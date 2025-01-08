// src/components/auth/Login.tsx
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Container,
  InputAdornment,
  IconButton,
  Alert,
  CircularProgress,
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { useAuth } from '../../contexts/AuthContext';
import logo_nish from '../../assets/images/logo_nish.png';

const validationSchema = yup.object({
  email: yup
    .string()
    .email('Enter a valid email')
    .required('Email is required'),
  password: yup
    .string()
    .min(8, 'Password should be of minimum 8 characters length')
    .required('Password is required'),
});

const Login = () => {
  const navigate = useNavigate();
  const { login, isLoading, error: authError, isAuthenticated } = useAuth();
  const [showPassword, setShowPassword] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const formik = useFormik({
    initialValues: {
      email: '',
      password: '',
    },
    validationSchema: validationSchema,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        console.log('Login Component: Starting login process', values);
        setError(null);
        
        await login(values);
        console.log('Login Component: Login successful');
        
        if (isAuthenticated) {
          console.log('Login Component: Navigating to home');
          navigate('/', { replace: true });
        } else {
          console.log('Login Component: Not authenticated after login');
          setError('Authentication failed');
        }
      } catch (err) {
        console.error('Login Component: Error during login:', err);
        setError(
          err instanceof Error 
            ? err.message 
            : 'Failed to sign in. Please check your credentials.'
        );
      } finally {
        setSubmitting(false);
      }
    },
  });

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          borderRadius: 10,
        }}
      >
        <Paper
          elevation={3}
          sx={{
            padding: 8,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            width: '100%',
            borderRadius: 10,
          }}
        >
          <Box
            component="img"
            src={logo_nish}
            alt="Flash Card Generator Logo"
            sx={{
              width: 120,
              height: 'auto',
              mb: 2
            }}
          />
          <Typography component="h1" variant="h5" gutterBottom>
            Sign in
          </Typography>

          {(error || authError) && (
            <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
              {error || authError}
            </Alert>
          )}

          <Box
            component="form"
            onSubmit={(e) => {
              e.preventDefault(); // Add this line
              formik.handleSubmit(e);
            }}
            noValidate
            sx={{ width: '100%' }}
          >
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              autoFocus
              disabled={isLoading || formik.isSubmitting}
              value={formik.values.email}
              onChange={formik.handleChange}
              error={formik.touched.email && Boolean(formik.errors.email)}
              helperText={formik.touched.email && formik.errors.email}
            />

            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type={showPassword ? 'text' : 'password'}
              id="password"
              autoComplete="current-password"
              disabled={isLoading || formik.isSubmitting}
              value={formik.values.password}
              onChange={formik.handleChange}
              error={formik.touched.password && Boolean(formik.errors.password)}
              helperText={formik.touched.password && formik.errors.password}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={handleClickShowPassword}
                      edge="end"
                      disabled={isLoading || formik.isSubmitting}
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2, height: 48 }}
              disabled={isLoading || formik.isSubmitting}
            >
              {(isLoading || formik.isSubmitting) ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                'Sign In'
              )}
            </Button>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default Login;
