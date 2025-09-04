import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import { useSkusByPallet } from '../../../lib/hook/sku';
import { useDeleteSku } from '../../../lib/hook/sku';
import TablePagination from '@mui/material/TablePagination';
import { useState } from 'react';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import SearchIcon from '@mui/icons-material/Search';
import Stack from '@mui/material/Stack';

type Props = {
  palletId: number | null;
  palletNumber?: string | null;
  open: boolean;
  onClose: () => void;
};

export default function SkuModal({ palletId, palletNumber, open, onClose }: Props) {
  const { data: skus, isLoading, isError } = useSkusByPallet(palletId);
  const deleteSku = useDeleteSku();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [search, setSearch] = useState<string>('');

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Items for Pallet #{palletNumber ?? palletId ?? '-'}</DialogTitle>
      <DialogContent>
        {isLoading ? (
          <Typography variant="body2">Loading…</Typography>
        ) : isError ? (
          <Typography variant="body2" color="error">Failed to load items</Typography>
        ) : (
          <TableContainer component={Paper}>
            <Stack direction="row" alignItems="center" justifyContent="flex-end" sx={{ p: 1 }}>
              <TextField
                size="small"
                placeholder="Search SKU code"
                value={search}
                onChange={(e) => { setSearch((e.target as HTMLInputElement).value); setPage(0); }}
                InputProps={{ startAdornment: (<InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment>) }}
              />
            </Stack>
            <Table size="small" stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>Code</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Quantity</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Date Created</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {(skus ?? []).filter(s => (s.code ?? '').toLowerCase().includes(search.trim().toLowerCase())).slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map(sku => (
                  <TableRow key={sku.id} hover>
                    <TableCell>{sku.code}</TableCell>
                    <TableCell>{sku.quantity}</TableCell>
                    <TableCell>{sku.dateCreated ? new Date(sku.dateCreated).toLocaleString() : '-'}</TableCell>
                    <TableCell>
                      <Button
                        size="small"
                        color="error"
                        variant="outlined"
                        disabled={deleteSku.isPending}
                        onClick={() => deleteSku.mutate(sku.id)}
                      >
                        Delete
                      </Button>
                    </TableCell>
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
        )}
      </DialogContent>
    </Dialog>
  );
}


