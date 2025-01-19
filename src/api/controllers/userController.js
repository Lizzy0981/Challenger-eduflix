import User from '../models/User'
import Progress from '../models/Progress'
import { createError } from '../utils/errorHandler'
import { saveCertificate } from '../services/certificateService'

export const getUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.userId)
      .select('-password')
      .populate({
        path: 'favorites',
        populate: {
          path: 'categoria instructor',
          select: 'nombre color name avatar'
        }
      })
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

    // Obtener progreso general
    const progress = await Progress.getUserProgress(user._id)

    res.status(200).json({
      user,
      progress
    })
  } catch (error) {
    next(error)
  }
}

export const updateProfile = async (req, res, next) => {
  try {
    const { name, avatar, currentPassword, newPassword } = req.body
    const user = await User.findById(req.user.userId)

    if (!user) {
      throw createError(404, 'Usuario no encontrado')
    }

    // Actualizar datos básicos
    if (name) user.name = name
    if (avatar) user.avatar = avatar

    // Actualizar contraseña si se proporciona
    if (currentPassword && newPassword) {
      const isPasswordValid = await user.comparePassword(currentPassword)
      if (!isPasswordValid) {
        throw createError(400, 'Contraseña actual incorrecta')
      }
      user.password = newPassword
    }

    await user.save()

    res.status(200).json({
      message: 'Perfil actualizado exitosamente',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar
      }
    })
  } catch (error) {
    next(error)
  }
}

export const getFavorites = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.userId)
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

    res.status(200).json({ favorites: user.favorites })
  } catch (error) {
    next(error)
  }
}

export const getWatchHistory = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.userId)
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

    res.status(200).json({ history: user.watchHistory })
  } catch (error) {
    next(error)
  }
}

export const clearWatchHistory = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.userId)
    if (!user) {
      throw createError(404, 'Usuario no encontrado')
    }

    user.watchHistory = []
    await user.save()

    res.status(200).json({
      message: 'Historial limpiado exitosamente'
    })
  } catch (error) {
    next(error)
  }
}

export const getUserStats = async (req, res, next) => {
  try {
    const [user, progress] = await Promise.all([
      User.findById(req.user.userId),
      Progress.getUserProgress(req.user.userId)
    ])

    if (!user) {
      throw createError(404, 'Usuario no encontrado')
    }

    res.status(200).json({
      stats: {
        ...user.stats.toObject(),
        ...progress
      }
    })
  } catch (error) {
    next(error)
  }
}

export const generateCertificate = async (req, res, next) => {
  try {
    const { videoId } = req.params
    const progress = await Progress.findOne({
      user: req.user.userId,
      video: videoId,
      completed: true
    }).populate('video')

    if (!progress) {
      throw createError(400, 'Debes completar el video para obtener el certificado')
    }

    const user = await User.findById(req.user.userId)
    const certificateUrl = await saveCertificate({
      userName: user.name,
      courseName: progress.video.titulo,
      completionDate: progress.updatedAt,
      userId: user._id,
      videoId: videoId
    })

    res.status(200).json({
      message: 'Certificado generado exitosamente',
      certificateUrl
    })
  } catch (error) {
    next(error)
  }
}

export const getProgress = async (req, res, next) => {
  try {
    const { videoId } = req.params
    const progress = await Progress.findOne({
      user: req.user.userId,
      video: videoId
    })

    res.status(200).json({ progress: progress || null })
  } catch (error) {
    next(error)
  }
}

export const updateNotes = async (req, res, next) => {
  try {
    const { videoId } = req.params
    const { content, timestamp } = req.body
    
    let progress = await Progress.findOne({
      user: req.user.userId,
      video: videoId
    })

    if (!progress) {
      throw createError(404, 'Progreso no encontrado')
    }

    await progress.addNote(content, timestamp)

    res.status(200).json({
      message: 'Nota añadida exitosamente',
      notes: progress.notes
    })
  } catch (error) {
    next(error)
  }
}

export default {
  getUserProfile,
  updateProfile,
  getFavorites,
  getWatchHistory,
  clearWatchHistory,
  getUserStats,
  generateCertificate,
  getProgress,
  updateNotes
}