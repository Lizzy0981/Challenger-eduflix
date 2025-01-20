import User from '../models/User'
import Progress from '../models/Progress'
import { createError } from '../middleware/errorHandler'
import { generatePDF } from '../utils/pdfGenerator'
import { uploadToS3, deleteFromS3 } from '../utils/s3'
import { cache } from '../utils/cache'
import { notificationService } from '../services/notificationService'

class UserService {
  async getUserProfile(userId) {
    const cacheKey = `user:${userId}`
    const cached = await cache.get(cacheKey)
    if (cached) return cached

    const user = await User.findById(userId)
      .select('-password')
      .populate({
        path: 'favorites',
        populate: {
          path: 'categoria instructor',
          select: 'nombre color name avatar'
        }
      })

    if (!user) {
      throw createError(404, 'Usuario no encontrado')
    }

    return { favorites: user.favorites }
  }

  async getWatchHistory(userId) {
    const user = await User.findById(userId)
      .populate({
        path: 'watchHistory.video',
        populate: {
          path: 'categoria instructor',
          select: 'nombre color name avatar'
        }
      })

    if (!user) {
      throw createError(404, 'Usuario no encontrado')
    }

    return { history: user.watchHistory }
  }

  async clearWatchHistory(userId) {
    const user = await User.findById(userId)
    if (!user) {
      throw createError(404, 'Usuario no encontrado')
    }

    user.watchHistory = []
    await user.save()
    await cache.del(`user:${userId}`)

    return { message: 'Historial limpiado exitosamente' }
  }

  async getUserStats(userId) {
    const [user, progress] = await Promise.all([
      User.findById(userId),
      Progress.getUserProgress(userId)
    ])

    if (!user) {
      throw createError(404, 'Usuario no encontrado')
    }

    return {
      stats: {
        ...user.stats.toObject(),
        ...progress
      }
    }
  }

  async generateCertificate(userId, videoId) {
    const progress = await Progress.findOne({
      user: userId,
      video: videoId,
      completed: true
    }).populate('video')

    if (!progress) {
      throw createError(400, 'Debes completar el video para obtener el certificado')
    }

    const user = await User.findById(userId)
    const certificateData = {
      userName: user.name,
      courseName: progress.video.titulo,
      completionDate: progress.updatedAt,
      userId: user._id,
      videoId: videoId
    }

    const pdfBuffer = await generatePDF(certificateData, 'certificate')
    const certificateUrl = await uploadToS3(pdfBuffer, 'certificates')

    // Notificar al usuario
    notificationService.notifyNewCertificate(user, progress.video)

    return { certificateUrl }
  }

  async getProgress(userId, videoId) {
    const progress = await Progress.findOne({
      user: userId,
      video: videoId
    })

    return { progress: progress || null }
  }

  async updateNotes(userId, videoId, notes) {
    let progress = await Progress.findOne({
      user: userId,
      video: videoId
    })

    if (!progress) {
      throw createError(404, 'Progreso no encontrado')
    }

    progress.notes.push(notes)
    await progress.save()

    return { notes: progress.notes }
  }

  async getRecommendations(userId) {
    const user = await User.findById(userId)
    if (!user) {
      throw createError(404, 'Usuario no encontrado')
    }

    const recommendations = await user.getRecommendations()
    return { recommendations }
  }

  async toggleFavorite(userId, videoId) {
    const user = await User.findById(userId)
    if (!user) {
      throw createError(404, 'Usuario no encontrado')
    }

    const isFavorite = user.favorites.includes(videoId)
    
    if (isFavorite) {
      user.favorites = user.favorites.filter(id => id.toString() !== videoId.toString())
    } else {
      user.favorites.push(videoId)
    }

    await user.save()
    await cache.del(`user:${userId}`)

    return {
      message: isFavorite ? 'Eliminado de favoritos' : 'Añadido a favoritos',
      isFavorite: !isFavorite
    }
  }

  async updateProgress(userId, videoId, progressData) {
    let userProgress = await Progress.findOne({
      user: userId,
      video: videoId
    })

    if (!userProgress) {
      userProgress = new Progress({
        user: userId,
        video: videoId
      })
    }

    await userProgress.updateProgress(progressData.currentTime, progressData.duration)
    
    // Actualizar caché del usuario
    await cache.del(`user:${userId}`)

    return { progress: userProgress }
  }
}

export const userService = new UserService()
      .populate({
        path: 'watchHistory.video',
        populate: {
          path: 'categoria instructor',
          select: 'nombre color name avatar'
        }
      })

    if (!user) {
      throw createError(404, 'Usuario no encontrado')
    }

    const progress = await Progress.getUserProgress(userId)
    
    const result = { user, progress }
    await cache.set(cacheKey, result, 300) // 5 minutos

    return result
  }

  async updateProfile(userId, profileData) {
    const user = await User.findById(userId)

    if (!user) {
      throw createError(404, 'Usuario no encontrado')
    }

    const { name, avatar, currentPassword, newPassword } = profileData

    // Actualizar datos básicos
    if (name) user.name = name

    // Actualizar avatar
    if (avatar) {
      if (user.avatar && !user.avatar.includes('placeholder')) {
        await deleteFromS3(user.avatar)
      }
      const avatarUrl = await uploadToS3(avatar, 'avatars')
      user.avatar = avatarUrl
    }

    // Actualizar contraseña
    if (currentPassword && newPassword) {
      const isPasswordValid = await user.comparePassword(currentPassword)
      if (!isPasswordValid) {
        throw createError(400, 'Contraseña actual incorrecta')
      }
      user.password = newPassword
    }

    await user.save()
    await cache.del(`user:${userId}`)

    return {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar
      }
    }
  }

  async getFavorites(userId) {
    const user = await User.findById(userId)
      .populate({
        path: 'favorites',
        populate: {
          path: 'categoria instructor',
          select: 'nombre color name avatar'
        }
      })

    