// src/pages/CreateCollection.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Snackbar,
  Alert,
  CircularProgress,
} from '@mui/material';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { createCollection } from '../services/collection.service';

const validationSchema = yup.object({
  title: yup
    .string()
    .required('Title is required')
    .min(3, 'Title should be at least 3 characters'),
  description: yup
    .string()
    .required('Description is required')
    .min(10, 'Description should be at least 10 characters'),
  category: yup
    .string()
    .required('Category is required'),
});

const CreateCollection = () => {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const formik = useFormik({
    initialValues: {
      title: '',
      description: '',
      category: '',
    },
    validationSchema: validationSchema,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        setError(null);
        await createCollection(values);
        setSuccess(true);
        setTimeout(() => {
          navigate('/collections');
        }, 1500);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to create collection';
        setError(errorMessage);
      } finally {
        setSubmitting(false);
      }
    },
  });

  return (
    <Box>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4">Create Collection</Typography>
        <Button
          variant="outlined"
          onClick={() => navigate('/collections')}
          disabled={formik.isSubmitting}
        >
          Cancel
        </Button>
      </Box>

      <Paper sx={{ p: 4, maxWidth: 'md', mx: 'auto' }}>
        <form onSubmit={formik.handleSubmit}>
          <TextField
            fullWidth
            id="title"
            name="title"
            label="Collection Title"
            margin="normal"
            value={formik.values.title}
            onChange={formik.handleChange}
            error={formik.touched.title && Boolean(formik.errors.title)}
            helperText={formik.touched.title && formik.errors.title}
            disabled={formik.isSubmitting}
          />

          <TextField
            fullWidth
            id="description"
            name="description"
            label="Description"
            margin="normal"
            multiline
            rows={4}
            value={formik.values.description}
            onChange={formik.handleChange}
            error={formik.touched.description && Boolean(formik.errors.description)}
            helperText={formik.touched.description && formik.errors.description}
            disabled={formik.isSubmitting}
          />

          <FormControl
            fullWidth
            margin="normal"
            error={formik.touched.category && Boolean(formik.errors.category)}
          >
            <InputLabel id="category-label">Category</InputLabel>
            <Select
              labelId="category-label"
              id="category"
              name="category"
              value={formik.values.category}
              label="Category"
              onChange={formik.handleChange}
              disabled={formik.isSubmitting}
            >
              <MenuItem value="mathematics">Mathematics</MenuItem>
              <MenuItem value="science">Science</MenuItem>
              <MenuItem value="history">History</MenuItem>
              <MenuItem value="language">Language</MenuItem>
              <MenuItem value="other">Other</MenuItem>
            </Select>
            {formik.touched.category && formik.errors.category && (
              <FormHelperText>{formik.errors.category}</FormHelperText>
            )}
          </FormControl>

          <Box sx={{ mt: 4, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
            <Button
              type="submit"
              variant="contained"
              size="large"
              disabled={formik.isSubmitting}
            >
              {formik.isSubmitting ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                'Create Collection'
              )}
            </Button>
          </Box>
        </form>
      </Paper>

      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError(null)}
      >
        <Alert severity="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      </Snackbar>

      <Snackbar
        open={success}
        autoHideDuration={6000}
        onClose={() => setSuccess(false)}
      >
        <Alert severity="success">
          Collection created successfully!
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default CreateCollection;