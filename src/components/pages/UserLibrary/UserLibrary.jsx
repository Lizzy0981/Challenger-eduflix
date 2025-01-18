import { useContext, useState, useCallback } from 'react'
import PropTypes from 'prop-types'
import { 
  Box, 
  Typography, 
  Tabs, 
  Tab,
  Grid,
  Button,
  Fade,
  Divider,
  Tooltip
} from '@mui/material'
import { styled } from '@mui/material/styles'
import { colorPrimary, colorWhite } from '../../UI/variablesStyle'
import { VideosContext } from '../../../Context/Context'
import { useAuth } from '../../../hooks/useAuth'
import VideoCard from '../Carrusel/VideoCard'
import LibraryFilters from './LibraryFilters'
import LearningStats from './LearningStats'
import LoadingComponent from '../LoadingComponent'
import EmptyState from '../common/EmptyState'
import { animations } from '../UI/animations'

// Icons
import FavoriteIcon from '@mui/icons-material/Favorite'
import HistoryIcon from '@mui/icons-material/History'
import QueryStatsIcon from '@mui/icons-material/QueryStats'
import FileDownloadIcon from '@mui/icons-material/FileDownload'
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents'
import RecommendIcon from '@mui/icons-material/Recommend'

const LibraryContainer = styled(Box)(({ theme }) => ({
  padding: '2rem',
  marginTop: '4rem',
  minHeight: '100vh',
  ...animations.fadeIn
}))

const TabPanel = styled(Box)(({ theme }) => ({
  padding: '2rem 0',
  ...animations.fadeIn
}))

const ActionButton = styled(Button)(({ theme }) => ({
  color: colorWhite,
  borderColor: 'rgba(255, 255, 255, 0.3)',
  '&:hover': {
    borderColor: colorPrimary,
    backgroundColor: 'rgba(52, 152, 219, 0.1)',
    transform: 'translateY(-2px)'
  },
  transition: 'all 0.3s ease'
}))

const ActionsContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: '1rem',
  marginBottom: '2rem',
  flexWrap: 'wrap'
}))

const StyledTab = styled(Tab)(({ theme }) => ({
  color: colorWhite,
  '&.Mui-selected': {
    color: colorPrimary
  },
  '&:hover': {
    color: colorPrimary,
    opacity: 0.8
  }
}))

const TAB_VALUES = {
  FAVORITES: 0,
  HISTORY: 1,
  STATS: 2
}

function UserLibrary() {
  const { 
    getFavoriteVideos, 
    getHistoryVideos,
    categorias,
    exportStatistics,
    generateCertificate,
    recommendations,
    loading
  } = useContext(VideosContext)

  const { user } = useAuth()
  
  const [currentTab, setCurrentTab] = useState(TAB_VALUES.FAVORITES)
  const [filters, setFilters] = useState({})
  const [filteredVideos, setFilteredVideos] = useState([])

  const favoriteVideos = getFavoriteVideos()
  const historyVideos = getHistoryVideos()

  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue)
  }

  const applyFilters = useCallback((videos) => {
    if (!videos) return []
    
    let filtered = [...videos]

    if (filters.nivel) {
      filtered = filtered.filter(video => video.nivel === filters.nivel)
    }

    if (filters.duracion) {
      filtered = filtered.filter(video => {
        const duration = parseInt(video.duracion)
        switch (filters.duracion) {
          case '0-30 min':
            return duration <= 30
          case '30-60 min':
            return duration > 30 && duration <= 60
          case '60+ min':
            return duration > 60
          default:
            return true
        }
      })
    }

    if (filters.progreso) {
      filtered = filtered.filter(video => {
        const progress = localStorage.getItem(`course_progress_${video.id}`) || '0'
        const progressValue = parseInt(progress)
        
        switch (filters.progreso) {
          case 'Completados':
            return progressValue === 100
          case 'En progreso':
            return progressValue > 0 && progressValue < 100
          case 'No iniciados':
            return progressValue === 0
          default:
            return true
        }
      })
    }

    if (filters.busqueda) {
      const search = filters.busqueda.toLowerCase()
      filtered = filtered.filter(video =>
        video.titulo.toLowerCase().includes(search) ||
        video.descripcion.toLowerCase().includes(search) ||
        video.instructor.toLowerCase().includes(search)
      )
    }

    setFilteredVideos(filtered)
  }, [filters])

  const handleExportStats = async () => {
    try {
      await exportStatistics()
    } catch (error) {
      console.error('Error exporting stats:', error)
    }
  }

  const handleGenerateCertificate = async (videoId) => {
    if (!user) return
    try {
      await generateCertificate(videoId, user.name)
    } catch (error) {
      console.error('Error generating certificate:', error)
    }
  }

  if (loading) {
    return <LoadingComponent message="Cargando tu biblioteca..." />
  }

  const renderContent = () => {
    let videos = []
    let emptyMessage = ''

    switch (currentTab) {
      case TAB_VALUES.FAVORITES:
        videos = favoriteVideos
        emptyMessage = 'No tienes videos favoritos aún'
        break
      case TAB_VALUES.HISTORY:
        videos = historyVideos
        emptyMessage = 'No has visto ningún video aún'
        break
      case TAB_VALUES.STATS:
        return <LearningStats />
      default:
        videos = []
    }

    if (videos.length === 0) {
      return (
        <EmptyState
          icon={currentTab === TAB_VALUES.FAVORITES ? FavoriteIcon : HistoryIcon}
          message={emptyMessage}
          actionText="Explorar cursos"
          actionLink="/videos"
        />
      )
    }

    return (
      <Fade in={true}>
        <Grid container spacing={3}>
          {filteredVideos.map((video) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={video.id}>
              <VideoCard
                video={video}
                color={categorias.find(cat => cat.nombre === video.categoria)?.color || colorPrimary}
                onComplete={handleGenerateCertificate}
              />
            </Grid>
          ))}
        </Grid>
      </Fade>
    )
  }

  return (
    <LibraryContainer>
      <Typography variant="h4" color={colorWhite} gutterBottom>
        Tu Biblioteca
      </Typography>

      <ActionsContainer>
        <Tooltip title="Descarga un reporte de tu progreso">
          <ActionButton
            variant="outlined"
            startIcon={<FileDownloadIcon />}
            onClick={handleExportStats}
          >
            Exportar Estadísticas
          </ActionButton>
        </Tooltip>

        <Tooltip title="Ver tus certificados">
          <ActionButton
            variant="outlined"
            startIcon={<EmojiEventsIcon />}
            onClick={() => {/* Implementar vista de certificados */}}
          >
            Certificados
          </ActionButton>
        </Tooltip>

        <Tooltip title="Ver cursos recomendados">
          <ActionButton
            variant="outlined"
            startIcon={<RecommendIcon />}
            onClick={() => {/* Implementar vista de recomendaciones */}}
          >
            Recomendaciones
          </ActionButton>
        </Tooltip>
      </ActionsContainer>

      <LearningStats />
      
      <Divider sx={{ 
        my: 4, 
        borderColor: 'rgba(255,255,255,0.1)' 
      }} />

      <Tabs 
        value={currentTab} 
        onChange={handleTabChange}
        sx={{ mb: 3 }}
        TabIndicatorProps={{
          style: { backgroundColor: colorPrimary }
        }}
      >
        <StyledTab 
          icon={<FavoriteIcon />} 
          label="Favoritos" 
        />
        <StyledTab 
          icon={<HistoryIcon />} 
          label="Historial" 
        />
        <StyledTab 
          icon={<QueryStatsIcon />} 
          label="Estadísticas" 
        />
      </Tabs>

      {currentTab !== TAB_VALUES.STATS && (
        <LibraryFilters onFilterChange={setFilters} />
      )}

      {renderContent()}
    </LibraryContainer>
  )
}

UserLibrary.propTypes = {
  onComplete: PropTypes.func
}

export default UserLibrary