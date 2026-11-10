
const express = require('express')
const path = require('path')
const cors = require('cors')
require('dotenv').config()

const connectDB = require('./config/db')
const authRoutes = require('./routes/authRoutes')
const workoutRoutes = require('./routes/workoutRoutes')
const analyticsRoutes = require('./routes/analyticsRoutes')
const bodyMeasurementRoutes = require('./routes/bodyMeasurementRoutes')
const workoutTemplateRoutes = require('./routes/workoutTemplateRoutes')

const app = express()

// Middleware
app.use(cors({
  origin: (origin, callback) => {
    const allowedOrigins = [
      'http://localhost:5173',
      process.env.CLIENT_URL
    ].filter(Boolean)

    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  }
}))

app.use(express.json())

// Serve uploaded profile pictures
app.use(
  '/uploads',
  express.static(path.join(__dirname, 'uploads'))
)

// API Routes
app.use('/api/auth', authRoutes)
app.use('/api/workouts', workoutRoutes)
app.use('/api/analytics', analyticsRoutes)
app.use('/api/body-measurements', bodyMeasurementRoutes)
app.use('/api/workout-templates', workoutTemplateRoutes)

// Home route
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'GymTrack API is running!',
  })
})

// Start server
const PORT = process.env.PORT || 5000

const startServer = async () => {
  try {
    await connectDB()

    app.listen(PORT, () => {
      console.log(`GymTrack server running on port ${PORT}`)
    })
  } catch (error) {
    console.error('Failed to start server:', error)
    process.exit(1)
  }
}

startServer()
