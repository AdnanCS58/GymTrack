
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Dumbbell, User, Mail, Lock } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import ThemeToggle from '../components/common/ThemeToggle'

const Register = () => {
  const navigate = useNavigate()
  const { register } = useAuth()

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  })

  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }

    setLoading(true)

    try {
      await register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
      })

      navigate('/dashboard')
    } catch (err) {
      setError(
        err.response?.data?.message ||
        'Registration failed. Please try again.'
      )
    } finally {
      setLoading(false)
    }
  }

  const inputClass = "w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#101713] text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500"

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#101713] flex items-center justify-center p-5 transition-colors">

      <div className="w-full max-w-md">

        <div className="flex justify-end mb-5">
          <ThemeToggle />
        </div>

        <div className="bg-white dark:bg-[#19251F] border border-gray-200 dark:border-gray-800 rounded-3xl p-8 shadow-xl">

          <div className="flex flex-col items-center mb-7">

            <div className="bg-emerald-500/10 p-4 rounded-2xl mb-4">
              <Dumbbell size={36} className="text-emerald-500" />
            </div>

            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Gym<span className="text-emerald-500">Track</span>
            </h1>

            <p className="text-gray-500 dark:text-gray-400 mt-2 text-sm">
              Start tracking your fitness journey.
            </p>

          </div>

          <form onSubmit={handleSubmit} className="space-y-4">

            <div className="relative">
              <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />

              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Full Name"
                maxLength={60}
                required
                className={inputClass}
              />
            </div>

            <div className="relative">
              <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />

              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Email Address"
                required
                className={inputClass}
              />
            </div>

            <div className="relative">
              <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />

              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Password (minimum 8 characters)"
                minLength={8}
                required
                className={inputClass}
              />
            </div>

            <div className="relative">
              <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />

              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm Password"
                minLength={8}
                required
                className={inputClass}
              />
            </div>

            {error && (
              <p className="text-red-500 text-sm bg-red-500/10 p-3 rounded-lg">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:opacity-60 text-white font-semibold py-3 rounded-xl transition"
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </button>

          </form>

          <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-emerald-500 font-semibold hover:underline">
              Sign In
            </Link>
          </p>

        </div>

      </div>
    </div>
  )
}

export default Register
