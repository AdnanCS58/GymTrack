
const mongoose = require('mongoose')

const setSchema = new mongoose.Schema(
  {
    setNumber: {
      type: Number,
      required: true,
      min: 1,
    },
    reps: {
      type: Number,
      required: true,
      min: 1,
    },
    weight: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
  },
  { _id: false }
)

const exerciseSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    muscleGroup: {
      type: String,
      required: true,
      trim: true,
    },
    sets: {
      type: [setSchema],
      validate: {
        validator: (sets) => sets.length > 0,
        message: 'Each exercise must have at least one set',
      },
    },
  },
  { _id: true }
)

const workoutSchema = new mongoose.Schema(
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
    exercises: {
      type: [exerciseSchema],
      validate: {
        validator: (exercises) => exercises.length > 0,
        message: 'A workout must contain at least one exercise',
      },
    },
    duration: {
      type: Number,
      min: 0,
      default: 0,
    },
    notes: {
      type: String,
      trim: true,
      default: '',
    },
  },
  { timestamps: true }
)

workoutSchema.index({ user: 1, date: -1 })

workoutSchema.virtual('totalVolume').get(function () {
  return this.exercises.reduce((total, exercise) => {
    return total + exercise.sets.reduce(
      (sum, set) => sum + set.reps * set.weight,
      0
    )
  }, 0)
})

workoutSchema.set('toJSON', { virtuals: true })
workoutSchema.set('toObject', { virtuals: true })

module.exports = mongoose.model('Workout', workoutSchema)
