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
  const [selectedPallet, setSelectedPallet] = useState<Pallet | null>(null);
  const [scanInput, setScanInput] = useState<string>('');
  const scanSku = useScanSku();
  const { isPending, mutate } = scanSku;
  const mutateRef = useRef(mutate);
  const isPendingRef = useRef(isPending);
  const [palletNumberInput, setPalletNumberInput] = useState<string>('');
  const [skuModalOpen, setSkuModalOpen] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [search, setSearch] = useState<string>('');
  const debounceTimerRef = useRef<number | null>(null);

  useEffect(() => { mutateRef.current = mutate; }, [mutate]);
  useEffect(() => { isPendingRef.current = isPending; }, [isPending]);

  const isValidScan = (value?: string | null) => {
    const v = value?.trim();
    if (!v) return false;
    const pattern = /^(?:P([^PQ\r\n]+)Q(\d+)|Q(\d+)P([^PQ\r\n]+))$/i;
    return pattern.test(v);
  };

  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }

    const value = scanInput?.trim();
    if (!isValidScan(value)) return;

    debounceTimerRef.current = window.setTimeout(() => {
      if (isPendingRef.current) return;
      if (!selectedPallet?.id) {
        toast.error('Select a pallet before scanning');
        return;
      }

      mutateRef.current(
        { palletId: selectedPallet.id, scanField: value },
        {
          onSuccess: () => setScanInput(''),
        }
      );
    }, 2000);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
        debounceTimerRef.current = null;
      }
    };
  }, [scanInput, selectedPallet?.id]);

  return (
    <Box sx={{ pt: 10, px: 2 }}>
      <Paper sx={{ maxWidth: 1500, mx: 'auto', p: 2 }}>
        <Button variant="outlined" onClick={() => navigate(-1)} sx={{ mb: 2 }}>Return</Button>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="h5" sx={{ mb: 2 }}>Scan Control #</Typography>
              {scan ? (
                <Typography variant="h6">{scan.scanControlNumber}</Typography>
              ) : (
                <Typography variant="body1">No scan data provided.</Typography>
              )}
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
                    label="Scan input"
                    sx={{ width: 320 }}
                    value={scanInput}
                    onChange={(e) => {
                      const value = (e.target as HTMLInputElement).value;
                      setScanInput(value);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        if (debounceTimerRef.current) {
                          clearTimeout(debounceTimerRef.current);
                          debounceTimerRef.current = null;
                        }
                        const value = scanInput?.trim();
                        if (!isValidScan(value)) return;
                        if (isPendingRef.current) return;
                        if (!selectedPallet?.id) {
                          toast.error('Select a pallet before scanning');
                          return;
                        }
                        mutateRef.current(
                          { palletId: selectedPallet.id, scanField: value! },
                          { onSuccess: () => setScanInput('') }
                        );
                      }
                    }}
                    onBlur={() => {
                      if (debounceTimerRef.current) {
                        clearTimeout(debounceTimerRef.current);
                        debounceTimerRef.current = null;
                      }
                      const value = scanInput?.trim();
                      if (!isValidScan(value)) return;
                      if (isPendingRef.current) return;
                      if (!selectedPallet?.id) {
                        toast.error('Select a pallet before scanning');
                        return;
                      }
                      mutateRef.current(
                        { palletId: selectedPallet.id, scanField: value! },
                        { onSuccess: () => setScanInput('') }
                      );
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