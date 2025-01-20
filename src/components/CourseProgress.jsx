import { useState, useEffect } from 'react'
import { 
  Box, 
  LinearProgress, 
  Typography, 
  Tooltip,
  IconButton
} from '@mui/material'
import { styled } from '@mui/material/styles'
import { colorPrimary, colorWhite } from '../../UI/variablesStyle'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline'
import { animations } from '../UI/animations'

const ProgressContainer = styled(Box)(({ theme }) => ({
  marginTop: '1rem',
  padding: '0.5rem',
  borderRadius: '8px',
  background: 'rgba(255, 255, 255, 0.1)',
  ${animations.fadeIn}
}))

const ProgressBar = styled(LinearProgress)(({ theme }) => ({
  height: 8,
  borderRadius: 4,
  '& .MuiLinearProgress-bar': {
    borderRadius: 4,
    backgroundColor: colorPrimary
  }
}))

const ProgressText = styled(Typography)(({ theme }) => ({
  color: colorWhite,
  fontSize: '0.875rem',
  marginTop: '0.5rem',
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem'
}))

const StatusIcon = styled(IconButton)(({ theme, completed }) => ({
  color: completed ? '#2ecc71' : colorWhite,
  padding: '4px',
  '&:hover': {
    transform: 'scale(1.1)'
  },
  transition: 'all 0.3s ease'
}))

function CourseProgress({ videoId, duration }) {
  const [progress, setProgress] = useState(0)
  const [completed, setCompleted] = useState(false)

  useEffect(() => {
    // Cargar progreso guardado
    const savedProgress = localStorage.getItem(`course_progress_${videoId}`)
    if (savedProgress) {
      setProgress(parseInt(savedProgress))
      setCompleted(parseInt(savedProgress) === 100)
    }
  }, [videoId])

  const handleProgressUpdate = (newProgress) => {
    setProgress(newProgress)
    localStorage.setItem(`course_progress_${videoId}`, newProgress.toString())
    
    if (newProgress === 100) {
      setCompleted(true)
    }
  }

  const formatTime = (minutes) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`
  }

  const getProgressText = () => {
    const timeLeft = Math.ceil((100 - progress) * duration / 100)
    return completed 
      ? 'Curso completado'
      : `${formatTime(timeLeft)} restantes`
  }

  return (
    <ProgressContainer>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Box sx={{ flex: 1 }}>
          <ProgressBar 
            variant="determinate" 
            value={progress} 
          />
        </Box>
        <Tooltip title={completed ? 'Completado' : 'Continuar curso'}>
          <StatusIcon completed={completed}>
            {completed 
              ? <CheckCircleIcon /> 
              : <PlayCircleOutlineIcon />
            }
          </StatusIcon>
        </Tooltip>
      </Box>
      <ProgressText variant="body2">
        {progress}% • {getProgressText()}
      </ProgressText>
    </ProgressContainer>
  )
}

export default CourseProgress