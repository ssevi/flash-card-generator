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
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Slider,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  PhotoLibrary as PhotoLibraryIcon,
  PictureAsPdf as PdfIcon
} from '@mui/icons-material';
import { getCollectionPhotos, deletePhotoFromCollection } from '../services/collection.service';
import { jsPDF } from 'jspdf';
import PDFSettingsDialog from './PDFSettingsDialog';
import { useTheme } from '../contexts/ThemeContext';

import { PDFSettings, GRID_LAYOUTS } from '../types/types';
// Types
interface Photo {
  _id: string;
  url: string;
  title: string;
  description?: string;
}
// // First, update the PDFSettings interface
// interface PDFSettings {
//   pageSize: 'a4' | 'letter' | 'legal';
//   orientation: 'portrait' | 'landscape';
//   margin: number;
//   displayMode: 'both' | 'text-only' | 'image-only';
//   gridLayout: '2x2' | '2x3' | '3x2' | '3x3';  // new option for grid layout
// }

interface PageDimensions {
  width: number;
  height: number;
}

export const PAGE_SIZES = {
  'a4': { width: 210, height: 297 },
  'letter': { width: 215.9, height: 279.4 },
  'legal': { width: 215.9, height: 355.6 }
};

export const ORIENTATIONS = {
  'portrait': 'Portrait',
  'landscape': 'Landscape'
};


// PDF Settings Dialog Component
interface PDFSettingsDialogProps {
  open: boolean;
  onClose: () => void;
  settings: PDFSettings;
  onSettingsChange: (settings: PDFSettings) => void;
  onGeneratePDF: () => void;
}



// Helper function to load image
const loadImage = (url: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
};

const calculateOptimalFontSize = (
  pdf: jsPDF,
  text: string,
  maxWidth: number,
  maxHeight: number,
  minFontSize: number = 12,
  maxFontSize: number = 72,
  preferSingleLine: boolean = true
): { fontSize: number; lines: string[] } => {
  let fontSize = maxFontSize;
  let finalLines: string[] = [];

  let low = minFontSize;
  let high = maxFontSize;

  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    pdf.setFontSize(mid);
    const lines = pdf.splitTextToSize(text, maxWidth);
    const textHeight = (lines.length * mid * 0.3527); // Convert pt to mm

    if (textHeight <= maxHeight) {
      if (preferSingleLine && lines.length > 1) {
        high = mid - 1;
      } else {
        fontSize = mid;
        finalLines = lines;
        low = mid + 1;
      }
    } else {
      high = mid - 1;
    }
  }

  if (preferSingleLine && finalLines.length === 0) {
    return calculateOptimalFontSize(
      pdf,
      text,
      maxWidth,
      maxHeight,
      minFontSize,
      maxFontSize,
      false
    );
  }

  return { fontSize, lines: finalLines };
};

const renderTextOnlyCard = (
  pdf: jsPDF,
  text: string,
  x: number,
  y: number,
  cardWidth: number,
  cardHeight: number,
  margin: number
) => {
  // Background
  pdf.setFillColor(245, 243, 255);
  pdf.rect(x, y, cardWidth, cardHeight, 'F');

  const textAreaWidth = cardWidth - (margin * 2);
  const textAreaHeight = cardHeight - (margin * 2);

  pdf.setFont('', 'bold');
  pdf.setTextColor(85, 60, 154);

  const { fontSize, lines } = calculateOptimalFontSize(
    pdf,
    text.toLowerCase(),
    textAreaWidth,
    textAreaHeight,
    20,  // min font size
    48,  // max font size
    true
  );

  pdf.setFontSize(fontSize);

  const lineHeight = fontSize * 0.3527;
  const totalTextHeight = lines.length * lineHeight;
  const textY = y + (cardHeight / 2) - (totalTextHeight / 2) + (lineHeight / 2);

  lines.forEach((line, index) => {
    pdf.text(
      line,
      x + (cardWidth / 2),
      textY + (index * lineHeight),
      { align: 'center' }
    );
  });
};

const renderTitleCard = (
  pdf: jsPDF,
  x: number,
  y: number,
  cardWidth: number,
  cardHeight: number,
  margin: number,
  collectionTitle: string,
  collectionDescription: string
) => {
  // Background
  pdf.setFillColor(255, 255, 255);
  pdf.rect(x, y, cardWidth, cardHeight, 'F');

  // Border
  pdf.setDrawColor(107, 70, 193);
  pdf.setLineWidth(0.3);
  pdf.rect(x + margin / 2, y + margin / 2, cardWidth - margin, cardHeight - margin, 'S');

  // Title Section
  pdf.setFont('', 'bold');
  pdf.setTextColor(85, 60, 154);

  const titleAreaWidth = cardWidth - (margin * 3);
  const titleAreaHeight = (cardHeight - (margin * 6)) / 2;

  const { fontSize: titleFontSize, lines: titleLines } = calculateOptimalFontSize(
    pdf,
    collectionTitle.toLowerCase(),
    titleAreaWidth,
    titleAreaHeight,
    20,
    36,
    false
  );

  pdf.setFontSize(titleFontSize);
  const titleLineHeight = titleFontSize * 0.3527;
  let currentY = y + margin * 4;

  titleLines.forEach((line, index) => {
    pdf.text(
      line,
      x + cardWidth / 2,
      currentY + (index * titleLineHeight),
      { align: 'center' }
    );
  });

  // Description
  if (collectionDescription) {
    currentY += (titleLines.length * titleLineHeight) + margin * 2;

    const descAreaHeight = cardHeight - currentY - (margin * 3);
    const { fontSize: descFontSize, lines: descLines } = calculateOptimalFontSize(
      pdf,
      collectionDescription,
      titleAreaWidth,
      descAreaHeight,
      10,
      14,
      false
    );

    pdf.setFontSize(descFontSize);
    pdf.setTextColor(107, 70, 193);

    const descLineHeight = descFontSize * 0.3527;
    descLines.forEach((line, index) => {
      pdf.text(
        line,
        x + cardWidth / 2,
        currentY + (index * descLineHeight),
        { align: 'center' }
      );
    });
  }

  // Date
  pdf.setFontSize(8);
  pdf.setTextColor(107, 70, 193);
  const date = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  pdf.text(
    date,
    x + cardWidth / 2,
    y + cardHeight - margin * 1.5,
    { align: 'center' }
  );
};
const calculateCardPositions = (
  pageWidth: number,
  pageHeight: number,
  margin: number,
  settings: PDFSettings
): { x: number; y: number }[] => {
  const positions: { x: number; y: number }[] = [];
  const usableWidth = pageWidth - (2 * margin);
  const usableHeight = pageHeight - (2 * margin);

  if (settings.layoutMode === 'grid' && settings.gridLayout) {
    // Grid layout logic
    const { rows, cols } = GRID_LAYOUTS[settings.gridLayout];
    const cardWidth = (usableWidth - (margin * (cols - 1))) / cols;
    const cardHeight = (usableHeight - (margin * (rows - 1))) / rows;

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        positions.push({
          x: margin + (col * (cardWidth + margin)),
          y: margin + (row * (cardHeight + margin))
        });
      }
    }
  } else if (settings.layoutMode === 'fixed-size' && settings.cardSize) {
    // Fixed-size layout logic
    const { width: cardWidth, height: cardHeight } = settings.cardSize;
    let currentX = margin;
    let currentY = margin;

    while (currentY + cardHeight <= pageHeight - margin) {
      // Check if there's enough space in the current row
      if (currentX + cardWidth <= pageWidth - margin) {
        positions.push({ x: currentX, y: currentY });
        currentX += cardWidth + margin;
      } else {
        // Move to next row
        currentX = margin;
        currentY += cardHeight + margin;
      }
    }
  }

  return positions;
};

const generateFlashcardsPDF = async (
  photos: Photo[],
  settings: PDFSettings,
  collectionTitle: string,
  collectionDescription: string
): Promise<jsPDF> => {
  const { pageSize, orientation, margin, displayMode } = settings;

  const dimensions: PageDimensions = PAGE_SIZES[pageSize];
  const pageWidth = orientation === 'portrait' ? dimensions.width : dimensions.height;
  const pageHeight = orientation === 'portrait' ? dimensions.height : dimensions.width;

  const pdf = new jsPDF({
    orientation: orientation,
    unit: 'mm',
    format: pageSize
  });

  // Calculate card positions based on layout mode
  const cardPositions = calculateCardPositions(pageWidth, pageHeight, margin, settings);

  // Helper function to get card dimensions
  const getCardDimensions = () => {
    if (settings.layoutMode === 'fixed-size' && settings.cardSize) {
      return settings.cardSize;
    } else if (settings.layoutMode === 'grid' && settings.gridLayout) {
      const { rows, cols } = GRID_LAYOUTS[settings.gridLayout];
      const usableWidth = pageWidth - (2 * margin);
      const usableHeight = pageHeight - (2 * margin);
      return {
        width: (usableWidth - (margin * (cols - 1))) / cols,
        height: (usableHeight - (margin * (rows - 1))) / rows
      };
    }
    throw new Error('Invalid layout settings');
  };

  // Draw grid lines helper
  const drawGridLines = () => {
    pdf.setDrawColor(200, 200, 200);
    pdf.setLineDashPattern([1, 1], 0);

    const cardDims = getCardDimensions();

    if (settings.layoutMode === 'grid') {
      // Draw regular grid lines for grid layout
      cardPositions.forEach(pos => {
        // Horizontal lines
        pdf.line(margin, pos.y, pageWidth - margin, pos.y);
        // Vertical lines
        pdf.line(pos.x, margin, pos.x, pageHeight - margin);
      });

      // Draw bottom and right lines for last row/column
      const lastPos = cardPositions[cardPositions.length - 1];
      pdf.line(margin, lastPos.y + cardDims.height, pageWidth - margin, lastPos.y + cardDims.height);
      pdf.line(lastPos.x + cardDims.width, margin, lastPos.x + cardDims.width, pageHeight - margin);
    } else {
      // Draw individual card borders for fixed-size layout
      cardPositions.forEach(pos => {
        pdf.rect(pos.x, pos.y, cardDims.width, cardDims.height, 'S');
      });
    }
  };

  // Process photos for each page
  const processPage = async (startIndex: number, positions: { x: number; y: number }[]) => {
    const cardDims = getCardDimensions();
    drawGridLines();

    // Add title card in first position if it's the first page
    let photoIndex = startIndex;
    let positionIndex = 0;

    if (startIndex === 0) {
      // Render title card in first position
      renderTitleCard(
        pdf,
        positions[0].x,
        positions[0].y,
        cardDims.width,
        cardDims.height,
        margin,
        collectionTitle,
        collectionDescription
      );
      photoIndex = 1;
      positionIndex = 1;
    }

    // Process remaining positions on the page
    for (; positionIndex < positions.length && photoIndex < photos.length; positionIndex++, photoIndex++) {
      const photo = photos[photoIndex];
      const pos = positions[positionIndex];

      if (displayMode === 'text-only') {
        renderTextOnlyCard(
          pdf,
          photo.title,
          pos.x,
          pos.y,
          cardDims.width,
          cardDims.height,
          margin
        );
      } else {
        try {
          const img = await loadImage(photo.url);
          const aspectRatio = img.width / img.height;

          let imgWidth = cardDims.width - (margin * 2);
          let imgHeight = imgWidth / aspectRatio;

          const availableHeight = displayMode === 'both' ?
            cardDims.height - (margin * 4) :
            cardDims.height - (margin * 2);

          if (imgHeight > availableHeight) {
            imgHeight = availableHeight;
            imgWidth = imgHeight * aspectRatio;
          }

          if (displayMode === 'both') {
            // Render title
            const textX = pos.x + margin;
            const textY = pos.y + margin;

            const maxTextWidth = cardDims.width - (margin * 2);
            const { fontSize, lines } = calculateOptimalFontSize(
              pdf,
              photo.title.toLowerCase(),
              maxTextWidth,
              margin * 2,
              12,
              18,
              false
            );

            pdf.setFontSize(fontSize);
            pdf.setTextColor(0, 0, 0);
            lines.forEach((line, idx) => {
              pdf.text(
                line,
                textX,
                textY + (idx * (fontSize * 0.3527)),
                { align: 'left' }
              );
            });
          }

          // Calculate image position
          const xOffset = pos.x + (cardDims.width - imgWidth) / 2;
          const yOffset = displayMode === 'both' ?
            pos.y + (margin * 3) :
            pos.y + (cardDims.height - imgHeight) / 2;

          pdf.addImage(img, 'JPEG', xOffset, yOffset, imgWidth, imgHeight);
        } catch (error) {
          console.error(`Error loading image: ${photo.url}`, error);
          // Fallback to text-only if image fails to load
          renderTextOnlyCard(
            pdf,
            photo.title,
            pos.x,
            pos.y,
            cardDims.width,
            cardDims.height,
            margin
          );
        }
      }
    }

    // Add watermark
    pdf.setFontSize(8);
    pdf.setTextColor(150, 150, 150);
    pdf.text(
      'Created with Nish - Learning Assistant',
      pageWidth / 2,
      pageHeight - (margin / 2),
      { align: 'center' }
    );

    return photoIndex;
  };

  // Process all photos across multiple pages
  let currentPhotoIndex = 0;
  while (currentPhotoIndex < photos.length) {
    if (currentPhotoIndex > 0) {
      pdf.addPage();
    }
    currentPhotoIndex = await processPage(currentPhotoIndex, cardPositions);
  }

  return pdf;
};


// Main Component
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
  // Update the initial PDF settings
  const [pdfSettings, setPdfSettings] = useState<PDFSettings>({
    pageSize: 'a4',
    orientation: 'portrait',
    margin: 6,
    displayMode: 'both',
    layoutMode: 'grid',
    gridLayout: '2x2',
    cardSize: null
  });
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

  const handleDeletePhoto = async () => {
    if (!photoToDelete) return;
    try {
      await deletePhotoFromCollection(collectionId!, photoToDelete);
      setPhotos(photos.filter(photo => photo._id !== photoToDelete));
      setDeleteConfirmOpen(false);
      setPhotoToDelete(null);
    } catch (err) {
      setError('Failed to delete photo');
    }
  };

  const handleDownloadPDF = async () => {
    try {
      setGeneratingPdf(true);
      setError(null);

      // Validate settings before generating PDF
      if (pdfSettings.layoutMode === 'fixed-size' && !pdfSettings.cardSize) {
        setError('Please set valid card dimensions');
        return;
      }

      if (pdfSettings.layoutMode === 'grid' && !pdfSettings.gridLayout) {
        setError('Please select a grid layout');
        return;
      }

      const pdf = await generateFlashcardsPDF(
        photos,
        pdfSettings,
        collectionTitle,
        collectionDescription
      );

      pdf.save(`nish-flashcards-${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      setError('Failed to generate PDF. Please try again.');
    } finally {
      setGeneratingPdf(false);
      setPdfSettingsOpen(false);
    }
  };

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="200px"
        sx={{ color: colors.primary }}  // Replace #6B46C1
      >
        <CircularProgress color="inherit" />
      </Box>
    );
  }

  const renderPDFButton = () => (
    <Tooltip title="Download as Flashcards PDF">
      <Button
        variant="outlined"
        startIcon={generatingPdf ? <CircularProgress size={20} /> : <PdfIcon />}
        onClick={() => setPdfSettingsOpen(true)}
        disabled={generatingPdf}
        sx={{
          color: colors.primary,
          borderColor: colors.primary,
          '&:hover': {
            borderColor: colors.primaryDark,
            bgcolor: colors.lightBg,
          },
          borderRadius: 2,
          py: 1.5,
          px: 3,
        }}
      >
        {generatingPdf ? 'Generating PDF...' : 'Download Flashcards'}
      </Button>
    </Tooltip>
  );
  // Update your render functions to use the permission check
  const renderAddPhotoButton = () => (
    canManagePhotos() && (
      <Button
        variant="contained"
        startIcon={<AddIcon />}
        onClick={() => navigate(`/collections/${collectionId}/photos/add`)}
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
        Add Photos
      </Button>
    )
  );

  const renderEmptyState = () => (
    <Paper
      elevation={1}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '400px',
        borderRadius: 4,
        border: `1px solid ${colors.lightBg}`,
        p: 6,
      }}
    >
      <PhotoLibraryIcon sx={{
        fontSize: 64,
        color: colors.primary,
        mb: 2,
        opacity: 0.8
      }} />
      <Typography variant="h6" sx={{ color: colors.primaryDark, mb: 2 }}>

        No photos added yet
      </Typography>
      {canManagePhotos() && (
       
          <Button
  variant="contained"
  startIcon={<AddIcon />}
  onClick={() => navigate(`/collections/${collectionId}/photos/add`)}
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
          Add Your First Photo
        </Button>
      )}
    </Paper>
  );

  // Update the photo card render function
  const renderPhotoCard = (photo: Photo) => (
    <Grid item xs={12} sm={6} md={4} key={photo._id}>
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
  );


  return (
    <Box sx={{
      minHeight: '100vh',
      bgcolor: colors.background,
      position: 'relative',
      p: 4
    }}>      {/* Decorative shapes */}
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
          background: 'linear-gradient(45deg, #805ad5 30%, #6b46c1 90%)',
          opacity: 0.05,
          zIndex: 0,
        }}
      />

      {/* Main content */}
      <Box sx={{ position: 'relative', zIndex: 1 }}>
        {/* Header */}
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
            {photos.length > 0 && renderPDFButton()}
            {renderAddPhotoButton()}
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

        {photos.length === 0 ? renderEmptyState() : (
          <Grid container spacing={3}>
            {photos.map(photo => renderPhotoCard(photo))}
          </Grid>
        )}
        {/* PDF Settings Dialog */}
        <PDFSettingsDialog
          open={pdfSettingsOpen}
          onClose={() => setPdfSettingsOpen(false)}
          settings={pdfSettings}
          onSettingsChange={setPdfSettings}
          onGeneratePDF={handleDownloadPDF}
        />

        {/* Delete Confirmation Dialog */}
        <Dialog
          open={deleteConfirmOpen}
          onClose={() => setDeleteConfirmOpen(false)}
          PaperProps={{
            sx: {
              borderRadius: 4,
              p: 2,
              bgcolor: colors.background,
            }
          }}
        >
          <DialogTitle sx={{ color: colors.primaryDark, fontWeight: 600 }}>
            Delete Photo
          </DialogTitle>
          <DialogContent>
            <DialogContentText sx={{ color: colors.primary }}>
              Are you sure you want to delete this photo from the collection?
              This action cannot be undone.
            </DialogContentText>
          </DialogContent>
          <DialogActions sx={{ p: 2, pt: 0 }}>
            <Button
              onClick={() => setDeleteConfirmOpen(false)}
              sx={{
                color: colors.primary,
                '&:hover': {
                  bgcolor: colors.lightBg,
                },
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleDeletePhoto}
              sx={{
                color: colors.error,
                '&:hover': {
                  bgcolor: `${colors.error}10`,
                },
              }}
            >
              Delete
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Box>
  );
};

export default CollectionPhotos;