import { useState, useMemo } from 'react';
import {
  Box, Card, CardContent, Typography, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, Chip, Button, ToggleButtonGroup, ToggleButton,
  Dialog, DialogTitle, DialogContent, DialogActions, FormControl, InputLabel, Select, MenuItem,
  TextField, Skeleton, Alert, IconButton, Tooltip, Grid,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import { useAttendanceRecords, useMarkAttendance, useUpdateAttendance } from '../hooks/useAttendance';
import { useWeeklyTimetable } from '../hooks/useTimetable';
import { useAuth } from '../context/AuthContext';
import { AttendanceStatus, UserRole, TimetableEntry } from '../types';
import dayjs from 'dayjs';

const STATUS_COLORS: Record<string, string> = {
  Present: '#4caf50',
  Absent: '#f44336',
  Leave: '#9c27b0',
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
    } catch {
      // handled by react-query
    }
  };

  const handleEditStatus = async (id: string, newStatus: AttendanceStatus) => {
    try {
      await updateMutation.mutateAsync({ id, status: newStatus });
    } catch {
      // handled
    }
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" fontWeight={600}>Attendance</Typography>
        <Box display="flex" gap={2} alignItems="center">
          <ToggleButtonGroup value={view} exclusive onChange={(_, v) => v && setView(v)} size="small">
            <ToggleButton value="history">History</ToggleButton>
            {isFacultyOrAdmin && <ToggleButton value="mark">Mark</ToggleButton>}
          </ToggleButtonGroup>
          {isFacultyOrAdmin && view === 'mark' && (
            <Button variant="contained" onClick={() => setMarkDialog(true)}>
              Mark Attendance
            </Button>
          )}
        </Box>
      </Box>

      {view === 'mark' && isFacultyOrAdmin && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>Todays Schedule</Typography>
            <TextField
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              size="small"
              sx={{ mb: 2 }}
            />
            {todayTimetable.length > 0 ? (
              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Period</TableCell>
                      <TableCell>Subject</TableCell>
                      <TableCell>Faculty</TableCell>
                      <TableCell>Room</TableCell>
                      <TableCell>Time</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {todayTimetable.map((entry) => (
                      <TableRow key={entry._id} hover sx={{ cursor: 'pointer' }} onClick={() => {
                        setSelectedTimetableId(entry._id);
                        setMarkDialog(true);
                      }}>
                        <TableCell>{entry.period}</TableCell>
                        <TableCell>{entry.subject}</TableCell>
                        <TableCell>{entry.faculty}</TableCell>
                        <TableCell>{entry.room}</TableCell>
                        <TableCell>{entry.startTime}-{entry.endTime}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Alert severity="info">No classes scheduled for today</Alert>
            )}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>Attendance Records</Typography>
          {recordsLoading ? (
            <Skeleton variant="rounded" height={200} />
          ) : records.length > 0 ? (
            <TableContainer component={Paper} variant="outlined">
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Date</TableCell>
                    <TableCell>Day</TableCell>
                    <TableCell>Period</TableCell>
                    <TableCell>Subject</TableCell>
                    <TableCell>Status</TableCell>
                    {isFacultyOrAdmin && <TableCell>Actions</TableCell>}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {records.map((record) => (
                    <TableRow key={record._id}>
                      <TableCell>{dayjs(record.date).format('MMM D, YYYY')}</TableCell>
                      <TableCell>{record.day}</TableCell>
                      <TableCell>{record.period}</TableCell>
                      <TableCell>{record.subject}</TableCell>
                      <TableCell>
                        <Chip
                          label={record.status}
                          size="small"
                          sx={{
                            bgcolor: STATUS_COLORS[record.status],
                            color: '#fff',
                            fontWeight: 600,
                          }}
                        />
                      </TableCell>
                      {isFacultyOrAdmin && (
                        <TableCell>
                          {[AttendanceStatus.PRESENT, AttendanceStatus.ABSENT, AttendanceStatus.LEAVE].map((s) => (
                            <Tooltip key={s} title={`Change to ${s}`}>
                              <IconButton
                                size="small"
                                onClick={() => handleEditStatus(record._id, s)}
                                disabled={record.status === s || updateMutation.isPending}
                                sx={{
                                  color: STATUS_COLORS[s],
                                  opacity: record.status === s ? 0.4 : 1,
                                }}
                              >
                                <EditIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          ))}
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Alert severity="info">No attendance records found</Alert>
          )}
        </CardContent>
      </Card>

      <Dialog open={markDialog} onClose={() => setMarkDialog(false)}>
        <DialogTitle>Mark Attendance</DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column" gap={2} pt={1} minWidth={300}>
            <FormControl fullWidth>
              <InputLabel>Timetable Entry</InputLabel>
              <Select
                value={selectedTimetableId}
                label="Timetable Entry"
                onChange={(e) => setSelectedTimetableId(e.target.value)}
              >
                {todayTimetable.map((entry) => (
                  <MenuItem key={entry._id} value={entry._id}>
                    {entry.period} - {entry.subject}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={selectedStatus}
                label="Status"
                onChange={(e) => setSelectedStatus(e.target.value as AttendanceStatus)}
              >
                <MenuItem value={AttendanceStatus.PRESENT}>Present</MenuItem>
                <MenuItem value={AttendanceStatus.ABSENT}>Absent</MenuItem>
                <MenuItem value={AttendanceStatus.LEAVE}>Leave</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setMarkDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleMark} disabled={!selectedTimetableId || markMutation.isPending}>
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
