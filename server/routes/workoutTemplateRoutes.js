const express = require('express')
const router = express.Router()

const {
  createTemplate,
  getTemplates,
  getTemplateById,
  updateTemplate,
  deleteTemplate,
} = require('../controllers/workoutTemplateController')

const { protect } = require('../middleware/authMiddleware')

// All template routes require authentication
router.use(protect)

// Create and retrieve templates
router.route('/')
  .post(createTemplate)
  .get(getTemplates)

// Retrieve, update, and delete a specific template
router.route('/:id')
  .get(getTemplateById)
  .put(updateTemplate)
  .delete(deleteTemplate)

module.exports = router