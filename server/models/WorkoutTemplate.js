const mongoose = require('mongoose')

const templateExerciseSchema = new mongoose.Schema(
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
  },
  { _id: true }
)

const workoutTemplateSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 50,
    },
    exercises: {
      type: [templateExerciseSchema],
      validate: {
        validator: (exercises) => exercises.length > 0,
        message: 'A template must contain at least one exercise',
      },
    },
  },
  { timestamps: true }
)

workoutTemplateSchema.index({ user: 1, name: 1 })

module.exports = mongoose.model('WorkoutTemplate', workoutTemplateSchema)