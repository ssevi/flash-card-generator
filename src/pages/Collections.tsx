// src/pages/Collections.tsx
import React from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Button,
  Card,
  CardContent,
  CardActions,
  IconButton,
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';

const Collections = () => {
  // Mock data - replace with actual data from your backend
  const collections = [
    { id: 1, title: 'Mathematics', cardCount: 15 },
    { id: 2, title: 'Science', cardCount: 20 },
    { id: 3, title: 'History', cardCount: 10 },
  ];

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Collections</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => {/* Handle create */}}
        >
          Create Collection
        </Button>
      </Box>

      <Grid container spacing={3}>
        {collections.map((collection) => (
          <Grid item xs={12} sm={6} md={4} key={collection.id}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {collection.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {collection.cardCount} cards
                </Typography>
              </CardContent>
              <CardActions>
                <Button size="small">View Cards</Button>
                <Box sx={{ flexGrow: 1 }} />
                <IconButton size="small">
                  <EditIcon />
                </IconButton>
                <IconButton size="small">
                  <DeleteIcon />
                </IconButton>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default Collections;