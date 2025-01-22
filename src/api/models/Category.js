import mongoose from 'mongoose'

const categorySchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  descripcion: {
    type: String,
    required: true,
    trim: true
  },
  color: {
    type: String,
    required: true,
    match: [/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Por favor ingrese un color hexadecimal válido']
  },
  codigoSeguridad: {
    type: String,
    required: true,
    unique: true
  },
  icon: {
    type: String,
    default: 'CategoryIcon'
  },
  slug: {
    type: String,
    unique: true
  },
  stats: {
    totalVideos: {
      type: Number,
      default: 0
    },
    totalViews: {
      type: Number,
      default: 0
    },
    completionRate: {
      type: Number,
      default: 0
    }
  },
  orden: {
    type: Number,
    default: 0
  },
  activa: {
    type: Boolean,
    default: true
  },
  subcategorias: [{
    nombre: {
      type: String,
      required: true,
      trim: true
    },
    descripcion: String,
    activa: {
      type: Boolean,
      default: true
    }
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
})

// Middleware para generar slug antes de guardar
categorySchema.pre('save', function(next) {
  if (this.isModified('nombre')) {
    this.slug = this.nombre
      .toLowerCase()
      .replace(/[^a-zA-Z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
  }
  next()
})

// Virtual para obtener videos de la categoría
categorySchema.virtual('videos', {
  ref: 'Video',
  localField: '_id',
  foreignField: 'categoria'
})

// Método para actualizar estadísticas
categorySchema.methods.updateStats = async function() {
  await this.populate('videos')
  
  this.stats.totalVideos = this.videos.length
  
  const totalViews = this.videos.reduce((sum, video) => sum + video.stats.views, 0)
  this.stats.totalViews = totalViews
  
  const completedVideos = this.videos.reduce((sum, video) => sum + video.stats.completions, 0)
  const totalPossibleCompletions = this.videos.reduce((sum, video) => sum + video.stats.views, 0)
  this.stats.completionRate = totalPossibleCompletions > 0 
    ? (completedVideos / totalPossibleCompletions) * 100 
    : 0

  await this.save()
}

// Método para obtener categorías populares
categorySchema.statics.getPopularCategories = async function() {
  return this.aggregate([
    {
      $lookup: {
        from: 'videos',
        localField: '_id',
        foreignField: 'categoria',
        as: 'videos'
      }
    },
    {
      $project: {
        nombre: 1,
        descripcion: 1,
        color: 1,
        totalViews: { $sum: '$videos.stats.views' }
      }
    },
    { $sort: { totalViews: -1 } },
    { $limit: 5 }
  ])
}

const Category = mongoose.model('Category', categorySchema)

export default Category