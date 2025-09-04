import requests from './agent';
import type { ScanResults } from '../types/results';

const ResultsApi = {
  getByScanId: async (scanId: number) => {
    return await requests.get<ScanResults>(`/Scan/general-scan-results/${scanId}`);
  },
};

export default ResultsApi;


