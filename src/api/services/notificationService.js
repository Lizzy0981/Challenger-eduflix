class NotificationService {
    constructor() {
      this.notifications = new Map()
    }
  
    async notifyNewCertificate(user, video) {
      const notification = {
        id: Date.now(),
        type: 'achievement',
        title: '¡Nuevo Certificado!',
        message: `Has obtenido un certificado por completar el curso: ${video.titulo}`,
        userId: user._id,
        timestamp: new Date(),
        read: false
      }
  
      this.notifications.set(notification.id, notification)
  
      // Si hay WebSocket configurado, enviar notificación en tiempo real
      if (global.io) {
        global.io.to(user._id.toString()).emit('notification', notification)
      }
  
      return notification
    }
  
    async getNotifications(userId) {
      return Array.from(this.notifications.values())
        .filter(n => n.userId.toString() === userId.toString())
        .sort((a, b) => b.timestamp - a.timestamp)
    }
  
    async markAsRead(notificationId) {
      const notification = this.notifications.get(notificationId)
      if (notification) {
        notification.read = true
        this.notifications.set(notificationId, notification)
      }
    }
  }
  
  export const notificationService = new NotificationService()