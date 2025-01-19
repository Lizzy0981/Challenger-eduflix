import { useState, useContext } from 'react'
import { VideosContext } from '../../../Context/Context'
import ReactPlayer from 'react-player/youtube'
import { 
  Box, 
  Card, 
  CardMedia, 
  CardContent, 
  Typography, 
  Modal, 
  Chip, 
  Stack,
  IconButton,
  Tooltip,
  Button
} from '@mui/material'
import { styled } from '@mui/material/styles'
import { colorWhite } from '../../UI/variablesStyle'
import AccessTimeIcon from '@mui/icons-material/AccessTime'
import PersonIcon from '@mui/icons-material/Person'
import SignalCellularAltIcon from '@mui/icons-material/SignalCellularAlt'
import FavoriteIcon from '@mui/icons-material/Favorite'
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder'
import PlayArrowIcon from '@mui/icons-material/PlayArrow'
import ShareIcon from '@mui/icons-material/Share'
import { animations } from '../UI/animations'
import RatingComponent from './RatingComponent'
import CourseProgress from './CourseProgress'
import { useAuth } from '../../hooks/useAuth'
import { useGamification } from '../../hooks/useGamification'

const VideoCardImg = styled(CardMedia)(({ theme }) => ({
  width: '100%',
  objectFit: 'cover',
  borderRadius: '12px 12px 0 0',
  transition: 'transform 0.3s ease-in-out',
  '&:hover': {
    transform: 'scale(1.05)'
  }
}))

const VideoText1 = styled(Typography)(({ theme }) => ({
  color: colorWhite,
  fontWeight: 'bold',
  marginBottom: '0.8rem'
}))

const VideoText2 = styled(Typography)(({ theme }) => ({
  color: colorWhite,
  lineHeight: '1.5rem',
  marginBottom: '1rem'
}))

const VideoCardMain = styled(Card)(({ theme }) => ({
  margin: '0 auto',
  width: '100%',
  height: '100%',
  borderRadius: '12px',
  transition: 'all 0.3s ease-in-out',
  background: 'transparent'
}))

const BoxModal = styled(Box)(({ theme }) => ({
  position: 'relative',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '80%',
  maxWidth: '1000px',
  aspectRatio: '16/9',
  backgroundColor: theme.palette.background.paper,
  border: '2px solid #000',
  boxShadow: 24,
  borderRadius: '12px',
  overflow: 'hidden'
}))

const ChipStyled = styled(Chip)(({ theme }) => ({
  color: colorWhite,
  fontWeight: 'bold',
  '& .MuiChip-icon': {
    color: colorWhite
  }
}))

const MetadataContainer = styled(Stack)(({ theme }) => ({
  marginTop: '1rem',
  marginBottom: '0.5rem'
}))

const VideoBox = styled(Box)(({ theme, color }) => ({
  border: `2px solid ${color}`,
  background: 'rgba(0, 0, 0, 0.6)',
  margin: '0 1rem',
  borderRadius: '12px',
  boxSizing: 'border-box',
  transition: 'all 0.3s ease-in-out',
  overflow: 'hidden',
  cursor: 'pointer',
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: `0 5px 15px ${color}50`
  }
}))

const VideoCardText = styled(CardContent)(({ theme }) => ({
  padding: '1.5rem',
  height: '100%'
}))

const OverlayContainer = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  background: 'rgba(0, 0, 0, 0.5)',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  opacity: 0,
  transition: 'opacity 0.3s ease',
  borderRadius: '12px 12px 0 0',
  '&:hover': {
    opacity: 1
  }
}))

const ActionButtons = styled(Stack)(({ theme }) => ({
  position: 'absolute',
  top: '10px',
  right: '10px',
  zIndex: 1
}))

const PlayButton = styled(IconButton)(({ theme }) => ({
  color: colorWhite,
  backgroundColor: 'rgba(0, 0, 0, 0.6)',
  '&:hover': {
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    transform: 'scale(1.1)'
  },
  transition: 'all 0.3s ease'
}))

function VideoCard({ video, color }) {
  const { favorites, toggleFavorite, addToHistory } = useContext(VideosContext)
  const { user } = useAuth()
  const { addPoints, checkAchievements } = useGamification()
  
  const [open, setOpen] = useState(false)
  const [progress, setProgress] = useState(0)

  const isFavorite = favorites.includes(video.id)

  const handleOpen = () => {
    setOpen(true)
    addToHistory(video.id)
  }

  const handleClose = () => setOpen(false)

  const handleFavoriteClick = (e) => {
    e.stopPropagation()
    toggleFavorite(video.id)
    if (!isFavorite) {
      addPoints(user.id, 5, 'favorite_video')
      checkAchievements(user.id)
    }
  }

  const handleShare = async (e) => {
    e.stopPropagation()
    try {
      await navigator.clipboard.writeText(video.linkVideo)
      toast.success('Enlace copiado al portapapeles')
      addPoints(user.id, 2, 'share_video')
    } catch (error) {
      toast.error('Error al copiar el enlace')
    }
  }

  const handleProgress = (state) => {
    const newProgress = Math.round(state.played * 100)
    if (newProgress > progress) {
      setProgress(newProgress)
      localStorage.setItem(`course_progress_${video.id}`, newProgress.toString())
      
      if (newProgress === 100 && progress !== 100) {
        addPoints(user.id, 50, 'complete_video')
        checkAchievements(user.id)
      }
    }
  }

  const getNivelColor = (nivel) => {
    switch (nivel) {
      case 'Principiante': return '#2ecc71'
      case 'Intermedio': return '#f1c40f'
      case 'Avanzado': return '#e74c3c'
      default: return color
    }
  }

  return (
    <VideoBox color={color}>
      <VideoCardMain>
        <Box sx={{ position: 'relative' }}>
          <VideoCardImg
            component="img"
            image={video.linkImage}
            alt={video.titulo}
          />
          <OverlayContainer>
            <PlayButton size="large" onClick={handleOpen}>
              <PlayArrowIcon sx={{ fontSize: '3rem' }} />
            </PlayButton>
          </OverlayContainer>
          <ActionButtons direction="column" spacing={1}>
            {user && (
              <Tooltip title={isFavorite ? "Quitar de favoritos" : "Añadir a favoritos"}>
                <IconButton 
                  onClick={handleFavoriteClick}
                  sx={{ color: colorWhite }}
                >
                  {isFavorite ? <FavoriteIcon /> : <FavoriteBorderIcon />}
                </IconButton>
              </Tooltip>
            )}
            <Tooltip title="Compartir">
              <IconButton 
                onClick={handleShare}
                sx={{ color: colorWhite }}
              >
                <ShareIcon />
              </IconButton>
            </Tooltip>
          </ActionButtons>
        </Box>

        <VideoCardText>
          <VideoText1 variant="h5">{video.titulo}</VideoText1>
          <VideoText2 variant="body2">{video.descripcion}</VideoText2>

          <MetadataContainer direction="row" spacing={1} useFlexGap flexWrap="wrap">
            <ChipStyled
              icon={<AccessTimeIcon />}
              label={`${video.duracion} min`}
              size="small"
              style={{ backgroundColor: color }}
            />
            <ChipStyled
              icon={<SignalCellularAltIcon />}
              label={video.nivel}
              size="small"
              style={{ backgroundColor: getNivelColor(video.nivel) }}
            />
            <ChipStyled
              icon={<PersonIcon />}
              label={video.instructor}
              size="small"
              style={{ backgroundColor: color }}
            />
          </MetadataContainer>

          {user && (
            <>
              <RatingComponent
                videoId={video.id}
                onRatingChange={(rating) => {
                  addPoints(user.id, 3, 'rate_video')
                }}
              />
              <CourseProgress
                videoId={video.id}
                progress={progress}
                duration={video.duracion}
              />
            </>
          )}
        </VideoCardText>
      </VideoCardMain>

      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="video-modal"
      >
        <BoxModal>
          <ReactPlayer
            url={video.linkVideo}
            width="100%"
            height="100%"
            style={{ position: 'absolute', top: 0, left: 0 }}
            controls
            onProgress={handleProgress}
          />
        </BoxModal>
      </Modal>
    </VideoBox>
  )
}

export default VideoCard