
const express = require('express')
const router = express.Router()

const {
  createMeasurement,
  getMeasurements,
} = require('../controllers/bodyMeasurementController')

const { protect } = require('../middleware/authMiddleware')

// All routes require authentication
router.use(protect)

// Create and retrieve body measurements
router.route('/')
  .post(createMeasurement)
  .get(getMeasurements)

module.exports = router
