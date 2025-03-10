import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Divider,
  IconButton,
  useTheme,
  Menu,
  MenuItem,
  Tooltip,
  Fade,
} from '@mui/material';
import {
  WidgetsOutlined as MenuIcon,
  DashboardOutlined as DashboardIcon,
  CollectionsBookmarkOutlined as CollectionsIcon,
  AdminPanelSettingsOutlined as TeachersIcon,
  Person3Outlined as ParentsIcon,
  LogoutOutlined as LogoutIcon,
  Palette as PaletteIcon,
  Check as CheckIcon,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme as useCustomTheme, ThemeOption, colorThemes } from '../../contexts/ThemeContext';
import logo from '../../assets/images/logo_nish.png';

const drawerWidth = 240;

interface LayoutProps {
  children: React.ReactNode;
}

interface MenuItem {
  text: string;
  icon: JSX.Element;
  path: string;
  roles: string[];
}

const Layout = ({ children }: LayoutProps) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();
  const { currentTheme, setTheme, colors } = useCustomTheme();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userRole, setUserRole] = useState<string>('');
  const [themeMenuAnchor, setThemeMenuAnchor] = useState<null | HTMLElement>(null);
  const [showThemeFeedback, setShowThemeFeedback] = useState(false);

  useEffect(() => {
    const role = localStorage.getItem('role');
    setUserRole(role || '');
  }, []);

  const allMenuItems: MenuItem[] = [
    { 
      text: 'Dashboard', 
      icon: <DashboardIcon />, 
      path: '/',
      roles: ['superadmin','admin', 'teacher', 'student'] 
    },
    { 
      text: 'Collections', 
      icon: <CollectionsIcon />, 
      path: '/collections',
      roles: ['superadmin','admin', 'teacher', 'student'] 
    },
    { 
      text: 'Teachers', 
      icon: <TeachersIcon />, 
      path: '/teachers',
      roles: ['superadmin','admin'] 
    },
    { 
      text: 'Parents', 
      icon: <ParentsIcon />, 
      path: '/parents',
      roles: ['superadmin','admin', 'teacher'] 
    },
  ];

  const filteredMenuItems = allMenuItems.filter(item => 
    item.roles.includes(userRole.toLowerCase())
  );

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const handleThemeMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setThemeMenuAnchor(event.currentTarget);
  };

  const handleThemeMenuClose = () => {
    setThemeMenuAnchor(null);
  };

  const handleThemeChange = (theme: ThemeOption) => {
    setTheme(theme);
    setShowThemeFeedback(true);
    setTimeout(() => setShowThemeFeedback(false), 1500);
    handleThemeMenuClose();
  };

  const drawer = (
    <div>
      <Toolbar>
        <Box display="flex" flexDirection="column" alignItems="center" width="100%" padding={1}>
          <img src={logo} alt="logo of nish" width={100} />
        </Box>
      </Toolbar>
      <Divider />
      <List>
        {filteredMenuItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              selected={location.pathname === item.path}
              onClick={() => navigate(item.path)}
              sx={{
                '&.Mui-selected': {
                  bgcolor: `${colors.primary}15`
                },
                '&:hover': {
                  bgcolor: `${colors.primary}10`
                }
              }}
            >
              <ListItemIcon sx={{ color: location.pathname === item.path ? colors.primary : '#3d59ab' }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText 
                primary={item.text}
                sx={{
                  '& .MuiTypography-root': {
                    color: location.pathname === item.path ? colors.primary : colors.text
                  }
                }}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      <Divider />
      <List>
        <ListItem disablePadding>
          <ListItemButton 
            onClick={handleLogout}
            sx={{
              '&:hover': {
                bgcolor: '#ffebee'
              }
            }}
          >
            <ListItemIcon>
              <LogoutIcon sx={{ color: '#cd3700' }}/>
            </ListItemIcon>
            <ListItemText primary="Logout" />
          </ListItemButton>
        </ListItem>
      </List>
    </div>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar
        elevation={0}
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
          bgcolor: colors.primary,
          transition: 'background-color 0.3s ease'
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            {filteredMenuItems.find(item => item.path === location.pathname)?.text || 'Flash Card App'}
          </Typography>

          {/* Theme Selector */}
          <Box sx={{ position: 'relative' }}>
            <Tooltip title="Change theme">
              <IconButton onClick={handleThemeMenuOpen} sx={{ color: '#FFF' }}>
                <PaletteIcon />
              </IconButton>
            </Tooltip>
            
            <Fade in={showThemeFeedback}>
              <Box
                sx={{
                  position: 'absolute',
                  top: '100%',
                  right: 0,
                  mt: 1,
                  p: 1,
                  bgcolor: 'rgba(255, 255, 255, 0.9)',
                  borderRadius: 1,
                  boxShadow: 2,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.5,
                  zIndex: theme.zIndex.drawer + 2,
                }}
              >
                <CheckIcon sx={{ color: colors.primary, fontSize: '1rem' }} />
                <Typography variant="caption" sx={{ color: colors.text }}>
                  Theme updated
                </Typography>
              </Box>
            </Fade>

            <Menu
              anchorEl={themeMenuAnchor}
              open={Boolean(themeMenuAnchor)}
              onClose={handleThemeMenuClose}
              PaperProps={{
                elevation: 2,
                sx: {
                  borderRadius: 2,
                  mt: 1.5,
                  minWidth: 180
                }
              }}
            >
              {Object.entries(colorThemes).map(([themeName, themeColors]) => (
                <MenuItem
                  key={themeName}
                  onClick={() => handleThemeChange(themeName as ThemeOption)}
                  selected={currentTheme === themeName}
                  sx={{
                    gap: 1,
                    '&:hover': {
                      bgcolor: `${themeColors.lightBg}40`
                    }
                  }}
                >
                  <Box
                    sx={{
                      width: 20,
                      height: 20,
                      borderRadius: '50%',
                      bgcolor: themeColors.primary,
                      border: '2px solid',
                      borderColor: currentTheme === themeName ? themeColors.primary : 'transparent'
                    }}
                  />
                  <Typography sx={{ 
                    textTransform: 'capitalize',
                    fontWeight: currentTheme === themeName ? 600 : 400
                  }}>
                    {themeName}
                  </Typography>
                  {currentTheme === themeName && (
                    <CheckIcon 
                      sx={{ 
                        ml: 'auto', 
                        fontSize: '1.2rem', 
                        color: themeColors.primary 
                      }} 
                    />
                  )}
                </MenuItem>
              ))}
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>

      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
              bgcolor: colors.background,
              transition: 'background-color 0.3s ease'
            },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
              bgcolor: colors.background,
              transition: 'background-color 0.3s ease'
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          bgcolor: colors.background,
          transition: 'background-color 0.3s ease'
        }}
      >
        <Toolbar />
        {children}
      </Box>
    </Box>
  );
};

export default Layout;