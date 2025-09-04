import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import { toast } from 'react-toastify';
import PalletApi from '../api/palletApi';
import type { Pallet, PalletCreateRequest } from '../types/pallet';

export const usePalletsList = () => {
  return useQuery({
    queryKey: ['pallets'],
    queryFn: () => PalletApi.getAll(),
    staleTime: 5 * 60 * 1000,
  });
};

export const usePalletsByScan = (scanId: number | null | undefined) => {
  return useQuery({
    queryKey: ['palletsByScan', scanId],
    queryFn: () => PalletApi.getByScanId(scanId as number),
    enabled: typeof scanId === 'number' && scanId > 0,
    staleTime: 5 * 60 * 1000,
  });
};

export const useCreatePallet = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: PalletCreateRequest) => PalletApi.create(payload),
    onSuccess: async (_created: Pallet, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['pallets'] }),
        queryClient.invalidateQueries({ queryKey: ['palletsByScan', variables.scanId] }),
      ]);
      toast.success('Pallet created');
    },
    onError: (error: unknown) => {
      toast.error('Failed to create pallet');
      console.error('Create pallet error:', error);
    },
  });
};

export const useUpdatePallet = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: Pallet) => PalletApi.update(payload),
    onSuccess: async (_void, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['pallets'] }),
        queryClient.invalidateQueries({ queryKey: ['palletsByScan', variables.scanId] }),
        queryClient.invalidateQueries({ queryKey: ['pallet', variables.id] }),
      ]);
      toast.success('Pallet updated');
    },
    onError: (error: unknown) => {
      toast.error('Failed to update pallet');
      console.error('Update pallet error:', error);
    },
  });
};

export const useDeletePallet = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => PalletApi.delete(id),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['pallets'] }),
        queryClient.invalidateQueries({ queryKey: ['palletsByScan'] }),
      ]);
      toast.success('Pallet deleted');
    },
    onError: (error: unknown) => {
      toast.error('Failed to delete pallet');
      console.error('Delete pallet error:', error);
    },
  });
};


