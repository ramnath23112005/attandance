import { useState, useMemo } from 'react';
import {
  Box, Card, CardContent, Typography, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, Chip, ToggleButtonGroup, ToggleButton, Skeleton, Alert,
  Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem,
  IconButton, Tooltip, Stack, Avatar,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CalendarViewWeekIcon from '@mui/icons-material/CalendarViewWeek';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import ScheduleIcon from '@mui/icons-material/Schedule';
import { useWeeklyTimetable, useCreateTimetable, useUpdateTimetable, useDeleteTimetable } from '../hooks/useTimetable';
import { useSubjects } from '../hooks/useSubjects';
import { useAuth } from '../context/AuthContext';
import { UserRole, TimetableEntry } from '../types';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const PERIODS = Array.from({ length: 8 }, (_, i) => ({
  label: `Lecture ${i + 1}`,
  time: ['8:40-9:30', '9:30-10:20', '10:20-11:10', '11:10-12:00', '12:00-12:50', '12:50-14:00', '14:00-14:50', '14:50-15:40'][i],
}));

const DAY_COLORS: Record<string, string> = {
  Monday: '#e3f2fd', Tuesday: '#fce4ec', Wednesday: '#e8f5e9', Thursday: '#fff3e0', Friday: '#f3e5f5',
};

const defaultForm = {
  day: 'Monday', period: 'Lecture 1', periodOrder: 1, subject: '', subjectId: '',
  faculty: '', facultyId: '', room: '', section: 'A', startTime: '08:40', endTime: '09:30',
};

export default function TimetablePage() {
  const { data: weeklyData, isLoading } = useWeeklyTimetable();
  const { data: subjectsData } = useSubjects();
  const createMutation = useCreateTimetable();
  const updateMutation = useUpdateTimetable();
  const deleteMutation = useDeleteTimetable();
  const { hasRole } = useAuth();
  const isAdmin = hasRole(UserRole.ADMIN);

  const [view, setView] = useState<'weekly' | 'list'>('weekly');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(defaultForm);

  const subjects = subjectsData?.data || [];
  const timetable = useMemo(() => weeklyData || {}, [weeklyData]);

  const handleFormChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setForm((prev) => {
      const updated = { ...prev, [field]: val };
      if (field === 'subjectId') {
        const sub = subjects.find((s) => s._id === val);
        if (sub) updated.subject = sub.code;
      }
      return updated;
    });
  };

  const handleOpenCreate = () => {
    setEditId(null);
    setForm(defaultForm);
    setDialogOpen(true);
  };

  const handleOpenEdit = (entry: TimetableEntry) => {
    setEditId(entry._id);
    setForm({
      day: entry.day,
      period: entry.period,
      periodOrder: entry.periodOrder,
      subject: entry.subject,
      subjectId: typeof entry.subjectId === 'string' ? entry.subjectId : (entry.subjectId as Record<string, string>)?._id || '',
      faculty: entry.faculty,
      facultyId: typeof entry.facultyId === 'string' ? entry.facultyId : (entry.facultyId as Record<string, string>)?._id || '',
      room: entry.room,
      section: entry.section,
      startTime: entry.startTime,
      endTime: entry.endTime,
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    try {
      if (editId) {
        await updateMutation.mutateAsync({ id: editId, data: form });
      } else {
        await createMutation.mutateAsync(form as unknown as Omit<TimetableEntry, '_id' | 'isActive' | 'createdAt' | 'updatedAt'>);
      }
      setDialogOpen(false);
    } catch { /* handled */ }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Delete this timetable entry?')) {
      await deleteMutation.mutateAsync(id);
    }
  };

  if (isLoading) {
    return <Skeleton variant="rounded" height={500} sx={{ borderRadius: 3 }} />;
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3} flexWrap="wrap" gap={2}>
        <Box>
          <Typography variant="h5" fontWeight={800}>Timetable</Typography>
          <Typography variant="body2" color="text.secondary">Weekly academic schedule</Typography>
        </Box>
        <Box display="flex" gap={2} alignItems="center">
          <ToggleButtonGroup value={view} exclusive onChange={(_, v) => v && setView(v)} size="small">
            <ToggleButton value="weekly" sx={{ px: 2 }}>
              <CalendarViewWeekIcon sx={{ mr: 0.5, fontSize: 18 }} /> Weekly
            </ToggleButton>
            <ToggleButton value="list" sx={{ px: 2 }}>
              <FormatListBulletedIcon sx={{ mr: 0.5, fontSize: 18 }} /> List
            </ToggleButton>
          </ToggleButtonGroup>
          {isAdmin && (
            <Button variant="contained" startIcon={<AddIcon />} disableElevation onClick={handleOpenCreate}>
              Add Entry
            </Button>
          )}
        </Box>
      </Box>

      {view === 'weekly' ? (
        <Card>
          <TableContainer>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700, minWidth: 100, bgcolor: '#f8f9fc' }}>Day</TableCell>
                  {PERIODS.map((p) => (
                    <TableCell key={p.label} sx={{ fontWeight: 700, minWidth: 130, textAlign: 'center', bgcolor: '#f8f9fc' }}>
                      {p.label}
                      <Typography variant="caption" display="block" color="text.secondary" fontWeight={500}>{p.time}</Typography>
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {DAYS.map((day) => {
                  const dayEntries = (timetable[day] || []) as TimetableEntry[];
                  return (
                    <TableRow key={day} sx={{ bgcolor: DAY_COLORS[day] || 'inherit' }}>
                      <TableCell sx={{ fontWeight: 700, color: '#1a237e' }}>{day}</TableCell>
                      {PERIODS.map((period) => {
                        const entry = dayEntries.find((e) => e.period === period.label);
                        return (
                          <TableCell key={period.label} sx={{ textAlign: 'center', p: 1 }}>
                            {entry ? (
                              <Box
                                sx={{
                                  bgcolor: 'rgba(255,255,255,0.9)',
                                  borderRadius: 2,
                                  p: 0.8,
                                  border: '1px solid #e0e0e0',
                                  transition: 'all 0.2s',
                                  '&:hover': { borderColor: '#1a237e', boxShadow: '0 2px 8px rgba(26,35,126,0.1)' },
                                }}
                              >
                                <Typography variant="body2" fontWeight={700} color="#1a237e">{entry.subject}</Typography>
                                <Typography variant="caption" display="block" color="text.secondary">{entry.faculty}</Typography>
                                <Typography variant="caption" display="block" color="text.secondary">
                                  <ScheduleIcon sx={{ fontSize: 11, mr: 0.3, verticalAlign: 'text-top' }} />
                                  {entry.room}
                                </Typography>
                                {isAdmin && (
                                  <Box mt={0.3}>
                                    <IconButton size="small" onClick={() => handleOpenEdit(entry)} sx={{ p: 0.3 }}>
                                      <EditIcon sx={{ fontSize: 14 }} />
                                    </IconButton>
                                    <IconButton size="small" onClick={() => handleDelete(entry._id)} color="error" sx={{ p: 0.3 }}>
                                      <DeleteIcon sx={{ fontSize: 14 }} />
                                    </IconButton>
                                  </Box>
                                )}
                              </Box>
                            ) : (
                              <Typography variant="caption" color="text.disabled">—</Typography>
                            )}
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
      ) : (
        <Card>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Day</TableCell>
                  <TableCell>Period</TableCell>
                  <TableCell>Subject</TableCell>
                  <TableCell>Faculty</TableCell>
                  <TableCell>Room</TableCell>
                  <TableCell>Time</TableCell>
                  {isAdmin && <TableCell align="center">Actions</TableCell>}
                </TableRow>
              </TableHead>
              <TableBody>
                {Object.entries(timetable).flatMap(([day, entries]) =>
                  (entries as TimetableEntry[]).map((entry) => (
                    <TableRow key={entry._id} hover>
                      <TableCell>
                        <Chip label={day} size="small" sx={{ bgcolor: DAY_COLORS[day], fontWeight: 600 }} />
                      </TableCell>
                      <TableCell>
                        <Chip label={entry.period} size="small" variant="outlined" color="primary" />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight={600}>{entry.subject}</Typography>
                      </TableCell>
                      <TableCell>{entry.faculty}</TableCell>
                      <TableCell>{entry.room}</TableCell>
                      <TableCell>
                        <Typography variant="caption" color="text.secondary">
                          {entry.startTime} - {entry.endTime}
                        </Typography>
                      </TableCell>
                      {isAdmin && (
                        <TableCell align="center">
                          <IconButton size="small" onClick={() => handleOpenEdit(entry)} sx={{ mr: 0.5 }}>
                            <EditIcon fontSize="small" />
                          </IconButton>
                          <IconButton size="small" onClick={() => handleDelete(entry._id)} color="error">
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </TableCell>
                      )}
                    </TableRow>
                  ))
                )}
                {Object.keys(timetable).length === 0 && (
                  <TableRow>
                    <TableCell colSpan={isAdmin ? 7 : 6}>
                      <Alert severity="info">No timetable data available</Alert>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
      )}

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ pb: 1 }}>{editId ? 'Edit Timetable Entry' : 'Create Timetable Entry'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} pt={1}>
            <TextField select label="Day" value={form.day} onChange={handleFormChange('day')}>
              {DAYS.map((d) => <MenuItem key={d} value={d}>{d}</MenuItem>)}
            </TextField>
            <TextField select label="Period" value={form.period} onChange={handleFormChange('period')}>
              {PERIODS.map((p) => <MenuItem key={p.label} value={p.label}>{p.label} ({p.time})</MenuItem>)}
            </TextField>
            <TextField type="number" label="Period Order" value={form.periodOrder} onChange={handleFormChange('periodOrder')} inputProps={{ min: 1, max: 8 }} />
            <TextField select label="Subject" value={form.subjectId} onChange={handleFormChange('subjectId')}>
              {subjects.map((s) => <MenuItem key={s._id} value={s._id}>{s.code} — {s.name}</MenuItem>)}
            </TextField>
            <TextField label="Faculty Name" value={form.faculty} onChange={handleFormChange('faculty')} />
            <TextField label="Faculty ID" value={form.facultyId} onChange={handleFormChange('facultyId')} />
            <Box display="flex" gap={2}>
              <TextField label="Room" value={form.room} onChange={handleFormChange('room')} />
              <TextField label="Section" value={form.section} onChange={handleFormChange('section')} />
            </Box>
            <Box display="flex" gap={2}>
              <TextField label="Start Time" value={form.startTime} onChange={handleFormChange('startTime')} helperText="HH:MM" />
              <TextField label="End Time" value={form.endTime} onChange={handleFormChange('endTime')} helperText="HH:MM" />
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDialogOpen(false)} color="inherit">Cancel</Button>
          <Button variant="contained" disableElevation onClick={handleSave} disabled={createMutation.isPending || updateMutation.isPending}>
            {editId ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
