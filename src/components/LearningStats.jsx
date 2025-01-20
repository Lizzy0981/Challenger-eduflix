import { useContext, useMemo } from 'react'
import { VideosContext } from '../../../Context/Context'
import { 
  Box, 
  Paper, 
  Typography, 
  Grid,
  CircularProgress,
  LinearProgress
} from '@mui/material'
import { styled } from '@mui/material/styles'
import { colorPrimary, colorWhite } from '../../UI/variablesStyle'
import { animations } from '../UI/animations'
import AccessTimeIcon from '@mui/icons-material/AccessTime'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import TrendingUpIcon from '@mui/icons-material/TrendingUp'
import CategoryIcon from '@mui/icons-material/Category'

const StatsContainer = styled(Box)(({ theme }) => ({
  padding: '2rem',
  ${animations.fadeIn}
}))

const StatCard = styled(Paper)(({ theme }) => ({
  padding: '1.5rem',
  borderRadius: '12px',
  background: 'rgba(255, 255, 255, 0.05)',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  gap: '1rem',
  transition: 'transform 0.3s ease',
  '&:hover': {
    transform: 'translateY(-5px)'
  },
  ${animations.slideUp}
}))

const StatIcon = styled(Box)(({ theme }) => ({
  width: '48px',
  height: '48px',
  borderRadius: '12px',
  background: colorPrimary,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginBottom: '1rem',
  '& svg': {
    fontSize: '24px',
    color: colorWhite
  }
}))

const ProgressLabel = styled(Typography)(({ theme }) => ({
  color: colorWhite,
  display: 'flex',
  justifyContent: 'space-between',
  marginBottom: '0.5rem'
}))

function LearningStats() {
  const { 
    videos,
    categorias,
    viewHistory,
    getFavoriteVideos
  } = useContext(VideosContext)

  const stats = useMemo(() => {
    // Calcular estadísticas
    const completedCourses = videos.filter(video => {
      const progress = localStorage.getItem(`course_progress_${video.id}`)
      return progress === '100'
    }).length

    const totalMinutes = videos.reduce((total, video) => {
      const progress = localStorage.getItem(`course_progress_${video.id}`)
      if (progress) {
        return total + (video.duracion * parseInt(progress) / 100)
      }
      return total
    }, 0)

    const categoriesProgress = categorias.map(categoria => {
      const categoryVideos = videos.filter(v => v.categoria === categoria.nombre)
      const completedInCategory = categoryVideos.filter(video => {
        const progress = localStorage.getItem(`course_progress_${video.id}`)
        return progress === '100'
      }).length
      
      return {
        name: categoria.nombre,
        progress: (completedInCategory / categoryVideos.length) * 100 || 0,
        color: categoria.color
      }
    })

    const totalProgress = videos.reduce((sum, video) => {
      const progress = localStorage.getItem(`course_progress_${video.id}`) || '0'
      return sum + parseInt(progress)
    }, 0) / videos.length

    return {
      completedCourses,
      totalMinutes,
      categoriesProgress,
      totalProgress
    }
  }, [videos, categorias])

  const formatTime = (minutes) => {
    const hours = Math.floor(minutes / 60)
    return hours > 0 
      ? `${hours}h ${minutes % 60}m`
      : `${minutes}m`
  }

  return (
    <StatsContainer>
      <Typography variant="h5" color={colorWhite} gutterBottom>
        Tu progreso de aprendizaje
      </Typography>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard>
            <StatIcon>
              <AccessTimeIcon />
            </StatIcon>
            <Typography variant="h4" color={colorWhite}>
              {formatTime(stats.totalMinutes)}
            </Typography>
            <Typography variant="body2" color="rgba(255,255,255,0.7)">
              Tiempo total de aprendizaje
            </Typography>
          </StatCard>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StatCard>
            <StatIcon>
              <CheckCircleIcon />
            </StatIcon>
            <Typography variant="h4" color={colorWhite}>
              {stats.completedCourses}
            </Typography>
            <Typography variant="body2" color="rgba(255,255,255,0.7)">
              Cursos completados
            </Typography>
          </StatCard>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StatCard>
            <StatIcon>
              <TrendingUpIcon />
            </StatIcon>
            <Box sx={{ position: 'relative', display: 'inline-flex' }}>
              <CircularProgress 
                variant="determinate" 
                value={stats.totalProgress}
                size={80}
                sx={{ color: colorPrimary }}
              />
              <Box sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                bottom: 0,
                right: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Typography variant="h4" color={colorWhite}>
                  {Math.round(stats.totalProgress)}%
                </Typography>
              </Box>
            </Box>
            <Typography variant="body2" color="rgba(255,255,255,0.7)">
              Progreso general
            </Typography>
          </StatCard>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StatCard>
            <StatIcon>
              <CategoryIcon />
            </StatIcon>
            <Box>
              {stats.categoriesProgress.map((cat) => (
                <Box key={cat.name} sx={{ mb: 2 }}>
                  <ProgressLabel variant="body2">
                    <span>{cat.name}</span>
                    <span>{Math.round(cat.progress)}%</span>
                  </ProgressLabel>
                  <LinearProgress 
                    variant="determinate" 
                    value={cat.progress}
                    sx={{ 
                      height: 8, 
                      borderRadius: 4,
                      backgroundColor: 'rgba(255,255,255,0.1)',
                      '& .MuiLinearProgress-bar': {
                        backgroundColor: cat.color
                      }
                    }} 
                  />
                </Box>
              ))}
            </Box>
          </StatCard>
        </Grid>
      </Grid>
    </StatsContainer>
  )
}

export default LearningStats