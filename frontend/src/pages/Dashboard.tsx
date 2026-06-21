import { useState } from 'react';
import {
  Box, Grid, Card, CardContent, Typography, Skeleton, Alert,
} from '@mui/material';
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, AreaChart, Area,
} from 'recharts';
import { useAttendanceStats, useAttendanceTrend, useAttendancePrediction } from '../hooks/useAttendance';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';

const COLORS = { present: '#4caf50', absent: '#f44336', leave: '#9c27b0' };
const RADIAN = Math.PI / 180;

function renderCustomizedLabel({ cx, cy, midAngle, innerRadius, outerRadius, percent }: Record<string, number>) {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={12} fontWeight={600}>
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
}

function StatCard({ title, value, subtitle, color }: { title: string; value: string | number; subtitle?: string; color?: string }) {
  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Typography variant="body2" color="text.secondary" gutterBottom>{title}</Typography>
        <Typography variant="h3" fontWeight={700} color={color || 'text.primary'}>{value}</Typography>
        {subtitle && <Typography variant="body2" color="text.secondary">{subtitle}</Typography>}
      </CardContent>
    </Card>
  );
}

export default function Dashboard() {
  const { user, hasRole } = useAuth();
  const userId = hasRole(UserRole.ADMIN) ? undefined : user?.id;
  const { overall, bySubject, weekly } = useAttendanceStats(userId);
  const { data: trend } = useAttendanceTrend(userId);
  const { data: prediction } = useAttendancePrediction(userId);
  const [targetPercent] = useState(75);

  if (overall.isLoading) {
    return (
      <Grid container spacing={3}>
        {[1, 2, 3, 4].map((i) => (
          <Grid size={{ xs: 12, sm: 6, md: 3 }} key={i}>
            <Skeleton variant="rounded" height={120} />
          </Grid>
        ))}
      </Grid>
    );
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

  return (
    <Box>
      <Typography variant="h5" fontWeight={600} mb={3}>
        Welcome back, {user?.name}
      </Typography>

      <Grid container spacing={3} mb={3}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard title="Overall Attendance" value={stats ? `${stats.percentage}%` : 'N/A'} subtitle={`${stats?.present || 0}/${stats?.total || 0} lectures`} color={stats && stats.percentage >= 75 ? COLORS.present : COLORS.absent} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard title="Present" value={stats?.present || 0} color={COLORS.present} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard title="Absent" value={stats?.absent || 0} color={COLORS.absent} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard title="Leave" value={stats?.leave || 0} color={COLORS.leave} />
        </Grid>
      </Grid>

      <Grid container spacing={3} mb={3}>
        <Grid size={{ xs: 12, md: 5 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight={600} mb={2}>Attendance Distribution</Typography>
              {pieData.some((d) => d.value > 0) ? (
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" labelLine={false} label={renderCustomizedLabel} outerRadius={100} dataKey="value">
                      {pieData.map((entry, index) => (
                        <Cell key={index} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <Alert severity="info">No attendance data yet</Alert>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 7 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight={600} mb={2}>Monthly Trend</Typography>
              {trend && trend.length > 0 ? (
                <ResponsiveContainer width="100%" height={280}>
                  <AreaChart data={trend}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis domain={[0, 100]} unit="%" />
                    <Tooltip />
                    <Area type="monotone" dataKey="percentage" stroke="#8884d8" fill="#8884d8" fillOpacity={0.3} name="Attendance %" />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <Alert severity="info">No trend data available</Alert>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3} mb={3}>
        <Grid size={{ xs: 12, md: 7 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight={600} mb={2}>Subject-wise Attendance</Typography>
              {subjectData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={subjectData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="subject" />
                    <YAxis domain={[0, 100]} unit="%" />
                    <Tooltip />
                    <Bar dataKey="percentage" fill="#8884d8" radius={[4, 4, 0, 0]} name="Attendance %" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <Alert severity="info">No subject data available</Alert>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 5 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight={600} mb={2}>Attendance Prediction</Typography>
              {prediction ? (
                <Box>
                  <Box display="flex" justifyContent="space-between" mb={1}>
                    <Typography variant="body2">Current: <strong>{prediction.currentPercentage}%</strong></Typography>
                    <Typography variant="body2">Target: <strong>{targetPercent}%</strong></Typography>
                  </Box>
                  <Typography variant="body2" gutterBottom>
                    {prediction.isOnTrack ? 'On track to maintain target' : `Need to attend ${prediction.lecturesRequired} more lectures`}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    You can skip up to {prediction.maxSkips} lectures and still reach {targetPercent}%
                  </Typography>
                  <Typography variant="body2" color={prediction.warning.includes('need') ? 'warning.main' : 'success.main'} mt={1}>
                    {prediction.warning}
                  </Typography>
                </Box>
              ) : (
                <Alert severity="info">No data for prediction</Alert>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {weekly.data && (
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Card>
              <CardContent>
                <Typography variant="h6" fontWeight={600} mb={1}>This Week</Typography>
                <Typography variant="body2" color="text.secondary">
                  {weekly.data.weekStart} — {weekly.data.weekEnd}
                </Typography>
                <Typography variant="h4" fontWeight={700} color={weekly.data.percentage >= 75 ? COLORS.present : COLORS.absent} mt={1}>
                  {weekly.data.percentage}%
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {weekly.data.present}/{weekly.data.total} lectures attended
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}
    </Box>
  );
}
