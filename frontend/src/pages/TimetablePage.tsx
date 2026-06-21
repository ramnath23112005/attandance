import { useState, useMemo } from 'react';
import {
  Box, Card, CardContent, Typography, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, Chip, ToggleButtonGroup, ToggleButton, Skeleton, Alert, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem, IconButton, Tooltip,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
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
  Monday: '#e3f2fd',
  Tuesday: '#fce4ec',
  Wednesday: '#e8f5e9',
  Thursday: '#fff3e0',
  Friday: '#f3e5f5',
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

  const timetable = useMemo(() => {
    if (!weeklyData) return {};
    return weeklyData;
  }, [weeklyData]);

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
      subjectId: typeof entry.subjectId === 'string' ? entry.subjectId : entry.subjectId?._id || '',
      faculty: entry.faculty,
      facultyId: typeof entry.facultyId === 'string' ? entry.facultyId : entry.facultyId?._id || '',
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
    } catch {
      // handled by react-query
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Delete this timetable entry?')) {
      await deleteMutation.mutateAsync(id);
    }
  };

  if (isLoading) {
    return <Skeleton variant="rounded" height={400} />;
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" fontWeight={600}>Timetable</Typography>
        <Box display="flex" gap={2}>
          <ToggleButtonGroup value={view} exclusive onChange={(_, v) => v && setView(v)} size="small">
            <ToggleButton value="weekly">Weekly</ToggleButton>
            <ToggleButton value="list">List</ToggleButton>
          </ToggleButtonGroup>
          {isAdmin && (
            <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenCreate}>
              Add Entry
            </Button>
          )}
        </Box>
      </Box>

      {view === 'weekly' ? (
        <TableContainer component={Paper}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 600, minWidth: 100 }}>Time / Day</TableCell>
                {PERIODS.map((p) => (
                  <TableCell key={p.label} sx={{ fontWeight: 600, minWidth: 140, textAlign: 'center' }}>
                    {p.label}<br /><Typography variant="caption">{p.time}</Typography>
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {DAYS.map((day) => {
                const dayEntries = (timetable[day] || []) as TimetableEntry[];
                return (
                  <TableRow key={day} sx={{ bgcolor: DAY_COLORS[day] || 'inherit' }}>
                    <TableCell sx={{ fontWeight: 600 }}>{day}</TableCell>
                    {PERIODS.map((period) => {
                      const entry = dayEntries.find((e) => e.period === period.label);
                      return (
                        <TableCell key={period.label} sx={{ textAlign: 'center', p: 1 }}>
                          {entry ? (
                            <Box>
                              <Typography variant="body2" fontWeight={600}>{entry.subject}</Typography>
                              <Typography variant="caption" display="block">{entry.faculty}</Typography>
                              <Typography variant="caption" color="text.secondary">{entry.room}</Typography>
                              {isAdmin && (
                                <Box mt={0.5}>
                                  <Tooltip title="Edit"><IconButton size="small" onClick={() => handleOpenEdit(entry)}><EditIcon fontSize="small" /></IconButton></Tooltip>
                                  <Tooltip title="Delete"><IconButton size="small" onClick={() => handleDelete(entry._id)}><DeleteIcon fontSize="small" /></IconButton></Tooltip>
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
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Day</TableCell>
                <TableCell>Period</TableCell>
                <TableCell>Subject</TableCell>
                <TableCell>Faculty</TableCell>
                <TableCell>Room</TableCell>
                <TableCell>Time</TableCell>
                {isAdmin && <TableCell>Actions</TableCell>}
              </TableRow>
            </TableHead>
            <TableBody>
              {Object.entries(timetable).flatMap(([day, entries]) =>
                (entries as TimetableEntry[]).map((entry) => (
                  <TableRow key={entry._id}>
                    <TableCell><Chip label={day} size="small" /></TableCell>
                    <TableCell>{entry.period}</TableCell>
                    <TableCell>{entry.subject}</TableCell>
                    <TableCell>{entry.faculty}</TableCell>
                    <TableCell>{entry.room}</TableCell>
                    <TableCell>{entry.startTime} - {entry.endTime}</TableCell>
                    {isAdmin && (
                      <TableCell>
                        <IconButton size="small" onClick={() => handleOpenEdit(entry)}><EditIcon /></IconButton>
                        <IconButton size="small" onClick={() => handleDelete(entry._id)}><DeleteIcon /></IconButton>
                      </TableCell>
                    )}
                  </TableRow>
                ))
              )}
              {Object.keys(timetable).length === 0 && (
                <TableRow><TableCell colSpan={isAdmin ? 7 : 6}><Alert severity="info">No timetable data</Alert></TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editId ? 'Edit Timetable Entry' : 'Create Timetable Entry'}</DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column" gap={2} pt={1}>
            <TextField select label="Day" value={form.day} onChange={handleFormChange('day')}>
              {DAYS.map((d) => <MenuItem key={d} value={d}>{d}</MenuItem>)}
            </TextField>
            <TextField select label="Period" value={form.period} onChange={handleFormChange('period')}>
              {PERIODS.map((p) => <MenuItem key={p.label} value={p.label}>{p.label} ({p.time})</MenuItem>)}
            </TextField>
            <TextField type="number" label="Period Order" value={form.periodOrder} onChange={handleFormChange('periodOrder')} />
            <TextField select label="Subject" value={form.subjectId} onChange={handleFormChange('subjectId')}>
              {subjects.map((s) => <MenuItem key={s._id} value={s._id}>{s.code} - {s.name}</MenuItem>)}
            </TextField>
            <TextField label="Faculty Name" value={form.faculty} onChange={handleFormChange('faculty')} />
            <TextField label="Faculty ID" value={form.facultyId} onChange={handleFormChange('facultyId')} />
            <TextField label="Room" value={form.room} onChange={handleFormChange('room')} />
            <TextField label="Section" value={form.section} onChange={handleFormChange('section')} />
            <TextField label="Start Time" value={form.startTime} onChange={handleFormChange('startTime')} helperText="HH:MM format" />
            <TextField label="End Time" value={form.endTime} onChange={handleFormChange('endTime')} helperText="HH:MM format" />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSave} disabled={createMutation.isPending || updateMutation.isPending}>
            {editId ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
