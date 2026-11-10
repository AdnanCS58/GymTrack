const WorkoutTemplate = require('../models/WorkoutTemplate')

// @desc    Create a workout template
// @route   POST /api/workout-templates
// @access  Private
const createTemplate = async (req, res) => {
  try {
    const { name, exercises } = req.body

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a template name',
      })
    }

    if (!Array.isArray(exercises) || exercises.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please add at least one exercise',
      })
    }

    const template = await WorkoutTemplate.create({
      user: req.user._id,
      name: name.trim(),
      exercises,
    })

    res.status(201).json({
      success: true,
      message: 'Workout template created successfully',
      template,
    })
  } catch (error) {
    console.error('CREATE TEMPLATE ERROR:', error)

    res.status(400).json({
      success: false,
      message: error.message,
    })
  }
}

// @desc    Get all workout templates
// @route   GET /api/workout-templates
// @access  Private
const getTemplates = async (req, res) => {
  try {
    const templates = await WorkoutTemplate.find({
      user: req.user._id,
    }).sort({ updatedAt: -1 })

    res.status(200).json({
      success: true,
      count: templates.length,
      templates,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

// @desc    Get a single workout template
// @route   GET /api/workout-templates/:id
// @access  Private
const getTemplateById = async (req, res) => {
  try {
    const template = await WorkoutTemplate.findOne({
      _id: req.params.id,
      user: req.user._id,
    })

    if (!template) {
      return res.status(404).json({
        success: false,
        message: 'Workout template not found',
      })
    }

    res.status(200).json({
      success: true,
      template,
    })
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Invalid template ID',
    })
  }
}

// @desc    Update a workout template
// @route   PUT /api/workout-templates/:id
// @access  Private
const updateTemplate = async (req, res) => {
  try {
    const { name, exercises } = req.body

    const template = await WorkoutTemplate.findOne({
      _id: req.params.id,
      user: req.user._id,
    })

    if (!template) {
      return res.status(404).json({
        success: false,
        message: 'Workout template not found',
      })
    }

    if (name !== undefined) {
      if (!name.trim()) {
        return res.status(400).json({
          success: false,
          message: 'Template name cannot be empty',
        })
      }

      template.name = name.trim()
    }

    if (exercises !== undefined) {
      if (!Array.isArray(exercises) || exercises.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'A template must contain at least one exercise',
        })
      }

      template.exercises = exercises
    }

    const updatedTemplate = await template.save()

    res.status(200).json({
      success: true,
      message: 'Workout template updated successfully',
      template: updatedTemplate,
    })
  } catch (error) {
    console.error('UPDATE TEMPLATE ERROR:', error)

    res.status(400).json({
      success: false,
      message: error.message,
    })
  }
}

// @desc    Delete a workout template
// @route   DELETE /api/workout-templates/:id
// @access  Private
const deleteTemplate = async (req, res) => {
  try {
    const template = await WorkoutTemplate.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    })

    if (!template) {
      return res.status(404).json({
        success: false,
        message: 'Workout template not found',
      })
    }

    res.status(200).json({
      success: true,
      message: 'Workout template deleted successfully',
    })
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Invalid template ID',
    })
  }
}

module.exports = {
  createTemplate,
  getTemplates,
  getTemplateById,
  updateTemplate,
  deleteTemplate,
}