const express = require('express')
const router = express.Router()

const {
  registerUser,
  loginUser,
  getMe,
  updateProfile,
  uploadProfilePicture,
  changePassword,
} = require('../controllers/authController')

const { protect } = require('../middleware/authMiddleware')
const uploadProfilePictureMiddleware = require('../middleware/uploadMiddleware')

// Public routes
router.post('/register', registerUser)
router.post('/login', loginUser)

// Protected routes
router.get('/me', protect, getMe)
router.put('/profile', protect, updateProfile)
router.put('/change-password', protect, changePassword)

router.post(
  '/profile-picture',
  protect,
  uploadProfilePictureMiddleware.single('profilePicture'),
  uploadProfilePicture
)

module.exports = router