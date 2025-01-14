import Category from '../models/Category'
import Video from '../models/Video'
import { createError } from '../utils/errorHandler'
import { cache } from '../utils/cache'

class CategoryService {
  async getCategories(filters = {}) {
    const { activa, sort = 'orden', order = 'asc' } = filters
    const cacheKey = `categories:${JSON.stringify(filters)}`

    // Intentar obtener del cache
    const cached = await cache.get(cacheKey)
    if (cached) return cached

    const query = {}
    if (activa !== undefined) {
      query.activa = activa === 'true'
    }

    const sortOptions = {}
    sortOptions[sort] = order === 'desc' ? -1 : 1

    const categories = await Category.find(query)
      .sort(sortOptions)
      .populate('videos')

    // Actualizar estadísticas
    await Promise.all(categories.map(cat => cat.updateStats()))

    // Guardar en cache
    await cache.set(cacheKey, { categories }, 300) // 5 minutos

    return { categories }
  }

  async getCategoryById(categoryId) {
    const cacheKey = `category:${categoryId}`
    const cached = await cache.get(cacheKey)
    if (cached) return cached

    const category = await Category.findById(categoryId)
      .populate({
        path: 'videos',
        populate: {
          path: 'instructor',
          select: 'name avatar'
        }
      })

    if (!category) {
      throw createError(404, 'Categoría no encontrada')
    }

    await category.updateStats()
    await cache.set(cacheKey, { category }, 300)

    return { category }
  }

  async createCategory(categoryData) {
    const existingCategory = await Category.findOne({
      $or: [
        { nombre: categoryData.nombre },
        { slug: categoryData.nombre.toLowerCase().replace(/[^a-z0-9]+/g, '-') }
      ]
    })

    if (existingCategory) {
      throw createError(400, 'Ya existe una categoría con ese nombre')
    }

    const category = new Category(categoryData)
    await category.save()

    // Invalidar cache de categorías
    await cache.del('categories:*')

    return { category }
  }

  async updateCategory(categoryId, categoryData) {
    const category = await Category.findById(categoryId)

    if (!category) {
      throw createError(404, 'Categoría no encontrada')
    }

    if (categoryData.nombre !== category.nombre) {
      const existingCategory = await Category.findOne({
        nombre: categoryData.nombre,
        _id: { $ne: categoryId }
      })

      if (existingCategory) {
        throw createError(400, 'Ya existe una categoría con ese nombre')
      }
    }

    Object.assign(category, categoryData)
    await category.save()

    // Invalidar cache
    await cache.del(`category:${categoryId}`)
    await cache.del('categories:*')

    return { category }
  }

  async deleteCategory(categoryId) {
    const category = await Category.findById(categoryId)

    if (!category) {
      throw createError(404, 'Categoría no encontrada')
    }

    // Verificar si hay videos asociados
    const videosCount = await Video.countDocuments({ categoria: categoryId })
    if (videosCount > 0) {
      throw createError(400, 'No se puede eliminar una categoría con videos asociados')
    }

    await category.remove()

    // Invalidar cache
    await cache.del(`category:${categoryId}`)
    await cache.del('categories:*')

    return { message: 'Categoría eliminada exitosamente' }
  }

  async updateCategoryOrder(orderedIds) {
    await Promise.all(
      orderedIds.map((id, index) => 
        Category.findByIdAndUpdate(id, { orden: index })
      )
    )

    // Invalidar cache de categorías
    await cache.del('categories:*')

    return { message: 'Orden actualizado exitosamente' }
  }

  async getPopularCategories() {
    const cacheKey = 'categories:popular'
    const cached = await cache.get(cacheKey)
    if (cached) return cached

    const popularCategories = await Category.getPopularCategories()
    await cache.set(cacheKey, { categories: popularCategories }, 3600) // 1 hora

    return { categories: popularCategories }
  }

  async addSubcategory(categoryId, subcategoryData) {
    const category = await Category.findById(categoryId)

    if (!category) {
      throw createError(404, 'Categoría no encontrada')
    }

    if (category.subcategorias.some(sub => sub.nombre === subcategoryData.nombre)) {
      throw createError(400, 'Ya existe una subcategoría con ese nombre')
    }

    category.subcategorias.push(subcategoryData)
    await category.save()

    // Invalidar cache
    await cache.del(`category:${categoryId}`)
    await cache.del('categories:*')

    return { category }
  }

  async getCategoryStats() {
    const stats = await Category.aggregate([
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
          totalVideos: { $size: '$videos' },
          totalViews: { $sum: '$videos.stats.views' },
          averageRating: { $avg: '$videos.stats.averageRating' }
        }
      }
    ])

    return { stats }
  }
}

export const categoryService = new CategoryService()