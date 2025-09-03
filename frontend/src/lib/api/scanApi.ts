import requests from './agent';
import type { scan, scanFormValues } from '../types/scan';

const ScanApi = {
  GetScans: async () => {
    return await requests.get<scan>('/Scan/');
  },
  register: async (scanDetails: scanFormValues) => {
    return await requests.post<void>('/scan/id/', scanDetails.scanId);
  }
  
  
};

export default ScanApi; 