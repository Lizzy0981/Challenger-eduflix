import Video from '../models/Video'
import Progress from '../models/Progress'
import { createError } from '../middleware/errorHandler'
import { validateVideoURL, getVideoDuration } from '../utils/validators'
import { notificationService } from './notificationService'

class VideoService {
  async getVideos(filters = {}, pagination = {}) {
    const { 
      categoria, 
      nivel, 
      duracion, 
      instructor,
      search 
    } = filters

    const { page = 1, limit = 10 } = pagination
    const query = {}

    if (categoria) query.categoria = categoria
    if (nivel) query.nivel = nivel
    if (instructor) query.instructor = instructor
    if (duracion) {
      const [min, max] = duracion.split('-')
      query.duracion = { $gte: min, $lte: max || 999 }
    }
    if (search) {
      query.$text = { $search: search }
    }

    const skip = (page - 1) * limit

    const videos = await Video.find(query)
      .populate('categoria')
      .populate('instructor', 'name avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))

    const total = await Video.countDocuments(query)

    return {
      videos,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        currentPage: parseInt(page),
        limit: parseInt(limit)
      }
    }
  }

  async getVideoById(videoId, userId = null) {
    const video = await Video.findById(videoId)
      .populate('categoria')
      .populate('instructor', 'name avatar')
      .populate('ratings.user', 'name avatar')

    if (!video) {
      throw createError(404, 'Video no encontrado')
    }

    // Incrementar vistas
    await video.incrementViews()

    // Si hay usuario, obtener su progreso
    let progress = null
    if (userId) {
      progress = await Progress.findOne({
        user: userId,
        video: videoId
      })
    }

    return { video, progress }
  }

  async createVideo(videoData, userId) {
    // Validar URL del video
    if (!await validateVideoURL(videoData.linkVideo)) {
      throw createError(400, 'URL del video inválida')
    }

    // Obtener duración del video
    const duration = await getVideoDuration(videoData.linkVideo)
    if (!duration) {
      throw createError(400, 'No se pudo obtener la duración del video')
    }

    const video = new Video({
      ...videoData,
      instructor: userId,
      duracion: duration
    })

    await video.save()

    // Notificar a seguidores del instructor
    notificationService.notifyNewVideo(video)

    return video
  }

  async updateVideo(videoId, videoData, userId) {
    const video = await Video.findById(videoId)

    if (!video) {
      throw createError(404, 'Video no encontrado')
    }

    // Verificar permisos
    if (video.instructor.toString() !== userId) {
      throw createError(403, 'No tienes permiso para editar este video')
    }

    // Validar nueva URL si se proporciona
    if (videoData.linkVideo && videoData.linkVideo !== video.linkVideo) {
      if (!await validateVideoURL(videoData.linkVideo)) {
        throw createError(400, 'URL del video inválida')
      }
      const duration = await getVideoDuration(videoData.linkVideo)
      if (duration) {
        videoData.duracion = duration
      }
    }

    Object.assign(video, videoData)
    await video.save()

    return video
  }

  async deleteVideo(videoId, userId) {
    const video = await Video.findById(videoId)

    if (!video) {
      throw createError(404, 'Video no encontrado')
    }

    // Verificar permisos
    if (video.instructor.toString() !== userId) {
      throw createError(403, 'No tienes permiso para eliminar este video')
    }

    // Eliminar progreso asociado
    await Progress.deleteMany({ video: videoId })

    await video.remove()

    return { message: 'Video eliminado exitosamente' }
  }

  async rateVideo(videoId, userId, rating, comment = '') {
    const video = await Video.findById(videoId)

    if (!video) {
      throw createError(404, 'Video no encontrado')
    }

    // Verificar si el usuario ya calificó
    const existingRating = video.ratings.find(
      r => r.user.toString() === userId
    )

    if (existingRating) {
      existingRating.rating = rating
      existingRating.comment = comment
    } else {
      video.ratings.push({
        user: userId,
        rating,
        comment
      })
    }

    await video.updateRatingStats()

    // Notificar al instructor
    if (!existingRating) {
      notificationService.notifyNewRating(video, rating)
    }

    return video
  }

  async getRelatedVideos(videoId) {
    const video = await Video.findById(videoId)
    if (!video) {
      throw createError(404, 'Video no encontrado')
    }

    return video.getRelatedVideos()
  }

  async getPopularVideos() {
    return Video.find()
      .sort({ 'stats.views': -1 })
      .limit(10)
      .populate('categoria')
      .populate('instructor', 'name avatar')
  }
}

export const videoService = new VideoService()