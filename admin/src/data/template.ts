import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { templateClient, PrintTemplate, PrintableFieldsResponse } from './client/template';
import { API_ENDPOINTS } from './client/api-endpoints';

export const usePrintableFieldsQuery = () => {
  return useQuery<PrintableFieldsResponse, Error>({
    queryKey: [API_ENDPOINTS.TEMPLATES_PRINTABLE_FIELDS],
    queryFn: templateClient.fetchPrintableFields,
  });
};

export const useTemplatesQuery = (params?: { type?: string; active?: boolean }) => {
  return useQuery({
    queryKey: [API_ENDPOINTS.TEMPLATES, params],
    queryFn: () => templateClient.fetchTemplates(params),
  });
};

export const useTemplateQuery = (id: string | null) => {
  return useQuery({
    queryKey: [API_ENDPOINTS.TEMPLATE_DETAIL, id],
    queryFn: () => templateClient.fetchTemplate(id!),
    enabled: !!id,
  });
};

export const useCreateTemplateMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: templateClient.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [API_ENDPOINTS.TEMPLATES] });
    },
  });
};

export const useUpdateTemplateMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: Partial<PrintTemplate> }) =>
      templateClient.update(id, input),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: [API_ENDPOINTS.TEMPLATES] });
      queryClient.invalidateQueries({ queryKey: [API_ENDPOINTS.TEMPLATE_DETAIL, id] });
    },
  });
};

export const useDeleteTemplateMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => templateClient.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [API_ENDPOINTS.TEMPLATES] });
    },
  });
};
