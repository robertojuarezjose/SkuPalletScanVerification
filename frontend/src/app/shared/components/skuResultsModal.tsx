import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { useSkusByPallet } from '../../../lib/hook/sku';
import type { Sku } from '../../../lib/types/sku';
import TablePagination from '@mui/material/TablePagination';
import { useState } from 'react';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import SearchIcon from '@mui/icons-material/Search';

interface SkuResultsModalProps {
  open: boolean;
  palletId: number | null;
  palletNumber?: string | null;
  onClose: () => void;
}

const SkuResultsModal: FC<SkuResultsModalProps> = ({ open, palletId, palletNumber, onClose }) => {
  const { data: skus, isLoading, isError } = useSkusByPallet(open ? palletId : null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [search, setSearch] = useState<string>('');

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>
        SKUs on Pallet {palletNumber ? `#${palletNumber}` : ''}
      </DialogTitle>
      <DialogContent dividers>
        {isLoading && (
          <Stack direction="row" alignItems="center" gap={1} sx={{ py: 2 }}>
            <CircularProgress size={20} />
            <Typography>Loading items…</Typography>
          </Stack>
        )}
        {isError && (
          <Typography color="error">Failed to load SKUs for this pallet.</Typography>
        )}
        {!isLoading && !isError && (
          skus && skus.length > 0 ? (
            <TableContainer>
              <Stack direction="row" alignItems="center" justifyContent="flex-end" sx={{ p: 1 }}>
                <TextField
                  size="small"
                  placeholder="Search SKU code"
                  value={search}
                  onChange={(e) => { setSearch((e.target as HTMLInputElement).value); setPage(0); }}
                  InputProps={{ startAdornment: (<InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment>) }}
                />
              </Stack>
              <Table size="small" stickyHeader aria-label="sku list" sx={{ '& td, & th': { py: 0.5, px: 1 } }}>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600, backgroundColor: 'background.paper' }}>SKU</TableCell>
                    <TableCell sx={{ fontWeight: 600, backgroundColor: 'background.paper' }} align="right">Quantity</TableCell>
                    <TableCell sx={{ fontWeight: 600, backgroundColor: 'background.paper' }} align="right">Scan Count</TableCell>
                    <TableCell sx={{ fontWeight: 600, backgroundColor: 'background.paper' }}>First Scanned</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {(skus ?? []).filter(s => (s.code ?? '').toLowerCase().includes(search.trim().toLowerCase())).slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((s: Sku) => (
                    <TableRow key={s.id} hover>
                      <TableCell>{s.code}</TableCell>
                      <TableCell align="right">{s.quantity}</TableCell>
                      <TableCell align="right">{typeof s.scanCount === 'number' ? s.scanCount : 0}</TableCell>
                      <TableCell>{s.dateCreated ? new Date(s.dateCreated).toLocaleString() : '-'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <TablePagination
                component="div"
                count={(skus ?? []).filter(s => (s.code ?? '').toLowerCase().includes(search.trim().toLowerCase())).length}
                page={page}
                onPageChange={(_e, newPage) => setPage(newPage)}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={(e) => {
                  setRowsPerPage(parseInt((e.target as HTMLInputElement).value, 10));
                  setPage(0);
                }}
                rowsPerPageOptions={[5, 10, 25, 50]}
              />
            </TableContainer>
          ) : (
            <Typography variant="body2">No SKUs found on this pallet.</Typography>
          )
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} variant="outlined">Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default SkuResultsModal;

