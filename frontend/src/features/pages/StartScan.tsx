import { useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import type { Scan } from '../../lib/types/scan';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import { usePalletsByScan, useCreatePallet, useDeletePallet } from '../../lib/hook/pallet';
import { useScanSku } from '../../lib/hook/sku';
import { useFinishScan } from '../../lib/hook/scan';
import type { Pallet } from '../../lib/types/pallet';
import { toast } from 'react-toastify';
import SkuModal from '../../app/shared/components/skuModal';
import TablePagination from '@mui/material/TablePagination';
import InputAdornment from '@mui/material/InputAdornment';
import SearchIcon from '@mui/icons-material/Search';

function StartScan() {
  const location = useLocation();
  const navigate = useNavigate();
  const scan = (location.state as { scan: Scan } | undefined)?.scan;
  const scanId = scan?.id ?? null;
  const { data: pallets } = usePalletsByScan(scanId);
  const createPallet = useCreatePallet();
  const deletePallet = useDeletePallet();
  const finishScan = useFinishScan();
  const [selectedPallet, setSelectedPallet] = useState<Pallet | null>(null);
  const [skuCodeInput, setSkuCodeInput] = useState<string>('');
  const [quantityInput, setQuantityInput] = useState<string>('');
  const scanSku = useScanSku();
  const { isPending, mutate } = scanSku;
  const mutateRef = useRef(mutate);
  const isPendingRef = useRef(isPending);
  const [palletNumberInput, setPalletNumberInput] = useState<string>('');
  const [skuModalOpen, setSkuModalOpen] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [search, setSearch] = useState<string>('');
  const lastAttemptRef = useRef<{ sku: string; qty: string } | null>(null);
  const skuInputRef = useRef<HTMLInputElement | null>(null);
  const quantityInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => { mutateRef.current = mutate; }, [mutate]);
  useEffect(() => { isPendingRef.current = isPending; }, [isPending]);

  // Focus SKU input when a pallet is selected or added
  useEffect(() => {
    if (selectedPallet) {
      skuInputRef.current?.focus();
    }
  }, [selectedPallet]);

  // After entering a valid SKU, move focus to Quantity automatically (1s delay)
  useEffect(() => {
    if (!selectedPallet) return;
    if (quantityInput) return;

    const timerId = window.setTimeout(() => {
      const sku = skuCodeInput.trim();
      const skuValid = sku.length >= 2 && (sku[0] === 'P' || sku[0] === 'p');
      if (skuValid) {
        quantityInputRef.current?.focus();
      }
    }, 400);

    return () => clearTimeout(timerId);
  }, [skuCodeInput, selectedPallet, quantityInput]);

  // Auto-submit when both fields are non-empty and in correct format
  useEffect(() => {
    const sku = skuCodeInput.trim();
    const qty = quantityInput.trim();

    if (!sku || !qty) return;
    if (!selectedPallet?.id) return;
    if (isPendingRef.current) return;

    const timerId = window.setTimeout(() => {
      // Validate formats to match backend: 'P...' and 'Q...'
      const skuValid = sku.length >= 2 && (sku[0] === 'P' || sku[0] === 'p');
      const qtyValid = qty.length >= 2 && (qty[0] === 'Q' || qty[0] === 'q');

      if (!skuValid || !qtyValid) {
        const last = lastAttemptRef.current;
        const sameAsLast = last && last.sku === sku && last.qty === qty;
        if (!sameAsLast) {
          toast.error(!skuValid ? 'Incorrect SKU code format' : 'Incorrect quantity format');
          lastAttemptRef.current = { sku, qty };
        }
        return;
      }

      // Submit
      mutateRef.current(
        { PalletId: selectedPallet.id, SkuCode: sku, Quantity: qty },
        {
          onSuccess: () => {
            setSkuCodeInput('');
            setQuantityInput('');
            lastAttemptRef.current = null;
            skuInputRef.current?.focus();
          },
        }
      );
    }, 300);

    return () => clearTimeout(timerId);
  }, [skuCodeInput, quantityInput, selectedPallet?.id]);

  return (
    <Box sx={{ pt: 10, px: 2 }}>
      <Paper sx={{ maxWidth: 1500, mx: 'auto', p: 2 }}>
        <Button variant="outlined" onClick={() => navigate(-1)} sx={{ mb: 2 }}>Return</Button>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
          <Card variant="outlined">
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="h5" sx={{ mb: 2 }}>Scan Control #</Typography>
                  {scan ? (
                    <Typography variant="h6">{scan.scanControlNumber}</Typography>
                  ) : (
                    <Typography variant="body1">No scan data provided.</Typography>
                  )}
                </Box>
                <Button
                  variant="contained"
                  color="success"
                  disabled={!scanId || finishScan.isPending}
                  onClick={() =>
                    finishScan.mutate(scanId as number, {
                      onSuccess: () => {
                        navigate('/Scan');
                      },
                    })
                  }
                >
                  {finishScan.isPending ? 'Finishing...' : 'Finish Scan'}
                </Button>
              </Box>
            </CardContent>
          </Card>
          <Card variant="outlined">
            <CardContent sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 120 }}>
              <Stack direction="row" spacing={1} alignItems="center">
                <TextField
                  size="small"
                  label="Pallet Number (Optional)"
                  sx={{ width: 260 }}
                  value={palletNumberInput}
                  onChange={(e) => setPalletNumberInput((e.target as HTMLInputElement).value)}
                />
                <Button
                  variant="contained"
                  color="primary"
                  disabled={!scanId || createPallet.isPending}
                  onClick={() =>
                    createPallet.mutate(
                      { scanId: scanId as number, palletNumber: palletNumberInput || undefined },
                      {
                        onSuccess: (created) => {
                          setSelectedPallet(created);
                          setPalletNumberInput('');
                        },
                      }
                    )
                  }
                >
                  {createPallet.isPending ? 'Adding…' : 'Add Pallet'}
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </Box>
        <Box sx={{ mt: 2 }}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="h6" sx={{ mb: 1 }}>Selected Pallet #</Typography>
              <Typography variant="h5">{selectedPallet?.palletNumber ?? '-'}</Typography>
              <Box sx={{ mt: 2 }}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <TextField
                    size="small"
                    label="SKU Code (starts with P)"
                    sx={{ width: 260 }}
                    value={skuCodeInput}
                    inputRef={skuInputRef}
                    disabled={!selectedPallet}
                    onChange={(e) => setSkuCodeInput((e.target as HTMLInputElement).value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        setSkuCodeInput((e.target as HTMLInputElement).value.trim());
                        window.setTimeout(() => {
                          quantityInputRef.current?.focus();
                        }, 1000);
                      }
                    }}
                  />
                  <TextField
                    size="small"
                    label="Quantity (starts with Q)"
                    sx={{ width: 200 }}
                    value={quantityInput}
                    inputRef={quantityInputRef}
                    disabled={!selectedPallet}
                    onChange={(e) => setQuantityInput((e.target as HTMLInputElement).value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        setQuantityInput((e.target as HTMLInputElement).value.trim());
                      }
                    }}
                  />
                  <Button
                    variant="outlined"
                    color="secondary"
                    disabled={!selectedPallet}
                    onClick={() => setSelectedPallet(null)}
                  >
                    Unselect Pallet
                  </Button>
                </Stack>
              </Box>
            </CardContent>
          </Card>
          <Box sx={{ mt: 2 }}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2 }}>Pallets in this Scan</Typography>
                <Stack direction="row" alignItems="center" justifyContent="flex-end" sx={{ mb: 1 }}>
                  <TextField
                    size="small"
                    placeholder="Search pallet #"
                    value={search}
                    onChange={(e) => { setSearch((e.target as HTMLInputElement).value); setPage(0); }}
                    InputProps={{ startAdornment: (<InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment>) }}
                  />
                </Stack>
                <TableContainer component={Paper}>
                  <Table size="small" stickyHeader>
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 600 }}>Pallet #</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Date Created</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {(pallets ?? []).filter(p => (p.palletNumber ?? '').toLowerCase().includes(search.trim().toLowerCase())).slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map(p => (
                        <TableRow key={p.id} hover>
                          <TableCell>{p.palletNumber ?? '-'}</TableCell>
                          <TableCell>{p.dateCreated ? new Date(p.dateCreated).toLocaleString() : '-'}</TableCell>
                          <TableCell>
                            <Stack direction="row" spacing={1}>
                              <Button size="small" variant="contained" onClick={() => setSelectedPallet(p)}>Select Pallet</Button>
                              <Button size="small" color="error" variant="outlined" onClick={() => deletePallet.mutate(p.id)}>Delete</Button>
                              <Button size="small" variant="outlined" onClick={() => { setSelectedPallet(p); setSkuModalOpen(true); }}>View Items</Button>
                            </Stack>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  <TablePagination
                    component="div"
                    count={(pallets ?? []).filter(p => (p.palletNumber ?? '').toLowerCase().includes(search.trim().toLowerCase())).length}
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
              </CardContent>
            </Card>
          </Box>
          <SkuModal
            palletId={selectedPallet?.id ?? null}
            palletNumber={selectedPallet?.palletNumber}
            open={skuModalOpen}
            onClose={() => setSkuModalOpen(false)}
          />
        </Box>
      </Paper>
    </Box>
  );
}

export default StartScan;

/*

*/