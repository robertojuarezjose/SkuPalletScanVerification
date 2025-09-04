export interface Sku {
  id: number;
  code: string;
  quantity: number;
  palletId: number;
  dateCreated?: string | null;
}

export interface SkuScanRequest {
  palletId: number;
  scanField: string;
}


