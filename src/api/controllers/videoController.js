import Video from '@api/models/Video'
import User from '@api/models/User'
import Category from '@api/models/Category'
import { createError } from '@api/middleware/errorHandler'
import { validateVideoData } from '@api/utils/validators'

export const getVideos = async (req, res, next) => {
  try {
    const {
      categoria,
      nivel,
      duracion,
      search,
      sort = 'createdAt',
      order = 'desc',
      page = 1,
      limit = 10
    } = req.query

    const query = {}

    if (categoria) query.categoria = categoria
    if (nivel) query.nivel = nivel
    if (duracion) {
      const [min, max] = duracion.split('-')
      query.duracion = { $gte: min, $lte: max || 999 }
    }
    if (search) {
      query.$text = { $search: search }
    }

    const skip = (page - 1) * limit
    const sortOptions = {}
    sortOptions[sort] = order === 'desc' ? -1 : 1

    const videos = await Video.find(query)
      .populate('categoria')
      .populate('instructor', 'name avatar')
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit))

    const total = await Video.countDocuments(query)

    res.status(200).json({
      videos,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        currentPage: parseInt(page),
        limit: parseInt(limit)
      }
    })
  } catch (error) {
    next(error)
  }
}

export const getVideo = async (req, res, next) => {
  try {
    const video = await Video.findById(req.params.id)
      .populate('categoria')
      .populate('instructor', 'name avatar')
      .populate('ratings.user', 'name avatar')

    if (!video) {
      throw createError(404, 'Video no encontrado')
    }

    await video.incrementViews()

    if (req.user) {
      const user = await User.findById(req.user.userId)
      const historyIndex = user.watchHistory.findIndex(
        h => h.video.toString() === video._id.toString()
      )

      if (historyIndex === -1) {
        user.watchHistory.unshift({
          video: video._id,
          lastWatched: new Date()
        })
      } else {
        user.watchHistory[historyIndex].lastWatched = new Date()
      }

      await user.save()
    }

    const relatedVideos = await video.getRelatedVideos()
    res.status(200).json({ video, relatedVideos })
  } catch (error) {
    next(error)
  }
}

export const createVideo = async (req, res, next) => {
  try {
    const videoData = req.body
    const validatedData = await validateVideoData(videoData)

    const categoria = await Category.findById(validatedData.categoria)
    if (!categoria) {
      throw createError(400, 'Categoría no válida')
    }

    const video = new Video({
      ...validatedData,
      instructor: req.user.userId
    })

    await video.save()
    await categoria.updateStats()

    res.status(201).json({
      message: 'Video creado exitosamente',
      video
    })
  } catch (error) {
    next(error)
  }
}

export const updateVideo = async (req, res, next) => {
  try {
    const videoData = req.body
    const video = await Video.findById(req.params.id)

    if (!video) {
      throw createError(404, 'Video no encontrado')
    }

    if (video.instructor.toString() !== req.user.userId && req.user.role !== 'admin') {
      throw createError(403, 'No tienes permiso para editar este video')
    }

    const validatedData = await validateVideoData(videoData)
    Object.assign(video, validatedData)
    await video.save()

    res.status(200).json({
      message: 'Video actualizado exitosamente',
      video
    })
  } catch (error) {
    next(error)
  }
}

export const deleteVideo = async (req, res, next) => {
  try {
    const video = await Video.findById(req.params.id)

    if (!video) {
      throw createError(404, 'Video no encontrado')
    }

    if (video.instructor.toString() !== req.user.userId && req.user.role !== 'admin') {
      throw createError(403, 'No tienes permiso para eliminar este video')
    }

    await video.remove()

    const categoria = await Category.findById(video.categoria)
    if (categoria) {
      await categoria.updateStats()
    }

    res.status(200).json({
      message: 'Video eliminado exitosamente'
    })
  } catch (error) {
    next(error)
  }
}

export const rateVideo = async (req, res, next) => {
  try {
    const { rating, comment } = req.body
    const video = await Video.findById(req.params.id)

    if (!video) {
      throw createError(404, 'Video no encontrado')
    }

    const existingRating = video.ratings.find(r => r.user.toString() === req.user.userId)

    if (existingRating) {
      existingRating.rating = rating
      existingRating.comment = comment
    } else {
      video.ratings.push({
        user: req.user.userId,
        rating,
        comment
      })
    }

    await video.updateRatingStats()

    res.status(200).json({
      message: 'Calificación registrada exitosamente',
      video
    })
  } catch (error) {
    next(error)
  }
}

export const updateProgress = async (req, res, next) => {
  try {
    const { progress } = req.body
    const video = await Video.findById(req.params.id)

    if (!video) {
      throw createError(404, 'Video no encontrado')
    }

    const user = await User.findById(req.user.userId)
    const historyIndex = user.watchHistory.findIndex(
      h => h.video.toString() === video._id.toString()
    )

    if (historyIndex === -1) {
      user.watchHistory.unshift({
        video: video._id,
        progress,
        lastWatched: new Date()
      })
    } else {
      user.watchHistory[historyIndex].progress = progress
      user.watchHistory[historyIndex].lastWatched = new Date()
    }

    if (progress === 100 && (!historyIndex || user.watchHistory[historyIndex].progress !== 100)) {
      await video.registerCompletion(user._id)
    }

    await user.save()

    res.status(200).json({
      message: 'Progreso actualizado exitosamente',
      progress
    })
  } catch (error) {
    next(error)
  }
}

export const getRelatedVideos = async (req, res, next) => {
  try {
    const video = await Video.findById(req.params.id)
    if (!video) {
      throw createError(404, 'Video no encontrado')
    }

    const relatedVideos = await video.getRelatedVideos()
    res.status(200).json({ videos: relatedVideos })
  } catch (error) {
    next(error)
  }
}

export const getRecommendations = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.userId)
    const recommendations = await user.getRecommendations()

    res.status(200).json({ videos: recommendations })
  } catch (error) {
    next(error)
  }
}

export const toggleFavorite = async (req, res, next) => {
  try {
    const video = await Video.findById(req.params.id)
    if (!video) {
      throw createError(404, 'Video no encontrado')
    }

    const user = await User.findById(req.user.userId)
    const isFavorite = user.favorites.includes(video._id)

    if (isFavorite) {
      user.favorites = user.favorites.filter(id => id.toString() !== video._id.toString())
    } else {
      user.favorites.push(video._id)
    }

    await user.save()

    res.status(200).json({
      message: isFavorite ? 'Eliminado de favoritos' : 'Añadido a favoritos',
      isFavorite: !isFavorite
    })
  } catch (error) {
    next(error)
  }
}

export default {
  getVideos,
  getVideo,
  createVideo,
  updateVideo,
  deleteVideo,
  rateVideo,
  updateProgress,
  getRelatedVideos,
  getRecommendations,
  toggleFavorite
}
