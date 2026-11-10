
const Workout = require('../models/Workout')

// @desc    Create a workout
// @route   POST /api/workouts
// @access  Private
const createWorkout = async (req, res) => {
    try {
        const { date, exercises, duration, notes } = req.body

        console.log('Received workout body:', JSON.stringify(req.body, null, 2))
        console.log('Received exercises:', JSON.stringify(exercises, null, 2))

        if (!Array.isArray(exercises) || exercises.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Please add at least one exercise',
            })
        }

        const workout = await Workout.create({
            user: req.user._id,
            date: date || new Date(),
            exercises,
            duration: duration || 0,
            notes: notes || '',
        })

        res.status(201).json({
            success: true,
            message: 'Workout saved successfully',
            workout,
        })
    } catch (error) {
        console.error('CREATE WORKOUT ERROR:', error)
        res.status(400).json({
            success: false,
            message: error.message,
        })
    }
}

// @desc    Get all workouts
// @route   GET /api/workouts
// @access  Private
const getWorkouts = async (req, res) => {
    try {
        const workouts = await Workout.find({
            user: req.user._id,
        }).sort({ date: -1 })

        res.status(200).json({
            success: true,
            count: workouts.length,
            workouts,
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        })
    }
}

// @desc    Get a single workout
// @route   GET /api/workouts/:id
// @access  Private
const getWorkoutById = async (req, res) => {
    try {
        const workout = await Workout.findOne({
            _id: req.params.id,
            user: req.user._id,
        })

        if (!workout) {
            return res.status(404).json({
                success: false,
                message: 'Workout not found',
            })
        }

        res.status(200).json({
            success: true,
            workout,
        })
    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'Invalid workout ID',
        })
    }
}

// @desc    Update a workout
// @route   PUT /api/workouts/:id
// @access  Private
const updateWorkout = async (req, res) => {
    try {
        const { date, exercises, duration, notes } = req.body

        if (!Array.isArray(exercises) || exercises.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'A workout must contain at least one exercise',
            })
        }

        const workout = await Workout.findOne({
            _id: req.params.id,
            user: req.user._id,
        })

        if (!workout) {
            return res.status(404).json({
                success: false,
                message: 'Workout not found',
            })
        }

        workout.date = date || workout.date
        workout.exercises = exercises
        workout.duration = duration ?? 0
        workout.notes = notes ?? ''

        const updatedWorkout = await workout.save()

        res.status(200).json({
            success: true,
            message: 'Workout updated successfully',
            workout: updatedWorkout,
        })
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message,
        })
    }
}

// @desc    Delete a workout
// @route   DELETE /api/workouts/:id
// @access  Private
const deleteWorkout = async (req, res) => {
    try {
        const workout = await Workout.findOneAndDelete({
            _id: req.params.id,
            user: req.user._id,
        })

        if (!workout) {
            return res.status(404).json({
                success: false,
                message: 'Workout not found',
            })
        }

        res.status(200).json({
            success: true,
            message: 'Workout deleted successfully',
        })
    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'Invalid workout ID',
        })
    }
}

module.exports = {
    createWorkout,
    getWorkouts,
    getWorkoutById,
    updateWorkout,
    deleteWorkout,
}
