import requests from './agent';
import type { Sku, SkuScanRequest } from '../types/sku';

const SkuApi = {
  getAll: async () => {
    return await requests.get<Sku[]>('/Sku');
  },
  getById: async (id: number) => {
    return await requests.get<Sku>(`/Sku/${id}`);
  },
  getByPalletId: async (palletId: number) => {
    return await requests.get<Sku[]>(`/Sku/by-pallet/${palletId}`);
  },
  scan: async (payload: SkuScanRequest) => {
    return await requests.post<Sku>('/Sku', payload);
  },
  delete: async (id: number) => {
    return await requests.del<void>(`/Sku/${id}`);
  },
};

export default SkuApi;


