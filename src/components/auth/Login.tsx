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
  Checkbox,
  FormControlLabel,
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

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const formik = useFormik({
    initialValues: {
      email: '',
      password: '',
      remember: false,
    },
    validationSchema: validationSchema,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        setError(null);
        await login(values);
      } catch (err) {
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

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: '#f5f5f5',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Decorative curved shapes */}
      <Box
        sx={{
          position: 'absolute',
          top: -100,
          left: -100,
          width: '400px',
          height: '400px',
          borderRadius: '50%',
          background: 'linear-gradient(45deg, #6b46c1 30%, #805ad5 90%)',
          opacity: 0.1,
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          bottom: -100,
          right: -100,
          width: '500px',
          height: '500px',
          borderRadius: '50%',
          background: 'linear-gradient(45deg, #805ad5 30%, #6b46c1 90%)',
          opacity: 0.1,
        }}
      />

      <Container maxWidth="lg">
        <Paper
          elevation={3}
          sx={{
            display: 'flex',
            borderRadius: 4,
            overflow: 'hidden',
            bgcolor: '#553C9A',
            color: 'white',
            position: 'relative',
          }}
        >
          {/* Left section */}
          <Box
            sx={{
              width: '50%',
              p: 6,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
            }}
          >
            <Box
              component="img"
              src={logo_nish}
              alt="Logo"
              sx={{
                width: 100,
                height: 'auto',
                mb: 4,
                filter: 'brightness(0) invert(1)',
              }}
            />
            <Typography variant="h4" gutterBottom sx={{ fontWeight: 600 }}>
              You will be testing one of
            </Typography>
            <Typography variant="h4" gutterBottom sx={{ fontWeight: 600 }}>
              Nish's core applications:
            </Typography>
            <Typography variant="h4" sx={{ color: '#9F7AEA', fontWeight: 600, mb: 4 }}>
              Flash Card Generator™
            </Typography>

            <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
              <Button
                variant="outlined"
                sx={{
                  color: 'white',
                  borderColor: 'rgba(255,255,255,0.3)',
                  '&:hover': {
                    borderColor: 'white',
                    bgcolor: 'rgba(255,255,255,0.1)',
                  },
                }}
              >
                What to Expect?
              </Button>
              <Button
                variant="outlined"
                sx={{
                  color: 'white',
                  borderColor: 'rgba(255,255,255,0.3)',
                  '&:hover': {
                    borderColor: 'white',
                    bgcolor: 'rgba(255,255,255,0.1)',
                  },
                }}
              >
                Other Applications
              </Button>
            </Box>
          </Box>

          {/* Right section - Login form */}
          <Box
            sx={{
              width: '50%',
              p: 6,
              bgcolor: '#4C3187',
              borderRadius: '30px 0 0 30px',
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
            }}
          >
            <Typography variant="h5" gutterBottom sx={{ color: 'white', mb: 4 }}>
              Log in to Nish™
            </Typography>

            {(error || authError) && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error || authError}
              </Alert>
            )}

            <Box
              component="form"
              onSubmit={formik.handleSubmit}
              noValidate
            >
              <Typography sx={{ color: 'white', mb: 1 }}>Your Email</Typography>
              <TextField
                fullWidth
                id="email"
                name="email"
                autoComplete="email"
                value={formik.values.email}
                onChange={formik.handleChange}
                error={formik.touched.email && Boolean(formik.errors.email)}
                helperText={formik.touched.email && formik.errors.email}
                sx={{
                  mb: 3,
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: 'rgba(255,255,255,0.1)',
                    '& fieldset': {
                      borderColor: 'rgba(255,255,255,0.3)',
                    },
                    '&:hover fieldset': {
                      borderColor: 'rgba(255,255,255,0.5)',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#9F7AEA',
                    },
                  },
                  '& .MuiInputBase-input': {
                    color: 'white',
                  },
                  '& .MuiInputLabel-root': {
                    color: 'rgba(255,255,255,0.7)',
                  },
                }}
              />

              <Typography sx={{ color: 'white', mb: 1 }}>Your Password</Typography>
              <TextField
                fullWidth
                name="password"
                type={showPassword ? 'text' : 'password'}
                id="password"
                autoComplete="current-password"
                value={formik.values.password}
                onChange={formik.handleChange}
                error={formik.touched.password && Boolean(formik.errors.password)}
                helperText={formik.touched.password && formik.errors.password}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                        sx={{ color: 'rgba(255,255,255,0.7)' }}
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{
                  mb: 2,
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: 'rgba(255,255,255,0.1)',
                    '& fieldset': {
                      borderColor: 'rgba(255,255,255,0.3)',
                    },
                    '&:hover fieldset': {
                      borderColor: 'rgba(255,255,255,0.5)',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#9F7AEA',
                    },
                  },
                  '& .MuiInputBase-input': {
                    color: 'white',
                  },
                }}
              />

              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3, alignItems: 'center' }}>
                <FormControlLabel
                  control={
                    <Checkbox
                      sx={{
                        color: 'rgba(255,255,255,0.7)',
                        '&.Mui-checked': {
                          color: '#9F7AEA',
                        },
                      }}
                    />
                  }
                  label="Remember me"
                  sx={{ color: 'rgba(255,255,255,0.7)' }}
                />
                <Button
                  sx={{
                    color: '#9F7AEA',
                    '&:hover': {
                      bgcolor: 'rgba(159,122,234,0.1)',
                    },
                  }}
                >
                  Forgot Password?
                </Button>
              </Box>

              <Button
                fullWidth
                type="submit"
                variant="contained"
                disabled={isLoading || formik.isSubmitting}
                sx={{
                  height: 48,
                  bgcolor: '#9F7AEA',
                  '&:hover': {
                    bgcolor: '#805AD5',
                  },
                  mb: 2,
                }}
              >
                {(isLoading || formik.isSubmitting) ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  'Log in'
                )}
              </Button>

              <Box sx={{ textAlign: 'center' }}>
                <Typography sx={{ color: 'rgba(255,255,255,0.7)' }}>
                  Don't have an account?{' '}
                  <Button
                    sx={{
                      color: '#9F7AEA',
                      '&:hover': {
                        bgcolor: 'rgba(159,122,234,0.1)',
                      },
                    }}
                  >
                    Sign Up
                  </Button>
                </Typography>
              </Box>
            </Box>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default Login;