import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Grid,
  Typography,
  Button,
  Card,
  CardContent,
  CardActions,
  IconButton,
  CircularProgress,
  Alert,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { 
  Add as AddIcon, 
  EditOutlined as EditIcon, 
  DeleteOutlineOutlined as DeleteIcon,
  Collections as CollectionsIcon 
} from '@mui/icons-material';
import { getAllCollections, Collection, getCollectionPhotos, deleteCollection } from '../services/collection.service';
import { useTheme } from '../contexts/ThemeContext';

const Collections = () => {
  const { colors } = useTheme();
  const navigate = useNavigate();
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [collectionToDelete, setCollectionToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [userRole, setUserRole] = useState<string>('');

  useEffect(() => {
    const role = localStorage.getItem('role');
    setUserRole(role || '');
    fetchCollections();
  }, []);

  // Function to check if user can create/edit collections
  const canManageCollections = () => {
    return userRole.toLowerCase() !== 'student';
  };

  // Rest of your existing functions...
  const handleDeleteClick = (collectionId: string) => {
    setCollectionToDelete(collectionId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!collectionToDelete) return;

    try {
      setIsDeleting(true);
      await deleteCollection(collectionToDelete);
      setCollections(collections.filter(c => c._id !== collectionToDelete));
    } catch (err) {
      setError('Failed to delete collection');
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
      setCollectionToDelete(null);
    }
  };

  const fetchCollections = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAllCollections();
      if (Array.isArray(data)) {
        const collectionsWithPhotoCount = await Promise.all(
          data.map(async (collection) => {
            const collectionData = await getCollectionPhotos(collection._id);
            return { ...collection, cardCount: collectionData.photos.length };
          })
        );
        setCollections(collectionsWithPhotoCount);
      } else {
        setError('Invalid data format received from server');
      }
    } catch (err) {
      setError('Failed to load collections');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box 
        display="flex" 
        justifyContent="center" 
        alignItems="center" 
        minHeight="200px"
        sx={{ color: colors.primary }}
      >
        <CircularProgress color="inherit" />
      </Box>
    );
  }

  const renderCollections = () => {
    if (!Array.isArray(collections)) {
      return (
        <Grid item xs={12}>
          <Alert 
            severity="error"
            sx={{
              borderRadius: 2,
              '& .MuiAlert-icon': {
                color: '#6B46C1'
              }
            }}
          >
            Error loading collections. Please try again.
          </Alert>
        </Grid>
      );
    }

    if (collections.length === 0) {
      return (
        <Grid item xs={12}>
          <Paper
            elevation={1}
            sx={{
              p: 6,
              textAlign: 'center',
              borderRadius: 4,
              backgroundColor: colors.background,
              border: `1px solid ${colors.lightBg}`,
            }}
          >
            <CollectionsIcon sx={{ fontSize: 48, mb: 2, color: colors.primary, opacity: 0.8 }} />
            <Typography variant="h6" gutterBottom sx={{ color: colors.primaryDark  }}>
              No collections found
            </Typography>
            {canManageCollections() && (
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => navigate('/collections/create')}
                sx={{
                  mt: 2,
                  bgcolor: colors.primary,
                  '&:hover': {
                    bgcolor: colors.primaryDark,
                  },
                  borderRadius: 2,
                  py: 1.5,
                  boxShadow: 'none',
                }}
              >
                Create your first collection
              </Button>
            )}
          </Paper>
        </Grid>
      );
    }

    return collections.map((collection) => (
      <Grid item xs={12} sm={6} md={4} key={collection._id}>
        <Card
          elevation={1}
          sx={{
            borderRadius: 4,
            backgroundColor: colors.background,
            border: `1px solid ${colors.lightBg}`,
            transition: 'transform 0.2s, box-shadow 0.2s',
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: '0 4px 20px rgba(107, 70, 193, 0.15)',
            },
          }}
        >
          <CardContent sx={{ pb: 1 }}>
            <Typography 
              sx={{ 
                fontSize: '1.1rem', 
                fontWeight: 600,
                mb: 2,
                color: colors.primaryDark,
              }}
            >
              {collection.title}
            </Typography>
            <Typography 
              sx={{ 
                color: colors.primary,
                fontSize: '0.9rem',
                mb: 1,
              }}
            >
              {collection.cardCount} cards
            </Typography>
            <Typography 
              sx={{ 
                color: colors.primaryLight,
                fontSize: '0.9rem',
              }}
              noWrap
            >
              {collection.description}
            </Typography>
          </CardContent>
          <CardActions sx={{ px: 2, pb: 2 }}>
            <Button
              size="small"
              onClick={() => navigate(`/collections/${collection._id}/cards`)}
              sx={{
                color: colors.primaryDark,
                fontWeight: 600,
                bgcolor: colors.lightBg,
                '&:hover': {
                  bgcolor: colors.primary,
                  color: '#FFF',
                },
                borderRadius: 1.5,
                px: 2,
                boxShadow: 'none',
              }}
            >
              View Cards
            </Button>
            <Box sx={{ flexGrow: 1 }} />
            {canManageCollections() && (
              <IconButton 
                size="small"
                onClick={() => handleDeleteClick(collection._id)}
                sx={{
                  color: colors.error,
                  '&:hover': {
                    color: colors.error,
                    bgcolor: '#FFF5F5',
                  },
                }}
              >
                <DeleteIcon />
              </IconButton>
            )}
          </CardActions>
        </Card>
      </Grid>
    ));
  };

  return (
    <>
      <Box
        sx={{
          minHeight: '100vh',
          bgcolor: colors.background,
          position: 'relative',
          p: 4,
        }}
      >
        {/* Decorative curved shapes */}
        <Box
          sx={{
            position: 'fixed',
            top: -100,
            left: -100,
            width: '400px',
            height: '400px',
            borderRadius: '50%',
            background: `linear-gradient(45deg, ${colors.primary} 30%, ${colors.primaryLight} 90%)`,
            opacity: 0.05,
            zIndex: 0,
          }}
        />
        <Box
          sx={{
            position: 'fixed',
            bottom: -100,
            right: -100,
            width: '500px',
            height: '500px',
            borderRadius: '50%',
            background: `linear-gradient(45deg, ${colors.primaryLight} 30%, ${colors.primary} 90%)`,
            opacity: 0.05,
            zIndex: 0,
          }}
        />

        {/* Main content */}
        <Box sx={{ position: 'relative', zIndex: 1 }}>
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            mb: 4 
          }}>
            <Typography 
              variant="h4" 
              sx={{ 
                color: colors.primaryDark,
                fontWeight: 600,
              }}
            >
              Collections
            </Typography>
            {canManageCollections() && (
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => navigate('/collections/create')}
                sx={{
                  bgcolor: colors.primary,
                  '&:hover': {
                    bgcolor: colors.primaryDark,
                  },
                  borderRadius: 2,
                  py: 1.5,
                  px: 3,
                  boxShadow: 'none',
                }}
              >
                Create Collection
              </Button>
            )}
          </Box>

          {error && (
            <Alert 
              severity="error" 
              sx={{ 
                mb: 3,
                borderRadius: 2,
              }}
            >
              {error}
              <Button 
                color="inherit" 
                size="small" 
                onClick={fetchCollections} 
                sx={{ ml: 2 }}
              >
                Retry
              </Button>
            </Alert>
          )}

          <Grid container spacing={3}>
            {renderCollections()}
          </Grid>
        </Box>
      </Box>
      
      <Dialog
        open={deleteDialogOpen}
        onClose={() => !isDeleting && setDeleteDialogOpen(false)}
        PaperProps={{
          sx: {
            borderRadius: 3,
            maxWidth: '400px',
          },
        }}
      >
        <DialogTitle sx={{ color: colors.primaryDark, pb: 1 }}>
          Delete Collection
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ color: colors.text  }}>
            Are you sure you want to delete this collection? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2.5, pt: 1.5 }}>
          <Button
            onClick={() => setDeleteDialogOpen(false)}
            disabled={isDeleting}
            sx={{
              color: colors.text,
              '&:hover': {
                bgcolor: '#EDF2F7',
              },
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            disabled={isDeleting}
            sx={{
              bgcolor: colors.error,
              color: 'white',
              '&:hover': {
                bgcolor: colors.error,
                opacity: 0.9,
              },
              '&:disabled': {
                bgcolor: `${colors.error}40`,
              },
            }}
          >
            {isDeleting ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default Collections;