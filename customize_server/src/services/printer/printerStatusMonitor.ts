import { Server as SocketIOServer } from 'socket.io';
import { PrinterRepository } from '../../infrastructure/repositories/PrinterRepository';
import { createPrinterInstance } from './printerFactory';
import { logger } from '../../shared/utils/logger';

const DEFAULT_INTERVAL_MS = 30_000;

export interface PrinterStatusPayload {
  printerId: string;
  name: string;
  status: string;
  checkedAt: string;
}

/**
 * Every intervalMs, check all active printers' connection, update last_status in DB,
 * and emit 'printer-status' to all Socket.io clients.
 */
export function startPrinterStatusMonitor(
  io: SocketIOServer,
  intervalMs: number = DEFAULT_INTERVAL_MS
): NodeJS.Timeout {
  const printerRepository = new PrinterRepository();

  const checkAll = async () => {
    try {
      const printers = await printerRepository.findAll({ active: true });
      const payloads: PrinterStatusPayload[] = [];

      for (const printer of printers) {
        try {
          const instance = createPrinterInstance(printer);
          const connected = await instance.isConnected();
          const status = connected ? 'connected' : 'disconnected';
          await printerRepository.update(printer.id, { last_status: status });
          payloads.push({
            printerId: printer.id,
            name: printer.name,
            status,
            checkedAt: new Date().toISOString(),
          });
        } catch (err) {
          const message = err instanceof Error ? err.message : String(err);
          await printerRepository.update(printer.id, { last_status: `error: ${message.slice(0, 200)}` });
          payloads.push({
            printerId: printer.id,
            name: printer.name,
            status: 'error',
            checkedAt: new Date().toISOString(),
          });
          logger.warn(`[PrinterStatusMonitor] ${printer.name} (${printer.id}): ${message}`);
        }
      }

      if (payloads.length > 0) {
        io.emit('printer-status', { printers: payloads });
      }
    } catch (err) {
      logger.error('[PrinterStatusMonitor] check failed:', err);
    }
  };

  checkAll();
  const intervalId = setInterval(checkAll, intervalMs);
  logger.info(`[PrinterStatusMonitor] Started (interval ${intervalMs}ms)`);
  return intervalId;
}
