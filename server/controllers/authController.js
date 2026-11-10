const User = require('../models/User')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const fs = require('fs')
const path = require('path')

// Generate JWT
const generateToken = (id) => {
  return jwt.sign(
    { id },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  )
}

// Register user
const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields',
      })
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email',
      })
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 8 characters',
      })
    }

    const normalizedEmail = email.toLowerCase().trim()

    const existingUser = await User.findOne({
      email: normalizedEmail,
    })

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'Email already registered',
      })
    }

    const hashedPassword = await bcrypt.hash(password, 12)

    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
    })

    const token = generateToken(user._id)

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

// Login user
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password',
      })
    }

    const user = await User.findOne({
      email: email.toLowerCase().trim(),
    }).select('+password')

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      })
    }

    const token = generateToken(user._id)

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

// Get logged-in user
const getMe = async (req, res) => {
  res.status(200).json({
    success: true,
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      profilePicture: req.user.profilePicture,
      phone: req.user.phone,
      dateOfBirth: req.user.dateOfBirth,
      gender: req.user.gender,
      bio: req.user.bio,
      profile: req.user.profile,
      theme: req.user.theme,
    },
  })
}

// Update profile
const updateProfile = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      dateOfBirth,
      gender,
      bio,
      height,
      currentWeight,
      targetWeight,
    } = req.body

    const updates = {}

    if (name !== undefined) {
      if (
        typeof name !== 'string' ||
        !name.trim() ||
        name.trim().length > 60
      ) {
        return res.status(400).json({
          success: false,
          message: 'Name must be between 1 and 60 characters',
        })
      }

      updates.name = name.trim()
    }

    if (email !== undefined) {
      if (typeof email !== 'string') {
        return res.status(400).json({
          success: false,
          message: 'Please provide a valid email',
        })
      }

      const normalizedEmail = email.toLowerCase().trim()

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
        return res.status(400).json({
          success: false,
          message: 'Please provide a valid email',
        })
      }

      const existingUser = await User.findOne({
        email: normalizedEmail,
        _id: { $ne: req.user._id },
      })

      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: 'Email is already being used',
        })
      }

      updates.email = normalizedEmail
    }

    if (phone !== undefined) {
      updates.phone = String(phone).trim()
    }

    if (dateOfBirth !== undefined) {
      updates.dateOfBirth = dateOfBirth || null
    }

    if (gender !== undefined) {
      updates.gender = gender
    }

    if (bio !== undefined) {
      updates.bio = String(bio).trim()
    }

    const fitnessFields = {
      height,
      currentWeight,
      targetWeight,
    }

    for (const [key, value] of Object.entries(fitnessFields)) {
      if (value !== undefined) {
        const numberValue =
          value === '' || value === null ? null : Number(value)

        if (
          numberValue !== null &&
          (!Number.isFinite(numberValue) || numberValue <= 0)
        ) {
          return res.status(400).json({
            success: false,
            message: `Invalid value for ${key}`,
          })
        }

        updates[`profile.${key}`] = numberValue
      }
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updates },
      {
        new: true,
        runValidators: true,
      }
    )

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      })
    }

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        profilePicture: user.profilePicture,
        phone: user.phone,
        dateOfBirth: user.dateOfBirth,
        gender: user.gender,
        bio: user.bio,
        profile: user.profile,
        theme: user.theme,
      },
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

// Upload profile picture
const uploadProfilePicture = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please select an image to upload',
      })
    }

    const user = await User.findById(req.user._id)

    if (!user) {
      fs.unlinkSync(req.file.path)

      return res.status(404).json({
        success: false,
        message: 'User not found',
      })
    }

    const oldPicture = user.profilePicture

    const newPicture = `/uploads/profiles/${req.file.filename}`

    user.profilePicture = newPicture
    await user.save()

    // Delete the previous uploaded picture
    if (oldPicture && oldPicture.startsWith('/uploads/profiles/')) {
      const oldFilename = path.basename(oldPicture)

      const oldPicturePath = path.join(
        __dirname,
        '..',
        'uploads',
        'profiles',
        oldFilename
      )

      if (fs.existsSync(oldPicturePath)) {
        fs.unlink(oldPicturePath, (error) => {
          if (error) {
            console.error('Failed to delete old profile picture:', error)
          }
        })
      }
    }

    res.status(200).json({
      success: true,
      message: 'Profile picture updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        profilePicture: user.profilePicture,
        phone: user.phone,
        dateOfBirth: user.dateOfBirth,
        gender: user.gender,
        bio: user.bio,
        profile: user.profile,
        theme: user.theme,
      },
    })
  } catch (error) {
    // Remove newly uploaded file if saving fails
    if (req.file?.path && fs.existsSync(req.file.path)) {
      fs.unlink(req.file.path, () => {})
    }

    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

// Change password
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both current and new passwords',
      })
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 8 characters',
      })
    }

    const user = await User.findById(req.user._id).select('+password')

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      })
    }

    const isMatch = await bcrypt.compare(
      currentPassword,
      user.password
    )

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect',
      })
    }

    const samePassword = await bcrypt.compare(
      newPassword,
      user.password
    )

    if (samePassword) {
      return res.status(400).json({
        success: false,
        message: 'New password must be different from current password',
      })
    }

    user.password = await bcrypt.hash(newPassword, 12)
    await user.save()

    res.status(200).json({
      success: true,
      message: 'Password changed successfully',
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

module.exports = {
  registerUser,
  loginUser,
  getMe,
  updateProfile,
  uploadProfilePicture,
  changePassword,
}