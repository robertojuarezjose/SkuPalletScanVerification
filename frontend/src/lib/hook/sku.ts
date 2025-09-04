import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import { toast } from 'react-toastify';
import SkuApi from '../api/skuApi';
import type { Sku, SkuScanRequest } from '../types/sku';

export const useSkusList = () => {
  return useQuery({
    queryKey: ['skus'],
    queryFn: () => SkuApi.getAll(),
    staleTime: 5 * 60 * 1000,
  });
};

export const useSkusByPallet = (palletId: number | null | undefined) => {
  return useQuery({
    queryKey: ['skusByPallet', palletId],
    queryFn: () => SkuApi.getByPalletId(palletId as number),
    enabled: typeof palletId === 'number' && palletId > 0,
    staleTime: 5 * 60 * 1000,
  });
};

export const useScanSku = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: SkuScanRequest) => SkuApi.scan(payload),
    onSuccess: async (_created: Sku, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['skus'] }),
        queryClient.invalidateQueries({ queryKey: ['skusByPallet', variables.palletId] }),
      ]);
      toast.success('SKU scanned');
    },
    onError: (error: unknown) => {
      toast.error('Failed to scan SKU');
      console.error('Scan SKU error:', error);
    },
  });
};

export const useDeleteSku = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => SkuApi.delete(id),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['skus'] }),
        queryClient.invalidateQueries({ queryKey: ['skusByPallet'] }),
      ]);
      toast.success('SKU deleted');
    },
    onError: (error: unknown) => {
      toast.error('Failed to delete SKU');
      console.error('Delete SKU error:', error);
    },
  });
};


