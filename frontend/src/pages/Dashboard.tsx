import { useState } from 'react';
import {
  Box, Grid, Card, CardContent, Typography, Skeleton, Alert, LinearProgress, Chip, Avatar, Stack, Divider,
} from '@mui/material';
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area,
} from 'recharts';
import HowToRegIcon from '@mui/icons-material/HowToReg';
import CancelIcon from '@mui/icons-material/Cancel';
import EventBusyIcon from '@mui/icons-material/EventBusy';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import SchoolIcon from '@mui/icons-material/School';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import { useAttendanceStats, useAttendanceTrend, useAttendancePrediction } from '../hooks/useAttendance';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';

const COLORS = { present: '#2e7d32', absent: '#d32f2f', leave: '#e65100' };
const PIE_COLORS = ['#2e7d32', '#d32f2f', '#e65100'];

function StatCard({ title, value, subtitle, icon, color, gradient }: {
  title: string; value: string | number; subtitle?: string; icon: React.ReactNode; color: string; gradient?: string;
}) {
  return (
    <Card sx={{ height: '100%', overflow: 'visible', position: 'relative' }}>
      <Box sx={{ position: 'absolute', top: -12, right: 16 }}>
        <Avatar sx={{ bgcolor: color, width: 48, height: 48, boxShadow: `0 4px 12px ${color}40` }}>
          {icon}
        </Avatar>
      </Box>
      <CardContent sx={{ pt: 2, pb: '16px !important' }}>
        <Typography variant="caption" color="text.secondary" fontWeight={600} textTransform="uppercase" letterSpacing="0.08em">
          {title}
        </Typography>
        <Typography variant="h4" fontWeight={800} sx={{ mt: 1, mb: 0.5, color: color }}>
          {value}
        </Typography>
        {subtitle && (
          <Typography variant="body2" color="text.secondary">{subtitle}</Typography>
        )}
      </CardContent>
      {gradient && <Box sx={{ height: 3, background: gradient, borderRadius: '0 0 12px 12px' }} />}
    </Card>
  );
}

const CustomTooltip = ({ active, payload, label }: Record<string, unknown>) => {
  if (active && payload && payload.length) {
    return (
      <Box sx={{ bgcolor: 'background.paper', p: 1.5, borderRadius: 2, boxShadow: '0 4px 12px rgba(0,0,0,0.15)', border: '1px solid #e8eaf0' }}>
        <Typography variant="caption" fontWeight={600}>{label}</Typography>
        {(payload as Array<{ name: string; value: number }>).map((p) => (
          <Typography key={p.name} variant="body2" sx={{ color: p.name === 'Present' ? COLORS.present : p.name === 'Absent' ? COLORS.absent : COLORS.leave }}>
            {p.name}: {p.value}
          </Typography>
        ))}
      </Box>
    );
  }
  return null;
};

export default function Dashboard() {
  const { user, hasRole } = useAuth();
  const userId = hasRole(UserRole.ADMIN) ? undefined : user?.id;
  const { overall, bySubject, weekly } = useAttendanceStats(userId);
  const { data: trend } = useAttendanceTrend(userId);
  const { data: prediction } = useAttendancePrediction(userId);
  const [targetPercent] = useState(75);

  if (overall.isLoading) {
    return (
      <Box>
        <Typography variant="h5" fontWeight={700} mb={1}>Dashboard</Typography>
        <Grid container spacing={3}>
          {[1, 2, 3, 4].map((i) => (
            <Grid item xs={12} sm={6} md={3} key={i}>
              <Skeleton variant="rounded" height={140} />
            </Grid>
          ))}
        </Grid>
      </Box>
    );
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

  return (
    <Box>
      <Box mb={4}>
        <Typography variant="h5" fontWeight={800} color="text.primary">Dashboard</Typography>
        <Typography variant="body2" color="text.secondary">
          Welcome back, <strong>{user?.name}</strong> &mdash; {user?.role === UserRole.STUDENT ? 'here\'s your attendance overview' : 'here\'s the system overview'}
        </Typography>
      </Box>

      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Overall Attendance"
            value={stats ? `${stats.percentage}%` : 'N/A'}
            subtitle={`${stats?.present || 0} / ${stats?.total || 0} lectures`}
            icon={<TrendingUpIcon />}
            color={stats && stats.percentage >= 75 ? '#2e7d32' : '#d32f2f'}
            gradient={stats && stats.percentage >= 75 ? 'linear-gradient(90deg, #2e7d32, #66bb6a)' : 'linear-gradient(90deg, #d32f2f, #ef5350)'}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Present" value={stats?.present || 0} icon={<HowToRegIcon />} color="#2e7d32" gradient="linear-gradient(90deg, #2e7d32, #66bb6a)" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Absent" value={stats?.absent || 0} icon={<CancelIcon />} color="#d32f2f" gradient="linear-gradient(90deg, #d32f2f, #ef5350)" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Leave" value={stats?.leave || 0} icon={<EventBusyIcon />} color="#e65100" gradient="linear-gradient(90deg, #e65100, #ff9800)" />
        </Grid>
      </Grid>

      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight={700} mb={3}>Attendance Trend</Typography>
              {trend && trend.length > 0 ? (
                <ResponsiveContainer width="100%" height={320}>
                  <AreaChart data={trend} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#1a237e" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#1a237e" stopOpacity={0.02} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e8eaf0" />
                    <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#546e7a' }} axisLine={false} tickLine={false} />
                    <YAxis domain={[0, 100]} unit="%" tick={{ fontSize: 12, fill: '#546e7a' }} axisLine={false} tickLine={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Area type="monotone" dataKey="percentage" stroke="#1a237e" strokeWidth={3} fill="url(#trendGradient)" dot={{ fill: '#1a237e', r: 4, strokeWidth: 0 }} activeDot={{ r: 6, fill: '#1a237e' }} />
                  </AreaChart>
                </ResponsiveContainer>
              ) : <Alert severity="info" icon={<CalendarMonthIcon />}>No trend data available yet. Start marking attendance!</Alert>}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Stack spacing={3}>
            <Card>
              <CardContent>
                <Typography variant="h6" fontWeight={700} mb={2}>Distribution</Typography>
                {pieData.some((d) => d.value > 0) ? (
                  <Box>
                    <ResponsiveContainer width="100%" height={200}>
                      <PieChart>
                        <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={85} paddingAngle={3} dataKey="value">
                          {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i]} />)}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                      </PieChart>
                    </ResponsiveContainer>
                    <Stack direction="row" spacing={2} justifyContent="center" mt={1}>
                      {pieData.map((d) => (
                        <Box key={d.name} display="flex" alignItems="center" gap={0.5}>
                          <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: PIE_COLORS[pieData.indexOf(d)] }} />
                          <Typography variant="caption">{d.name}: {d.value}</Typography>
                        </Box>
                      ))}
                    </Stack>
                  </Box>
                ) : <Alert severity="info">No data</Alert>}
              </CardContent>
            </Card>

            {prediction && (
              <Card>
                <CardContent>
                  <Typography variant="h6" fontWeight={700} mb={2}>Prediction</Typography>
                  <Box display="flex" justifyContent="space-between" mb={1}>
                    <Typography variant="body2" color="text.secondary">Current</Typography>
                    <Typography variant="body2" fontWeight={700}>{prediction.currentPercentage}%</Typography>
                  </Box>
                  <Box display="flex" justifyContent="space-between" mb={1}>
                    <Typography variant="body2" color="text.secondary">Target</Typography>
                    <Typography variant="body2" fontWeight={700}>{targetPercent}%</Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={Math.min(prediction.currentPercentage, 100)}
                    sx={{ height: 8, borderRadius: 4, mb: 1.5, bgcolor: '#e8eaf0', '& .MuiLinearProgress-bar': { bgcolor: prediction.isOnTrack ? '#2e7d32' : '#d32f2f', borderRadius: 4 } }}
                  />
                  <Chip
                    label={prediction.isOnTrack ? 'On Track' : `${prediction.lecturesRequired} lectures needed`}
                    color={prediction.isOnTrack ? 'success' : 'error'}
                    size="small"
                    sx={{ fontWeight: 600 }}
                  />
                </CardContent>
              </Card>
            )}
          </Stack>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} md={7}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight={700} mb={3}>Subject Performance</Typography>
              {subjectData.length > 0 ? (
                <ResponsiveContainer width="100%" height={320}>
                  <BarChart data={subjectData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }} barCategoryGap="20%">
                    <CartesianGrid strokeDasharray="3 3" stroke="#e8eaf0" vertical={false} />
                    <XAxis dataKey="subject" tick={{ fontSize: 12, fill: '#546e7a' }} axisLine={false} tickLine={false} />
                    <YAxis domain={[0, 100]} unit="%" tick={{ fontSize: 12, fill: '#546e7a' }} axisLine={false} tickLine={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="percentage" radius={[6, 6, 0, 0]} minPointSize={2}>
                      {subjectData.map((entry, i) => (
                        <Cell key={i} fill={entry.percentage >= 75 ? '#2e7d32' : entry.percentage >= 50 ? '#e65100' : '#d32f2f'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : <Alert severity="info">No subject data available.</Alert>}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={5}>
          <Stack spacing={3}>
            {weekly.data && (
              <Card>
                <CardContent>
                  <Typography variant="h6" fontWeight={700} mb={1}>This Week</Typography>
                  <Typography variant="caption" color="text.secondary" display="block" mb={1}>
                    {weekly.data.weekStart} &mdash; {weekly.data.weekEnd}
                  </Typography>
                  <Typography variant="h3" fontWeight={800} color={weekly.data.percentage >= 75 ? '#2e7d32' : '#d32f2f'}>
                    {weekly.data.percentage}%
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {weekly.data.present}/{weekly.data.total} lectures attended
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={Math.min(weekly.data.percentage, 100)}
                    sx={{ mt: 1.5, height: 6, borderRadius: 3, bgcolor: '#e8eaf0', '& .MuiLinearProgress-bar': { bgcolor: weekly.data.percentage >= 75 ? '#2e7d32' : '#d32f2f', borderRadius: 3 } }}
                  />
                </CardContent>
              </Card>
            )}

            <Card>
              <CardContent>
                <Typography variant="h6" fontWeight={700} mb={2}>Quick Stats</Typography>
                <Stack spacing={1.5}>
                  <Box display="flex" alignItems="center" gap={2}>
                    <SchoolIcon sx={{ color: '#1a237e', fontSize: 20 }} />
                    <Box flex={1}>
                      <Typography variant="body2" color="text.secondary">Subjects</Typography>
                      <Typography variant="body1" fontWeight={600}>{subjectData.length}</Typography>
                    </Box>
                  </Box>
                  <Divider />
                  <Box display="flex" alignItems="center" gap={2}>
                    <TrendingUpIcon sx={{ color: '#2e7d32', fontSize: 20 }} />
                    <Box flex={1}>
                      <Typography variant="body2" color="text.secondary">Best Subject</Typography>
                      <Typography variant="body1" fontWeight={600}>
                        {subjectData.length > 0
                          ? subjectData.reduce((a, b) => (a.percentage > b.percentage ? a : b)).subject
                          : 'N/A'}
                      </Typography>
                    </Box>
                  </Box>
                  <Divider />
                  <Box display="flex" alignItems="center" gap={2}>
                    <CalendarMonthIcon sx={{ color: '#e65100', fontSize: 20 }} />
                    <Box flex={1}>
                      <Typography variant="body2" color="text.secondary">Attendance Streak</Typography>
                      <Typography variant="body1" fontWeight={600}>
                        {stats && stats.percentage >= 75 ? 'Good' : 'Needs Improvement'}
                      </Typography>
                    </Box>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Stack>
        </Grid>
      </Grid>
    </Box>
  );
}
