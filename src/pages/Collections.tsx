// src/pages/Collections.tsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Grid,
  Typography,
  Button,
  Card,
  CardContent,
  CardActions,
  IconButton,
  CircularProgress,
  Alert,
} from '@mui/material';
import { Add as AddIcon, EditOutlined as EditIcon, DeleteOutlineOutlined as DeleteIcon } from '@mui/icons-material';
import { getCollections, Collection, getCollectionPhotos } from '../services/collection.service';

const Collections = () => {
  const navigate = useNavigate();
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCollections();
  }, []);

  const fetchCollections = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getCollections();
      console.log('Fetched collections:', data);

      // Ensure data is an array before setting it
      if (Array.isArray(data)) {
        // Fetch the photo count for each collection
        const collectionsWithPhotoCount = await Promise.all(
          data.map(async (collection) => {
            const photoCount = await getCollectionPhotos(collection._id);
            return { ...collection, cardCount: photoCount.length };
          })
        );
        setCollections(collectionsWithPhotoCount);
      } else {
        console.error('Invalid data format:', data);
        setError('Invalid data format received from server');
      }
    } catch (err) {
      console.error('Error fetching collections:', err);
      setError('Failed to load collections');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  const renderCollections = () => {
    if (!Array.isArray(collections)) {
      console.error('Collections is not an array:', collections);
      return (
        <Grid item xs={12}>
          <Alert severity="error">
            Error loading collections. Please try again.
          </Alert>
        </Grid>
      );
    }

    if (collections.length === 0) {
      return (
        <Grid item xs={12}>
          <Box textAlign="center" py={4}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No collections found
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => navigate('/collections/create')}
              sx={{ mt: 2 }}
            >
              Create your first collection
            </Button>
          </Box>
        </Grid>
      );
    }

    return collections.map((collection) => (
      <Grid item xs={12} sm={6} md={4} key={collection._id}>
        <Card elevation={0} sx={{ border: '1px solid #e4e4e7' }}>
          <CardContent>
            <Typography sx={{ color: '#09090b', fontSize: '16px', fontWeight: 'bold' }} gutterBottom>
              {collection.title}
            </Typography>
            <Typography variant="body2" color="text.secondary" >
              {collection.cardCount} cards
            </Typography>
            <Typography variant="body2" color="text.secondary" noWrap>
              {collection.description}
            </Typography>
          </CardContent>
          <CardActions>
            <Button
              size="small"
              onClick={() => navigate(`/collections/${collection._id}/cards`)}
              sx={{ fontWeight: 'bold', color: '#263784' }}
            >
              View Cards
            </Button>
            <Box sx={{ flexGrow: 1 }} />
            <IconButton
              size="small"
              onClick={() => navigate(`/collections/${collection._id}/edit`)}
            >
              <EditIcon sx={{color:'#03A89E'}}/>
            </IconButton>
            <IconButton size="small">
              <DeleteIcon  sx={{color:'#CD3700'}}/>
            </IconButton>
          </CardActions>
        </Card>
      </Grid>
    ));
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>Collections</Typography>
        <Button
          disableElevation
          variant="outlined"
          size="small"
          sx={{borderRadius:'20px'}}
          startIcon={<AddIcon />}
          onClick={() => navigate('/collections/create')}
        >
          Create Collection
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
          <Button color="inherit" size="small" onClick={fetchCollections} sx={{ ml: 2 }}>
            Retry
          </Button>
        </Alert>
      )}

      <Grid container spacing={3}>
        {renderCollections()}
      </Grid>
    </Box>
  );
};

export default Collections;