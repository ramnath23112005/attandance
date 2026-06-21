import { useState } from 'react';
import {
  Box, Card, CardContent, Typography, Grid, ToggleButtonGroup, ToggleButton,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Skeleton, Alert,
} from '@mui/material';
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, AreaChart, Area, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
} from 'recharts';
import { useAttendanceStats, useAttendanceTrend, useAttendancePrediction, useAttendanceHeatmap } from '../hooks/useAttendance';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';

const COLORS = { present: '#4caf50', absent: '#f44336', leave: '#9c27b0' };

export default function Analytics() {
  const { user, hasRole } = useAuth();
  const userId = hasRole(UserRole.ADMIN) ? undefined : user?.id;
  const [chartType, setChartType] = useState<'pie' | 'bar' | 'radar'>('pie');

  const { overall, bySubject, weekly, monthly } = useAttendanceStats(userId);
  const { data: trend } = useAttendanceTrend(userId, 12);
  const { data: prediction } = useAttendancePrediction(userId);
  const { data: heatmap } = useAttendanceHeatmap(userId);

  if (overall.isLoading || bySubject.isLoading) {
    return <Skeleton variant="rounded" height={600} />;
  }

  const stats = overall.data;
  const subjectData = bySubject.data || [];
  const pieData = stats
    ? [
        { name: 'Present', value: stats.present, color: COLORS.present },
        { name: 'Absent', value: stats.absent, color: COLORS.absent },
        { name: 'Leave', value: stats.leave, color: COLORS.leave },
      ]
    : [];

  const radarData = subjectData.map((s) => ({
    subject: s.subject,
    percentage: s.percentage,
  }));

  const heatmapEntries = heatmap ? Object.entries(heatmap) : [];

  return (
    <Box>
      <Typography variant="h5" fontWeight={600} mb={3}>Attendance Analytics</Typography>

      <Grid container spacing={3} mb={3}>
        <Grid item xs={12} md={3}>
          <Card><CardContent>
            <Typography variant="body2" color="text.secondary">Overall</Typography>
            <Typography variant="h3" fontWeight={700} color={stats && stats.percentage >= 75 ? 'success.main' : 'error.main'}>
              {stats?.percentage ?? 0}%
            </Typography>
            <Typography variant="body2">{stats?.present}/{stats?.total} lectures</Typography>
          </CardContent></Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card><CardContent>
            <Typography variant="body2" color="text.secondary">This Week</Typography>
            <Typography variant="h4" fontWeight={700}>{weekly.data?.percentage ?? 0}%</Typography>
          </CardContent></Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card><CardContent>
            <Typography variant="body2" color="text.secondary">This Month</Typography>
            <Typography variant="h4" fontWeight={700}>{monthly.data?.percentage ?? 0}%</Typography>
          </CardContent></Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card><CardContent>
            <Typography variant="body2" color="text.secondary">Predicted Final</Typography>
            <Typography variant="h4" fontWeight={700} color={prediction?.isOnTrack ? 'success.main' : 'warning.main'}>
              {prediction?.projectedPercentage ?? 0}%
            </Typography>
          </CardContent></Card>
        </Grid>
      </Grid>

      <Grid container spacing={3} mb={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6">Distribution</Typography>
                <ToggleButtonGroup value={chartType} exclusive onChange={(_, v) => v && setChartType(v)} size="small">
                  <ToggleButton value="pie">Pie</ToggleButton>
                  <ToggleButton value="bar">Bar</ToggleButton>
                  <ToggleButton value="radar">Radar</ToggleButton>
                </ToggleButtonGroup>
              </Box>
              {chartType === 'pie' ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" outerRadius={100} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                      {pieData.map((e, i) => <Cell key={i} fill={e.color} />)}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : chartType === 'bar' ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={pieData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                      {pieData.map((e, i) => <Cell key={i} fill={e.color} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <RadarChart data={radarData}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="subject" />
                    <PolarRadiusAxis domain={[0, 100]} />
                    <Radar dataKey="percentage" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                  </RadarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" mb={2}>Attendance Trend (12 Months)</Typography>
              {trend && trend.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={trend}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis domain={[0, 100]} unit="%" />
                    <Tooltip />
                    <Line type="monotone" dataKey="percentage" stroke="#8884d8" strokeWidth={2} dot={{ r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <Alert severity="info">No trend data</Alert>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} md={7}>
          <Card>
            <CardContent>
              <Typography variant="h6" mb={2}>Subject-wise Performance</Typography>
              {subjectData.length > 0 ? (
                <TableContainer component={Paper} variant="outlined">
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Subject</TableCell>
                        <TableCell align="center">Total</TableCell>
                        <TableCell align="center">Present</TableCell>
                        <TableCell align="center">Absent</TableCell>
                        <TableCell align="center">Leave</TableCell>
                        <TableCell align="center">%</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {subjectData.map((s) => (
                        <TableRow key={s.subject}>
                          <TableCell>{s.subject}</TableCell>
                          <TableCell align="center">{s.total}</TableCell>
                          <TableCell align="center" sx={{ color: COLORS.present }}>{s.present}</TableCell>
                          <TableCell align="center" sx={{ color: COLORS.absent }}>{s.absent}</TableCell>
                          <TableCell align="center" sx={{ color: COLORS.leave }}>{s.leave}</TableCell>
                          <TableCell align="center">
                            <Typography fontWeight={600} color={s.percentage >= 75 ? 'success.main' : 'error.main'}>
                              {s.percentage}%
                            </Typography>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Alert severity="info">No subject data</Alert>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={5}>
          <Card>
            <CardContent>
              <Typography variant="h6" mb={2}>Prediction</Typography>
              {prediction ? (
                <Box>
                  <Typography variant="body1" gutterBottom>
                    Current: <strong>{prediction.currentPercentage}%</strong>
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    Target: <strong>{prediction.targetPercentage}%</strong>
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    Projected: <strong>{prediction.projectedPercentage}%</strong>
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    Lectures needed: <strong>{prediction.lecturesRequired}</strong>
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    Max skips allowed: <strong>{prediction.maxSkips}</strong>
                  </Typography>
                  <Typography variant="body2" color={prediction.isOnTrack ? 'success.main' : 'warning.main'} mt={2}>
                    {prediction.warning}
                  </Typography>
                </Box>
              ) : (
                <Alert severity="info">No data for prediction</Alert>
              )}
            </CardContent>
          </Card>

          <Card sx={{ mt: 3 }}>
            <CardContent>
              <Typography variant="h6" mb={2}>Attendance Heatmap ({new Date().getMonth() + 1}/{new Date().getFullYear()})</Typography>
              {heatmapEntries.length > 0 ? (
                <Box display="flex" flexWrap="wrap" gap={1}>
                  {heatmapEntries.map(([date, status]) => (
                    <Tooltip key={date} title={`${date}: ${status}`}>
                      <Box
                        sx={{
                          width: 24, height: 24, borderRadius: 0.5,
                          bgcolor: status === 'Present' ? COLORS.present : status === 'Absent' ? COLORS.absent : COLORS.leave,
                          cursor: 'pointer',
                        }}
                      />
                    </Tooltip>
                  ))}
                </Box>
              ) : (
                <Alert severity="info">No heatmap data</Alert>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
