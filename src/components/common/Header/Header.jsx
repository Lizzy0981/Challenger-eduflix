import { Link } from 'react-router-dom'
import {
  AppBar,
  MenuItem,
  MenuList,
  Toolbar,
  Typography,
  useMediaQuery,
  useTheme,
  IconButton,
  Avatar,
  Box,
  Badge
} from '@mui/material'
import { styled } from '@mui/material/styles'
import { colorWhite, colorPrimary } from '../../UI/variablesStyle'
import Boton from '../Button/Boton'
import DrawerComponent from './DrawerComponent'
import { useNotifications } from '@components/common/NotificationSystem'
import NotificationsIcon from '@mui/icons-material/Notifications'
import BookmarkIcon from '@mui/icons-material/Bookmark'
import LocalLibraryIcon from '@mui/icons-material/LocalLibrary'
import { animations } from '../UI/animations'

const HeaderBox = styled(AppBar)(({ theme }) => ({
  background: 'rgba(0, 0, 0, 0.8)',
  backdropFilter: 'blur(10px)',
  borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
  ${animations.fadeIn}
}))

const Logo = styled('img')(({ theme }) => ({
  width: '120px',
  height: 'auto',
  transition: 'transform 0.3s ease',
  '&:hover': {
    transform: 'scale(1.05)'
  }
}))

const Navbar = styled(Toolbar)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '0.5rem 2rem',
  [theme.breakpoints.down('md')]: {
    padding: '0.5rem 1rem'
  }
}))

const ListMenu = styled(MenuList)(({ theme }) => ({
  display: 'flex',
  gap: '1rem',
  alignItems: 'center'
}))

const MenuItemStyled = styled(MenuItem)(({ theme }) => ({
  borderRadius: '8px',
  transition: 'all 0.3s ease'
}))

const NavLink = styled(Typography)(({ theme, active }) => ({
  color: colorWhite,
  padding: '0.6rem 1.2rem',
  borderRadius: '8px',
  transition: 'all 0.3s ease',
  position: 'relative',
  '&:after': {
    content: '""',
    position: 'absolute',
    bottom: '0',
    left: '50%',
    width: active ? '100%' : '0%',
    height: '2px',
    backgroundColor: colorPrimary,
    transition: 'all 0.3s ease',
    transform: 'translateX(-50%)'
  },
  '&:hover': {
    backgroundColor: 'rgba(255,255,255,0.1)',
    '&:after': {
      width: '100%'
    }
  }
}))

const IconsContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: '1rem',
  alignItems: 'center'
}))

function Header() {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const { unreadCount } = useNotifications()

  const navigationItems = [
    { text: 'Cursos', path: '/videos', icon: <LocalLibraryIcon /> },
    { text: 'Biblioteca', path: '/biblioteca', icon: <BookmarkIcon /> }
  ]

  return (
    <HeaderBox position="fixed">
      <Navbar>
        <Link to={'/'}>
          <Logo
            src='/logo.png'
            alt='EduFlix Logo'
          />
        </Link>
        
        {isMobile ? (
          <DrawerComponent />
        ) : (
          <>
            <ListMenu>
              {navigationItems.map((item) => (
                <MenuItemStyled key={item.path}>
                  <Link
                    to={item.path}
                    style={{ textDecoration: 'none' }}
                  >
                    <NavLink
                      display="flex"
                      alignItems="center"
                      gap={1}
                    >
                      {item.icon}
                      {item.text}
                    </NavLink>
                  </Link>
                </MenuItemStyled>
              ))}
            </ListMenu>

            <IconsContainer>
              <IconButton sx={{ color: colorWhite }}>
                <Badge badgeContent={unreadCount} color="primary">
                  <NotificationsIcon />
                </Badge>
              </IconButton>

              <Link to={'/crear-video'}>
                <Boton>Crear Curso</Boton>
              </Link>

              <Avatar
                alt="User Profile"
                src="/placeholder-avatar.png"
                sx={{ 
                  width: 40, 
                  height: 40,
                  cursor: 'pointer',
                  transition: 'transform 0.3s ease',
                  '&:hover': {
                    transform: 'scale(1.1)'
                  }
                }}
              />
            </IconsContainer>
          </>
        )}
      </Navbar>
    </HeaderBox>
  )
}

export default Header