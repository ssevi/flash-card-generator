import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Alert,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Chip
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon,AlternateEmail, SendToMobile  } from '@mui/icons-material';
import { Parent } from '../interfaces/parent.interface';
import { getParents, deleteParent } from '../services/parent.service';

const Parents = () => {
  const navigate = useNavigate();
  const [parents, setParents] = useState<Parent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [parentToDelete, setParentToDelete] = useState<string | null>(null);

  const fetchParents = async () => {
    try {
      setError(null);
      const data = await getParents();
      setParents(data);
    } catch (err) {
      setError('Failed to fetch parents');
      console.error('Error fetching parents:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchParents();
  }, []);

  const handleDeleteClick = (id: string) => {
    setParentToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!parentToDelete) return;

    try {
      await deleteParent(parentToDelete);
      setParents(parents.filter(parent => parent._id !== parentToDelete));
      setDeleteDialogOpen(false);
    } catch (err) {
      setError('Failed to delete parent');
      console.error('Error deleting parent:', err);
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
        <Typography variant="h6">View all the parents</Typography>
        <Button
          variant="outlined"
          size='small'
          sx={{borderRadius: '20px'}}
          onClick={() => navigate('/parents/create')}
        >
          Add New Parent
        </Button>
      </Box>
  
      {error && parents.length !== 0 && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
          <Button color="inherit" size="small" onClick={fetchParents} sx={{ ml: 2 }}>
            Retry
          </Button>
        </Alert>
      )}
  
      {parents.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }} elevation={0}>
          <Typography variant="h6" color="textSecondary" gutterBottom>
            No Parents Available
          </Typography>
          <Typography color="textSecondary" sx={{ mb: 2 }}>
            Start by creating your first parent account
          </Typography>
          <Button
            variant="contained"
            size='small'
          sx={{borderRadius: '20px'}}
            onClick={() => navigate('/parents/create')}
          >
            Add New Parent
          </Button>
        </Paper>
      ) : (
        <TableContainer component={Paper} elevation={0}>
          <Table >
            <TableHead>
              <TableRow>
                <TableCell  sx={{fontWeight:'bold'}}>Name</TableCell>
                <TableCell sx={{fontWeight:'bold'}}>Email</TableCell>
                <TableCell sx={{fontWeight:'bold'}}>Phone</TableCell>
                <TableCell sx={{fontWeight:'bold'}}>Child Name</TableCell>
                <TableCell sx={{fontWeight:'bold'}}>Child Age</TableCell>
                <TableCell sx={{fontWeight:'bold'}}>Permissions</TableCell>
                <TableCell sx={{fontWeight:'bold'}} align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {parents.map((parent) => (
                <TableRow key={parent._id}>
                  <TableCell>{parent.name}</TableCell>
                  <TableCell><AlternateEmail sx={{fontSize:'medium', color:'green'}}/>{parent.email}</TableCell>
                  <TableCell><SendToMobile  sx={{fontSize:'medium', color:'blue'}}/>{parent.phone}</TableCell>
                  <TableCell>{parent.childName}</TableCell>
                  <TableCell>{parent.childAge}</TableCell>
                  <TableCell>
                  <Box display="flex" gap={1}>
                      {parent.permissions.canView && (
                        <Chip 
                          size="small" 
                          label="View" 
                          color="info"
                          sx={{ borderRadius: '10px' }} 
                        />
                      )}
                      {parent.permissions.canDownload && (
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
                    <IconButton onClick={() => navigate(`/parents/${parent._id}/edit`)} color="primary">
                    <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton onClick={() => handleDeleteClick(parent._id)} color="error">
                    <DeleteIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this parent? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error">Delete</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Parents;