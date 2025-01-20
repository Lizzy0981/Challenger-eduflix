import React, { useState, useEffect } from 'react'
import { Box, Typography, IconButton } from '@mui/material'
import { styled } from '@mui/material/styles'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import ErrorIcon from '@mui/icons-material/Error'
import InfoIcon from '@mui/icons-material/Info'
import CloseIcon from '@mui/icons-material/Close'
import { advancedAnimations, basicAnimations } from './animationUtils'

const FeedbackContainer = styled(Box)(({ theme, type }) => ({
  position: 'fixed',
  bottom: '2rem',
  right: '2rem',
  padding: '1rem',
  borderRadius: '8px',
  minWidth: '300px',
  backgroundColor: type === 'success' ? '#2ecc71' 
    : type === 'error' ? '#e74c3c' 
    : '#3498db',
  color: 'white',
  display: 'flex',
  alignItems: 'center',
  gap: '1rem',
  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
  zIndex: 9999,
  animation: `${advancedAnimations.slideUp} 0.3s ease-out`
}))

const IconContainer = styled(Box)(({ theme }) => ({
  animation: `${advancedAnimations.rotateIn} 0.5s ease-out`
}))

const MessageContainer = styled(Box)(({ theme }) => ({
  flex: 1,
  animation: `${basicAnimations.fadeIn} 0.3s ease-out`
}))

const CloseButton = styled(IconButton)(({ theme }) => ({
  color: 'white',
  padding: '4px',
  '&:hover': {
    animation: `${advancedAnimations.pulse} 0.3s ease-in-out`
  }
}))

const getIcon = (type) => {
  switch (type) {
    case 'success':
      return <CheckCircleIcon />
    case 'error':
      return <ErrorIcon />
    default:
      return <InfoIcon />
  }
}

function FeedbackComponent({ 
  message, 
  type = 'info', 
  duration = 3000, 
  onClose 
}) {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    if (duration) {
      const timer = setTimeout(() => {
        handleClose()
      }, duration)
      return () => clearTimeout(timer)
    }
  }, [duration])

  const handleClose = () => {
    setIsVisible(false)
    if (onClose) {
      onClose()
    }
  }

  if (!isVisible) return null

  return (
    <FeedbackContainer type={type}>
      <IconContainer>
        {getIcon(type)}
      </IconContainer>
      <MessageContainer>
        <Typography variant="body1">
          {message}
        </Typography>
      </MessageContainer>
      <CloseButton onClick={handleClose} size="small">
        <CloseIcon fontSize="small" />
      </CloseButton>
    </FeedbackContainer>
  )
}

export default FeedbackComponent