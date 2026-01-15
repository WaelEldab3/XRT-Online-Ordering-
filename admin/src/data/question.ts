import { useQuery } from '@tanstack/react-query';
import { mapPaginatorData } from '@/utils/data-mappers';
import { API_ENDPOINTS } from './client/api-endpoints';
import { QuestionPaginator, QuestionQueryOptions } from '@/types';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { useTranslation } from 'next-i18next';
import { questionClient } from '@/data/client/question';

export const useQuestionsQuery = (options: Partial<QuestionQueryOptions>) => {
  const { data, error, isPending: isLoading } = useQuery<QuestionPaginator, Error>({
    queryKey: [API_ENDPOINTS.QUESTIONS, options],
    queryFn: () => questionClient.paginated(options),
    placeholderData: (previousData: QuestionPaginator | undefined) => previousData,
  });

  return {
    questions: data?.data ?? [],
    paginatorInfo: mapPaginatorData(data),
    error,
    loading: isLoading,
  };
};

export const useReplyQuestionMutation = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: questionClient.update,
    onSuccess: () => {
      toast.success(t('common:successfully-updated'));
    },
    // Always refetch after error or success:
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: [API_ENDPOINTS.QUESTIONS] });
    },
  });
};

export const useDeleteQuestionMutation = () => {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: questionClient.delete,
    onSuccess: () => {
      toast.success(t('common:successfully-deleted'));
    },
    // Always refetch after error or success:
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: [API_ENDPOINTS.QUESTIONS] });
    },
  });
};
