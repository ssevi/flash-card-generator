import React, { useEffect, useState } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Button,
  Avatar,
  IconButton,
  useTheme,
  Chip
} from '@mui/material';
import {
  Collections as CollectionsIcon,
  PictureAsPdf as PdfIcon,
  Add as AddIcon,
  ChildCare as ChildCareIcon,
  ChevronRight as ChevronRightIcon,
  Category as CategoryIcon,
  Image as ImageIcon,
  School as SchoolIcon,
  Psychology as PsychologyIcon,
  Timer as TimerIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { getCollections, getCollectionPhotos } from '../services/collection.service';

interface Collection {
  _id: string;
  title: string;
  imageCount?: number;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const popularCategories = [
    { name: 'Birds', count: 5 },
    { name: 'Animals', count: 4 },
    { name: 'Edibles', count: 3 },

  ];
  const ageGroups = [
    { range: '3-4 years', color: '#FFB5B5' },
    { range: '4-5 years', color: '#B5DEFF' },
    { range: '5-6 years', color: '#C1FFB5' },

  ];
  const [stats, setStats] = useState({
    totalCollections: 0,
    totalFlashcards: 0,
    totalDownloads: 0
  });

  useEffect(() => {
    fetchCollections();
  }, []);

  const fetchCollections = async () => {
    try {
      setLoading(true);
      const data = await getCollections();
      if (Array.isArray(data)) {
        const collectionsWithPhotos = await Promise.all(
          data.slice(0, 3).map(async (collection) => {
            try {
              const collectionData = await getCollectionPhotos(collection._id);
              return {
                ...collection,
                imageCount: collectionData?.photos.length || 0,
              };
            } catch (error) {
              console.error(`Error fetching photos for collection ${collection._id}:`, error);
              return {
                ...collection,
                imageCount: 0,
              };
            }
          })
        );
        setCollections(collectionsWithPhotos);
        // Update stats
        setStats({
          totalCollections: data.length,
          totalFlashcards: collectionsWithPhotos.reduce((acc, curr) => acc + curr.imageCount, 0),
          totalDownloads: Math.floor(Math.random() * 100) // Replace with actual download stats
        });
      }
    } catch (err) {
      console.error('Error fetching collections:', err);
    } finally {
      setLoading(false);
    }
  };

  const learningInsights = [
    {
      icon: PsychologyIcon,
      title: 'Visual Learning',
      stat: '90%',
      description: 'of information transmitted to the brain is visual',
      color: '#FF6B6B'  // Coral
    },
    {
      icon: TimerIcon,
      title: 'Quick Recognition',
      stat: '0.25s',
      description: 'time for the brain to process a familiar image',
      color: '#4ECDC4'  // Teal
    },
    {
      icon: SchoolIcon,
      title: 'Memory Retention',
      stat: '55%',
      description: 'higher recall with visual flashcards vs text',
      color: '#45B7D1'  // Sky Blue
    }
  ];

  interface Stats {
    totalCollections: number;
    totalFlashcards: number;
    totalDownloads: number;
  }

  interface LearningInsight {
    icon: React.ElementType;
    title: string;
    stat: string;
    description: string;
    color: string;
  }

  const navigateToCollection = (collectionId: string) => {
    navigate(`/collections/${collectionId}/cards`);
  };

  const navigateToCreateCollection = () => {
    navigate('/collections/create');
  };

  interface HandleGeneratePDF {
    (collectionId: string): void;
  }

  const handleGeneratePDF: HandleGeneratePDF = (collectionId) => {
    // Add your PDF generation logic here
    navigate(`/collections/${collectionId}/pdf`);
  };

  return (
    <Box sx={{ p: 4, minHeight: '100vh', bgcolor: '#FAFAFA' }}>
      <Box sx={{ maxWidth: 'xl', mx: 'auto' }}>
        <Typography 
          variant="h4" 
          sx={{ 
            color: '#2C3E50',
            fontWeight: 600,
            mb: 4
          }}
        >
          Dashboard
        </Typography>
        
        <Grid container spacing={3}>
          {/* Quick Stats */}
          <Grid item xs={12} md={4}>
            <Paper
              elevation={2}
              sx={{
                p: 3,
                borderRadius: 2,
                background: 'linear-gradient(135deg, #FFF 0%, #F8F9FA 100%)',
                transition: 'transform 0.2s',
                '&:hover': {
                  transform: 'translateY(-2px)'
                }
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ bgcolor: '#FF6B6B' }}>
                  <CollectionsIcon />
                </Avatar>
                <Box>
                  <Typography sx={{ color: '#2C3E50' }}>
                    Total Collections
                  </Typography>
                  <Typography variant="h5" sx={{ color: '#2C3E50', fontWeight: 600 }}>
                    {stats.totalCollections}
                  </Typography>

                </Box>
              </Box>
            </Paper>
          </Grid>

          <Grid item xs={12} md={4}>
            <Paper
              elevation={2}
              sx={{
                p: 3,
                borderRadius: 2,
                background: 'linear-gradient(135deg, #FFF 0%, #F8F9FA 100%)',
                transition: 'transform 0.2s',
                '&:hover': {
                  transform: 'translateY(-2px)'
                }
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <Avatar sx={{ bgcolor: '#4ECDC4' }}>
                  <CategoryIcon />
                </Avatar>
                <Box>
                  <Typography sx={{ color: '#2C3E50' }}>
                    Popular Categories
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {popularCategories.map((category, index) => (
                  <Chip
                    key={index}
                    label={`${category.name} (${category.count})`}
                    sx={{
                      bgcolor: '#4ECDC4',
                      color: 'white',
                      '&:hover': { bgcolor: '#45b7af' }
                    }}
                    size="small"
                  />
                ))}
              </Box>
            </Paper>
          </Grid>

          <Grid item xs={12} md={4}>
          <Paper
              elevation={2}
              sx={{
                p: 3,
                borderRadius: 2,
                background: 'linear-gradient(135deg, #FFF 0%, #F8F9FA 100%)',
                transition: 'transform 0.2s',
                '&:hover': { transform: 'translateY(-2px)' }
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <Avatar sx={{ bgcolor: '#45B7D1' }}>
                  <ChildCareIcon />
                </Avatar>
                <Box>
                  <Typography sx={{ color: '#2C3E50' }}>
                    Age Groups
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {ageGroups.map((age, index) => (
                  <Chip
                    key={index}
                    label={age.range}
                    sx={{
                      bgcolor: age.color,
                      color: '#2C3E50',
                      '&:hover': { opacity: 0.9 }
                    }}
                    size="small"
                  />
                ))}
              </Box>
            </Paper>
          </Grid>

          {/* Early Learning Benefits */}
          <Grid item xs={12}>
            <Paper
              elevation={2}
              sx={{
                p: 3,
                borderRadius: 2,
                background: 'linear-gradient(135deg, #FFF 0%, #F8F9FA 100%)',
                mb: 3
              }}
            >
              <Typography 
                variant="h6" 
                sx={{ 
                  color: '#2C3E50',
                  fontWeight: 600,
                  mb: 3
                }}
              >
                Benefits of Visual Learning
              </Typography>
              
              <Grid container spacing={3}>
                {learningInsights.map((insight, index) => (
                  <Grid item xs={12} md={4} key={index}>
                    <Box sx={{ 
                      display: 'flex', 
                      gap: 2,
                      p: 2,
                      bgcolor: '#FFF',
                      borderRadius: 2,
                      height: '100%',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                      transition: 'transform 0.2s',
                      '&:hover': {
                        transform: 'translateY(-2px)'
                      }
                    }}>
                      <Avatar sx={{ bgcolor: insight.color }}>
                        <insight.icon />
                      </Avatar>
                      <Box>
                        <Typography sx={{ color: '#2C3E50', fontWeight: 600 }}>
                          {insight.title}
                        </Typography>
                        <Typography variant="h6" sx={{ color: insight.color, fontWeight: 600, my: 1 }}>
                          {insight.stat}
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#666' }}>
                          {insight.description}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </Paper>
          </Grid>

          {/* Recent Collections */}
          <Grid item xs={12} md={8}>
            <Paper
              elevation={2}
              sx={{
                p: 3,
                borderRadius: 2,
                background: 'linear-gradient(135deg, #FFF 0%, #F8F9FA 100%)'
              }}
            >
              <Typography 
                variant="h6" 
                sx={{ 
                  color: '#2C3E50',
                  fontWeight: 600,
                  mb: 3,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                Recent Collections
                <Button
                  startIcon={<AddIcon />}
                  onClick={navigateToCreateCollection}
                  sx={{
                    color: '#FF6B6B',
                    '&:hover': {
                      bgcolor: 'rgba(255,107,107,0.1)'
                    }
                  }}
                >
                  New Collection
                </Button>
              </Typography>

              {collections.map((collection) => (
                <Box
                  key={collection._id}
                  onClick={() => navigateToCollection(collection._id)}
                  sx={{
                    p: 2,
                    mb: 2,
                    bgcolor: '#FFF',
                    borderRadius: 2,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                    boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                    transition: 'transform 0.2s',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      cursor: 'pointer'
                    }
                  }}
                >
                  <Avatar sx={{ bgcolor: '#FF6B6B' }}>
                    <CollectionsIcon />
                  </Avatar>
                  <Box sx={{ flex: 1 }}>
                    <Typography sx={{ color: '#2C3E50', fontWeight: 600 }}>
                      {collection.title}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#666' }}>
                      {collection.imageCount} images
                    </Typography>
                  </Box>
                  <IconButton 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleGeneratePDF(collection._id);
                    }}
                    sx={{ color: '#4ECDC4' }}
                  >
                    <PdfIcon />
                  </IconButton>
                  <ChevronRightIcon sx={{ color: '#666' }} />
                </Box>
              ))}
            </Paper>
          </Grid>

          {/* Quick Actions */}
          <Grid item xs={12} md={4}>
            <Paper
              elevation={2}
              sx={{
                p: 3,
                borderRadius: 2,
                background: 'linear-gradient(135deg, #FFF 0%, #F8F9FA 100%)'
              }}
            >
              <Typography 
                variant="h6" 
                sx={{ 
                  color: '#2C3E50',
                  fontWeight: 600,
                  mb: 3
                }}
              >
                Quick Actions
              </Typography>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={navigateToCreateCollection}
                  sx={{
                    bgcolor: '#FF6B6B',
                    '&:hover': {
                      bgcolor: '#ff5252'
                    },
                    boxShadow: 'none'
                  }}
                >
                  Create New Collection
                </Button>
                
                <Button
                  variant="outlined"
                  startIcon={<PdfIcon />}
                  onClick={() => navigate('/collections')}
                  sx={{
                    color: '#4ECDC4',
                    borderColor: '#4ECDC4',
                    '&:hover': {
                      borderColor: '#45b7af',
                      bgcolor: 'rgba(78,205,196,0.1)'
                    }
                  }}
                >
                  View All Collections
                </Button>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default Dashboard;