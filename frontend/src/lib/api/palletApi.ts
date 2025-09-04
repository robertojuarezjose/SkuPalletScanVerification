import requests from './agent';
import type { Pallet, PalletCreateRequest } from '../types/pallet';

const PalletApi = {
  getAll: async () => {
    return await requests.get<Pallet[]>('/Pallet');
  },
  getById: async (id: number) => {
    return await requests.get<Pallet>(`/Pallet/${id}`);
  },
  getByScanId: async (scanId: number) => {
    return await requests.get<Pallet[]>(`/Pallet/by-scan/${scanId}`);
  },
  create: async (payload: PalletCreateRequest) => {
    return await requests.post<Pallet>('/Pallet', payload);
  },
  update: async (pallet: Pallet) => {
    return await requests.put<void>('/Pallet', pallet);
  },
  delete: async (id: number) => {
    return await requests.del<void>(`/Pallet/${id}`);
  },
};

export default PalletApi;


