import { useState } from 'react';
import {
  Box, Card, CardContent, Typography, Grid, ToggleButtonGroup, ToggleButton,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
  Skeleton, Alert, Chip, LinearProgress, Stack, Avatar, Divider,
} from '@mui/material';
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, LineChart, Line, AreaChart, Area,
} from 'recharts';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import AssessmentIcon from '@mui/icons-material/Assessment';
import SchoolIcon from '@mui/icons-material/School';
import { useAttendanceStats, useAttendanceTrend, useAttendancePrediction, useAttendanceHeatmap } from '../hooks/useAttendance';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';

const PIE_COLORS = ['#2e7d32', '#d32f2f', '#e65100'];

const CustomTooltip = ({ active, payload, label }: Record<string, unknown>) => {
  if (active && payload && payload.length) {
    return (
      <Box sx={{ bgcolor: 'background.paper', p: 1.5, borderRadius: 2, boxShadow: '0 4px 12px rgba(0,0,0,0.15)', border: '1px solid #e8eaf0' }}>
        <Typography variant="caption" fontWeight={600}>{label}</Typography>
        {(payload as Array<{ name: string; value: number }>).map((p) => (
          <Typography key={p.name} variant="body2">{p.name}: {p.value}%</Typography>
        ))}
      </Box>
    );
  }
  return null;
};

function KpiCard({ icon, title, value, subtitle, color }: {
  icon: React.ReactNode; title: string; value: string; subtitle?: string; color: string;
}) {
  return (
    <Card sx={{ height: '100%' }}>
      <CardContent sx={{ p: 2.5 }}>
        <Box display="flex" alignItems="flex-start" justifyContent="space-between" mb={1}>
          <Box>
            <Typography variant="caption" color="text.secondary" fontWeight={600} textTransform="uppercase" letterSpacing="0.08em">
              {title}
            </Typography>
            <Typography variant="h4" fontWeight={800} sx={{ mt: 0.5, color }}>
              {value}
            </Typography>
          </Box>
          <Avatar sx={{ bgcolor: color, width: 42, height: 42, opacity: 0.9 }}>
            {icon}
          </Avatar>
        </Box>
        {subtitle && (
          <Typography variant="body2" color="text.secondary">{subtitle}</Typography>
        )}
      </CardContent>
    </Card>
  );
}

export default function Analytics() {
  const { user, hasRole } = useAuth();
  const userId = hasRole(UserRole.ADMIN) ? undefined : user?.id;
  const [chartType, setChartType] = useState<'pie' | 'bar'>('pie');

  const { overall, bySubject, weekly, monthly } = useAttendanceStats(userId);
  const { data: trend } = useAttendanceTrend(userId, 12);
  const { data: prediction } = useAttendancePrediction(userId);
  const { data: heatmap } = useAttendanceHeatmap(userId);

  if (overall.isLoading || bySubject.isLoading) {
    return <Skeleton variant="rounded" height={600} sx={{ borderRadius: 3 }} />;
  }

  const stats = overall.data;
  const subjectData = bySubject.data || [];
  const pieData = stats
    ? [
        { name: 'Present', value: stats.present },
        { name: 'Absent', value: stats.absent },
        { name: 'Leave', value: stats.leave },
      ]
    : [];

  const heatmapEntries = heatmap ? Object.entries(heatmap) : [];

  return (
    <Box>
      <Typography variant="h5" fontWeight={800} mb={0.5}>Analytics</Typography>
      <Typography variant="body2" color="text.secondary" mb={3}>
        Deep dive into attendance trends and predictions
      </Typography>

      <Grid container spacing={3} mb={4}>
        <Grid item xs={6} md={3}>
          <KpiCard title="Overall" value={`${stats?.percentage ?? 0}%`} subtitle={`${stats?.present}/${stats?.total} lectures`} color="#1a237e" icon={<AssessmentIcon />} />
        </Grid>
        <Grid item xs={6} md={3}>
          <KpiCard title="This Week" value={`${weekly.data?.percentage ?? 0}%`} color="#2e7d32" icon={<CalendarMonthIcon />} />
        </Grid>
        <Grid item xs={6} md={3}>
          <KpiCard title="This Month" value={`${monthly.data?.percentage ?? 0}%`} color="#1565c0" icon={<TrendingUpIcon />} />
        </Grid>
        <Grid item xs={6} md={3}>
          <KpiCard
            title="Predicted Final"
            value={`${prediction?.projectedPercentage ?? 0}%`}
            color={prediction?.isOnTrack ? '#2e7d32' : '#e65100'}
            icon={<SchoolIcon />}
          />
        </Grid>
      </Grid>

      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} md={5}>
          <Card>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6" fontWeight={700}>Distribution</Typography>
                <ToggleButtonGroup value={chartType} exclusive onChange={(_, v) => v && setChartType(v)} size="small">
                  <ToggleButton value="pie" sx={{ px: 2 }}>Pie</ToggleButton>
                  <ToggleButton value="bar" sx={{ px: 2 }}>Bar</ToggleButton>
                </ToggleButtonGroup>
              </Box>
              {chartType === 'pie' ? (
                <Box>
                  <ResponsiveContainer width="100%" height={260}>
                    <PieChart>
                      <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={3} dataKey="value">
                        {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i]} />)}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                  <Stack direction="row" spacing={3} justifyContent="center" mt={1}>
                    {pieData.map((d) => (
                      <Box key={d.name} display="flex" alignItems="center" gap={0.8}>
                        <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: PIE_COLORS[pieData.indexOf(d)] }} />
                        <Typography variant="caption" fontWeight={600}>{d.name}: {d.value}</Typography>
                      </Box>
                    ))}
                  </Stack>
                </Box>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={pieData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e8eaf0" vertical={false} />
                    <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#546e7a' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 12, fill: '#546e7a' }} axisLine={false} tickLine={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                      {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i]} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={7}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight={700} mb={2}>12-Month Trend</Typography>
              {trend && trend.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={trend} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="analyticsTrend" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#1a237e" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#1a237e" stopOpacity={0.02} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e8eaf0" />
                    <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#546e7a' }} axisLine={false} tickLine={false} />
                    <YAxis domain={[0, 100]} unit="%" tick={{ fontSize: 12, fill: '#546e7a' }} axisLine={false} tickLine={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Area type="monotone" dataKey="percentage" stroke="#1a237e" strokeWidth={3} fill="url(#analyticsTrend)" dot={{ fill: '#1a237e', r: 4 }} activeDot={{ r: 6, fill: '#1a237e' }} />
                  </AreaChart>
                </ResponsiveContainer>
              ) : <Alert severity="info">No trend data available</Alert>}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} md={7}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight={700} mb={2}>Subject-wise Performance</Typography>
              {subjectData.length > 0 ? (
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Subject</TableCell>
                        <TableCell align="center">Total</TableCell>
                        <TableCell align="center">Present</TableCell>
                        <TableCell align="center">Absent</TableCell>
                        <TableCell align="center">%</TableCell>
                        <TableCell>Progress</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {subjectData.map((s) => (
                        <TableRow key={s.subject}>
                          <TableCell>
                            <Typography variant="body2" fontWeight={600}>{s.subject}</Typography>
                          </TableCell>
                          <TableCell align="center">{s.total}</TableCell>
                          <TableCell align="center" sx={{ color: '#2e7d32', fontWeight: 600 }}>{s.present}</TableCell>
                          <TableCell align="center" sx={{ color: '#d32f2f', fontWeight: 600 }}>{s.absent}</TableCell>
                          <TableCell align="center">
                            <Chip
                              label={`${s.percentage}%`}
                              size="small"
                              color={s.percentage >= 75 ? 'success' : 'error'}
                              variant="filled"
                              sx={{ fontWeight: 700, minWidth: 56 }}
                            />
                          </TableCell>
                          <TableCell sx={{ minWidth: 120 }}>
                            <LinearProgress
                              variant="determinate"
                              value={Math.min(s.percentage, 100)}
                              sx={{
                                height: 6,
                                borderRadius: 3,
                                bgcolor: '#e8eaf0',
                                '& .MuiLinearProgress-bar': {
                                  bgcolor: s.percentage >= 75 ? '#2e7d32' : s.percentage >= 50 ? '#e65100' : '#d32f2f',
                                  borderRadius: 3,
                                },
                              }}
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : <Alert severity="info">No subject data available</Alert>}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={5}>
          <Stack spacing={3}>
            <Card>
              <CardContent>
                <Typography variant="h6" fontWeight={700} mb={2}>Prediction Summary</Typography>
                {prediction ? (
                  <Stack spacing={2}>
                    <Box display="flex" justifyContent="space-between">
                      <Typography variant="body2" color="text.secondary">Current</Typography>
                      <Typography variant="body1" fontWeight={700}>{prediction.currentPercentage}%</Typography>
                    </Box>
                    <Divider />
                    <Box display="flex" justifyContent="space-between">
                      <Typography variant="body2" color="text.secondary">Target</Typography>
                      <Typography variant="body1" fontWeight={700}>{prediction.targetPercentage}%</Typography>
                    </Box>
                    <Divider />
                    <Box display="flex" justifyContent="space-between">
                      <Typography variant="body2" color="text.secondary">Projected</Typography>
                      <Typography variant="body1" fontWeight={700} color={prediction.isOnTrack ? '#2e7d32' : '#e65100'}>{prediction.projectedPercentage}%</Typography>
                    </Box>
                    <Divider />
                    <Box display="flex" justifyContent="space-between">
                      <Typography variant="body2" color="text.secondary">Lectures Needed</Typography>
                      <Typography variant="body1" fontWeight={700}>{prediction.lecturesRequired}</Typography>
                    </Box>
                    <Divider />
                    <Box display="flex" justifyContent="space-between">
                      <Typography variant="body2" color="text.secondary">Max Skips Allowed</Typography>
                      <Typography variant="body1" fontWeight={700}>{prediction.maxSkips}</Typography>
                    </Box>
                    <Box mt={1}>
                      <LinearProgress
                        variant="determinate"
                        value={Math.min(prediction.currentPercentage, 100)}
                        sx={{ height: 8, borderRadius: 4, bgcolor: '#e8eaf0', '& .MuiLinearProgress-bar': { bgcolor: prediction.isOnTrack ? '#2e7d32' : '#d32f2f', borderRadius: 4 } }}
                      />
                    </Box>
                    <Chip
                      label={prediction.isOnTrack ? 'On Track ✓' : prediction.warning}
                      color={prediction.isOnTrack ? 'success' : 'warning'}
                      sx={{ fontWeight: 600, alignSelf: 'flex-start' }}
                    />
                  </Stack>
                ) : <Alert severity="info">No prediction data available</Alert>}
              </CardContent>
            </Card>

            <Card>
              <CardContent>
                <Typography variant="h6" fontWeight={700} mb={2}>Attendance Heatmap</Typography>
                {heatmapEntries.length > 0 ? (
                  <Box>
                    <Typography variant="caption" color="text.secondary" display="block" mb={1.5}>
                      {new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}
                    </Typography>
                    <Box display="flex" flexWrap="wrap" gap={1}>
                      {heatmapEntries.map(([date, status]) => (
                        <Box
                          key={date}
                          sx={{
                            width: 28, height: 28, borderRadius: 1,
                            bgcolor: status === 'Present' ? '#2e7d32' : status === 'Absent' ? '#d32f2f' : '#e65100',
                            opacity: 0.85,
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            '&:hover': { opacity: 1, transform: 'scale(1.2)', boxShadow: '0 2px 8px rgba(0,0,0,0.2)' },
                          }}
                          title={`${date}: ${status}`}
                        />
                      ))}
                    </Box>
                    <Stack direction="row" spacing={2} mt={2}>
                      <Box display="flex" alignItems="center" gap={0.5}>
                        <Box sx={{ width: 10, height: 10, borderRadius: '2px', bgcolor: '#2e7d32' }} />
                        <Typography variant="caption">Present</Typography>
                      </Box>
                      <Box display="flex" alignItems="center" gap={0.5}>
                        <Box sx={{ width: 10, height: 10, borderRadius: '2px', bgcolor: '#d32f2f' }} />
                        <Typography variant="caption">Absent</Typography>
                      </Box>
                      <Box display="flex" alignItems="center" gap={0.5}>
                        <Box sx={{ width: 10, height: 10, borderRadius: '2px', bgcolor: '#e65100' }} />
                        <Typography variant="caption">Leave</Typography>
                      </Box>
                    </Stack>
                  </Box>
                ) : <Alert severity="info">No heatmap data for this month</Alert>}
              </CardContent>
            </Card>
          </Stack>
        </Grid>
      </Grid>
    </Box>
  );
}
