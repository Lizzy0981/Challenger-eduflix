import { Box, Typography, Button } from '@mui/material'
import { Link } from 'react-router-dom'
import PropTypes from 'prop-types'
import { styled } from '@mui/material/styles'
import { colorWhite, colorPrimary } from '../../UI/variablesStyle'

const EmptyContainer = styled(Box)(({ theme }) => ({
  textAlign: 'center',
  padding: '3rem',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '1.5rem'
}))

const IconWrapper = styled(Box)(({ theme }) => ({
  fontSize: '4rem',
  color: colorPrimary,
  '& svg': {
    fontSize: 'inherit'
  }
}))

function EmptyState({ icon: Icon, message, actionText, actionLink }) {
  return (
    <EmptyContainer>
      <IconWrapper>
        <Icon />
      </IconWrapper>
      <Typography variant="h6" color={colorWhite}>
        {message}
      </Typography>
      {actionText && actionLink && (
        <Button
          component={Link}
          to={actionLink}
          variant="outlined"
          color="primary"
        >
          {actionText}
        </Button>
      )}
    </EmptyContainer>
  )
}

EmptyState.propTypes = {
  icon: PropTypes.elementType.isRequired,
  message: PropTypes.string.isRequired,
  actionText: PropTypes.string,
  actionLink: PropTypes.string
}

export default EmptyState