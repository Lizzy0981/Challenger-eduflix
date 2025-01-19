import { createTheme } from '@mui/material/styles'
import {
  colorPrimary,
  colorSecondary,
  colorBlack,
  colorWhite,
  colorError,
  colorWarning,
  colorSuccess,
  fontFamily,
  borderRadius
} from './components/UI/variablesStyle'

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: colorPrimary,
      contrastText: colorWhite
    },
    secondary: {
      main: colorSecondary,
      contrastText: colorWhite
    },
    error: {
      main: colorError
    },
    warning: {
      main: colorWarning
    },
    success: {
      main: colorSuccess
    },
    background: {
      default: colorBlack,
      paper: 'rgba(255, 255, 255, 0.05)'
    },
    text: {
      primary: colorWhite,
      secondary: 'rgba(255, 255, 255, 0.7)'
    }
  },
  typography: {
    fontFamily,
    h1: {
      fontSize: '2.5rem',
      fontWeight: 700,
      lineHeight: 1.2
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 700,
      lineHeight: 1.3
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 600,
      lineHeight: 1.3
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 600,
      lineHeight: 1.4
    },
    h5: {
      fontSize: '1.25rem',
      fontWeight: 500,
      lineHeight: 1.4
    },
    h6: {
      fontSize: '1rem',
      fontWeight: 500,
      lineHeight: 1.5
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.5
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.6
    }
  },
  shape: {
    borderRadius: parseInt(borderRadius)
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 500,
          padding: '8px 16px'
        }
      }
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: 'rgba(255, 255, 255, 0.05)',
          backdropFilter: 'blur(10px)'
        }
      }
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none'
        }
      }
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            '& fieldset': {
              borderColor: 'rgba(255, 255, 255, 0.2)'
            },
            '&:hover fieldset': {
              borderColor: 'rgba(255, 255, 255, 0.3)'
            }
          }
        }
      }
    }
  }
})

export default theme