// src/pages/CollectionPhotos.tsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Grid,
  Typography,
  Button,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  IconButton,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { 
  getCollectionPhotos, 
  deletePhotoFromCollection 
} from '../services/collection.service';

interface Photo {
  _id: string;
  url: string;
  title: string;
  description?: string;
}

const CollectionPhotos = () => {
  const { id: collectionId } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [photoToDelete, setPhotoToDelete] = useState<string | null>(null);

  useEffect(() => {
    if (collectionId) {
      fetchPhotos();
    }
  }, [collectionId]);

  const fetchPhotos = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getCollectionPhotos(collectionId!);
      setPhotos(data);
    } catch (err) {
      console.error('Error fetching photos:', err);
      setError('Failed to load photos');
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePhoto = async () => {
    if (!photoToDelete) return;

    try {
      await deletePhotoFromCollection(collectionId!, photoToDelete);
      setPhotos(photos.filter(photo => photo._id !== photoToDelete));
      setDeleteConfirmOpen(false);
      setPhotoToDelete(null);
    } catch (err) {
      console.error('Error deleting photo:', err);
      setError('Failed to delete photo');
    }
  };

  const openDeleteConfirm = (photoId: string) => {
    setPhotoToDelete(photoId);
    setDeleteConfirmOpen(true);
  };

  const closeDeleteConfirm = () => {
    setDeleteConfirmOpen(false);
    setPhotoToDelete(null);
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
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3, alignItems: 'center' }}>
        <Typography variant="h4">Collection Photos</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate(`/collections/${collectionId}/photos/add`)}
        >
          Add Photos
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
          <Button color="inherit" size="small" onClick={fetchPhotos} sx={{ ml: 2 }}>
            Retry
          </Button>
        </Alert>
      )}

      {photos.length === 0 ? (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '300px',
            bgcolor: 'background.paper',
            borderRadius: 1,
            p: 3,
          }}
        >
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No photos added yet
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate(`/collections/${collectionId}/photos/add`)}
            sx={{ mt: 2 }}
          >
            Add Your First Photo
          </Button>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {photos.map((photo) => (
            <Grid item xs={12} sm={6} md={4} key={photo._id}>
              <Card>
                <CardMedia
                  component="img"
                  height="200"
                  image={photo.url}
                  alt={photo.title}
                  sx={{ objectFit: 'cover' }}
                />
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {photo.title}
                  </Typography>
                  {photo.description && (
                    <Typography variant="body2" color="text.secondary">
                      {photo.description}
                    </Typography>
                  )}
                </CardContent>
                <CardActions sx={{ justifyContent: 'flex-end' }}>
                  <IconButton 
                    size="small" 
                    color="error" 
                    onClick={() => openDeleteConfirm(photo._id)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      <Dialog
        open={deleteConfirmOpen}
        onClose={closeDeleteConfirm}
        aria-labelledby="delete-photo-dialog-title"
        aria-describedby="delete-photo-dialog-description"
      >
        <DialogTitle id="delete-photo-dialog-title">
          Delete Photo
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-photo-dialog-description">
            Are you sure you want to delete this photo from the collection? 
            This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDeleteConfirm} color="primary">
            Cancel
          </Button>
          <Button onClick={handleDeletePhoto} color="error" autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CollectionPhotos;