import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  avatar: {
    type: String,
    default: '/placeholder-avatar.png'
  },
  role: {
    type: String,
    enum: ['user', 'admin', 'instructor'],
    default: 'user'
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  favorites: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Video'
  }],
  watchHistory: [{
    video: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Video'
    },
    lastWatched: {
      type: Date,
      default: Date.now
    },
    progress: {
      type: Number,
      default: 0
    }
  }],
  stats: {
    totalWatchTime: {
      type: Number,
      default: 0
    },
    completedCourses: {
      type: Number,
      default: 0
    },
    currentStreak: {
      type: Number,
      default: 0
    },
    lastActive: {
      type: Date,
      default: Date.now
    }
  }
}, {
  timestamps: true
})

// Middleware pre-save para hashear la contraseña
userSchema.pre('save', async function(next) {
  const user = this
  if (user.isModified('password')) {
    user.password = await bcrypt.hash(user.password, 10)
  }
  next()
})

// Método para comparar contraseñas
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password)
}

// Método para actualizar estadísticas
userSchema.methods.updateStats = async function(videoId, progress) {
  const video = await mongoose.model('Video').findById(videoId)
  if (!video) return

  // Actualizar tiempo total de visualización
  const watchTime = (progress / 100) * video.duracion
  this.stats.totalWatchTime += watchTime

  // Verificar si el curso se completó
  if (progress === 100) {
    this.stats.completedCourses += 1
  }

  // Actualizar racha de actividad
  const today = new Date()
  const lastActive = new Date(this.stats.lastActive)
  const diffDays = Math.floor((today - lastActive) / (1000 * 60 * 60 * 24))

  if (diffDays === 1) {
    this.stats.currentStreak += 1
  } else if (diffDays > 1) {
    this.stats.currentStreak = 1
  }

  this.stats.lastActive = today
  await this.save()
}

// Método para obtener recomendaciones
userSchema.methods.getRecommendations = async function() {
  // Obtener categorías más vistas
  const watchHistory = await this.populate('watchHistory.video')
  const categories = watchHistory.watchHistory.map(h => h.video.categoria)
  const favoriteCat = categories.reduce((acc, curr) => {
    acc[curr] = (acc[curr] || 0) + 1
    return acc
  }, {})

  // Obtener videos recomendados
  const recommendations = await mongoose.model('Video')
    .find({
      categoria: { $in: Object.keys(favoriteCat) },
      _id: { $nin: this.watchHistory.map(h => h.video) }
    })
    .limit(10)

  return recommendations
}

const User = mongoose.model('User', userSchema)

export default User