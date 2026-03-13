import { HttpClient } from '@/data/client/http-client';
import { API_ENDPOINTS } from '@/data/client/api-endpoints';

export interface Printer {
  id: string;
  name: string;
  connection_type: 'lan' | 'wifi' | 'bluetooth';
  interface: string;
  assigned_template_ids: string[];
  kitchen_sections: string[];
  active: boolean;
  last_status: string | null;
  last_printed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface PrinterListResponse {
  success: boolean;
  message: string;
  data?: Printer[];
}

export const printerClient = {
  fetchPrinters: async (params?: { active?: boolean }) => {
    const { data } = await HttpClient.get<PrinterListResponse>(
      API_ENDPOINTS.PRINTERS,
      {
        params,
      },
    );
    // @ts-ignore
    return (data?.data ?? data) as Printer[];
  },
  fetchPrinter: async (id: string) => {
    const url = API_ENDPOINTS.PRINTER_DETAIL.replace(':id', id);
    const { data } = await HttpClient.get<{ success: boolean; data?: Printer }>(
      url,
    );
    // @ts-ignore
    return data?.data ?? data;
  },
  create: async (
    input: Partial<Printer> & {
      name: string;
      connection_type: string;
      interface: string;
    },
  ) => {
    const { data } = await HttpClient.post<{
      success: boolean;
      data?: Printer;
    }>(API_ENDPOINTS.PRINTERS, input);
    // @ts-ignore
    return data?.data ?? data;
  },
  update: async (id: string, input: Partial<Printer>) => {
    const url = API_ENDPOINTS.PRINTER_DETAIL.replace(':id', id);
    const { data } = await HttpClient.put<{ success: boolean; data?: Printer }>(
      url,
      input,
    );
    // @ts-ignore
    return data?.data ?? data;
  },
  testPrint: async (id: string) => {
    const url = API_ENDPOINTS.PRINTER_TEST_PRINT.replace(':id', id);
    const data = await HttpClient.post<{ success: boolean }>(url, {});
    return data;
  },
  scanWiFi: async () => {
    const { data } = await HttpClient.get<{
      success: boolean;
      data?: string[];
    }>(API_ENDPOINTS.PRINTER_SCAN_WIFI);
    // @ts-ignore
    return data?.data ?? [];
  },
  scanLAN: async () => {
    const { data } = await HttpClient.get<{
      success: boolean;
      data?: string[];
    }>(API_ENDPOINTS.PRINTER_SCAN_LAN);
    // @ts-ignore
    return data?.data ?? [];
  },
  scanBluetooth: async () => {
    const { data } = await HttpClient.get<{
      success: boolean;
      data?: string[];
    }>(API_ENDPOINTS.PRINTER_SCAN_BLUETOOTH);
    // @ts-ignore
    return data?.data ?? [];
  },
  delete: async (id: string) => {
    const url = API_ENDPOINTS.PRINTER_DETAIL.replace(':id', id);
    return HttpClient.delete<{ success: boolean; data: null }>(url);
  },
};
