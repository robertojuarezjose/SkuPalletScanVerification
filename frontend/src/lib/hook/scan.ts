import {useMutation, useQuery, useQueryClient, keepPreviousData} from '@tanstack/react-query';
import { toast } from 'react-toastify';
import ScanApi from '../api/scanApi';
import type { Scan } from '../types/scan';

export const useScansList = (
  status: 'pending' | 'finished' | 'all' = 'all',
  from?: string | null,
  to?: string | null,
) => {
  return useQuery<Scan[]>({
    queryKey: ['scans', status, from ?? null, to ?? null],
    queryFn: () => ScanApi.getAll(status, from ?? undefined, to ?? undefined),
    staleTime: 5 * 60 * 1000,
    placeholderData: keepPreviousData,
    refetchOnWindowFocus: false,
  });
};

export const useScan = (scanId: number | null | undefined) => {
  return useQuery({
    queryKey: ['scan', scanId],
    queryFn: () => ScanApi.getById(scanId as number),
    enabled: typeof scanId === 'number' && scanId > 0,
    staleTime: 5 * 60 * 1000,
  });
};

export const useScanResults = (scanId: number | null | undefined) => {
  return useQuery({
    queryKey: ['scanResults', scanId],
    queryFn: () => ScanApi.getResults(scanId as number),
    enabled: typeof scanId === 'number' && scanId > 0,
    staleTime: 60 * 1000,
  });
};

export const useStartScan = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => ScanApi.start(),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['scans'] });
      toast.success('Scan started');
    },
    onError: (error: unknown) => {
      toast.error('Failed to start scan');
      console.error('Start scan error:', error);
    },
  });
};

export const useFinishScan = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (scanId: number) => ScanApi.finish(scanId),
    onSuccess: async (_void, scanId) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['scans'] }),
        queryClient.invalidateQueries({ queryKey: ['scan', scanId] }),
        queryClient.invalidateQueries({ queryKey: ['scanResults', scanId] }),
      ]);
      toast.success('Scan finished');
    },
    onError: (error: unknown) => {
      toast.error('Failed to finish scan');
      console.error('Finish scan error:', error);
    },
  });
};

export const useContinueScan = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (scanId: number) => ScanApi.continue(scanId),
    onSuccess: async (_void, scanId) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['scans'] }),
        queryClient.invalidateQueries({ queryKey: ['scan', scanId] }),
      ]);
      toast.success('Scan continued');
    },
    onError: (error: unknown) => {
      toast.error('Failed to continue scan');
      console.error('Continue scan error:', error);
    },
  });
};

export const useDeleteScan = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => ScanApi.delete(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['scans'] });
      toast.success('Scan deleted');
    },
    onError: (error: unknown) => {
      toast.error('Failed to delete scan');
      console.error('Delete scan error:', error);
    },
  });
};


