import { HttpClient } from '@/data/client/http-client';
import { API_ENDPOINTS } from '@/data/client/api-endpoints';

export interface TemplateLayoutBlock {
  type: 'field' | 'itemsTable' | 'separator' | 'line' | 'logo';
  value?: string;
  columns?: string[];
  text?: string;
}

export interface TemplateLayout {
  header?: TemplateLayoutBlock[];
  body?: TemplateLayoutBlock[];
  footer?: TemplateLayoutBlock[];
}

export interface PrintTemplate {
  id: string;
  name: string;
  type: 'kitchen' | 'cashier' | 'generic';
  layout: TemplateLayout;
  paper_width: '58mm' | '80mm';
  active: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface PrintableFieldsResponse {
  order: {
    key: string;
    label: string;
    category: string;
    description?: string;
  }[];
  customer: { key: string; label: string; category: string }[];
  delivery: { key: string; label: string; category: string }[];
  system: { key: string; label: string; category: string }[];
  itemColumns: { key: string; label: string; category: string }[];
}

export const templateClient = {
  fetchPrintableFields: async () => {
    const url = API_ENDPOINTS.TEMPLATES_PRINTABLE_FIELDS;
    const response = await HttpClient.get<{
      success: boolean;
      data?: PrintableFieldsResponse;
    }>(url);
    return ((response as any).data ?? response) as PrintableFieldsResponse;
  },
  fetchTemplates: async (params?: { type?: string; active?: boolean }) => {
    const response = await HttpClient.get<{
      success: boolean;
      data?: PrintTemplate[];
    }>(API_ENDPOINTS.TEMPLATES, { params });
    return ((response as any).data ?? response) as PrintTemplate[];
  },
  fetchTemplate: async (id: string) => {
    const url = API_ENDPOINTS.TEMPLATE_DETAIL.replace(':id', id);
    const response = await HttpClient.get<{
      success: boolean;
      data?: PrintTemplate;
    }>(url);
    return ((response as any).data ?? response) as PrintTemplate;
  },
  create: async (
    input: Partial<PrintTemplate> & {
      name: string;
      type: string;
      layout: TemplateLayout;
    },
  ) => {
    const response = await HttpClient.post<{
      success: boolean;
      data?: PrintTemplate;
    }>(API_ENDPOINTS.TEMPLATES, input);
    return ((response as any).data ?? response) as PrintTemplate;
  },
  update: async (id: string, input: Partial<PrintTemplate>) => {
    const url = API_ENDPOINTS.TEMPLATE_DETAIL.replace(':id', id);
    const response = await HttpClient.put<{
      success: boolean;
      data?: PrintTemplate;
    }>(url, input);
    return ((response as any).data ?? response) as PrintTemplate;
  },
  delete: async (id: string) => {
    const url = API_ENDPOINTS.TEMPLATE_DETAIL.replace(':id', id);
    const response = await HttpClient.delete<any>(url);
    return response;
  },
};
