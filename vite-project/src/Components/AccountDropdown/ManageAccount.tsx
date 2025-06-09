import React from 'react';
import { useAuth } from '../auth/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Avatar, Button, Grid, Paper, Typography, Box } from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import EditIcon from '@mui/icons-material/Edit';
import LockIcon from '@mui/icons-material/Lock';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import FavoriteIcon from '@mui/icons-material/Favorite';
import ComputerIcon from '@mui/icons-material/Computer';
import StarIcon from '@mui/icons-material/Star';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import AssignmentIcon from '@mui/icons-material/Assignment';

const menuItems = [
  { icon: <ShoppingBagIcon color="primary" />, label: 'Orders', path: '/orders' },
  { icon: <AssignmentIcon color="primary" />, label: 'Quote', path: '/account/quote' },
  { icon: <EditIcon color="primary" />, label: 'Edit Profile', path: '/account/edit-profile' },
  { icon: <LockIcon color="primary" />, label: 'Change Password', path: '/account/change-password' },
  { icon: <LocationOnIcon color="primary" />, label: 'Addresses', path: '/account/addresses' },
  { icon: <FavoriteIcon color="primary" />, label: 'Wish List', path: '/account/wishlist' },
  { icon: <ComputerIcon color="primary" />, label: 'Saved PC', path: '/account/saved-pc' },
  { icon: <StarIcon color="primary" />, label: 'Star Points', path: '/account/star-points' },
  { icon: <MonetizationOnIcon color="primary" />, label: 'Your Transactions', path: '/account/transactions' },
];

const ManageAccount: React.FC = () => {
  const navigate = useNavigate();
  const { authData } = useAuth();
  const { name, imgUrl, role } = authData;

  return (
    <Box
      sx={{
        minHeight: '100vh',
        width: '100vw',
        bgcolor: '#f5f5f5',
        py: { xs: 1, md: 4 },
        px: { xs: 1, md: 2 },
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'auto',
      }}
    >
      <Paper
        elevation={3}
        sx={{
          width: '100%',
          maxWidth: { xs: '100%', sm: '95%', md: 1000, lg: 1200 },
          mx: 'auto',
          p: { xs: 2, sm: 3, md: 4 },
          borderRadius: { xs: 0, sm: 3 },
          minHeight: { xs: '100vh', sm: 'auto', md: '90vh' },
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Admin Dashboard Button */}
        {role === 'admin' && (
          <Button
            variant="contained"
            color="secondary"
            startIcon={<DashboardIcon />}
            fullWidth
            sx={{
              mb: { xs: 2, md: 3 },
              py: { xs: 1.5, md: 2 },
              fontWeight: 'bold',
              fontSize: { xs: '1rem', md: '1.1rem' },
              letterSpacing: 1,
              bgcolor: 'secondary.main',
              '&:hover': { bgcolor: 'secondary.dark' },
            }}
            onClick={() => navigate('/admin')}
          >
            Admin Dashboard
          </Button>
        )}

        {/* User Info */}
        <Box 
          display="flex" 
          alignItems="center" 
          mb={{ xs: 3, md: 4 }}
          flexDirection={{ xs: 'column', sm: 'row' }}
          textAlign={{ xs: 'center', sm: 'left' }}
        >
          <Avatar
            src={imgUrl || undefined}
            alt={name || 'User'}
            sx={{ 
              width: { xs: 80, md: 64 }, 
              height: { xs: 80, md: 64 }, 
              mr: { xs: 0, sm: 2 }, 
              mb: { xs: 2, sm: 0 },
              bgcolor: 'primary.main', 
              fontSize: { xs: 40, md: 32 } 
            }}
          >
            {!imgUrl && (name ? name[0] : 'U')}
          </Avatar>
          <Box>
            <Typography variant="subtitle2" color="text.secondary">
              Hello,
            </Typography>
            <Typography variant="h5" fontWeight="bold" sx={{ fontSize: { xs: '1.25rem', md: '1.5rem' } }}>
              {name || 'User'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Role: {role || 'user'}
            </Typography>
          </Box>
        </Box>

        {/* Menu Grid */}
        <Grid container spacing={{ xs: 1.5, sm: 2, md: 3 }} sx={{ flex: 1 }}>
          {menuItems.map((item) => (
            <Grid 
              item 
              xs={6} 
              sm={4} 
              md={3} 
              lg={2.4}
              key={item.label}
            >
              <Paper
                elevation={1}
                sx={{
                  p: { xs: 1.5, sm: 2 },
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  minHeight: { xs: 100, sm: 110, md: 120 },
                  height: 'auto',
                  borderRadius: 2,
                  '&:hover': { 
                    boxShadow: 6, 
                    bgcolor: '#f0f0f0',
                    transform: 'translateY(-2px)'
                  },
                }}
                onClick={() => navigate(item.path)}
              >
                <Box sx={{ fontSize: { xs: 28, sm: 32 }, mb: 1 }}>
                  {item.icon}
                </Box>
                <Typography 
                  variant="body2" 
                  fontWeight={500} 
                  align="center"
                  sx={{ 
                    fontSize: { xs: '0.75rem', sm: '0.875rem' },
                    lineHeight: 1.2,
                    px: 0.5
                  }}
                >
                  {item.label}
                </Typography>
              </Paper>
            </Grid>
          ))}
          
          {/* Non-admin users এর জন্য Admin Panel */}
          {role !== 'admin' && (
            <Grid 
              item 
              xs={6} 
              sm={4} 
              md={3} 
              lg={2.4}
            >
              <Paper
                elevation={2}
                sx={{
                  p: { xs: 1.5, sm: 2 },
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  border: '2px dashed #bdbdbd',
                  bgcolor: '#fffde7',
                  color: '#ff9800',
                  minHeight: { xs: 100, sm: 110, md: 120 },
                  borderRadius: 2,
                  transition: 'all 0.3s ease',
                  '&:hover': { 
                    boxShadow: 6, 
                    bgcolor: '#fff8e1',
                    transform: 'translateY(-2px)'
                  },
                }}
                onClick={() => navigate('/admin')}
              >
                <DashboardIcon 
                  color="warning" 
                  sx={{ fontSize: { xs: 28, sm: 32 }, mb: 1 }} 
                />
                <Typography 
                  variant="body2" 
                  fontWeight={700} 
                  align="center"
                  sx={{ 
                    fontSize: { xs: '0.75rem', sm: '0.875rem' },
                    lineHeight: 1.2,
                    px: 0.5
                  }}
                >
                  Admin Panel
                </Typography>
              </Paper>
            </Grid>
          )}
        </Grid>
      </Paper>
    </Box>
  );
};

export default ManageAccount;