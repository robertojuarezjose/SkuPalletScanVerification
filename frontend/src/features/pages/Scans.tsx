import { useScansList, useStartScan } from '../../lib/hook/scan';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import { useNavigate } from 'react-router-dom';
import { useContinueScan, useDeleteScan, useFinishScan } from '../../lib/hook/scan';
import TablePagination from '@mui/material/TablePagination';
import { useState, type ChangeEvent } from 'react';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormControl from '@mui/material/FormControl';
import type { Scan } from '../../lib/types/scan';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import SearchIcon from '@mui/icons-material/Search';

function Scans() {
  const [statusFilter, setStatusFilter] = useState<'pending' | 'finished' | 'all'>('pending');
  const [fromDate, setFromDate] = useState<string | null>(null);
  const [toDate, setToDate] = useState<string | null>(null);
  const { data: scans, isLoading, isError, error } = useScansList(
    statusFilter,
    fromDate,
    toDate
  );
  const startScan = useStartScan();
  const continueScan = useContinueScan();
  const finishScan = useFinishScan();
  const deleteScan = useDeleteScan();
  const navigate = useNavigate();

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [search, setSearch] = useState<string>('');

  // Keep outer layout stable; show loading/error inline within table instead

  const scansArray: Scan[] = Array.isArray(scans) ? (scans as Scan[]) : [];
  const query = search.trim().toLowerCase();
  const filteredScans: Scan[] = query.length === 0
    ? scansArray
    : scansArray.filter((s: Scan) =>
        (s.scanControlNumber ?? '').toLowerCase().includes(query)
      );
  const totalScans = scansArray.length;
  const finishedScans = scansArray.filter((s: Scan) => s.scanFinished).length;
  const pagedScans = filteredScans.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <Box sx={{ pt: 10, px: 2 }}>
      <Paper sx={{ maxWidth: 1500, mx: 'auto', p: 2 }}>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
          <Card variant="outlined">
            <CardContent sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <Button
                variant="contained"
                onClick={() => {
                  startScan.mutate(undefined, {
                    onSuccess: (scan) => navigate('/StartScan', { state: { scan } }),
                  });
                }}
                disabled={startScan.isPending}
              >
                {startScan.isPending ? 'Starting...' : 'Start Scan'}
              </Button>
            </CardContent>
          </Card>
          <Card variant="outlined">
            <CardContent>
              <Stack direction="row" spacing={2} alignItems="flex-start">
                <Box sx={{ flex: 1, paddingLeft: '10rem' }}>
                  <Typography variant="subtitle2" color="text.secondary">Total Scans</Typography>
                  <Typography variant="h5">{totalScans}</Typography>
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="subtitle2" color="text.secondary">Finished Scans</Typography>
                  <Typography variant="h5">{finishedScans}</Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Box>
        <Box sx={{ mt: 2 }}>
          <Card variant="outlined">
            <CardContent>
              <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Typography variant="h6">Scans</Typography>
                  <TextField
                    size="small"
                    placeholder="Search control #"
                    value={search}
                    onChange={(e) => { setSearch((e.target as HTMLInputElement).value); setPage(0); }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon fontSize="small" />
                        </InputAdornment>
                      )
                    }}
                  />
                </Stack>
                <Stack direction="row" alignItems="center" spacing={2}>
                  <FormControl component="fieldset" variant="standard">
                    <RadioGroup
                      row
                      value={statusFilter}
                      onChange={(e) => {
                        const v = (e.target as HTMLInputElement).value as 'pending' | 'finished' | 'all';
                        setStatusFilter(v);
                        setPage(0);
                      }}
                    >
                      <FormControlLabel value="pending" control={<Radio size="small" />} label="Pending Scans" />
                      <FormControlLabel value="finished" control={<Radio size="small" />} label="Finished Scans" />
                      <FormControlLabel value="all" control={<Radio size="small" />} label="All" />
                    </RadioGroup>
                  </FormControl>
                  <TextField
                    type="date"
                    size="small"
                    label="From"
                    InputLabelProps={{ shrink: true }}
                    value={fromDate ?? ''}
                    onChange={(e) => { setFromDate((e.target as HTMLInputElement).value || null); setPage(0); }}
                  />
                  <TextField
                    type="date"
                    size="small"
                    label="To"
                    InputLabelProps={{ shrink: true }}
                    value={toDate ?? ''}
                    onChange={(e) => { setToDate((e.target as HTMLInputElement).value || null); setPage(0); }}
                  />
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => { setFromDate(null); setToDate(null); setPage(0); }}
                  >
                    Reset Dates
                  </Button>
                </Stack>
              </Stack>
              <>
                <TableContainer>
                  <Table size="small" stickyHeader aria-label="scans table" sx={{ '& td, & th': { py: 0.5, px: 1 } }}>
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 600, backgroundColor: 'background.paper' }}>Control #</TableCell>
                        <TableCell sx={{ fontWeight: 600, backgroundColor: 'background.paper' }}>Scan Date</TableCell>
                        <TableCell sx={{ fontWeight: 600, backgroundColor: 'background.paper' }}>Finished</TableCell>
                        <TableCell sx={{ fontWeight: 600, backgroundColor: 'background.paper' }}>Finished Date</TableCell>
                        <TableCell sx={{ fontWeight: 600, backgroundColor: 'background.paper' }}>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {isLoading ? (
                        <TableRow>
                          <TableCell colSpan={5}><Typography>Loading scans…</Typography></TableCell>
                        </TableRow>
                      ) : isError ? (
                        <TableRow>
                          <TableCell colSpan={5}><Typography color="error">Error loading scans{error ? `: ${(error as Error).message}` : ''}</Typography></TableCell>
                        </TableRow>
                      ) : (scansArray.length === 0) ? (
                        <TableRow>
                          <TableCell colSpan={5}><Typography variant="body2">No scans found</Typography></TableCell>
                        </TableRow>
                      ) : (
                        pagedScans.map((s: Scan) => (
                          <TableRow key={s.id} hover>
                            <TableCell>{s.scanControlNumber ?? '-'}</TableCell>
                            <TableCell>{s.scanDate ? new Date(s.scanDate).toLocaleString() : '-'}</TableCell>
                            <TableCell>{s.scanFinished ? 'Yes' : 'No'}</TableCell>
                            <TableCell>{s.scanFinishedDate ? new Date(s.scanFinishedDate).toLocaleString() : '-'}</TableCell>
                            <TableCell>
                              <Stack direction="row" spacing={1}>
                                <Button
                                  size="small"
                                  variant="outlined"
                                  onClick={() => navigate('/Results', { state: { scan: s } })}
                                >
                                  View Results
                                </Button>
                                {!s.scanFinished ? (
                                  <>
                                    <Button
                                      size="small"
                                      variant="contained"
                                      disabled={continueScan.isPending}
                                      onClick={() =>
                                        continueScan.mutate(s.id, {
                                          onSuccess: () => navigate('/StartScan', { state: { scan: s } }),
                                        })
                                      }
                                    >
                                      {continueScan.isPending ? 'Continuing...' : 'Continue Scanning'}
                                    </Button>
                                    <Button
                                      size="small"
                                      variant="outlined"
                                      color="success"
                                      disabled={finishScan.isPending}
                                      onClick={() => finishScan.mutate(s.id)}
                                    >
                                      {finishScan.isPending ? 'Finishing...' : 'Finish Scan'}
                                    </Button>
                                  </>
                                ) : (
                                  <Button
                                    size="small"
                                    variant="outlined"
                                    color="warning"
                                    disabled={continueScan.isPending}
                                    onClick={() => continueScan.mutate(s.id)}
                                  >
                                    {continueScan.isPending ? 'Reopening…' : 'Reopen Scan'}
                                  </Button>
                                )}
                                <Button
                                  size="small"
                                  variant="outlined"
                                  color="error"
                                  disabled={deleteScan.isPending}
                                  onClick={() => deleteScan.mutate(s.id)}
                                >
                                  Delete Scan
                                </Button>
                              </Stack>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
                <TablePagination
                  component="div"
                  count={filteredScans.length}
                  page={page}
                  onPageChange={(_e, newPage) => setPage(newPage)}
                  rowsPerPage={rowsPerPage}
                  onRowsPerPageChange={(e: ChangeEvent<HTMLInputElement>) => {
                    setRowsPerPage(parseInt(e.target.value, 10));
                    setPage(0);
                  }}
                  rowsPerPageOptions={[5, 10, 25, 50]}
                />
              </>
            </CardContent>
          </Card>
        </Box>
      </Paper>
    </Box>
  );
}

export default Scans