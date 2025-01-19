import mongoose from 'mongoose'

const videoSchema = new mongoose.Schema({
  titulo: {
    type: String,
    required: true,
    trim: true
  },
  linkVideo: {
    type: String,
    required: true,
    trim: true
  },
  linkImage: {
    type: String,
    required: true,
    trim: true
  },
  categoria: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true
  },
  descripcion: {
    type: String,
    required: true,
    trim: true
  },
  duracion: {
    type: Number,
    required: true,
    min: 1
  },
  nivel: {
    type: String,
    enum: ['Principiante', 'Intermedio', 'Avanzado'],
    required: true
  },
  instructor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  codigoSeguridad: {
    type: String,
    required: true,
    unique: true
  },
  stats: {
    views: {
      type: Number,
      default: 0
    },
    completions: {
      type: Number,
      default: 0
    },
    averageRating: {
      type: Number,
      default: 0
    },
    totalRatings: {
      type: Number,
      default: 0
    }
  },
  ratings: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },
    comment: String,
    date: {
      type: Date,
      default: Date.now
    }
  }],
  tags: [{
    type: String,
    trim: true
  }],
  requisitos: [{
    type: String,
    trim: true
  }],
  objetivos: [{
    type: String,
    trim: true
  }]
}, {
  timestamps: true
})

// Índices
videoSchema.index({ titulo: 'text', descripcion: 'text', tags: 'text' })

// Método para actualizar estadísticas de calificaciones
videoSchema.methods.updateRatingStats = async function() {
  if (this.ratings.length === 0) {
    this.stats.averageRating = 0
    this.stats.totalRatings = 0
  } else {
    const totalRating = this.ratings.reduce((sum, rating) => sum + rating.rating, 0)
    this.stats.averageRating = totalRating / this.ratings.length
    this.stats.totalRatings = this.ratings.length
  }
  await this.save()
}

// Método para incrementar vistas
videoSchema.methods.incrementViews = async function() {
  this.stats.views += 1
  await this.save()
}

// Método para registrar finalización
videoSchema.methods.registerCompletion = async function(userId) {
  this.stats.completions += 1
  
  // Actualizar estadísticas del usuario
  const User = mongoose.model('User')
  const user = await User.findById(userId)
  if (user) {
    await user.updateStats(this._id, 100)
  }
  
  await this.save()
}

// Método para obtener videos relacionados
videoSchema.methods.getRelatedVideos = async function() {
  return this.model('Video').find({
    categoria: this.categoria,
    _id: { $ne: this._id }
  }).limit(4)
}

const Video = mongoose.model('Video', videoSchema)

export default Video