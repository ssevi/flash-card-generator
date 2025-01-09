// src/pages/Dashboard.tsx
import React from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  useTheme,
  Button,
} from '@mui/material';

const Dashboard = () => {
  const theme = useTheme();

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6} lg={4}>
          <Paper
            sx={{
              p: 3,
              display: 'flex',
              flexDirection: 'column',
              height: 240,
            }}
          >
            <Typography variant="h6" gutterBottom>
              Recent Collections
            </Typography>
            {/* Add content here */}
          </Paper>
        </Grid>
        <Grid item xs={12} md={6} lg={4}>
          <Paper
            sx={{
              p: 3,
              display: 'flex',
              flexDirection: 'column',
              height: 240,
            }}
          >
            <Typography variant="h6" gutterBottom>
              Statistics
            </Typography>
            {/* Add content here */}
          </Paper>
        </Grid>
        <Grid item xs={12} md={6} lg={4}>
          <Paper
            sx={{
              p: 3,
              display: 'flex',
              flexDirection: 'column',
              height: 240,
            }}
          >
            <Typography variant="h6" gutterBottom>
              Quick Actions
            </Typography>
            <Button variant="outlined">Create Collections</Button>
            </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;