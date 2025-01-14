import Category from '../models/Category'
import Video from '../models/Video'
import { createError } from '../utils/errorHandler'
import { validateCategoryData } from '../utils/validators'

export const getCategories = async (req, res, next) => {
  try {
    const { 
      sort = 'orden',
      order = 'asc',
      activa
    } = req.query

    const query = {}
    if (activa !== undefined) {
      query.activa = activa === 'true'
    }

    const sortOptions = {}
    sortOptions[sort] = order === 'desc' ? -1 : 1

    const categories = await Category.find(query)
      .sort(sortOptions)
      .populate('videos')

    // Calcular y actualizar estadísticas
    await Promise.all(categories.map(cat => cat.updateStats()))

    res.status(200).json({ categories })
  } catch (error) {
    next(error)
  }
}

export const getCategory = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id)
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

    res.status(200).json({ category })
  } catch (error) {
    next(error)
  }
}

export const createCategory = async (req, res, next) => {
  try {
    const categoryData = req.body

    // Validar datos
    const validatedData = await validateCategoryData(categoryData)

    // Verificar si ya existe una categoría con el mismo nombre o slug
    const existingCategory = await Category.findOne({
      $or: [
        { nombre: validatedData.nombre },
        { slug: validatedData.nombre.toLowerCase().replace(/[^a-z0-9]+/g, '-') }
      ]
    })

    if (existingCategory) {
      throw createError(400, 'Ya existe una categoría con ese nombre')
    }

    // Crear categoría
    const category = new Category(validatedData)
    await category.save()

    res.status(201).json({
      message: 'Categoría creada exitosamente',
      category
    })
  } catch (error) {
    next(error)
  }
}

export const updateCategory = async (req, res, next) => {
  try {
    const categoryData = req.body
    const category = await Category.findById(req.params.id)

    if (!category) {
      throw createError(404, 'Categoría no encontrada')
    }

    // Solo administradores pueden actualizar categorías
    if (req.user.role !== 'admin') {
      throw createError(403, 'No tienes permiso para editar categorías')
    }

    // Validar datos
    const validatedData = await validateCategoryData(categoryData)

    // Verificar nombre único si se está cambiando
    if (validatedData.nombre !== category.nombre) {
      const existingCategory = await Category.findOne({
        nombre: validatedData.nombre,
        _id: { $ne: category._id }
      })

      if (existingCategory) {
        throw createError(400, 'Ya existe una categoría con ese nombre')
      }
    }

    // Actualizar categoría
    Object.assign(category, validatedData)
    await category.save()

    res.status(200).json({
      message: 'Categoría actualizada exitosamente',
      category
    })
  } catch (error) {
    next(error)
  }
}

export const deleteCategory = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id)

    if (!category) {
      throw createError(404, 'Categoría no encontrada')
    }

    // Solo administradores pueden eliminar categorías
    if (req.user.role !== 'admin') {
      throw createError(403, 'No tienes permiso para eliminar categorías')
    }

    // Verificar si hay videos asociados
    const videosCount = await Video.countDocuments({ categoria: category._id })
    if (videosCount > 0) {
      throw createError(400, 'No se puede eliminar una categoría con videos asociados')
    }

    await category.remove()

    res.status(200).json({
      message: 'Categoría eliminada exitosamente'
    })
  } catch (error) {
    next(error)
  }
}

export const updateCategoryOrder = async (req, res, next) => {
  try {
    const { orderedIds } = req.body

    // Solo administradores pueden reordenar categorías
    if (req.user.role !== 'admin') {
      throw createError(403, 'No tienes permiso para reordenar categorías')
    }

    // Actualizar el orden de cada categoría
    await Promise.all(
      orderedIds.map((id, index) => 
        Category.findByIdAndUpdate(id, { orden: index })
      )
    )

    res.status(200).json({
      message: 'Orden de categorías actualizado exitosamente'
    })
  } catch (error) {
    next(error)
  }
}

export const getPopularCategories = async (req, res, next) => {
  try {
    const popularCategories = await Category.getPopularCategories()
    res.status(200).json({ categories: popularCategories })
  } catch (error) {
    next(error)
  }
}

export const addSubcategory = async (req, res, next) => {
  try {
    const { nombre, descripcion } = req.body
    const category = await Category.findById(req.params.id)

    if (!category) {
      throw createError(404, 'Categoría no encontrada')
    }

    if (req.user.role !== 'admin') {
      throw createError(403, 'No tienes permiso para añadir subcategorías')
    }

    // Verificar si ya existe la subcategoría
    if (category.subcategorias.some(sub => sub.nombre === nombre)) {
      throw createError(400, 'Ya existe una subcategoría con ese nombre')
    }

    category.subcategorias.push({ nombre, descripcion })
    await category.save()

    res.status(200).json({
      message: 'Subcategoría añadida exitosamente',
      category
    })
  } catch (error) {
    next(error)
  }
}

export default {
  getCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory,
  updateCategoryOrder,
  getPopularCategories,
  addSubcategory
}