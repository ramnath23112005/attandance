import { useState } from 'react';
import {
  Box, Card, CardContent, Typography, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, Chip, Button, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, TablePagination, Skeleton, Alert, IconButton, Tooltip, Stack,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import BookIcon from '@mui/icons-material/Book';
import { useSubjects, useCreateSubject, useUpdateSubject, useDeleteSubject } from '../hooks/useSubjects';

const defaultForm = { code: '', name: '', department: '', semester: 1 };

export default function SubjectsPage() {
  const [page, setPage] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(defaultForm);

  const { data, isLoading } = useSubjects(page + 1);
  const createMutation = useCreateSubject();
  const updateMutation = useUpdateSubject();
  const deleteMutation = useDeleteSubject();

  const subjects = data?.data || [];
  const total = data?.pagination?.total || 0;

  const handleFormChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = field === 'semester' ? parseInt(e.target.value, 10) : e.target.value;
    setForm((prev) => ({ ...prev, [field]: val }));
  };

  const handleOpenCreate = () => {
    setEditId(null);
    setForm(defaultForm);
    setDialogOpen(true);
  };

  const handleOpenEdit = (subject: typeof subjects[number]) => {
    setEditId(subject._id);
    setForm({ code: subject.code, name: subject.name, department: subject.department, semester: subject.semester });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    try {
      if (editId) {
        await updateMutation.mutateAsync({ id: editId, data: form });
      } else {
        await createMutation.mutateAsync(form);
      }
      setDialogOpen(false);
    } catch { /* handled */ }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Delete this subject?')) {
      await deleteMutation.mutateAsync(id);
    }
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3} flexWrap="wrap" gap={2}>
        <Box>
          <Typography variant="h5" fontWeight={800}>Subjects</Typography>
          <Typography variant="body2" color="text.secondary">Manage academic subjects ({total} total)</Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} disableElevation onClick={handleOpenCreate}>
          Add Subject
        </Button>
      </Box>

      <Card>
        <CardContent sx={{ p: 0 }}>
          {isLoading ? (
            <Skeleton variant="rounded" height={400} sx={{ borderRadius: 2 }} />
          ) : subjects.length > 0 ? (
            <>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Code</TableCell>
                      <TableCell>Name</TableCell>
                      <TableCell>Department</TableCell>
                      <TableCell align="center">Semester</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell align="center">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {subjects.map((subject) => (
                      <TableRow key={subject._id} hover>
                        <TableCell>
                          <Chip label={subject.code} size="small" color="primary" variant="outlined" sx={{ fontWeight: 700, fontFamily: 'monospace' }} />
                        </TableCell>
                        <TableCell>
                          <Box display="flex" alignItems="center" gap={1}>
                            <BookIcon sx={{ color: '#1a237e', fontSize: 18, opacity: 0.6 }} />
                            <Typography variant="body2" fontWeight={600}>{subject.name}</Typography>
                          </Box>
                        </TableCell>
                        <TableCell>{subject.department}</TableCell>
                        <TableCell align="center">
                          <Chip label={`Sem ${subject.semester}`} size="small" variant="outlined" sx={{ fontWeight: 600 }} />
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={subject.isActive ? 'Active' : 'Inactive'}
                            size="small"
                            color={subject.isActive ? 'success' : 'default'}
                            sx={{ fontWeight: 600 }}
                          />
                        </TableCell>
                        <TableCell align="center">
                          <IconButton size="small" onClick={() => handleOpenEdit(subject)} sx={{ mr: 0.5 }}>
                            <EditIcon fontSize="small" />
                          </IconButton>
                          <IconButton size="small" onClick={() => handleDelete(subject._id)} color="error">
                            <DeleteIcon fontSize="small" />
                          </IconButton>
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
                rowsPerPage={50}
                rowsPerPageOptions={[50]}
              />
            </>
          ) : (
            <Box p={3}><Alert severity="info">No subjects found</Alert></Box>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ pb: 1 }}>{editId ? 'Edit Subject' : 'Add Subject'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2.5} pt={1}>
            <TextField label="Subject Code" value={form.code} onChange={handleFormChange('code')} required helperText="e.g., EEMI, PE, MPMC" />
            <TextField label="Subject Name" value={form.name} onChange={handleFormChange('name')} required />
            <TextField label="Department" value={form.department} onChange={handleFormChange('department')} required />
            <TextField type="number" label="Semester" value={form.semester} onChange={handleFormChange('semester')} required inputProps={{ min: 1, max: 8 }} />
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
