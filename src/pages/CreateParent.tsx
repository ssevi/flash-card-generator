import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  LinearProgress,
} from '@mui/material';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { createParent } from '../services/parent.service';

// Password strength checker function
const checkPasswordStrength = (password: string): number => {
  let strength = 0;
  if (password.length >= 8) strength += 20;
  if (password.match(/[a-z]+/)) strength += 20;
  if (password.match(/[A-Z]+/)) strength += 20;
  if (password.match(/[0-9]+/)) strength += 20;
  if (password.match(/[@$!%*?&]+/)) strength += 20;
  return strength;
};

// Get color based on password strength
const getPasswordStrengthColor = (strength: number): string => {
  if (strength <= 20) return '#f44336'; // Red
  if (strength <= 40) return '#ff9800'; // Orange
  if (strength <= 60) return '#ffeb3b'; // Yellow
  if (strength <= 80) return '#4caf50'; // Light Green
  return '#2e7d32'; // Dark Green
};

const validationSchema = yup.object({
  name: yup.string()
    .required('Name is required')
    .min(2, 'Name should be at least 2 characters'),
  email: yup.string()
    .email('Enter a valid email')
    .required('Email is required'),
  phone: yup.string()
    .required('Phone number is required')
    .matches(/^\d{10}$/, 'Phone number must be exactly 10 digits'),
  childName: yup.string()
    .required('Child name is required')
    .min(2, 'Child name should be at least 2 characters'),
  childAge: yup.number()
    .required('Child age is required')
    .min(0, 'Age cannot be negative')
    .max(18, 'Age must be 18 or under'),
  password: yup.string()
    .required('Password is required')
    .min(8, 'Password should be at least 8 characters')
    .matches(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .matches(/[a-z]/, 'Password must contain at least one lowercase letter')
    .matches(/[0-9]/, 'Password must contain at least one number')
    .matches(/[@$!%*?&]/, 'Password must contain at least one special character'),
});

const CreateParent = () => {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);

  const formik = useFormik({
    initialValues: {
      name: '',
      email: '',
      phone: '',
      childName: '',
      childAge: '',
      password: '',
      permissions: {
        canView: true,
        canDownload: true,
      },
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        setError(null);
        await createParent({ ...values, childAge: Number(values.childAge) });
        navigate('/parents');
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to create parent';
        setError(errorMessage);
        console.error('Error creating parent:', err);
      }
    },
  });

  // Handle password change to update strength indicator
  const handlePasswordChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    formik.handleChange(event);
    setPasswordStrength(checkPasswordStrength(event.target.value));
  };

  return (
    <Box>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4">Create Parent</Typography>
        <Button 
          variant="outlined" 
          onClick={() => navigate('/parents')}
          disabled={formik.isSubmitting}
        >
          Cancel
        </Button>
      </Box>

      <Paper sx={{ p: 4, maxWidth: 'md', mx: 'auto', border: '1px solid #E8E8E8' }} elevation={0}>
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
            label="Phone (10 digits)"
            value={formik.values.phone}
            onChange={formik.handleChange}
            error={formik.touched.phone && Boolean(formik.errors.phone)}
            helperText={formik.touched.phone && formik.errors.phone}
            sx={{ mb: 2 }}
            disabled={formik.isSubmitting}
            inputProps={{
              maxLength: 10,
              pattern: '\\d*',
            }}
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

          <TextField
            fullWidth
            id="password"
            name="password"
            label="Password"
            type={showPassword ? "text" : "password"}
            value={formik.values.password}
            onChange={handlePasswordChange}
            error={formik.touched.password && Boolean(formik.errors.password)}
            helperText={formik.touched.password && formik.errors.password}
            sx={{ mb: 1 }}
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
          />

          {/* Password strength indicator */}
          <Box sx={{ mb: 3 }}>
            <LinearProgress
              variant="determinate"
              value={passwordStrength}
              sx={{
                height: 8,
                borderRadius: 4,
                backgroundColor: '#e0e0e0',
                '& .MuiLinearProgress-bar': {
                  backgroundColor: getPasswordStrengthColor(passwordStrength),
                },
              }}
            />
            <Typography variant="caption" sx={{ mt: 1, display: 'block', color: getPasswordStrengthColor(passwordStrength) }}>
              Password Strength: {passwordStrength}%
            </Typography>
          </Box>

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
                'Create Parent'
              )}
            </Button>
          </Box>
        </form>
      </Paper>
    </Box>
  );
};

export default CreateParent;