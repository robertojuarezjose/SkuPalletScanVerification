import requests from './agent';
import type { Scan } from '../types/scan';
import type { ScanResults } from '../types/results';

const ScanApi = {
  getAll: async (
    status: 'pending' | 'finished' | 'all' = 'all',
    from?: string | null,
    to?: string | null
  ) => {
    const params: string[] = [];
    if (status) params.push(`status=${encodeURIComponent(status)}`);
    if (from) params.push(`from=${encodeURIComponent(from)}`);
    if (to) params.push(`to=${encodeURIComponent(to)}`);
    const query = params.length ? `?${params.join('&')}` : '';
    return await requests.get<Scan[]>(`/Scan${query}`);
  },
  getById: async (id: number) => {
    return await requests.get<Scan>(`/Scan/${id}`);
  },
  start: async () => {
    return await requests.post<Scan>('/Scan', {});
  },
  finish: async (scanId: number) => {
    return await requests.put<void>(`/Scan/finish/${scanId}`, {});
  },
  continue: async (scanId: number) => {
    return await requests.put<void>(`/Scan/continue/${scanId}`, {});
  },
  delete: async (id: number) => {
    return await requests.del<void>(`/Scan/${id}`);
  },
  getResults: async (scanId: number) => {
    return await requests.get<ScanResults>(`/Scan/general-scan-results/${scanId}`);
  },
};

export default ScanApi; 