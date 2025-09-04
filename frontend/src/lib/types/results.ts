import type { Pallet } from './pallet';

export interface ScanResults {
  scanId: number;
  scanControlNumber: string;
  palletCount: number;
  skuUniqueCount: number;
  skuCount: number;
  totalPieces: number;
  dateCreated: string;
  dateFinished: string;
  pallets: Pallet[];
}


