const multer = require('multer')
const path = require('path')
const fs = require('fs')
const crypto = require('crypto')

// Upload directory
const uploadDirectory = path.join(
  __dirname,
  '..',
  'uploads',
  'profiles'
)

// Create directory if it doesn't exist
fs.mkdirSync(uploadDirectory, { recursive: true })

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDirectory)
  },

  filename: (req, file, cb) => {
    const extension = path.extname(file.originalname).toLowerCase()
    const uniqueName = `${Date.now()}-${crypto.randomBytes(8).toString('hex')}${extension}`

    cb(null, uniqueName)
  },
})

// Allowed image formats
const allowedMimeTypes = [
  'image/jpeg',
  'image/png',
  'image/webp',
]

const allowedExtensions = [
  '.jpg',
  '.jpeg',
  '.png',
  '.webp',
  '.jfif',
]

// File filter
const fileFilter = (req, file, cb) => {
  const extension = path.extname(file.originalname).toLowerCase()

  const isValid =
    allowedMimeTypes.includes(file.mimetype) &&
    allowedExtensions.includes(extension)

  if (isValid) {
    cb(null, true)
  } else {
    cb(new Error('Only JPG, JPEG, PNG and WEBP images are allowed.'))
  }
}

// Multer configuration
const uploadProfilePicture = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 2 * 1024 * 1024,
  },
})

module.exports = uploadProfilePicture