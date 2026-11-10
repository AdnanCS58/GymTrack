
const express = require('express')
const router = express.Router()

const { getWorkoutAnalytics } = require('../controllers/analyticsController')
const { protect } = require('../middleware/authMiddleware')

// All analytics routes require authentication
router.use(protect)

// Get workout analytics
router.get('/', getWorkoutAnalytics)

module.exports = router
