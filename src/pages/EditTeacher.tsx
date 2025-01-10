// src/pages/EditTeacher.tsx
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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
} from '@mui/material';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { getTeacher, updateTeacher } from '../services/teacher.service';

// Add after imports
interface TeacherPermissions {
  canUpload: boolean;
  canDownload: boolean;
  canEdit: boolean;
  canDelete: boolean;
}

interface Teacher {
  permissions: TeacherPermissions;
  _id: string;
  name: string;
  email: string;
  department: string;
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
  department: yup.string()
    .required('Department is required'),
});

const EditTeacher = () => {
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
      department: '',
      permissions: {
        canUpload: false,
        canDownload: true,
        canEdit: false,
        canDelete: false,
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
        await updateTeacher(id!, updateData);
        navigate('/teachers');
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to update teacher';
        setError(errorMessage);
        console.error('Error updating teacher:', err);
      }
    },
  });

  useEffect(() => {
    const fetchTeacher = async () => {
      setLoading(true);
      try {
        const teacherData: Teacher = await getTeacher(id!);
        console.log("teacher data:", teacherData);
        
        if (!teacherData) {
          throw new Error('Teacher not found');
        }
  
        formik.setValues({
          name: teacherData.name ?? '',
          email: teacherData.email ?? '',
          password: '', // Don't show existing password
          department: teacherData.department ?? '',
          permissions: {
            canUpload: teacherData.permissions?.canUpload ?? false,
            canDownload: teacherData.permissions?.canDownload ?? false,
            canEdit: teacherData.permissions?.canEdit ?? false,
            canDelete: teacherData.permissions?.canDelete ?? false,
          },
        });
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch teacher data';
        setError(errorMessage);
        console.error('Error fetching teacher:', err);
      } finally {
        setLoading(false);
      }
    };
  
    if (id) {
      fetchTeacher();
    }
  }, [id]);
  

  const departments = [
    'Special Education',
    'Speech Language Pathology',
    'Audiology',
    'Early Intervention',
    'Psychology',
    'Other'
  ];

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
        <Typography variant="h6">Edit Teacher</Typography>
        <Button 
          variant="outlined" 
          onClick={() => navigate('/teachers')}
          disabled={formik.isSubmitting}
          size='small'
          sx={{borderRadius:'20px'}}
        >
          Cancel
        </Button>
      </Box>

      <Paper sx={{ p: 4, maxWidth: 'md', mx: 'auto', border:'1px solid #e8e8e8' }} elevation={0}>
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
            label="Name"
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
{/* 
          <TextField
            fullWidth
            id="password"
            name="password"
            label="New Password (leave empty to keep current)"
            type={showPassword ? "text" : "password"}
            value={formik.values.password}
            onChange={formik.handleChange}
            error={formik.touched.password && Boolean(formik.errors.password)}
            helperText={formik.touched.password && formik.errors.password}
            sx={{ mb: 2 }}
            disabled={formik.isSubmitting}
            InputProps={{
              endAdornment: (
                <Button
                  onClick={() => setShowPassword(!showPassword)}
                  sx={{ whiteSpace: 'nowrap' }}
                >
                  {showPassword ? 'Hide' : 'Show'}
                </Button>
              ),
            }}
          /> */}

          <FormControl fullWidth sx={{ mb: 3 }}>
            <InputLabel id="department-label">Department</InputLabel>
            <Select
              labelId="department-label"
              id="department"
              name="department"
              value={formik.values.department}
              label="Department"
              onChange={formik.handleChange}
              error={formik.touched.department && Boolean(formik.errors.department)}
              disabled={formik.isSubmitting}
            >
              {departments.map((dept) => (
                <MenuItem key={dept} value={dept}>
                  {dept}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Divider sx={{ my: 3 }}>
            <Typography color="textSecondary" variant="body2">
              Permissions
            </Typography>
          </Divider>

          <Box sx={{ mb: 3 }}>
            <FormControlLabel
              control={
                <Switch
                  name="permissions.canUpload"
                  checked={formik.values.permissions.canUpload}
                  onChange={formik.handleChange}
                  disabled={formik.isSubmitting}
                />
              }
              label="Can Upload Content"
            />
            <Typography variant="caption" color="textSecondary" display="block" sx={{ mt: 0.5 }}>
              Teachers with upload permission can also edit and delete content
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
              sx={{ minWidth: 120 , borderRadius:'20px'}}
              size='small'
              
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

export default EditTeacher;