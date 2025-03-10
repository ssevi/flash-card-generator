import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Card,
  Select,
  MenuItem,
  Slider,
  Typography,
  Box,
  FormControl,
  InputLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  TextField,
} from '@mui/material';
import { 
  PDFSettings, 
  GridLayoutType, 
  GRID_LAYOUTS,
  LayoutModeType,
  CardSize 
} from '../types/types';

interface PDFSettingsDialogProps {
  open: boolean;
  onClose: () => void;
  settings: PDFSettings;
  onSettingsChange: (settings: PDFSettings) => void;
  onGeneratePDF: () => void;
}

const PDFSettingsDialog: React.FC<PDFSettingsDialogProps> = ({ 
  open, 
  onClose, 
  settings, 
  onSettingsChange,
  onGeneratePDF 
}) => {
  const handleChange = (field: keyof PDFSettings) => (event: any) => {
    onSettingsChange({
      ...settings,
      [field]: event.target.value
    });
  };

  const handleLayoutModeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newLayoutMode = event.target.value as LayoutModeType;
    onSettingsChange({
      ...settings,
      layoutMode: newLayoutMode,
      gridLayout: newLayoutMode === 'grid' ? '2x2' as GridLayoutType : null,
      cardSize: newLayoutMode === 'fixed-size' ? { width: 90, height: 120 } : null
    });
  };

  const handleCardSizeChange = (dimension: keyof CardSize) => (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(event.target.value);
    if (!isNaN(value) && value > 0) {
      onSettingsChange({
        ...settings,
        cardSize: {
          ...(settings.cardSize || { width: 90, height: 120 }),
          [dimension]: value
        }
      });
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      PaperProps={{
        sx: {
          borderRadius: 4,
          bgcolor: 'background.paper',
        }
      }}
    >
      <DialogTitle sx={{ 
        color: '#553C9A',
        fontWeight: 600,
        pt: 3,
        px: 3
      }}>
        PDF Settings
      </DialogTitle>

      <DialogContent sx={{ px: 3 }}>
        <Typography variant="subtitle1" sx={{ mb: 3, color: '#6B46C1' }}>
          Customize your flashcards PDF layout
        </Typography>

        <Card sx={{ 
          p: 3, 
          mb: 2,
          border: '1px solid #EDE9FE',
          boxShadow: 'none'
        }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {/* Layout Mode Selection */}
            <FormControl component="fieldset">
              <Typography sx={{ color: '#553C9A', mb: 1 }}>Layout Mode</Typography>
              <RadioGroup
                value={settings.layoutMode}
                onChange={handleLayoutModeChange}
              >
                <FormControlLabel 
                  value="grid" 
                  control={<Radio sx={{ color: '#6B46C1' }} />} 
                  label="Grid Layout" 
                />
                <FormControlLabel 
                  value="fixed-size" 
                  control={<Radio sx={{ color: '#6B46C1' }} />} 
                  label="Fixed Card Size" 
                />
              </RadioGroup>
            </FormControl>

            {/* Grid Layout or Fixed Size Settings */}
            {settings.layoutMode === 'grid' ? (
              <FormControl fullWidth>
                <InputLabel id="grid-layout-label">Cards per Page</InputLabel>
                <Select
                  labelId="grid-layout-label"
                  value={settings.gridLayout || '2x2'}
                  label="Cards per Page"
                  onChange={handleChange('gridLayout')}
                  sx={{
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#E9D8FD'
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#805AD5'
                    }
                  }}
                >
                  {Object.entries(GRID_LAYOUTS).map(([key, value]) => (
                    <MenuItem key={key} value={key}>
                      {value.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            ) : (
              <Box sx={{ display: 'flex', gap: 2 }}>
                <FormControl fullWidth>
                  <TextField
                    label="Card Width (mm)"
                    type="number"
                    value={settings.cardSize?.width || ''}
                    onChange={handleCardSizeChange('width')}
                    inputProps={{ min: 30, max: 200 }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        '& fieldset': {
                          borderColor: '#E9D8FD',
                        },
                        '&:hover fieldset': {
                          borderColor: '#805AD5',
                        },
                      },
                    }}
                  />
                </FormControl>
                <FormControl fullWidth>
                  <TextField
                    label="Card Height (mm)"
                    type="number"
                    value={settings.cardSize?.height || ''}
                    onChange={handleCardSizeChange('height')}
                    inputProps={{ min: 30, max: 200 }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        '& fieldset': {
                          borderColor: '#E9D8FD',
                        },
                        '&:hover fieldset': {
                          borderColor: '#805AD5',
                        },
                      },
                    }}
                  />
                </FormControl>
              </Box>
            )}

            {/* Display Mode Selection */}
            <FormControl fullWidth>
              <InputLabel id="display-mode-label">Card Display Mode</InputLabel>
              <Select
                labelId="display-mode-label"
                value={settings.displayMode}
                label="Card Display Mode"
                onChange={handleChange('displayMode')}
                sx={{
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#E9D8FD'
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#805AD5'
                  }
                }}
              >
                <MenuItem value="both">Image and Text</MenuItem>
                <MenuItem value="text-only">Text Only</MenuItem>
                <MenuItem value="image-only">Image Only</MenuItem>
              </Select>
            </FormControl>

            {/* Page Settings */}
            <FormControl fullWidth>
              <InputLabel id="page-size-label">Page Size</InputLabel>
              <Select
                labelId="page-size-label"
                value={settings.pageSize}
                label="Page Size"
                onChange={handleChange('pageSize')}
                sx={{
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#E9D8FD'
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#805AD5'
                  }
                }}
              >
                <MenuItem value="a4">A4</MenuItem>
                <MenuItem value="letter">Letter</MenuItem>
                <MenuItem value="legal">Legal</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel id="orientation-label">Page Orientation</InputLabel>
              <Select
                labelId="orientation-label"
                value={settings.orientation}
                label="Page Orientation"
                onChange={handleChange('orientation')}
                sx={{
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#E9D8FD'
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#805AD5'
                  }
                }}
              >
                <MenuItem value="portrait">Portrait</MenuItem>
                <MenuItem value="landscape">Landscape</MenuItem>
              </Select>
            </FormControl>

            {/* Margin Settings */}
            <Box>
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'space-between',
                mb: 2
              }}>
                <Typography sx={{ color: '#553C9A' }}>
                  Page Margin
                </Typography>
                <Typography sx={{ color: '#6B46C1' }}>
                  {settings.margin}mm
                </Typography>
              </Box>
              <Slider
                value={settings.margin}
                onChange={(_, value) => 
                  onSettingsChange({ ...settings, margin: value as number })
                }
                min={5}
                max={30}
                step={1}
                sx={{
                  color: '#6B46C1',
                  '& .MuiSlider-thumb': {
                    '&:hover, &.Mui-focusVisible': {
                      boxShadow: '0 0 0 8px rgba(107, 70, 193, 0.16)'
                    }
                  },
                  '& .MuiSlider-rail': {
                    backgroundColor: '#E9D8FD'
                  }
                }}
              />
            </Box>
          </Box>
        </Card>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button 
          onClick={onClose}
          sx={{
            color: '#6B46C1',
            '&:hover': {
              bgcolor: '#F5F3FF'
            }
          }}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={onGeneratePDF}
          sx={{
            bgcolor: '#6B46C1',
            '&:hover': {
              bgcolor: '#553C9A'
            },
            boxShadow: 'none'
          }}
        >
          Generate PDF
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PDFSettingsDialog;