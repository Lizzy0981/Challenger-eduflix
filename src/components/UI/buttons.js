// src/components/UI/buttons.js
import { Button } from '@mui/material'
import { styled } from '@mui/material/styles'
import { 
  colorPrimary, 
  colorWhite, 
  colorSuccess, 
  colorError,
  colorWarning 
} from './variablesStyle'

// Botón Base
export const BaseButton = styled(Button)(({ theme }) => ({
  borderRadius: '8px',
  padding: '8px 24px',
  textTransform: 'none',
  fontSize: '0.9rem',
  fontWeight: 500,
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
  },
  '&:active': {
    transform: 'translateY(0)'
  },
  '&.Mui-disabled': {
    opacity: 0.6,
    transform: 'none'
  }
}))

// Botón Primario
export const PrimaryButton = styled(BaseButton)(({ theme }) => ({
  backgroundColor: colorPrimary,
  color: colorWhite,
  '&:hover': {
    backgroundColor: colorPrimary,
    boxShadow: `0 4px 12px ${colorPrimary}40`
  }
}))

// Botón Secundario
export const SecondaryButton = styled(BaseButton)(({ theme }) => ({
  backgroundColor: 'transparent',
  color: colorWhite,
  border: `2px solid ${colorWhite}`,
  '&:hover': {
    backgroundColor: colorWhite,
    color: colorPrimary
  }
}))

// Botón de Éxito
export const SuccessButton = styled(BaseButton)(({ theme }) => ({
  backgroundColor: colorSuccess,
  color: colorWhite,
  '&:hover': {
    backgroundColor: colorSuccess,
    boxShadow: `0 4px 12px ${colorSuccess}40`
  }
}))

// Botón de Error
export const ErrorButton = styled(BaseButton)(({ theme }) => ({
  backgroundColor: colorError,
  color: colorWhite,
  '&:hover': {
    backgroundColor: colorError,
    boxShadow: `0 4px 12px ${colorError}40`
  }
}))

// Botón de Advertencia
export const WarningButton = styled(BaseButton)(({ theme }) => ({
  backgroundColor: colorWarning,
  color: colorWhite,
  '&:hover': {
    backgroundColor: colorWarning,
    boxShadow: `0 4px 12px ${colorWarning}40`
  }
}))

// Botón de Texto
export const TextButton = styled(BaseButton)(({ theme }) => ({
  backgroundColor: 'transparent',
  color: colorPrimary,
  padding: '6px 12px',
  '&:hover': {
    backgroundColor: 'rgba(52, 152, 219, 0.1)',
    transform: 'none',
    boxShadow: 'none'
  }
}))

// Botón de Icono
export const IconButton = styled(BaseButton)(({ theme }) => ({
  minWidth: 'unset',
  width: '40px',
  height: '40px',
  padding: '8px',
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  '& svg': {
    fontSize: '1.25rem'
  }
}))

// Botón Circular
export const CircularButton = styled(BaseButton)(({ theme }) => ({
  borderRadius: '50%',
  width: '56px',
  height: '56px',
  minWidth: 'unset',
  padding: '0',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  '& svg': {
    fontSize: '1.5rem'
  }
}))

// Botón de Carga
export const LoadingButton = styled(BaseButton)(({ theme, loading }) => ({
  position: 'relative',
  '&::after': {
    content: '""',
    display: loading ? 'block' : 'none',
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: '20px',
    height: '20px',
    marginTop: '-10px',
    marginLeft: '-10px',
    border: '2px solid transparent',
    borderTopColor: colorWhite,
    borderRightColor: colorWhite,
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite'
  },
  '& span': {
    opacity: loading ? 0 : 1
  },
  '@keyframes spin': {
    to: {
      transform: 'rotate(360deg)'
    }
  }
}))