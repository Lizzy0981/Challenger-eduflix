import React, { createContext, useContext, useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import { 
  Box, 
  Drawer, 
  List, 
  ListItem, 
  ListItemText, 
  IconButton, 
  Typography,
  Badge,
  Button,
  ListItemIcon,
  Tooltip,
  Divider
} from '@mui/material'
import { styled } from '@mui/material/styles'
import { colorPrimary, colorWhite, colorSuccess, colorWarning } from '@components/UI/variablesStyle'
import NotificationsIcon from '@mui/icons-material/Notifications'
import CloseIcon from '@mui/icons-material/Close'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import NewReleasesIcon from '@mui/icons-material/NewReleases'
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents'
import DeleteSweepIcon from '@mui/icons-material/DeleteSweep'
import DoneAllIcon from '@mui/icons-material/DoneAll'
import { slideIn } from '@components/UI/animations'

const NOTIFICATION_TYPES = {
  ACHIEVEMENT: 'achievement',
  COURSE: 'course',
  INFO: 'info',
  WARNING: 'warning'
}

const NotificationContext = createContext(null)

const NotificationDrawer = styled(Drawer)(({ theme }) => ({
  '& .MuiDrawer-paper': {
    width: '350px',
    background: 'rgba(0, 0, 0, 0.95)',
    backdropFilter: 'blur(10px)',
    padding: '1.5rem',
    borderLeft: '1px solid rgba(255, 255, 255, 0.1)'
  }
}))

const NotificationItem = styled(ListItem)(({ theme, read, type }) => ({
  borderRadius: '12px',
  marginBottom: '0.8rem',
  padding: '1rem',
  background: read 
    ? 'rgba(255, 255, 255, 0.05)' 
    : `${getNotificationBackground(type)}`,
  transition: 'all 0.3s ease',
  cursor: 'pointer',
  '&:hover': {
    background: 'rgba(255, 255, 255, 0.1)',
    transform: 'translateX(5px)'
  },
  animation: `${slideIn} 0.5s ease-out`
}))

const NotificationBadge = styled(Badge)(({ theme }) => ({
  '& .MuiBadge-badge': {
    backgroundColor: colorPrimary,
    color: colorWhite,
    boxShadow: '0 0 10px rgba(52, 152, 219, 0.5)'
  }
}))

const ActionButton = styled(Button)(({ theme }) => ({
  color: colorWhite,
  borderColor: 'rgba(255, 255, 255, 0.3)',
  '&:hover': {
    borderColor: colorWhite,
    background: 'rgba(255, 255, 255, 0.1)'
  }
}))

const getNotificationBackground = (type) => {
  switch (type) {
    case NOTIFICATION_TYPES.ACHIEVEMENT:
      return 'rgba(241, 196, 15, 0.1)'
    case NOTIFICATION_TYPES.COURSE:
      return 'rgba(46, 204, 113, 0.1)'
    case NOTIFICATION_TYPES.WARNING:
      return 'rgba(231, 76, 60, 0.1)'
    default:
      return 'rgba(52, 152, 219, 0.1)'
  }
}

const getNotificationIcon = (type) => {
  switch (type) {
    case NOTIFICATION_TYPES.ACHIEVEMENT:
      return <EmojiEventsIcon sx={{ color: colorWarning }} />
    case NOTIFICATION_TYPES.COURSE:
      return <CheckCircleIcon sx={{ color: colorSuccess }} />
    case NOTIFICATION_TYPES.WARNING:
      return <NewReleasesIcon sx={{ color: '#e74c3c' }} />
    default:
      return <NewReleasesIcon sx={{ color: colorPrimary }} />
  }
}

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([])
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    loadStoredNotifications()
  }, [])

  useEffect(() => {
    saveNotifications()
  }, [notifications])

  const loadStoredNotifications = () => {
    try {
      const stored = localStorage.getItem('eduflix_notifications')
      if (stored) {
        setNotifications(JSON.parse(stored))
      }
    } catch (error) {
      console.error('Error loading notifications:', error)
    }
  }

  const saveNotifications = () => {
    try {
      localStorage.setItem('eduflix_notifications', JSON.stringify(notifications))
    } catch (error) {
      console.error('Error saving notifications:', error)
    }
  }

  const addNotification = (notification) => {
    setNotifications(prev => [{
      id: Date.now(),
      timestamp: new Date().toISOString(),
      read: false,
      type: NOTIFICATION_TYPES.INFO,
      ...notification
    }, ...prev])
  }

  const markAsRead = (id) => {
    setNotifications(prev =>
      prev.map(notif =>
        notif.id === id ? { ...notif, read: true } : notif
      )
    )
  }

  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(notif => ({ ...notif, read: true }))
    )
  }

  const clearAll = () => {
    setNotifications([])
    localStorage.removeItem('eduflix_notifications')
  }

  const deleteNotification = (id) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id))
  }

  const handleNotificationClick = (notification) => {
    if (!notification.read) {
      markAsRead(notification.id)
    }
    
    if (notification.onClick) {
      notification.onClick()
    }
  }

  const unreadCount = notifications.filter(n => !n.read).length

  const value = {
    notifications,
    unreadCount,
    addNotification,
    markAsRead,
    markAllAsRead,
    clearAll,
    deleteNotification,
    isLoading
  }

  return (
    <NotificationContext.Provider value={value}>
      <Box sx={{ 
        position: 'fixed', 
        top: '1rem', 
        right: '1rem', 
        zIndex: 1200 
      }}>
        <Tooltip title="Notificaciones">
          <IconButton 
            onClick={() => setOpen(true)} 
            sx={{ color: colorWhite }}
          >
            <NotificationBadge badgeContent={unreadCount}>
              <NotificationsIcon />
            </NotificationBadge>
          </IconButton>
        </Tooltip>
      </Box>

      <NotificationDrawer
        anchor="right"
        open={open}
        onClose={() => setOpen(false)}
      >
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          mb: 3
        }}>
          <Typography variant="h6" color={colorWhite}>
            Notificaciones {unreadCount > 0 && `(${unreadCount})`}
          </Typography>
          <IconButton 
            onClick={() => setOpen(false)}
            sx={{ color: colorWhite }}
          >
            <CloseIcon />
          </IconButton>
        </Box>

        {notifications.length > 0 && (
          <Box sx={{ 
            display: 'flex', 
            gap: 1, 
            mb: 2 
          }}>
            <ActionButton 
              size="small" 
              variant="outlined"
              startIcon={<DoneAllIcon />}
              onClick={markAllAsRead}
              disabled={!unreadCount}
            >
              Marcar como leídas
            </ActionButton>
            <ActionButton 
              size="small" 
              variant="outlined"
              startIcon={<DeleteSweepIcon />}
              onClick={clearAll}
            >
              Limpiar todo
            </ActionButton>
          </Box>
        )}

        <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)', my: 2 }} />

        {notifications.length > 0 ? (
          <List>
            {notifications.map((notification) => (
              <NotificationItem 
                key={notification.id}
                read={notification.read}
                type={notification.type}
                onClick={() => handleNotificationClick(notification)}
              >
                <ListItemIcon>
                  {getNotificationIcon(notification.type)}
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Typography 
                      variant="subtitle2" 
                      color={colorWhite}
                      sx={{ 
                        fontWeight: notification.read ? 400 : 600,
                        mb: 0.5
                      }}
                    >
                      {notification.title}
                    </Typography>
                  }
                  secondary={
                    <>
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          color: 'rgba(255,255,255,0.7)',
                          mb: 1
                        }}
                      >
                        {notification.message}
                      </Typography>
                      <Typography 
                        variant="caption" 
                        sx={{ 
                          color: 'rgba(255,255,255,0.5)'
                        }}
                      >
                        {new Date(notification.timestamp).toLocaleString()}
                      </Typography>
                    </>
                  }
                />
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation()
                    deleteNotification(notification.id)
                  }}
                  sx={{ 
                    color: 'rgba(255,255,255,0.5)',
                    '&:hover': { color: colorWhite }
                  }}
                >
                  <CloseIcon fontSize="small" />
                </IconButton>
              </NotificationItem>
            ))}
          </List>
        ) : (
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center',
            mt: 4 
          }}>
            <NotificationsIcon 
              sx={{ 
                fontSize: 48, 
                color: 'rgba(255,255,255,0.3)', 
                mb: 2 
              }} 
            />
            <Typography 
              variant="body1" 
              color="rgba(255,255,255,0.5)"
            >
              No hay notificaciones
            </Typography>
          </Box>
        )}
      </NotificationDrawer>
      {children}
    </NotificationContext.Provider>
  )
}

NotificationProvider.propTypes = {
  children: PropTypes.node.isRequired
}

export function useNotifications() {
  const context = useContext(NotificationContext)
  if (!context) {
    throw new Error('useNotifications debe ser usado dentro de un NotificationProvider')
  }
  return context
}

export const NOTIFICATION_TYPES_EXPORT = NOTIFICATION_TYPES

export default NotificationProvider
