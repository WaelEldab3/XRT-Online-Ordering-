import { ThermalPrinter, PrinterTypes } from 'node-thermal-printer';
import { Printer, PrinterConnectionType } from '../../domain/entities/Printer';

const DEFAULT_EXECUTE_TIMEOUT_MS = 15000;
const DEFAULT_CONNECTION_TIMEOUT_MS = 5000;

/** Normalize interface string for node-thermal-printer. */
function normalizeInterface(connectionType: PrinterConnectionType, iface: string): string {
  const trimmed = (iface || '').trim();
  if (!trimmed) return trimmed;

  switch (connectionType) {
    case 'lan':
    case 'wifi':
      if (/^tcp:\/\//i.test(trimmed)) return trimmed;
      if (trimmed.includes(':')) {
        const [host, port] = trimmed.split(':');
        return `tcp://${host}:${port || '9100'}`;
      }
      return `tcp://${trimmed}:9100`;

    case 'bluetooth':
      // Windows COM: ensure \\.\COMx form for node-thermal-printer File interface
      if (/^COM\d+$/i.test(trimmed)) return `\\\\.\\${trimmed}`;
      if (/^\\\\\.\\COM\d+$/i.test(trimmed)) return trimmed;
      // Linux serial / Bluetooth: use as-is (e.g. /dev/ttyUSB0, /dev/rfcomm0)
      // System printer: printer:Name
      return trimmed;

    default:
      return trimmed;
  }
}

export interface PrinterInstance {
  /** Underlying ThermalPrinter (for print(), println(), cut(), etc.) */
  getPrinter(): ThermalPrinter;
  /** Check if printer is reachable */
  isConnected(): Promise<boolean>;
  /** Execute buffered commands with timeout and try/catch */
  executeWithTimeout(timeoutMs?: number): Promise<void>;
  /** Send raw buffer immediately (e.g. pre-rendered ESC/POS string) with timeout */
  rawWithTimeout(buffer: Buffer, timeoutMs?: number): Promise<void>;
}

/**
 * Create a printer instance from Printer config.
 * Supports tcp:// (LAN), serial/COM (USB, Bluetooth), and printer:Name (system).
 */
export function createPrinterInstance(printer: {
  connection_type: PrinterConnectionType;
  interface: string;
}): PrinterInstance {
  const iface = normalizeInterface(printer.connection_type, printer.interface);

  const thermal = new ThermalPrinter({
    type: PrinterTypes.EPSON,
    width: 48,
    interface: iface,
    options: {
      timeout: DEFAULT_CONNECTION_TIMEOUT_MS,
    },
  }) as ThermalPrinter;

  return {
    getPrinter(): ThermalPrinter {
      return thermal;
    },

    async isConnected(): Promise<boolean> {
      try {
        const result = await thermal.isPrinterConnected();
        return !!result;
      } catch {
        return false;
      }
    },

    async executeWithTimeout(timeoutMs: number = DEFAULT_EXECUTE_TIMEOUT_MS): Promise<void> {
      try {
        await Promise.race([
          thermal.execute(),
          new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error('Print execute timeout')), timeoutMs)
          ),
        ]);
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        throw new Error(`Print failed: ${message}`);
      }
    },

    async rawWithTimeout(
      buffer: Buffer,
      timeoutMs: number = DEFAULT_EXECUTE_TIMEOUT_MS
    ): Promise<void> {
      try {
        await Promise.race([
          thermal.raw(buffer),
          new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error('Print raw timeout')), timeoutMs)
          ),
        ]);
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        throw new Error(`Print raw failed: ${message}`);
      }
    },
  };
}
