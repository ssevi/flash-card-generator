// src/pages/EditParent.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  FormControlLabel,
  Switch,
  Alert,
  CircularProgress,
  Divider,
} from '@mui/material';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { getParent, updateParent } from '../services/parent.service';

// Define the Parent interface
interface ParentPermissions {
  canView: boolean;
  canDownload: boolean;
}

interface Parent {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  childName: string;
  childAge: number;
  permissions: ParentPermissions;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

// Enhanced validation schema for edit mode (password is optional)
const validationSchema = yup.object({
  name: yup.string()
    .required('Name is required')
    .min(2, 'Name should be at least 2 characters'),
  email: yup.string()
    .email('Enter a valid email')
    .required('Email is required'),
  password: yup.string()
    .test('password', 'Password must meet requirements', function(value) {
      // Skip validation if password is empty (not being changed)
      if (!value) return true;
      
      // Validate password only if it's being changed
      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
      return passwordRegex.test(value);
    }),
  phone: yup.string()
    .matches(/^\+?[\d\s-]+$/, 'Invalid phone number'),
  childName: yup.string()
    .required('Child name is required')
    .min(2, 'Child name should be at least 2 characters'),
  childAge: yup.number()
    .required('Child age is required')
    .min(0, 'Age cannot be negative')
    .max(18, 'Age must be 18 or under'),
});

const EditParent = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  const formik = useFormik({
    initialValues: {
      name: '',
      email: '',
      password: '',
      phone: '',
      childName: '',
      childAge: 0,
      permissions: {
        canView: false,
        canDownload: true,
      },
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        setError(null);
        // Remove password if it's empty (not being changed)
        const updateData: Partial<typeof values> = { ...values };
        if (!updateData.password) {
          delete updateData.password;
        }
        await updateParent(id!, { ...updateData, childAge: Number(updateData.childAge) });
        navigate('/parents');
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to update parent';
        setError(errorMessage);
        console.error('Error updating parent:', err);
      }
    },
  });

  useEffect(() => {
    const fetchParent = async () => {
      setLoading(true);
      try {
        const parentData: Parent = await getParent(id!);
        
        if (!parentData) {
          throw new Error('Parent not found');
        }

        formik.setValues({
          name: parentData.name ?? '',
          email: parentData.email ?? '',
          password: '', // Don't show existing password
          phone: parentData.phone ?? '',
          childName: parentData.childName ?? '',
          childAge: parentData.childAge ?? 0,
          permissions: {
            canView: parentData.permissions?.canView ?? false,
            canDownload: parentData.permissions?.canDownload ?? false,
          },
        });
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch parent data';
        setError(errorMessage);
        console.error('Error fetching parent:', err);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchParent();
    }
  }, [id]);

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
        <Typography variant="h4">Edit Parent</Typography>
        <Button 
          variant="outlined" 
          onClick={() => navigate('/parents')}
          disabled={formik.isSubmitting}
        >
          Cancel
        </Button>
      </Box>

      <Paper sx={{ p: 4, maxWidth: 'md', mx: 'auto' }}>
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <form onSubmit={formik.handleSubmit}>
          <TextField
            fullWidth
            id="name"
            name="name"
            label="Parent Name"
            value={formik.values.name}
            onChange={formik.handleChange}
            error={formik.touched.name && Boolean(formik.errors.name)}
            helperText={formik.touched.name && formik.errors.name}
            sx={{ mb: 2 }}
            disabled={formik.isSubmitting}
          />

          <TextField
            fullWidth
            id="email"
            name="email"
            label="Email"
            type="email"
            value={formik.values.email}
            onChange={formik.handleChange}
            error={formik.touched.email && Boolean(formik.errors.email)}
            helperText={formik.touched.email && formik.errors.email}
            sx={{ mb: 2 }}
            disabled={formik.isSubmitting}
          />

          <TextField
            fullWidth
            id="phone"
            name="phone"
            label="Phone"
            value={formik.values.phone}
            onChange={formik.handleChange}
            error={formik.touched.phone && Boolean(formik.errors.phone)}
            helperText={formik.touched.phone && formik.errors.phone}
            sx={{ mb: 2 }}
            disabled={formik.isSubmitting}
          />

          <TextField
            fullWidth
            id="childName"
            name="childName"
            label="Child's Name"
            value={formik.values.childName}
            onChange={formik.handleChange}
            error={formik.touched.childName && Boolean(formik.errors.childName)}
            helperText={formik.touched.childName && formik.errors.childName}
            sx={{ mb: 2 }}
            disabled={formik.isSubmitting}
          />

          <TextField
            fullWidth
            id="childAge"
            name="childAge"
            label="Child's Age"
            type="number"
            value={formik.values.childAge}
            onChange={formik.handleChange}
            error={formik.touched.childAge && Boolean(formik.errors.childAge)}
            helperText={formik.touched.childAge && formik.errors.childAge}
            sx={{ mb: 2 }}
            disabled={formik.isSubmitting}
          />

          <Divider sx={{ my: 3 }}>
            <Typography color="textSecondary" variant="body2">
              Permissions
            </Typography>
          </Divider>

          <Box sx={{ mb: 3 }}>
            <FormControlLabel
              control={
                <Switch
                  name="permissions.canView"
                  checked={formik.values.permissions.canView}
                  onChange={formik.handleChange}
                  disabled={formik.isSubmitting}
                />
              }
              label="Can View Content"
            />
            <Typography variant="caption" color="textSecondary" display="block" sx={{ mt: 0.5 }}>
              Parents with view permission can access all collections
            </Typography>
          </Box>

          <FormControlLabel
            control={
              <Switch
                name="permissions.canDownload"
                checked={formik.values.permissions.canDownload}
                onChange={formik.handleChange}
                disabled={formik.isSubmitting}
              />
            }
            label="Can Download Content"
          />

          <Box sx={{ mt: 4, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
            <Button
              type="submit"
              variant="contained"
              disabled={formik.isSubmitting}
              sx={{ minWidth: 120 }}
            >
              {formik.isSubmitting ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                'Save Changes'
              )}
            </Button>
          </Box>
        </form>
      </Paper>
    </Box>
  );
};

export default EditParent;