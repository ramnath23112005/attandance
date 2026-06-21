import { useState, ReactNode } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  AppBar, Box, CssBaseline, Drawer, IconButton, List, ListItem, ListItemButton,
  ListItemIcon, ListItemText, Toolbar, Typography, Button, useMediaQuery, useTheme,
  Avatar, Divider, Stack,
} from '@mui/material';
import MenuOpenIcon from '@mui/icons-material/MenuOpen';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import DashboardIcon from '@mui/icons-material/Dashboard';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import HowToRegIcon from '@mui/icons-material/HowToReg';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import PeopleIcon from '@mui/icons-material/People';
import BookIcon from '@mui/icons-material/Book';
import LogoutIcon from '@mui/icons-material/Logout';
import SchoolIcon from '@mui/icons-material/School';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';

const DRAWER_WIDTH = 270;
const DRAWER_COLLAPSED = 72;

interface NavItem {
  label: string;
  path: string;
  icon: ReactNode;
  roles: UserRole[];
}

const navItems: NavItem[] = [
  { label: 'Dashboard', path: '/dashboard', icon: <DashboardIcon />, roles: [UserRole.ADMIN, UserRole.FACULTY, UserRole.STUDENT] },
  { label: 'Timetable', path: '/timetable', icon: <CalendarMonthIcon />, roles: [UserRole.ADMIN, UserRole.FACULTY, UserRole.STUDENT] },
  { label: 'Attendance', path: '/attendance', icon: <HowToRegIcon />, roles: [UserRole.ADMIN, UserRole.FACULTY, UserRole.STUDENT] },
  { label: 'Analytics', path: '/analytics', icon: <AnalyticsIcon />, roles: [UserRole.ADMIN, UserRole.STUDENT] },
  { label: 'Users', path: '/users', icon: <PeopleIcon />, roles: [UserRole.ADMIN] },
  { label: 'Subjects', path: '/subjects', icon: <BookIcon />, roles: [UserRole.ADMIN] },
];

const ROLE_AVATAR_COLORS: Record<string, string> = {
  admin: '#d32f2f',
  faculty: '#1565c0',
  student: '#2e7d32',
};

export default function DashboardLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [sidebarHover, setSidebarHover] = useState(false);
  const { user, logout, hasRole } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const filteredNavItems = navItems.filter((item) => hasRole(...item.roles));

  const drawer = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Box sx={{ px: 2.5, py: 2.5, display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Avatar sx={{ bgcolor: '#00bcd4', width: 36, height: 36, borderRadius: 1.5 }}>
          <SchoolIcon sx={{ fontSize: 20 }} />
        </Avatar>
        <Box>
          <Typography variant="h6" fontWeight={800} color="#1a237e" lineHeight={1.2}>
            Attandance
          </Typography>
          <Typography variant="caption" color="text.secondary" fontWeight={500}>
            Attendance System
          </Typography>
        </Box>
      </Box>

      <Divider sx={{ mx: 2, mb: 1 }} />

      <List sx={{ flex: 1, px: 1 }}>
        {filteredNavItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <ListItem key={item.path} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                selected={isActive}
                onClick={() => {
                  navigate(item.path);
                  if (isMobile) setMobileOpen(false);
                }}
                sx={{
                  borderRadius: 2,
                  py: 1.2,
                  '&.Mui-selected': {
                    bgcolor: '#e8eaf6',
                    color: '#1a237e',
                    '& .MuiListItemIcon-root': { color: '#1a237e' },
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      left: 0,
                      top: '25%',
                      height: '50%',
                      width: 3,
                      bgcolor: '#1a237e',
                      borderRadius: '0 4px 4px 0',
                    },
                  },
                }}
              >
                <ListItemIcon sx={{ minWidth: 42 }}>{item.icon}</ListItemIcon>
                <ListItemText
                  primary={item.label}
                  primaryTypographyProps={{ fontWeight: isActive ? 700 : 500, fontSize: '0.9rem' }}
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>

      <Divider sx={{ mx: 2 }} />

      <Box sx={{ px: 2.5, py: 2 }}>
        <Box display="flex" alignItems="center" gap={1.5}>
          <Avatar sx={{ width: 38, height: 38, bgcolor: ROLE_AVATAR_COLORS[user?.role || 'student'] || '#757575', fontSize: 15, fontWeight: 700 }}>
            {user?.name?.charAt(0).toUpperCase()}
          </Avatar>
          <Box flex={1} minWidth={0}>
            <Typography variant="body2" fontWeight={700} noWrap>{user?.name}</Typography>
            <Typography variant="caption" color="text.secondary" noWrap sx={{ textTransform: 'capitalize' }}>
              {user?.role}
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#f4f6f8' }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
          ml: { md: `${DRAWER_WIDTH}px` },
          bgcolor: 'rgba(255,255,255,0.8)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid #e8eaf0',
          color: '#1a1a2e',
        }}
      >
        <Toolbar>
          <IconButton
            edge="start"
            onClick={() => setMobileOpen(!mobileOpen)}
            sx={{ mr: 2, display: { md: 'none' } }}
          >
            <MenuOpenIcon />
          </IconButton>
          <Typography variant="h6" fontWeight={700} noWrap sx={{ flexGrow: 1 }}>
            {navItems.find((i) => i.path === location.pathname)?.label || ''}
          </Typography>
          <Box display="flex" alignItems="center" gap={2}>
            <Box display="flex" alignItems="center" gap={1} sx={{ display: { xs: 'none', sm: 'flex' } }}>
              <Avatar
                sx={{ width: 32, height: 32, bgcolor: ROLE_AVATAR_COLORS[user?.role || 'student'], fontSize: 13, fontWeight: 700 }}
              >
                {user?.name?.charAt(0).toUpperCase()}
              </Avatar>
              <Box>
                <Typography variant="body2" fontWeight={600} lineHeight={1.2}>{user?.name}</Typography>
                <Typography variant="caption" color="text.secondary" lineHeight={1.2} sx={{ textTransform: 'capitalize' }}>
                  {user?.role}
                </Typography>
              </Box>
            </Box>
            <Button
              variant="outlined"
              size="small"
              startIcon={<LogoutIcon />}
              onClick={logout}
              sx={{ borderColor: '#e0e0e0', color: '#546e7a', '&:hover': { borderColor: '#d32f2f', color: '#d32f2f', bgcolor: '#fbe9e7' } }}
            >
              Logout
            </Button>
          </Box>
        </Toolbar>
      </AppBar>

      <Box component="nav" sx={{ width: { md: DRAWER_WIDTH }, flexShrink: { md: 0 } }}>
        {isMobile ? (
          <Drawer
            variant="temporary"
            open={mobileOpen}
            onClose={() => setMobileOpen(false)}
            ModalProps={{ keepMounted: true }}
            sx={{ '& .MuiDrawer-paper': { boxSizing: 'border-box', width: DRAWER_WIDTH, border: 'none', boxShadow: '4px 0 20px rgba(0,0,0,0.08)' } }}
          >
            {drawer}
          </Drawer>
        ) : (
          <Drawer
            variant="permanent"
            sx={{
              '& .MuiDrawer-paper': {
                boxSizing: 'border-box',
                width: DRAWER_WIDTH,
                borderRight: '1px solid #e8eaf0',
                bgcolor: '#ffffff',
              },
            }}
            open
          >
            {drawer}
          </Drawer>
        )}
      </Box>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 2, md: 4 },
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
          minHeight: '100vh',
        }}
      >
        <Toolbar />
        <Box sx={{ animation: 'fadeInUp 0.3s ease forwards' }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}
