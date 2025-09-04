export interface Scan {
  id: number;
  scanControlNumber?: string | null;
  scanDate?: string | null;
  scanFinished?: boolean | null;
  scanFinishedDate?: string | null;
}

