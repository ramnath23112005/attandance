import { useState } from 'react';
import {
  Box, Card, CardContent, Typography, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, Chip, TablePagination, Skeleton, Alert, Avatar,
} from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { authService } from '../services/auth.service';
import { UserRole } from '../types';

const ROLE_COLORS: Record<string, string> = {
  admin: '#f44336',
  faculty: '#2196f3',
  student: '#4caf50',
};

export default function Users() {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);

  const { data, isLoading } = useQuery({
    queryKey: ['users', page + 1, rowsPerPage],
    queryFn: () => authService.getUsers(page + 1, rowsPerPage),
  });

  const users = (data?.data as Array<{ _id: string; name: string; email: string; role: string; department?: string; isActive: boolean }>) || [];
  const total = data?.pagination?.total || 0;

  return (
    <Box>
      <Typography variant="h5" fontWeight={600} mb={3}>User Management</Typography>

      <Card>
        <CardContent sx={{ p: 0 }}>
          {isLoading ? (
            <Skeleton variant="rounded" height={400} />
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
                    {users.map((user) => (
                      <TableRow key={user._id} hover>
                        <TableCell>
                          <Box display="flex" alignItems="center" gap={2}>
                            <Avatar sx={{ width: 32, height: 32, bgcolor: ROLE_COLORS[user.role] || '#757575', fontSize: 14 }}>
                              {user.name.charAt(0).toUpperCase()}
                            </Avatar>
                            {user.name}
                          </Box>
                        </TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          <Chip
                            label={user.role}
                            size="small"
                            sx={{
                              bgcolor: ROLE_COLORS[user.role],
                              color: '#fff',
                              fontWeight: 600,
                              textTransform: 'capitalize',
                            }}
                          />
                        </TableCell>
                        <TableCell>{user.department || '—'}</TableCell>
                        <TableCell>
                          <Chip
                            label={user.isActive ? 'Active' : 'Inactive'}
                            size="small"
                            color={user.isActive ? 'success' : 'default'}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
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
