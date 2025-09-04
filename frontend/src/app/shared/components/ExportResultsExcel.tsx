import Button from '@mui/material/Button';
import ExcelJS from 'exceljs';
import { useState } from 'react';
import SkuApi from '../../../lib/api/skuApi';
import type { ScanResults } from '../../../lib/types/results';
import type { Sku } from '../../../lib/types/sku';

type Props = {
  results?: ScanResults;
};

function ExportResultsExcel({ results }: Props) {
  const [isExporting, setIsExporting] = useState(false);

  const formatIfValid = (iso?: string | null) => {
    if (!iso) return null;
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return null;
    if (d.getFullYear() <= 1) return null;
    return d.toLocaleString();
  };

  const handleExport = async () => {
    if (!results) return;
    try {
      setIsExporting(true);

      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Report');

      const control = `Control #${results.scanControlNumber}`;
      const started = formatIfValid(results.dateCreated) ?? '-';
      const finished = formatIfValid(results.dateFinished) ?? 'No';

      const scanHeader = worksheet.addRow(['Control #', 'Started', 'Finished']);
      scanHeader.font = { bold: true };
      scanHeader.alignment = { vertical: 'middle' };
      for (let i = 1; i <= 3; i += 1) {
        scanHeader.getCell(i).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE5E7EB' } };
      }

      worksheet.addRow([control, started, finished]);

      worksheet.addRow([]);
      worksheet.addRow([]);

      const pallets = results.pallets ?? [];
      for (const p of pallets) {
        const created = p.dateCreated ? formatIfValid(p.dateCreated) : '-';
        const palletHeader = worksheet.addRow(['Pallet #', 'Created', 'Total Qty', 'Scan Count']);
        palletHeader.font = { bold: true };
        palletHeader.alignment = { vertical: 'middle' };
        for (let i = 1; i <= 4; i += 1) {
          palletHeader.getCell(i).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE5E7EB' } };
        }

        worksheet.addRow([
          `Pallet #${p.palletNumber ?? '-'}`,
          created,
          p.totalQuantity ?? 0,
          p.totalScanCount ?? 0,
        ]);

        // Spacer between pallet summary and SKU headers
        worksheet.addRow([]);

        const headerRow = worksheet.addRow([null, 'SKU', 'Quantity', 'Scan Count', 'First Scanned']);
        headerRow.font = { bold: true };
        headerRow.alignment = { vertical: 'middle' };
        for (let i = 2; i <= 5; i += 1) {
          headerRow.getCell(i).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE0F2FE' } };
        }
        // Ensure no blue beyond the last header cell
        for (let i = 6; i <= 20; i += 1) {
          headerRow.getCell(i).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFFFF' } };
        }

        let skus: Sku[] = [];
        try {
          skus = await SkuApi.getByPalletId(p.id);
        } catch {
          // If fetching SKUs fails, still continue with an empty section for this pallet
          skus = [];
        }

        for (const s of skus) {
          const firstScanned = s.dateCreated ? formatIfValid(s.dateCreated) : '';
          worksheet.addRow([null, s.code, s.quantity, s.scanCount ?? 1, firstScanned]);
        }

        worksheet.addRow([]);
      }

      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `scan-report-${results.scanControlNumber}.xlsx`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Button variant="contained" onClick={handleExport} disabled={!results || isExporting}>
      {isExporting ? 'Exporting…' : 'Export Report'}
    </Button>
  );
}

export default ExportResultsExcel;


