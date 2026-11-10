
const Workout = require('../models/Workout')

// @desc    Get workout analytics for logged-in user
// @route   GET /api/analytics
// @access  Private
const getWorkoutAnalytics = async (req, res) => {
  try {
    const workouts = await Workout.find({
      user: req.user._id,
    }).sort({ date: 1 })

    const now = new Date()

    // Convert a date to YYYY-MM-DD using UTC
    const getDateKey = (date) => {
      return new Date(date).toISOString().slice(0, 10)
    }

    // Get Monday of the current UTC week
    const today = new Date(
      Date.UTC(
        now.getUTCFullYear(),
        now.getUTCMonth(),
        now.getUTCDate()
      )
    )

    const dayOfWeek = today.getUTCDay()
    const daysFromMonday = (dayOfWeek + 6) % 7

    const weekStart = new Date(today)
    weekStart.setUTCDate(today.getUTCDate() - daysFromMonday)

    // Prepare the last 7 days
    const weeklyActivity = []

    for (let i = 6; i >= 0; i--) {
      const date = new Date(today)
      date.setUTCDate(today.getUTCDate() - i)

      weeklyActivity.push({
        date: getDateKey(date),
        workouts: 0,
      })
    }

    // Prepare the last 30 days
    const volumeTrend = []

    for (let i = 29; i >= 0; i--) {
      const date = new Date(today)
      date.setUTCDate(today.getUTCDate() - i)

      volumeTrend.push({
        date: getDateKey(date),
        volume: 0,
      })
    }

    const weeklyMap = new Map(
      weeklyActivity.map((item) => [item.date, item])
    )

    const volumeMap = new Map(
      volumeTrend.map((item) => [item.date, item])
    )

    let totalExercises = 0
    let totalVolume = 0
    let totalDuration = 0
    let workoutsThisWeek = 0

    const muscleGroups = {}

    const personalRecords = {}

    workouts.forEach((workout) => {
      const workoutDate = new Date(workout.date)
      const dateKey = getDateKey(workoutDate)

      if (workoutDate >= weekStart && workoutDate <= now) {
        workoutsThisWeek++
      }

      if (weeklyMap.has(dateKey)) {
        weeklyMap.get(dateKey).workouts++
      }

      totalDuration += workout.duration || 0

      workout.exercises.forEach((exercise) => {
        totalExercises++

        const group = exercise.muscleGroup || 'Other'

        if (!muscleGroups[group]) {
          muscleGroups[group] = {
            muscleGroup: group,
            exercises: 0,
            volume: 0,
          }
        }

        muscleGroups[group].exercises++

        exercise.sets.forEach((set) => {
          const reps = Number(set.reps) || 0
          const weight = Number(set.weight) || 0
          const volume = reps * weight

          totalVolume += volume
          muscleGroups[group].volume += volume

          if (volumeMap.has(dateKey)) {
            volumeMap.get(dateKey).volume += volume
          }

          const exerciseName = exercise.name

          if (
            !personalRecords[exerciseName] ||
            weight > personalRecords[exerciseName].weight
          ) {
            personalRecords[exerciseName] = {
              exercise: exerciseName,
              weight,
              reps,
              date: dateKey,
            }
          }
        })
      })
    })

    const averageDuration =
      workouts.length > 0
        ? Math.round(totalDuration / workouts.length)
        : 0

    res.status(200).json({
      success: true,

      overview: {
        totalWorkouts: workouts.length,
        workoutsThisWeek,
        totalExercises,
        totalVolume: Math.round(totalVolume * 100) / 100,
        averageDuration,
      },

      weeklyActivity,

      volumeTrend,

      muscleDistribution: Object.values(muscleGroups).sort(
        (a, b) => b.volume - a.volume
      ),

      personalRecords: Object.values(personalRecords).sort(
        (a, b) => b.weight - a.weight
      ),
    })
  } catch (error) {
    console.error('Analytics Error:', error.message)

    res.status(500).json({
      success: false,
      message: 'Failed to generate workout analytics',
    })
  }
}

module.exports = { getWorkoutAnalytics }
