export interface Pallet {
  id: number;
  scanId: number;
  palletNumber?: string | null;
  dateCreated?: string | null; // ISO string
  totalQuantity?: number;
}

export interface PalletCreateRequest {
  scanId: number;
  palletNumber?: string | null;
}


