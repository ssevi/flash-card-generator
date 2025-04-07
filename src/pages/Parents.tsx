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
import { Parent } from '../interfaces/parent.interface';
import { getParents, deleteParent } from '../services/parent.service';

const ParentList = () => {
  const navigate = useNavigate();
  const [parents, setParents] = useState<Parent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; parentId: string | null; parentName: string }>({
    open: false,
    parentId: null,
    parentName: ''
  });

  useEffect(() => {
    fetchParents();
  }, []);

  const fetchParents = async () => {
    try {
      setLoading(true);
      const data = await getParents();
      setParents(data);
    } catch (err) {
      setError('Failed to fetch parents');
      console.error('Error fetching parents:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (parentId: string, parentName: string) => {
    setDeleteConfirm({
      open: true,
      parentId,
      parentName
    });
  };

  const handleDelete = async () => {
    if (!deleteConfirm.parentId) return;

    try {
      await deleteParent(deleteConfirm.parentId);
      setParents(parents.filter(parent => parent._id !== deleteConfirm.parentId));
      setDeleteConfirm({ open: false, parentId: null, parentName: '' });
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
          disableElevation
          variant="outlined"
          size="small"
          startIcon={<AddIcon />}
          onClick={() => navigate('/parents/create')}
          sx={{ borderRadius: '20px' }}
        >
          Add Parent
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

      <TableContainer component={Paper} elevation={0}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{fontWeight:'bold'}}>Name</TableCell>
              <TableCell sx={{fontWeight:'bold'}}>Email</TableCell>
              <TableCell sx={{fontWeight:'bold'}}>Phone</TableCell>
              <TableCell sx={{fontWeight:'bold'}}>Child Name</TableCell>
              <TableCell sx={{fontWeight:'bold'}}>Child Age</TableCell>
              <TableCell sx={{fontWeight:'bold'}}>Permissions</TableCell>
              <TableCell sx={{fontWeight:'bold'}} align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {parents.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  <Typography color="textSecondary" sx={{ py: 4 }}>
                    No parents found
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              parents.map((parent) => (
                <TableRow key={parent._id}>
                  <TableCell>{parent.name}</TableCell>
                  <TableCell><AlternateEmail sx={{fontSize:'medium', color:'green'}}/>{parent.email}</TableCell>
                  <TableCell>{parent.phone}</TableCell>
                  <TableCell>{parent.childName}</TableCell>
                  <TableCell>{parent.childAge}</TableCell>
                  <TableCell>
                    <Box display="flex" gap={1}>
                      {parent.permissions.canView && (
                        <Chip 
                          size="small" 
                          label="View" 
                          color="primary"
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
                    <Box display="flex" justifyContent="flex-end" gap={1}>
                      <Tooltip title="Edit parent">
                        <IconButton
                          size="small"
                          onClick={() => navigate(`/parents/${parent._id}/edit`)}
                          color="primary"
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete parent">
                        <IconButton
                          size="small"
                          onClick={() => handleDeleteClick(parent._id, parent.name)}
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
        onClose={() => setDeleteConfirm({ open: false, parentId: null, parentName: '' })}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete {deleteConfirm.parentName}? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setDeleteConfirm({ open: false, parentId: null, parentName: '' })}
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

export default ParentList;