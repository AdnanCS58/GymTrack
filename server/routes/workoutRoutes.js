
const express = require('express')
const router = express.Router()

const {
  createWorkout,
  getWorkouts,
  getWorkoutById,
  updateWorkout,
  deleteWorkout,
} = require('../controllers/workoutController')

const { protect } = require('../middleware/authMiddleware')

// All workout routes require authentication
router.use(protect)

// Create a workout and retrieve all workouts
router.route('/')
  .post(createWorkout)
  .get(getWorkouts)

// Retrieve, update, and delete a specific workout
router.route('/:id')
  .get(getWorkoutById)
  .put(updateWorkout)
  .delete(deleteWorkout)

module.exports = router
