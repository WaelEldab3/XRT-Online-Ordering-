import { Request, Response } from 'express';
import { sendSuccess } from '../../shared/utils/response';
import { asyncHandler } from '../../shared/utils/asyncHandler';
import { TransactionRepository } from '../../infrastructure/repositories/TransactionRepository';

export class TransactionController {
  getTransactions = asyncHandler(async (req: Request, res: Response) => {
    const transactionRepository = new TransactionRepository();
    
    const { 
      page, 
      limit, 
      status, 
      gateway, 
      date, 
      startDate, 
      endDate,
      customer_id 
    } = req.query;

    const filters = {
      page: page ? parseInt(page as string, 10) : 1,
      limit: limit ? parseInt(limit as string, 10) : 20,
      status,
      gateway,
      date,
      startDate,
      endDate,
      customer_id
    };

    const result = await transactionRepository.findAll(filters);
    
    return sendSuccess(res, 'Transactions retrieved successfully', result);
  });

  getTransactionById = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const transactionRepository = new TransactionRepository();
    
    const transaction = await transactionRepository.findById(id);
    
    if (!transaction) {
      return res.status(404).json({ success: false, message: 'Transaction not found' });
    }

    return sendSuccess(res, 'Transaction retrieved successfully', transaction);
  });
}
