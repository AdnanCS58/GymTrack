const mongoose = require('mongoose')

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 60,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
      select: false,
    },

    profilePicture: {
      type: String,
      default: '',
    },

    phone: {
      type: String,
      trim: true,
      default: '',
    },

    dateOfBirth: {
      type: Date,
      default: null,
    },

    gender: {
      type: String,
      enum: ['Male', 'Female', 'Other', 'Prefer not to say', ''],
      default: '',
    },

    bio: {
      type: String,
      trim: true,
      maxlength: 250,
      default: '',
    },

    profile: {
      height: {
        type: Number,
        default: null,
      },

      currentWeight: {
        type: Number,
        default: null,
      },

      targetWeight: {
        type: Number,
        default: null,
      },
    },

    theme: {
      type: String,
      enum: ['dark', 'light'],
      default: 'dark',
    },
  },
  {
    timestamps: true,
  }
)

module.exports = mongoose.model('User', userSchema)