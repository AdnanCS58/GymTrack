
const BodyMeasurement = require('../models/BodyMeasurement')

// @desc    Create a body measurement record
// @route   POST /api/body-measurements
// @access  Private
const createMeasurement = async (req, res) => {
  try {
    const {
      date,
      weight,
      chest,
      arm,
      waist,
      shoulder,
      thigh,
      notes,
    } = req.body

    if (!weight || Number(weight) <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid body weight',
      })
    }

    const measurement = await BodyMeasurement.create({
      user: req.user._id,
      date: date || new Date(),
      weight: Number(weight),
      chest: chest ?? null,
      arm: arm ?? null,
      waist: waist ?? null,
      shoulder: shoulder ?? null,
      thigh: thigh ?? null,
      notes: notes || '',
    })

    res.status(201).json({
      success: true,
      message: 'Body measurement saved successfully',
      measurement,
    })
  } catch (error) {
    console.error('Create Measurement Error:', error.message)

    res.status(400).json({
      success: false,
      message: error.message,
    })
  }
}

// @desc    Get all body measurement records
// @route   GET /api/body-measurements
// @access  Private
const getMeasurements = async (req, res) => {
  try {
    const measurements = await BodyMeasurement.find({
      user: req.user._id,
    }).sort({ date: -1 })

    res.status(200).json({
      success: true,
      count: measurements.length,
      measurements,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

module.exports = {
  createMeasurement,
  getMeasurements,
}
