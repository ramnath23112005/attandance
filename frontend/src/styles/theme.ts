import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#ff69b4',
      light: '#ffb6c1',
      dark: '#ff1493',
    },
    secondary: {
      main: '#c71585',
      light: '#d8bfd8',
      dark: '#8b008b',
    },
    success: {
      main: '#4caf50',
    },
    warning: {
      main: '#ff9800',
    },
    error: {
      main: '#f44336',
    },
    background: {
      default: '#fff0f5',
      paper: '#ffffff',
    },
    text: {
      primary: '#4b004b',
      secondary: '#6b2d6b',
    },
  },
  typography: {
    fontFamily: '"Segoe UI", "Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 700,
      color: '#b03060',
    },
    h5: {
      fontWeight: 600,
      color: '#c71585',
    },
    h6: {
      fontWeight: 600,
      color: '#c71585',
    },
  },
  shape: {
    borderRadius: 10,
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: '#fff0f5',
          color: '#4b004b',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 0 10px rgba(255,182,193,0.3)',
          borderRadius: 10,
          border: '1px solid #f8c8dc',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          borderRadius: 25,
          padding: '12px 24px',
        },
        containedPrimary: {
          backgroundColor: '#ff69b4',
          color: 'white',
          '&:hover': {
            backgroundColor: '#ff1493',
          },
        },
        outlinedPrimary: {
          borderColor: '#ff69b4',
          color: '#ff69b4',
          '&:hover': {
            backgroundColor: '#ffe4e1',
            borderColor: '#ff1493',
          },
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          padding: 12,
          textAlign: 'center',
          border: '1px solid #f8c8dc',
        },
        head: {
          backgroundColor: '#ffe4e1',
          color: '#b03060',
          fontWeight: 'bold',
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          '&:hover': {
            backgroundColor: '#ffeef5',
          },
        },
      },
    },
    MuiTableContainer: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          overflow: 'hidden',
          boxShadow: '0 0 10px rgba(255,182,193,0.3)',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 600,
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          background: 'linear-gradient(135deg, #ffc0cb, #ffe4e1)',
          borderBottom: '4px solid #ff69b4',
          boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          background: '#fff0f5',
          borderRight: '1px solid #f8c8dc',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
      },
    },
    MuiTablePagination: {
      styleOverrides: {
        root: {
          color: '#4b004b',
        },
      },
    },
    MuiToggleButton: {
      styleOverrides: {
        root: {
          color: '#ff69b4',
          borderColor: '#f8c8dc',
          '&.Mui-selected': {
            backgroundColor: '#ffe4e1',
            color: '#c71585',
          },
        },
      },
    },
  },
});

export default theme;
