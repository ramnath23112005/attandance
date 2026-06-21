import { useState, useMemo } from 'react';
import {
  Box, Card, CardContent, Typography, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, Chip, Button, ToggleButtonGroup, ToggleButton,
  Dialog, DialogTitle, DialogContent, DialogActions, FormControl, InputLabel, Select,
  MenuItem, TextField, Skeleton, Alert, IconButton, Tooltip, Grid, Stack, Avatar,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import HowToRegIcon from '@mui/icons-material/HowToReg';
import HistoryIcon from '@mui/icons-material/History';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import EventBusyIcon from '@mui/icons-material/EventBusy';
import { useAttendanceRecords, useMarkAttendance, useUpdateAttendance } from '../hooks/useAttendance';
import { useWeeklyTimetable } from '../hooks/useTimetable';
import { useAuth } from '../context/AuthContext';
import { AttendanceStatus, UserRole, TimetableEntry } from '../types';
import dayjs from 'dayjs';

const STATUS_CONFIG: Record<string, { label: string; color: string; bgcolor: string; icon: React.ReactNode }> = {
  Present: { label: 'Present', color: '#2e7d32', bgcolor: '#e8f5e9', icon: <CheckCircleIcon fontSize="small" /> },
  Absent: { label: 'Absent', color: '#d32f2f', bgcolor: '#fbe9e7', icon: <CancelIcon fontSize="small" /> },
  Leave: { label: 'Leave', color: '#e65100', bgcolor: '#fff3e0', icon: <EventBusyIcon fontSize="small" /> },
};

export default function AttendancePage() {
  const { user, hasRole } = useAuth();
  const isFacultyOrAdmin = hasRole(UserRole.ADMIN, UserRole.FACULTY);
  const [view, setView] = useState<'mark' | 'history'>('history');
  const [selectedDate, setSelectedDate] = useState(dayjs().format('YYYY-MM-DD'));
  const [markDialog, setMarkDialog] = useState(false);
  const [selectedTimetableId, setSelectedTimetableId] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<AttendanceStatus>(AttendanceStatus.PRESENT);
  const [editId, setEditId] = useState<string | null>(null);
  const [editStatus, setEditStatus] = useState<AttendanceStatus>(AttendanceStatus.PRESENT);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  const { data: recordsData, isLoading: recordsLoading } = useAttendanceRecords(isFacultyOrAdmin ? undefined : user?.id);
  const { data: weeklyData } = useWeeklyTimetable();
  const markMutation = useMarkAttendance();
  const updateMutation = useUpdateAttendance();

  const records = recordsData?.data || [];
  const timetable = weeklyData || {};

  const todayTimetable = useMemo(() => {
    const dayName = dayjs(selectedDate).format('dddd');
    return (timetable[dayName] || []) as TimetableEntry[];
  }, [timetable, selectedDate]);

  const handleMark = async () => {
    if (!selectedTimetableId || !user) return;
    try {
      await markMutation.mutateAsync({
        userId: user.id,
        timetableId: selectedTimetableId,
        date: dayjs().toISOString(),
        status: selectedStatus,
      });
      setMarkDialog(false);
    } catch { /* handled */ }
  };

  const handleEditClick = (id: string, currentStatus: string) => {
    setEditId(id);
    setEditStatus(currentStatus as AttendanceStatus);
    setEditDialogOpen(true);
  };

  const handleEditSave = async () => {
    if (!editId) return;
    try {
      await updateMutation.mutateAsync({ id: editId, status: editStatus });
      setEditDialogOpen(false);
    } catch { /* handled */ }
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3} flexWrap="wrap" gap={2}>
        <Box>
          <Typography variant="h5" fontWeight={800}>Attendance</Typography>
          <Typography variant="body2" color="text.secondary">Track and manage attendance records</Typography>
        </Box>
        <Box display="flex" gap={2} alignItems="center">
          <ToggleButtonGroup value={view} exclusive onChange={(_, v) => v && setView(v)} size="small">
            <ToggleButton value="history" sx={{ px: 2 }}>
              <HistoryIcon sx={{ mr: 0.5, fontSize: 18 }} /> History
            </ToggleButton>
            {isFacultyOrAdmin && (
              <ToggleButton value="mark" sx={{ px: 2 }}>
                <HowToRegIcon sx={{ mr: 0.5, fontSize: 18 }} /> Mark
              </ToggleButton>
            )}
          </ToggleButtonGroup>
        </Box>
      </Box>

      {view === 'mark' && isFacultyOrAdmin && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6" fontWeight={700}>Today's Schedule</Typography>
              <TextField
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                size="small"
                sx={{ '& input': { fontSize: '0.875rem' } }}
              />
            </Box>
            {todayTimetable.length > 0 ? (
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Period</TableCell>
                      <TableCell>Subject</TableCell>
                      <TableCell>Faculty</TableCell>
                      <TableCell>Room</TableCell>
                      <TableCell>Time</TableCell>
                      <TableCell align="center">Action</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {todayTimetable.map((entry) => (
                      <TableRow key={entry._id} hover>
                        <TableCell>
                          <Chip label={entry.period} size="small" color="primary" variant="outlined" />
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
                        <TableCell align="center">
                          <Button
                            variant="contained"
                            size="small"
                            disableElevation
                            sx={{ borderRadius: 2, px: 2, fontSize: '0.75rem' }}
                            onClick={() => {
                              setSelectedTimetableId(entry._id);
                              setMarkDialog(true);
                            }}
                          >
                            Mark
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Alert severity="info" sx={{ borderRadius: 2 }}>
                No classes scheduled for {selectedDate === dayjs().format('YYYY-MM-DD') ? 'today' : 'this date'}
              </Alert>
            )}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6" fontWeight={700}>Attendance Records</Typography>
            <Typography variant="caption" color="text.secondary">{records.length} record{records.length !== 1 ? 's' : ''}</Typography>
          </Box>
          {recordsLoading ? (
            <Skeleton variant="rounded" height={300} sx={{ borderRadius: 2 }} />
          ) : records.length > 0 ? (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Date</TableCell>
                    <TableCell>Day</TableCell>
                    <TableCell>Period</TableCell>
                    <TableCell>Subject</TableCell>
                    <TableCell>Status</TableCell>
                    {isFacultyOrAdmin && <TableCell align="center">Actions</TableCell>}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {records.map((record) => {
                    const sc = STATUS_CONFIG[record.status];
                    return (
                      <TableRow key={record._id} hover>
                        <TableCell>
                          <Typography variant="body2" fontWeight={600}>
                            {dayjs(record.date).format('MMM D, YYYY')}
                          </Typography>
                        </TableCell>
                        <TableCell>{record.day}</TableCell>
                        <TableCell>
                          <Chip label={record.period} size="small" variant="outlined" color="primary" />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" fontWeight={500}>{record.subject}</Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            icon={sc?.icon}
                            label={record.status}
                            size="small"
                            sx={{ bgcolor: sc?.bgcolor, color: sc?.color, fontWeight: 700, '& .MuiChip-icon': { color: sc?.color } }}
                          />
                        </TableCell>
                        {isFacultyOrAdmin && (
                          <TableCell align="center">
                            <Tooltip title="Edit Status">
                              <IconButton size="small" onClick={() => handleEditClick(record._id, record.status)}>
                                <EditIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </TableCell>
                        )}
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          ) : <Alert severity="info">No attendance records found</Alert>}
        </CardContent>
      </Card>

      <Dialog open={markDialog} onClose={() => setMarkDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ pb: 1 }}>Mark Attendance</DialogTitle>
        <DialogContent>
          <Stack spacing={2.5} pt={1}>
            <FormControl fullWidth>
              <InputLabel>Timetable Entry</InputLabel>
              <Select value={selectedTimetableId} label="Timetable Entry" onChange={(e) => setSelectedTimetableId(e.target.value)}>
                {todayTimetable.map((entry) => (
                  <MenuItem key={entry._id} value={entry._id}>
                    {entry.period} — {entry.subject}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select value={selectedStatus} label="Status" onChange={(e) => setSelectedStatus(e.target.value as AttendanceStatus)}>
                <MenuItem value={AttendanceStatus.PRESENT}>Present</MenuItem>
                <MenuItem value={AttendanceStatus.ABSENT}>Absent</MenuItem>
                <MenuItem value={AttendanceStatus.LEAVE}>Leave</MenuItem>
              </Select>
            </FormControl>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setMarkDialog(false)} color="inherit">Cancel</Button>
          <Button variant="contained" disableElevation onClick={handleMark} disabled={!selectedTimetableId || markMutation.isPending}>
            Save
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ pb: 1 }}>Edit Status</DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ pt: 1 }}>
            <InputLabel>New Status</InputLabel>
            <Select value={editStatus} label="New Status" onChange={(e) => setEditStatus(e.target.value as AttendanceStatus)}>
              <MenuItem value={AttendanceStatus.PRESENT}>Present</MenuItem>
              <MenuItem value={AttendanceStatus.ABSENT}>Absent</MenuItem>
              <MenuItem value={AttendanceStatus.LEAVE}>Leave</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setEditDialogOpen(false)} color="inherit">Cancel</Button>
          <Button variant="contained" disableElevation onClick={handleEditSave} disabled={updateMutation.isPending}>
            Update
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
