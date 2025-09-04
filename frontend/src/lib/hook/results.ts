import {useQuery} from '@tanstack/react-query';
import ResultsApi from '../api/resultsApi';

export const useScanResultsById = (scanId: number | null | undefined) => {
  return useQuery({
    queryKey: ['scanResults', scanId],
    queryFn: () => ResultsApi.getByScanId(scanId as number),
    enabled: typeof scanId === 'number' && scanId > 0,
    staleTime: 60 * 1000,
  });
};


