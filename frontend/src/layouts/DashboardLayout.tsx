import { useState, ReactNode } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  AppBar,
  Box,
  CssBaseline,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  Button,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import DashboardIcon from '@mui/icons-material/Dashboard';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import HowToRegIcon from '@mui/icons-material/HowToReg';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import PeopleIcon from '@mui/icons-material/People';
import BookIcon from '@mui/icons-material/Book';
import LogoutIcon from '@mui/icons-material/Logout';
import { useAuth } from '../context/AuthContext';
import { UserRole, ThemeMode } from '../types';

const DRAWER_WIDTH = 260;

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

export default function DashboardLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, logout, hasRole } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const filteredNavItems = navItems.filter((item) => hasRole(...item.roles));

  const drawer = (
    <Box>
      <Toolbar>
        <Typography variant="h6" fontWeight={700} color="primary">
          Attandance
        </Typography>
      </Toolbar>
      <List>
        {filteredNavItems.map((item) => (
          <ListItem key={item.path} disablePadding>
            <ListItemButton
              selected={location.pathname === item.path}
              onClick={() => {
                navigate(item.path);
                if (isMobile) setMobileOpen(false);
              }}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.label} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        sx={{
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
          ml: { md: `${DRAWER_WIDTH}px` },
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            edge="start"
            onClick={() => setMobileOpen(!mobileOpen)}
            sx={{ mr: 2, display: { md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap sx={{ flexGrow: 1 }}>
            {navItems.find((i) => i.path === location.pathname)?.label || 'Attandance'}
          </Typography>
          <Typography variant="body2" sx={{ mr: 2 }}>
            {user?.name} ({user?.role})
          </Typography>
          <Button color="inherit" startIcon={<LogoutIcon />} onClick={logout}>
            Logout
          </Button>
        </Toolbar>
      </AppBar>

      <Box component="nav" sx={{ width: { md: DRAWER_WIDTH }, flexShrink: { md: 0 } }}>
        {isMobile ? (
          <Drawer
            variant="temporary"
            open={mobileOpen}
            onClose={() => setMobileOpen(false)}
            sx={{ '& .MuiDrawer-paper': { boxSizing: 'border-box', width: DRAWER_WIDTH } }}
          >
            {drawer}
          </Drawer>
        ) : (
          <Drawer
            variant="permanent"
            sx={{ '& .MuiDrawer-paper': { boxSizing: 'border-box', width: DRAWER_WIDTH } }}
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
          p: 3,
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
          minHeight: '100vh',
          bgcolor: 'background.default',
        }}
      >
        <Toolbar />
        <Outlet />
      </Box>
    </Box>
  );
}
