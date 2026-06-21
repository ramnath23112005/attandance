import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1a237e',
      light: '#534bae',
      dark: '#000051',
    },
    secondary: {
      main: '#00bcd4',
      light: '#62efff',
      dark: '#008ba3',
    },
    success: {
      main: '#2e7d32',
      light: '#4caf50',
    },
    warning: {
      main: '#ed6c02',
    },
    error: {
      main: '#d32f2f',
    },
    background: {
      default: '#f4f6f8',
      paper: '#ffffff',
    },
    text: {
      primary: '#1a1a2e',
      secondary: '#546e7a',
    },
    divider: '#e0e0e0',
  },
  typography: {
    fontFamily: '"Inter", "Segoe UI", "Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 700,
      color: '#1a237e',
      letterSpacing: '-0.02em',
    },
    h5: {
      fontWeight: 600,
      color: '#1a237e',
      letterSpacing: '-0.01em',
    },
    h6: {
      fontWeight: 600,
      color: '#1a237e',
    },
    body1: {
      color: '#37474f',
    },
    body2: {
      color: '#546e7a',
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: '#f4f6f8',
          color: '#1a1a2e',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.06)',
          borderRadius: 12,
          border: '1px solid #e8eaf0',
          transition: 'box-shadow 0.2s ease, transform 0.2s ease',
          '&:hover': {
            boxShadow: '0 10px 25px rgba(0,0,0,0.1), 0 4px 10px rgba(0,0,0,0.06)',
            transform: 'translateY(-2px)',
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          borderRadius: 8,
          padding: '10px 20px',
          fontSize: '0.875rem',
        },
        containedPrimary: {
          backgroundColor: '#1a237e',
          color: '#ffffff',
          boxShadow: '0 2px 8px rgba(26,35,126,0.25)',
          '&:hover': {
            backgroundColor: '#283593',
            boxShadow: '0 4px 12px rgba(26,35,126,0.35)',
          },
        },
        outlinedPrimary: {
          borderColor: '#1a237e',
          color: '#1a237e',
          '&:hover': {
            backgroundColor: '#e8eaf6',
            borderColor: '#1a237e',
          },
        },
        text: {
          color: '#546e7a',
          '&:hover': {
            backgroundColor: '#f5f5f5',
          },
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          padding: '14px 16px',
          borderBottom: '1px solid #e8eaf0',
          color: '#37474f',
          fontSize: '0.875rem',
        },
        head: {
          backgroundColor: '#f8f9fc',
          color: '#1a237e',
          fontWeight: 700,
          fontSize: '0.75rem',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          borderBottom: '2px solid #e8eaf0',
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          transition: 'background-color 0.15s ease',
          '&:hover': {
            backgroundColor: '#f0f4ff',
          },
          '&:last-child td': {
            borderBottom: 'none',
          },
        },
      },
    },
    MuiTableContainer: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          overflow: 'hidden',
          boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
          border: '1px solid #e8eaf0',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 600,
          borderRadius: 6,
          fontSize: '0.75rem',
        },
        filled: {
          '&.MuiChip-colorSuccess': {
            backgroundColor: '#e8f5e9',
            color: '#2e7d32',
          },
          '&.MuiChip-colorError': {
            backgroundColor: '#fbe9e7',
            color: '#d32f2f',
          },
          '&.MuiChip-colorWarning': {
            backgroundColor: '#fff3e0',
            color: '#e65100',
          },
          '&.MuiChip-colorPrimary': {
            backgroundColor: '#e8eaf6',
            color: '#1a237e',
          },
          '&.MuiChip-colorSecondary': {
            backgroundColor: '#e0f7fa',
            color: '#00838f',
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#ffffff',
          color: '#1a237e',
          boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
          borderBottom: '1px solid #e8eaf0',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: '#ffffff',
          borderRight: '1px solid #e8eaf0',
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
          color: '#546e7a',
          borderTop: '1px solid #e8eaf0',
        },
      },
    },
    MuiToggleButton: {
      styleOverrides: {
        root: {
          color: '#546e7a',
          borderColor: '#e0e0e0',
          '&.Mui-selected': {
            backgroundColor: '#e8eaf6',
            color: '#1a237e',
            borderColor: '#1a237e',
          },
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          margin: '2px 8px',
          '&.Mui-selected': {
            backgroundColor: '#e8eaf6',
            color: '#1a237e',
            '&:hover': {
              backgroundColor: '#c5cae9',
            },
          },
        },
      },
    },
    MuiListItemIcon: {
      styleOverrides: {
        root: {
          color: '#546e7a',
          minWidth: 40,
        },
      },
    },
    MuiAvatar: {
      styleOverrides: {
        root: {
          fontWeight: 600,
        },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          backgroundColor: '#1a1a2e',
          borderRadius: 6,
          fontSize: '0.75rem',
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 16,
          boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
        },
      },
    },
    MuiDialogTitle: {
      styleOverrides: {
        root: {
          fontSize: '1.25rem',
          fontWeight: 700,
          color: '#1a237e',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: '#1a237e',
            },
          },
          '& .MuiInputLabel-root.Mui-focused': {
            color: '#1a237e',
          },
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
    MuiCardContent: {
      styleOverrides: {
        root: {
          '&:last-child': {
            paddingBottom: 16,
          },
        },
      },
    },
  },
});

export default theme;
