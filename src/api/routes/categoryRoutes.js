import express from 'express'
import {
  getCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory,
  updateCategoryOrder,
  getPopularCategories,
  addSubcategory
} from '@api/controllers/categoryController'
import { verifyToken, verifyRole, validationErrorHandler } from '@api/middleware'
import { categorySchema, subcategorySchema } from '@api/utils/validators'

const router = express.Router()

// Rutas públicas
router.get('/', getCategories)
router.get('/popular', getPopularCategories)
router.get('/:id', getCategory)

// Rutas protegidas (solo admin)
router.use(verifyToken, verifyRole('admin'))

router.post('/', validationErrorHandler(categorySchema), createCategory)

router.put('/:id', validationErrorHandler(categorySchema), updateCategory)

router.delete('/:id', deleteCategory)

router.put(
  '/order',
  validationErrorHandler({
    orderedIds: ['string']
  }),
  updateCategoryOrder
)

router.post('/:id/subcategories', validationErrorHandler(subcategorySchema), addSubcategory)

export default router
