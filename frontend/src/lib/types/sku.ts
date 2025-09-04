export interface Sku {
  id: number;
  code: string;
  quantity: number;
  palletId: number;
  scanCount?: number;
  dateCreated?: string | null;
}

export interface SkuScanRequest {
  PalletId: number;
  SkuCode: string; // expects leading 'P'
  Quantity: string; // expects leading 'Q'
}


