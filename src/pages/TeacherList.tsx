// src/pages/TeacherList.tsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
  Tooltip
} from '@mui/material';
import { 
  Add as AddIcon, 
  Edit as EditIcon, 
  Delete as DeleteIcon,
  AlternateEmail 
} from '@mui/icons-material';
import { getTeachers, deleteTeacher, Teacher } from '../services/teacher.service';

const TeacherList = () => {
  const navigate = useNavigate();
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; teacherId: string | null; teacherName: string }>({
    open: false,
    teacherId: null,
    teacherName: ''
  });

  useEffect(() => {
    fetchTeachers();
  }, []);

  const fetchTeachers = async () => {
    try {
      setLoading(true);
      const data = await getTeachers();
      setTeachers(data);
    } catch (err) {
      setError('Failed to fetch teachers');
      console.error('Error fetching teachers:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (teacherId: string, teacherName: string) => {
    setDeleteConfirm({
      open: true,
      teacherId,
      teacherName
    });
  };

  const handleDelete = async () => {
    if (!deleteConfirm.teacherId) return;

    try {
      await deleteTeacher(deleteConfirm.teacherId);
      setTeachers(teachers.filter(teacher => teacher._id !== deleteConfirm.teacherId));
      setDeleteConfirm({ open: false, teacherId: null, teacherName: '' });
    } catch (err) {
      setError('Failed to delete teacher');
      console.error('Error deleting teacher:', err);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6">View all the teachers</Typography>
        <Button
          disableElevation
          variant="outlined"
          size="small"
          startIcon={<AddIcon />}
          onClick={() => navigate('/teachers/create')}
          sx={{ borderRadius: '20px' }}
        >
          Add Teacher
        </Button>
      </Box>

      {error && teachers.length !== 0 && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
          <Button color="inherit" size="small" onClick={fetchTeachers} sx={{ ml: 2 }}>
            Retry
          </Button>
        </Alert>
      )}

      <TableContainer component={Paper} elevation={0}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{fontWeight:'bold'}}>Name</TableCell>
              <TableCell sx={{fontWeight:'bold'}}>Email</TableCell>
              <TableCell sx={{fontWeight:'bold'}}>Department</TableCell>
              <TableCell sx={{fontWeight:'bold'}}>Permissions</TableCell>
              <TableCell sx={{fontWeight:'bold'}} align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {teachers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  <Typography color="textSecondary" sx={{ py: 4 }}>
                    No teachers found
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              teachers.map((teacher) => (
                <TableRow key={teacher._id}>
                  <TableCell>{teacher.name}</TableCell>
                  <TableCell><AlternateEmail sx={{fontSize:'medium', color:'green'}}/>{teacher.email}</TableCell>
                  <TableCell>{teacher.department}</TableCell>
                  <TableCell>
                    <Box display="flex" gap={1}>
                      {teacher.permissions.canUpload && (
                        <Chip 
                          size="small" 
                          label="Upload" 
                          color="primary"
                          sx={{ borderRadius: '10px' }} 
                        />
                      )}
                      {teacher.permissions.canDownload && (
                        <Chip 
                          size="small" 
                          label="Download" 
                          color="secondary"
                          sx={{ borderRadius: '10px' }} 
                        />
                      )}
                    </Box>
                  </TableCell>
                  <TableCell align="right">
                    <Box display="flex" justifyContent="flex-end" gap={1}>
                      <Tooltip title="Edit teacher">
                        <IconButton
                          size="small"
                          onClick={() => navigate(`/teachers/${teacher._id}/edit`)}
                          color="primary"
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete teacher">
                        <IconButton
                          size="small"
                          onClick={() => handleDeleteClick(teacher._id, teacher.name)}
                          color="error"
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteConfirm.open}
        onClose={() => setDeleteConfirm({ open: false, teacherId: null, teacherName: '' })}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete {deleteConfirm.teacherName}? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setDeleteConfirm({ open: false, teacherId: null, teacherName: '' })}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleDelete}
            color="error" 
            variant="contained"
            disableElevation
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TeacherList;