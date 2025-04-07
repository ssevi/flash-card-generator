import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Grid,
  Typography,
  Button,
  Card,
  CardMedia,
  IconButton,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Paper,
  Tooltip,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  PhotoLibrary as PhotoLibraryIcon,
  PictureAsPdf as PdfIcon,
  DragHandle as DragHandleIcon,
} from '@mui/icons-material';
import { 
  DragDropContext, 
  Droppable, 
  Draggable, 
  DropResult 
} from 'react-beautiful-dnd';
import { getCollectionPhotos, deletePhotoFromCollection, updatePhotoOrder } from '../services/collection.service';
import { jsPDF } from 'jspdf';
import PDFSettingsDialog from './PDFSettingsDialog';
import { useTheme } from '../contexts/ThemeContext';

// ... (keep all previous imports and type definitions)

const CollectionPhotos: React.FC = () => {
  const { id: collectionId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { colors } = useTheme();

  // State declarations
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [photoToDelete, setPhotoToDelete] = useState<string | null>(null);
  const [generatingPdf, setGeneratingPdf] = useState(false);
  const [pdfSettingsOpen, setPdfSettingsOpen] = useState(false);
  const [collectionTitle, setCollectionTitle] = useState('');
  const [collectionDescription, setCollectionDescription] = useState('');
  const [userRole, setUserRole] = useState<string>('');
  const [isReordering, setIsReordering] = useState(false);

  // ... (keep previous state and PDF settings)

  useEffect(() => {
    const role = localStorage.getItem('role');
    setUserRole(role || '');
    if (collectionId) {
      fetchPhotos();
    }
  }, [collectionId]);

  const canManagePhotos = () => {
    return userRole.toLowerCase() !== 'student';
  };

  const fetchPhotos = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getCollectionPhotos(collectionId!);

      // Set both collection details and photos
      setCollectionTitle(data.collection.title);
      setCollectionDescription(data.collection.description);
      setPhotos(data.photos);
    } catch (err) {
      console.error('Error fetching photos:', err);
      setError('Failed to load photos');
    } finally {
      setLoading(false);
    }
  };

  const handleDragEnd = async (result: DropResult) => {
    // If dropped outside the list or no destination
    if (!result.destination) return;

    // Create a new array with the reordered items
    const newPhotos = Array.from(photos);
    const [reorderedItem] = newPhotos.splice(result.source.index, 1);
    newPhotos.splice(result.destination.index, 0, reorderedItem);

    // Optimistically update the UI
    setPhotos(newPhotos);

    try {
      // Send the new order to the backend
      await updatePhotoOrder(collectionId!, 
        newPhotos.map(photo => photo._id)
      );
    } catch (error) {
      // If update fails, revert the local state
      console.error('Failed to update photo order', error);
      setPhotos(photos);
      setError('Failed to update photo order');
    }
  };

  // Render photo with drag and drop support
  const renderPhotoCard = (photo: Photo, index: number) => (
    <Draggable 
      key={photo._id} 
      draggableId={photo._id} 
      index={index}
      isDragDisabled={!isReordering || !canManagePhotos()}
    >
      {(provided) => (
        <Grid 
          item 
          xs={12} 
          sm={6} 
          md={4} 
          ref={provided.innerRef}
          {...provided.draggableProps}
        >
          <Card
            elevation={1}
            sx={{
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              borderRadius: 4,
              border: `1px solid ${colors.lightBg}`,
              overflow: 'hidden',
              transition: 'transform 0.2s, box-shadow 0.2s',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: `0 4px 20px ${colors.primary}25`,
                '& .image-overlay': {
                  opacity: 1,
                },
              },
            }}
          >
            {/* Drag handle when reordering is active */}
            {isReordering && canManagePhotos() && (
              <Box
                {...provided.dragHandleProps}
                sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  bgcolor: colors.lightBg,
                  py: 0.5,
                }}
              >
                <DragHandleIcon 
                  sx={{ 
                    color: colors.primary,
                    fontSize: 20 
                  }} 
                />
              </Box>
            )}

            <Box sx={{ position: 'relative', height: 320 }}>
              <CardMedia
                component="img"
                image={photo.url}
                alt={photo.title}
                sx={{
                  height: '100%',
                  objectFit: 'contain',
                }}
              />
              <Box
                className="image-overlay"
                sx={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  bgcolor: colors.lightBg,
                  p: 2,
                  opacity: 0,
                  transition: 'opacity 0.2s',
                  borderTop: `1px solid ${colors.lightBg}`,
                }}
              >
                <Typography variant="subtitle1" sx={{ color: colors.primaryDark, fontWeight: 600 }}>
                  {photo.title}
                </Typography>
                {photo.description && (
                  <Typography
                    variant="body2"
                    sx={{
                      color: colors.primary,
                      mt: 0.5,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                    }}
                  >
                    {photo.description}
                  </Typography>
                )}
              </Box>
              {canManagePhotos() && (
                <Box
                  sx={{
                    position: 'absolute',
                    top: 8,
                    right: 8,
                    opacity: 0.8,
                    transition: 'opacity 0.2s',
                    '&:hover': {
                      opacity: 1,
                    },
                  }}
                >
                  <IconButton
                    size="small"
                    onClick={() => {
                      setPhotoToDelete(photo._id);
                      setDeleteConfirmOpen(true);
                    }}
                    sx={{
                      color: colors.primary,
                      bgcolor: 'white',
                      boxShadow: `0 2px 8px ${colors.primary}25`,
                      '&:hover': {
                        bgcolor: 'white',
                        color: colors.error,
                      },
                    }}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Box>
              )}
            </Box>
          </Card>
        </Grid>
      )}
    </Draggable>
  );

  // Update the main return statement
  return (
    <Box sx={{
      minHeight: '100vh',
      bgcolor: colors.background,
      position: 'relative',
      p: 4
    }}>
      {/* ... (keep previous decorative elements and header) */}

      {/* Header with Reorder Toggle */}
      <Box sx={{
        display: 'flex',
        justifyContent: 'space-between',
        mb: 4,
        alignItems: 'center'
      }}>
        <Typography
          variant="h4"
          sx={{
            color: colors.primaryDark,
            fontWeight: 600,
          }}
        >
          Collection Photos
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          {photos.length > 0 && (
            <>
              {canManagePhotos() && (
                <Button
                  variant="outlined"
                  onClick={() => setIsReordering(!isReordering)}
                  sx={{
                    color: colors.primary,
                    borderColor: colors.primary,
                    mr: 2,
                    '&:hover': {
                      bgcolor: colors.lightBg,
                    },
                  }}
                >
                  {isReordering ? 'Stop Reordering' : 'Reorder Photos'}
                </Button>
              )}
              {renderPDFButton()}
              {renderAddPhotoButton()}
            </>
          )}
        </Box>
      </Box>

      {/* Error Alert */}
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
            onClick={fetchPhotos}
            sx={{ ml: 2 }}
          >
            Retry
          </Button>
        </Alert>
      )}

      {/* Drag and Drop Context */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="photo-grid" direction="horizontal">
          {(provided) => (
            <Grid 
              container 
              spacing={3} 
              ref={provided.innerRef}
              {...provided.droppableProps}
            >
              {photos.length === 0 ? (
                renderEmptyState()
              ) : (
                photos.map((photo, index) => renderPhotoCard(photo, index))
              )}
              {provided.placeholder}
            </Grid>
          )}
        </Droppable>
      </DragDropContext>

      {/* ... (keep previous dialogs and other elements) */}
    </Box>
  );
};

export default CollectionPhotos;