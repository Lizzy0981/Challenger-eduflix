import { useState } from 'react'
import { Box, Rating, Typography, Tooltip } from '@mui/material'
import { styled } from '@mui/material/styles'
import { colorWhite } from '../../UI/variablesStyle'
import StarIcon from '@mui/icons-material/Star'
import { animations } from '../UI/animations'

const RatingContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  marginTop: '8px'
}))

const StyledRating = styled(Rating)(({ theme }) => ({
  '& .MuiRating-iconFilled': {
    color: '#f1c40f'
  },
  '& .MuiRating-iconHover': {
    color: '#f39c12'
  }
}))

const RatingText = styled(Typography)(({ theme }) => ({
  color: colorWhite,
  fontSize: '0.9rem',
  opacity: 0.8
}))

const RatingPopup = styled(Box)(({ theme }) => ({
  background: 'rgba(0, 0, 0, 0.8)',
  padding: '4px 8px',
  borderRadius: '4px',
  ${animations.fadeIn}
}))

function RatingComponent({ initialValue = 0, totalRatings = 0, onRatingChange }) {
  const [value, setValue] = useState(initialValue)
  const [hover, setHover] = useState(-1)
  const [showThankYou, setShowThankYou] = useState(false)

  const handleRatingChange = (event, newValue) => {
    setValue(newValue)
    if (onRatingChange) {
      onRatingChange(newValue)
    }
    setShowThankYou(true)
    setTimeout(() => setShowThankYou(false), 2000)
  }

  const labels = {
    1: 'Malo',
    2: 'Regular',
    3: 'Bueno',
    4: 'Muy bueno',
    5: 'Excelente'
  }

  return (
    <RatingContainer>
      <Box sx={{ position: 'relative' }}>
        <Tooltip 
          title={value !== null ? labels[hover !== -1 ? hover : value] : ''} 
          placement="top"
        >
          <StyledRating
            value={value}
            precision={1}
            onChange={handleRatingChange}
            onChangeActive={(event, newHover) => {
              setHover(newHover)
            }}
            icon={<StarIcon fontSize="inherit" />}
            emptyIcon={<StarIcon style={{ opacity: 0.55 }} fontSize="inherit" />}
          />
        </Tooltip>
        {showThankYou && (
          <RatingPopup>
            <Typography variant="caption" sx={{ color: colorWhite }}>
              ¡Gracias por tu valoración!
            </Typography>
          </RatingPopup>
        )}
      </Box>
      <RatingText>
        ({totalRatings} valoraciones)
      </RatingText>
    </RatingContainer>
  )
}

export default RatingComponent