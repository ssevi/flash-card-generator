// src/pages/AddPhoto.tsx
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Alert,
  CircularProgress,
  IconButton,
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { addPhotoToCollection } from '../services/collection.service';

interface FormValues {
  title: string;
  description: string;
  photo: File | null;
}

const validationSchema = yup.object({
  title: yup.string().required('Title is required'),
  description: yup.string(),
  photo: yup
    .mixed()
    .required('Photo is required')
    .test('fileType', 'Unsupported file format', (value: any) => {
      if (!value) return false;
      if (!(value instanceof File)) return false;
      const supportedFormats = ['image/jpeg', 'image/png', 'image/webp'];
      return supportedFormats.includes(value.type);
    })
});

const AddPhoto = () => {
  const { id: collectionId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const formik = useFormik<FormValues>({
    initialValues: {
      title: '',
      description: '',
      photo: null,
    },
    validationSchema,
        onSubmit: async (values) => {
      try {
        setUploadError(null);
        if (!values.photo) {
          throw new Error('Photo is required');
        }
        if (!collectionId) {
          throw new Error('Collection ID is missing');
        }

        console.log('Submitting photo:', {
          collectionId,
          title: values.title,
          description: values.description,
          photoName: values.photo.name
        });

        await addPhotoToCollection(collectionId, {
          title: values.title,
          description: values.description,
          photo: values.photo,
        });

        navigate(`/collections/${collectionId}/cards`);
      } catch (error) {
        console.error('Error adding photo:', error);
        setUploadError(error instanceof Error ? error.message : 'Failed to upload photo');
      }
    },
  });
  const handlePhotoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.currentTarget.files?.[0];
    if (file) {
      formik.setFieldValue('photo', file);
      // Cleanup previous preview URL if it exists
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  // Cleanup preview URL on component unmount
  React.useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const clearPhoto = (e: React.MouseEvent) => {
    e.preventDefault();
    formik.setFieldValue('photo', null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
  };

  return (
    <Box>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4">Add Photo</Typography>
        <Button variant="outlined" onClick={() => navigate(`/collections/${collectionId}/cards`)}>
          Cancel
        </Button>
      </Box>

      <Paper sx={{ p: 4, maxWidth: 'md', mx: 'auto' }}>
      {uploadError && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {uploadError}
          </Alert>
        )}
        <form onSubmit={formik.handleSubmit}>
          <Box sx={{ mb: 3 }}>
            <input
              accept="image/jpeg,image/png,image/webp"
              style={{ display: 'none' }}
              id="photo-upload"
              type="file"
              onChange={handlePhotoChange}
            />
            <label htmlFor="photo-upload">
              <Button
                variant="outlined"
                component="span"
                fullWidth
                sx={{ height: 200, position: 'relative' }}
              >
                {previewUrl ? (
                  <>
                    <img
                      src={previewUrl}
                      alt="Preview"
                      style={{
                        maxHeight: '100%',
                        maxWidth: '100%',
                        objectFit: 'contain',
                      }}
                    />
                    <IconButton
                      size="small"
                      sx={{ position: 'absolute', top: 8, right: 8 }}
                      onClick={clearPhoto}
                    >
                      <CloseIcon />
                    </IconButton>
                  </>
                ) : (
                  'Click to upload photo'
                )}
              </Button>
            </label>
            {formik.touched.photo && formik.errors.photo && (
              <Alert severity="error" sx={{ mt: 1 }}>
                {formik.errors.photo as string}
              </Alert>
            )}
          </Box>

          <TextField
            fullWidth
            id="title"
            name="title"
            label="Title"
            value={formik.values.title}
            onChange={formik.handleChange}
            error={formik.touched.title && Boolean(formik.errors.title)}
            helperText={formik.touched.title && formik.errors.title}
            sx={{ mb: 2 }}
          />

          <TextField
            fullWidth
            id="description"
            name="description"
            label="Description"
            multiline
            rows={4}
            value={formik.values.description}
            onChange={formik.handleChange}
            error={formik.touched.description && Boolean(formik.errors.description)}
            helperText={formik.touched.description && formik.errors.description}
            sx={{ mb: 3 }}
          />

          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
            <Button
              type="submit"
              variant="contained"
              disabled={formik.isSubmitting}
              sx={{ minWidth: 120 }}
            >
              {formik.isSubmitting ? <CircularProgress size={24} /> : 'Add Photo'}
            </Button>
          </Box>
        </form>
      </Paper>
    </Box>
  );
};

export default AddPhoto;