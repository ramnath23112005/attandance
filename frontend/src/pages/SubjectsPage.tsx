import { useState } from 'react';
import {
  Box, Card, CardContent, Typography, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, Chip, Button, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, TablePagination, Skeleton, Alert, IconButton, Tooltip,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
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
    setForm({
      code: subject.code,
      name: subject.name,
      department: subject.department,
      semester: subject.semester,
    });
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
    } catch {
      // handled by react-query
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Delete this subject?')) {
      await deleteMutation.mutateAsync(id);
    }
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" fontWeight={600}>Subjects</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenCreate}>
          Add Subject
        </Button>
      </Box>

      <Card>
        <CardContent sx={{ p: 0 }}>
          {isLoading ? (
            <Skeleton variant="rounded" height={400} />
          ) : subjects.length > 0 ? (
            <>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Code</TableCell>
                      <TableCell>Name</TableCell>
                      <TableCell>Department</TableCell>
                      <TableCell>Semester</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {subjects.map((subject) => (
                      <TableRow key={subject._id} hover>
                        <TableCell><Chip label={subject.code} size="small" color="primary" variant="outlined" /></TableCell>
                        <TableCell>{subject.name}</TableCell>
                        <TableCell>{subject.department}</TableCell>
                        <TableCell>{subject.semester}</TableCell>
                        <TableCell>
                          <Chip label={subject.isActive ? 'Active' : 'Inactive'} size="small" color={subject.isActive ? 'success' : 'default'} />
                        </TableCell>
                        <TableCell>
                          <IconButton size="small" onClick={() => handleOpenEdit(subject)}><EditIcon /></IconButton>
                          <IconButton size="small" onClick={() => handleDelete(subject._id)}><DeleteIcon /></IconButton>
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
        <DialogTitle>{editId ? 'Edit Subject' : 'Add Subject'}</DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column" gap={2} pt={1}>
            <TextField label="Subject Code" value={form.code} onChange={handleFormChange('code')} required helperText="e.g., EEMI, PE, MPMC" />
            <TextField label="Subject Name" value={form.name} onChange={handleFormChange('name')} required />
            <TextField label="Department" value={form.department} onChange={handleFormChange('department')} required />
            <TextField type="number" label="Semester" value={form.semester} onChange={handleFormChange('semester')} required inputProps={{ min: 1, max: 8 }} />
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
