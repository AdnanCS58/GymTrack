
const mongoose = require('mongoose')

const bodyMeasurementSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    date: {
      type: Date,
      required: true,
      default: Date.now,
    },
    weight: {
      type: Number,
      min: 1,
      required: true,
    },
    chest: {
      type: Number,
      min: 0,
      default: null,
    },
    arm: {
      type: Number,
      min: 0,
      default: null,
    },
    waist: {
      type: Number,
      min: 0,
      default: null,
    },
    shoulder: {
      type: Number,
      min: 0,
      default: null,
    },
    thigh: {
      type: Number,
      min: 0,
      default: null,
    },
    notes: {
      type: String,
      trim: true,
      maxlength: 500,
      default: '',
    },
  },
  { timestamps: true }
)

bodyMeasurementSchema.index({ user: 1, date: -1 })

module.exports = mongoose.model(
  'BodyMeasurement',
  bodyMeasurementSchema
)
