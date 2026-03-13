import { Request, Response } from 'express';
import { PrintJobRepository } from '../../infrastructure/repositories/PrintJobRepository';
import { PrintJobStatus } from '../../domain/entities/PrintJob';
import { Types } from 'mongoose';
import { logger } from '../../shared/utils/logger';

const printJobRepository = new PrintJobRepository();

export class PrintJobController {
  /**
   * Called by the local print agent to fetch and atomically claim jobs.
   * Method: POST /api/print-jobs/claim
   * Body: { printerId: string, limit?: number }
   */
  async claimJobs(req: Request, res: Response): Promise<void> {
    try {
      const { printerId, limit } = req.body;

      if (!printerId) {
        res.status(400).json({ error: 'printerId is required' });
        return;
      }
      if (!Types.ObjectId.isValid(printerId)) {
        res.status(400).json({ error: 'Invalid printerId format' });
        return;
      }

      const jobs = await printJobRepository.claimNextJobsForPrinter(printerId, limit || 10);

      res.status(200).json(jobs);
    } catch (error) {
      logger.error('[PrintJobController.claimJobs] Error:', error);
      res.status(500).json({ error: 'Internal server error while claiming print jobs' });
    }
  }

  /**
   * Called by the local print agent to update the status of a job.
   * Method: PUT /api/print-jobs/:id/status
   * Body: { status: 'printed' | 'failed', errorMessage?: string }
   */
  async updateStatus(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { status, errorMessage } = req.body;

      if (!Types.ObjectId.isValid(id)) {
        res.status(400).json({ error: 'Invalid job ID format' });
        return;
      }

      if (status !== 'printed' && status !== 'failed') {
        res.status(400).json({ error: 'Invalid status update. Must be "printed" or "failed".' });
        return;
      }

      const job = await printJobRepository.findById(id);
      if (!job) {
        res.status(404).json({ error: 'PrintJob not found' });
        return;
      }

      let newRetryCount = job.retryCount;
      let finalStatus: PrintJobStatus = status;

      if (status === 'failed') {
        newRetryCount += 1;
        // If it failed but hasn't reached max retries, put it back to pending
        if (newRetryCount < job.maxRetries) {
          finalStatus = 'pending';
        }
      }

      const updatedJob = await printJobRepository.update(id, {
        status: finalStatus,
        retryCount: newRetryCount,
        errorMessage: errorMessage || null,
        lockedAt: null, // Release the lock
      });

      res.status(200).json(updatedJob);
    } catch (error) {
      logger.error(`[PrintJobController.updateStatus] Error for job ${req.params.id}:`, error);
      res.status(500).json({ error: 'Internal server error while updating print job status' });
    }
  }

  /**
   * For the dashboard: Get a specific job
   */
  async getJob(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      if (!Types.ObjectId.isValid(id)) {
        res.status(400).json({ error: 'Invalid job ID format' });
        return;
      }

      const job = await printJobRepository.findById(id);
      if (!job) {
        res.status(404).json({ error: 'PrintJob not found' });
        return;
      }

      res.status(200).json(job);
    } catch (error) {
      logger.error(`[PrintJobController.getJob] Error:`, error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}
