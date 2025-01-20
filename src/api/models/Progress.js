import mongoose from 'mongoose'

const progressSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  video: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Video',
    required: true
  },
  progress: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  currentTime: {
    type: Number,
    default: 0
  },
  completed: {
    type: Boolean,
    default: false
  },
  lastWatched: {
    type: Date,
    default: Date.now
  },
  timeSpent: {
    type: Number,
    default: 0
  },
  notes: [{
    content: String,
    timestamp: Number,
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  bookmarks: [{
    timestamp: Number,
    label: String,
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  interactions: {
    pauses: {
      type: Number,
      default: 0
    },
    seeks: {
      type: Number,
      default: 0
    },
    rateChanges: {
      type: Number,
      default: 0
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
})

// Índices compuestos
progressSchema.index({ user: 1, video: 1 }, { unique: true })
progressSchema.index({ user: 1, completed: 1 })
progressSchema.index({ video: 1, completed: 1 })

// Método para actualizar progreso
progressSchema.methods.updateProgress = async function(currentTime, duration) {
  const progressPercentage = Math.floor((currentTime / duration) * 100)
  this.progress = progressPercentage
  this.currentTime = currentTime
  this.completed = progressPercentage === 100

  // Calcular tiempo transcurrido desde última actualización
  const timeDiff = (Date.now() - this.lastWatched.getTime()) / 1000
  if (timeDiff > 0 && timeDiff < 3600) { // Ignorar diferencias mayores a 1 hora
    this.timeSpent += timeDiff
  }
  this.lastWatched = new Date()

  await this.save()

  // Si se completó, actualizar estadísticas del usuario y video
  if (this.completed) {
    const Video = mongoose.model('Video')
    const User = mongoose.model('User')

    const [video, user] = await Promise.all([
      Video.findById(this.video),
      User.findById(this.user)
    ])

    if (video) await video.registerCompletion(this.user)
    if (user) await user.updateStats(this.video, 100)
  }
}

// Método para añadir nota
progressSchema.methods.addNote = async function(content, timestamp) {
  this.notes.push({ content, timestamp })
  await this.save()
}

// Método para añadir marcador
progressSchema.methods.addBookmark = async function(timestamp, label) {
  this.bookmarks.push({ timestamp, label })
  await this.save()
}

// Método para registrar interacción
progressSchema.methods.registerInteraction = async function(type) {
  if (this.interactions[type] !== undefined) {
    this.interactions[type] += 1
  }
  await this.save()
}

// Método estático para obtener progreso del usuario
progressSchema.statics.getUserProgress = async function(userId) {
  const progress = await this.aggregate([
    { $match: { user: mongoose.Types.ObjectId(userId) } },
    {
      $group: {
        _id: null,
        totalVideos: { $sum: 1 },
        completedVideos: { 
          $sum: { $cond: ['$completed', 1, 0] }
        },
        averageProgress: { $avg: '$progress' },
        totalTimeSpent: { $sum: '$timeSpent' }
      }
    }
  ])

  return progress[0] || {
    totalVideos: 0,
    completedVideos: 0,
    averageProgress: 0,
    totalTimeSpent: 0
  }
}

// Virtual para calcular velocidad de progreso
progressSchema.virtual('progressRate').get(function() {
  if (!this.timeSpent) return 0
  const hoursSinceStart = (Date.now() - this.createdAt.getTime()) / (1000 * 60 * 60)
  return this.progress / hoursSinceStart
})

const Progress = mongoose.model('Progress', progressSchema)

export default Progress