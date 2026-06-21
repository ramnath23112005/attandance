import { useState } from 'react';
import {
  Box, Card, CardContent, Typography, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Chip, TablePagination, Skeleton, Alert, Avatar, Stack,
} from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { authService } from '../services/auth.service';

const ROLE_CONFIG: Record<string, { color: string; bgcolor: string }> = {
  admin: { color: '#d32f2f', bgcolor: '#fbe9e7' },
  faculty: { color: '#1565c0', bgcolor: '#e3f2fd' },
  student: { color: '#2e7d32', bgcolor: '#e8f5e9' },
};

export default function Users() {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);

  const { data, isLoading } = useQuery({
    queryKey: ['users', page + 1, rowsPerPage],
    queryFn: () => authService.getUsers(page + 1, rowsPerPage),
  });

  const users = (data?.data || []) as Array<Record<string, unknown>>;
  const total = data?.pagination?.total || 0;

  return (
    <Box>
      <Typography variant="h5" fontWeight={800} mb={0.5}>User Management</Typography>
      <Typography variant="body2" color="text.secondary" mb={3}>
        View and manage all system users ({total} total)
      </Typography>

      <Card>
        <CardContent sx={{ p: 0 }}>
          {isLoading ? (
            <Skeleton variant="rounded" height={400} sx={{ borderRadius: 2 }} />
          ) : users.length > 0 ? (
            <>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>User</TableCell>
                      <TableCell>Email</TableCell>
                      <TableCell>Role</TableCell>
                      <TableCell>Department</TableCell>
                      <TableCell>Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {users.map((u, idx) => {
                      const row = u as Record<string, string | boolean | undefined>;
                      const role = (row.role as string) || '';
                      const rc = ROLE_CONFIG[role] || { color: '#757575', bgcolor: '#f5f5f5' };
                      return (
                        <TableRow key={(row._id as string) || idx} hover>
                          <TableCell>
                            <Box display="flex" alignItems="center" gap={1.5}>
                              <Avatar sx={{ width: 34, height: 34, bgcolor: rc.color, fontSize: 14, fontWeight: 700 }}>
                                {(row.name as string)?.charAt(0).toUpperCase()}
                              </Avatar>
                              <Box>
                                <Typography variant="body2" fontWeight={600}>
                                  {row.name as string}
                                </Typography>
                              </Box>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" color="text.secondary">
                              {row.email as string}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={role}
                              size="small"
                              sx={{ bgcolor: rc.bgcolor, color: rc.color, fontWeight: 700, textTransform: 'capitalize' }}
                            />
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {(row.department as string) || '—'}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={row.isActive ? 'Active' : 'Inactive'}
                              size="small"
                              color={row.isActive ? 'success' : 'default'}
                              variant="outlined"
                              sx={{ fontWeight: 600 }}
                            />
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
              <TablePagination
                component="div"
                count={total}
                page={page}
                onPageChange={(_, newPage) => setPage(newPage)}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={(e) => {
                  setRowsPerPage(parseInt(e.target.value, 10));
                  setPage(0);
                }}
              />
            </>
          ) : (
            <Box p={3}><Alert severity="info">No users found</Alert></Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}
