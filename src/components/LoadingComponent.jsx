import { Box, Typography } from '@mui/material'
import { styled, keyframes } from '@mui/material/styles'
import { colorPrimary } from '../../UI/variablesStyle'
import SchoolIcon from '@mui/icons-material/School'

const pulse = keyframes`
  0% {
    transform: scale(0.95);
    opacity: 0.5;
  }
  50% {
    transform: scale(1.05);
    opacity: 0.8;
  }
  100% {
    transform: scale(0.95);
    opacity: 0.5;
  }
`

const rotate = keyframes`
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
`

const LoadingContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: '200px',
  gap: '20px'
}))

const IconWrapper = styled(Box)(({ theme }) => ({
  position: 'relative',
  animation: `${pulse} 2s infinite ease-in-out`,
  '& svg': {
    fontSize: '4rem',
    color: colorPrimary
  }
}))

const LoadingCircle = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '80px',
  height: '80px',
  borderRadius: '50%',
  border: `3px solid ${colorPrimary}`,
  borderTopColor: 'transparent',
  animation: `${rotate} 1s infinite linear`
}))

const LoadingText = styled(Typography)(({ theme }) => ({
  color: colorPrimary,
  fontWeight: 500,
  letterSpacing: '1px'
}))

function LoadingComponent({ message = 'Cargando contenido...' }) {
  return (
    <LoadingContainer>
      <IconWrapper>
        <SchoolIcon />
        <LoadingCircle />
      </IconWrapper>
      <LoadingText variant="h6">
        {message}
      </LoadingText>
    </LoadingContainer>
  )
}

export default LoadingComponent