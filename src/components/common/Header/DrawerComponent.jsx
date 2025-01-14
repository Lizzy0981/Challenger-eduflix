import { useState } from 'react'
import { 
  Drawer, 
  IconButton, 
  List, 
  ListItemButton, 
  ListItemIcon, 
  ListItemText,
  Box,
  Avatar,
  Typography,
  Divider,
  Badge
} from '@mui/material'
import { styled } from '@mui/material/styles'
import { colorPrimary, colorWhite } from '../../UI/variablesStyle'
import { Link } from 'react-router-dom'
import MenuIcon from '@mui/icons-material/Menu'
import CloseIcon from '@mui/icons-material/Close'
import HomeIcon from '@mui/icons-material/Home'
import LocalLibraryIcon from '@mui/icons-material/LocalLibrary'
import BookmarkIcon from '@mui/icons-material/Bookmark'
import VideoLibraryIcon from '@mui/icons-material/VideoLibrary'
import SettingsIcon from '@mui/icons-material/Settings'
import HelpIcon from '@mui/icons-material/Help'
import NotificationsIcon from '@mui/icons-material/Notifications'
import { useNotifications } from '../NotificationSystem'
import { animations } from '../UI/animations'

const DrawerBox = styled(Drawer)(({ theme }) => ({
  '& .MuiDrawer-paper': {
    width: '280px',
    background: 'rgba(0, 0, 0, 0.95)',
    backdropFilter: 'blur(10px)',
    borderLeft: '1px solid rgba(255, 255, 255, 0.1)'
  }
}))

const DrawerHeader = styled(Box)(({ theme }) => ({
  padding: '1rem',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
}))

const UserInfo = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: '1rem',
  padding: '1rem',
  background: 'rgba(255, 255, 255, 0.05)',
  margin: '1rem',
  borderRadius: '12px',
  cursor: 'pointer',
  transition: 'all 0.3s ease',
  '&:hover': {
    background: 'rgba(255, 255, 255, 0.1)'
  }
}))

const ListItemStyled = styled(ListItemButton)(({ theme }) => ({
  margin: '0.25rem 1rem',
  borderRadius: '8px',
  transition: 'all 0.3s ease',
  '&:hover': {
    background: 'rgba(255, 255, 255, 0.1)',
    transform: 'translateX(5px)'
  },
  '& .MuiListItemIcon-root': {
    color: colorWhite
  }
}))

const MenuButton = styled(IconButton)(({ theme }) => ({
  color: colorWhite,
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'rotate(180deg)'
  }
}))

function DrawerComponent() {
  const [open, setOpen] = useState(false)
  const { unreadCount } = useNotifications()

  const menuItems = [
    { text: 'Inicio', icon: <HomeIcon />, path: '/' },
    { text: 'Cursos', icon: <LocalLibraryIcon />, path: '/videos' },
    { text: 'Mi Biblioteca', icon: <BookmarkIcon />, path: '/biblioteca' },
    { text: 'Crear Curso', icon: <VideoLibraryIcon />, path: '/crear-video' }
  ]

  const secondaryItems = [
    { text: 'Configuración', icon: <SettingsIcon />, path: '/settings' },
    { text: 'Ayuda', icon: <HelpIcon />, path: '/help' }
  ]

  const toggleDrawer = () => {
    setOpen(!open)
  }

  return (
    <>
      <MenuButton onClick={toggleDrawer}>
        <MenuIcon />
      </MenuButton>

      <DrawerBox
        anchor="right"
        open={open}
        onClose={toggleDrawer}
      >
        <DrawerHeader>
          <Typography variant="h6" color={colorWhite}>
            Menú
          </Typography>
          <IconButton onClick={toggleDrawer} sx={{ color: colorWhite }}>
            <CloseIcon />
          </IconButton>
        </DrawerHeader>

        <UserInfo>
          <Avatar
            alt="User Profile"
            src="/placeholder-avatar.png"
            sx={{ width: 40, height: 40 }}
          />
          <Box>
            <Typography variant="subtitle1" color={colorWhite}>
              Usuario Demo
            </Typography>
            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)' }}>
              usuario@eduflix.com
            </Typography>
          </Box>
        </UserInfo>

        <List sx={{ ${animations.slideIn} }}>
          {menuItems.map((item) => (
            <ListItemStyled
              key={item.text}
              component={Link}
              to={item.path}
              onClick={toggleDrawer}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText 
                primary={item.text}
                sx={{ color: colorWhite }}
              />
              {item.text === 'Notificaciones' && (
                <Badge 
                  badgeContent={unreadCount} 
                  color="primary"
                  sx={{ ml: 2 }}
                />
              )}
            </ListItemStyled>
          ))}
        </List>

        <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)', my: 2 }} />

        <List>
          {secondaryItems.map((item) => (
            <ListItemStyled
              key={item.text}
              component={Link}
              to={item.path}
              onClick={toggleDrawer}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText 
                primary={item.text}
                sx={{ color: colorWhite }}
              />
            </ListItemStyled>
          ))}
        </List>

        <Box sx={{ mt: 'auto', p: 2, textAlign: 'center' }}>
          <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)' }}>
            EduFlix v1.0.0
          </Typography>
        </Box>
      </DrawerBox>
    </>
  )
}

export default DrawerComponent