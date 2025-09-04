import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';
import Button from '@mui/material/Button';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import {useLocation, useNavigate} from 'react-router-dom';
import IconButton from '@mui/material/IconButton';
import VisibilityIcon from '@mui/icons-material/Visibility';
import type { Scan } from '../../lib/types/scan';
import {useScanResultsById} from '../../lib/hook/results';
import SkuResultsModal from '../../app/shared/components/skuResultsModal';
import { useState } from 'react';
import TablePagination from '@mui/material/TablePagination';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import SearchIcon from '@mui/icons-material/Search';

function Results() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = (location.state as { scan?: Scan } | undefined) ?? undefined;
  const scan = state?.scan;
  const [openSkuModal, setOpenSkuModal] = useState(false);
  const [activePalletId, setActivePalletId] = useState<number | null>(null);
  const [activePalletNumber, setActivePalletNumber] = useState<string | null | undefined>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [search, setSearch] = useState<string>('');

  const {
    data: results,
    isLoading,
    isError,
    error,
  } = useScanResultsById(scan?.id);

  if (!scan) {
    return (
      <Box sx={{ pt: 10, px: 2 }}>
        <Paper sx={{ maxWidth: 1500, mx: 'auto', p: 2 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>No scan provided</Typography>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Navigate here via the Scans page to view results for a specific scan.
          </Typography>
          <Button variant="outlined" onClick={() => navigate(-1)}>Go Back</Button>
        </Paper>
      </Box>
    );
  }

  // Helper to treat SQL/DateTime.MinValue as unset
  const formatIfValid = (iso?: string | null) => {
    if (!iso) return null;
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return null;
    if (d.getFullYear() <= 1) return null; // handles 0001-01-01T00:00:00
    return d.toLocaleString();
  };

  return (
    <Box sx={{ pt: 10, px: 2 }}>
      <Paper sx={{ maxWidth: 1500, mx: 'auto', p: 2 }}>
        <Card variant="outlined">
          <CardContent>
            <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 2 }}>
              <Box>
                <Typography variant="h6">
                  Results for Control #{
                    (results?.scanControlNumber ?? scan.scanControlNumber) ?? scan.id
                  }
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Started: {formatIfValid(results?.dateCreated) ?? '-'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Finished: {formatIfValid(results?.dateFinished) ?? 'No'}
                </Typography>
              </Box>
              <Button variant="outlined" onClick={() => navigate(-1)}>Back</Button>
            </Stack>

            <Divider sx={{ my: 2 }} />

            {isLoading && <Typography>Loading results...</Typography>}
            {isError && (
              <Typography color="error">
                Error loading results{error ? `: ${(error as Error).message}` : ''}
              </Typography>
            )}

            {!isLoading && !isError && results && (
              <>
                <Box
                  sx={{
                    mb: 2,
                    display: 'grid',
                    gridTemplateColumns: {
                      xs: '1fr',
                      sm: 'repeat(2, 1fr)',
                      md: 'repeat(4, 1fr)'
                    },
                    gap: 2
                  }}
                >
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="subtitle2" color="text.secondary">Pallets</Typography>
                      <Typography variant="h5">{results.palletCount}</Typography>
                    </CardContent>
                  </Card>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="subtitle2" color="text.secondary">Unique SKUs</Typography>
                      <Typography variant="h5">{results.skuUniqueCount}</Typography>
                    </CardContent>
                  </Card>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="subtitle2" color="text.secondary">Total SKUs</Typography>
                      <Typography variant="h5">{results.skuCount}</Typography>
                    </CardContent>
                  </Card>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="subtitle2" color="text.secondary">Total Pieces</Typography>
                      <Typography variant="h5">{results.totalPieces}</Typography>
                    </CardContent>
                  </Card>
                </Box>

                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="subtitle1" sx={{ mb: 2 }}>Pallets</Typography>
                    <Stack direction="row" alignItems="center" justifyContent="flex-end" sx={{ mb: 1 }}>
                      <TextField
                        size="small"
                        placeholder="Search pallet #"
                        value={search}
                        onChange={(e) => { setSearch((e.target as HTMLInputElement).value); setPage(0); }}
                        InputProps={{ startAdornment: (<InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment>) }}
                      />
                    </Stack>
                    {(!results.pallets || results.pallets.length === 0) ? (
                      <Typography variant="body2">No pallets found</Typography>
                    ) : (
                      <TableContainer>
                        <Table size="small" stickyHeader aria-label="pallets table" sx={{ '& td, & th': { py: 0.5, px: 1 } }}>
                          <TableHead>
                            <TableRow>
                              <TableCell sx={{ fontWeight: 600, backgroundColor: 'background.paper' }}>Pallet #</TableCell>
                              <TableCell sx={{ fontWeight: 600, backgroundColor: 'background.paper' }}>Created</TableCell>
                              <TableCell sx={{ fontWeight: 600, backgroundColor: 'background.paper' }} align="right">Total Qty</TableCell>
                              <TableCell sx={{ fontWeight: 600, backgroundColor: 'background.paper' }} align="center">Actions</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {((results.pallets ?? []).filter(p => (p.palletNumber ?? '').toLowerCase().includes(search.trim().toLowerCase()))).slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((p) => (
                              <TableRow key={p.id} hover>
                                <TableCell>{p.palletNumber ?? '-'}</TableCell>
                                <TableCell>{p.dateCreated ? new Date(p.dateCreated).toLocaleString() : '-'}</TableCell>
                                <TableCell align="right">{typeof p.totalQuantity === 'number' ? p.totalQuantity : '-'}</TableCell>
                                <TableCell align="center">
                                  <IconButton
                                    size="small"
                                    aria-label="View items"
                                    onClick={() => {
                                      setActivePalletId(p.id);
                                      setActivePalletNumber(p.palletNumber);
                                      setOpenSkuModal(true);
                                    }}
                                  >
                                    <VisibilityIcon fontSize="small" />
                                  </IconButton>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                        <TablePagination
                          component="div"
                          count={((results.pallets ?? []).filter(p => (p.palletNumber ?? '').toLowerCase().includes(search.trim().toLowerCase()))).length}
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
                  </CardContent>
                </Card>
                <SkuResultsModal
                  open={openSkuModal}
                  palletId={activePalletId}
                  palletNumber={activePalletNumber}
                  onClose={() => setOpenSkuModal(false)}
                />
              </>
            )}
          </CardContent>
        </Card>
      </Paper>
    </Box>
  );
}

export default Results