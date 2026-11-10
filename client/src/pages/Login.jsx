
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Dumbbell, Mail, Lock } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import ThemeToggle from '../components/common/ThemeToggle'

const Login = () => {
  const navigate = useNavigate()
  const { login } = useAuth()

  const [formData, setFormData] = useState({
    email: '',
    password: '',
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
    setLoading(true)

    try {
      await login(formData)
      navigate('/dashboard')
    } catch (err) {
      setError(
        err.response?.data?.message ||
        'Unable to login. Please try again.'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#101713] flex items-center justify-center p-5 transition-colors">

      <div className="w-full max-w-md">

        <div className="flex justify-end mb-5">
          <ThemeToggle />
        </div>

        <div className="bg-white dark:bg-[#19251F] border border-gray-200 dark:border-gray-800 rounded-3xl p-8 shadow-xl">

          <div className="flex flex-col items-center mb-8">

            <div className="bg-emerald-500/10 p-4 rounded-2xl mb-4">
              <Dumbbell size={36} className="text-emerald-500" />
            </div>

            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Gym<span className="text-emerald-500">Track</span>
            </h1>

            <p className="text-gray-500 dark:text-gray-400 mt-2 text-sm">
              Welcome back! Continue your fitness journey.
            </p>

          </div>

          <form onSubmit={handleSubmit} className="space-y-5">

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email Address
              </label>

              <div className="relative">
                <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />

                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  required
                  className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#101713] text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Password
              </label>

              <div className="relative">
                <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />

                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  required
                  className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#101713] text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
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
              {loading ? 'Signing in...' : 'Sign In'}
            </button>

          </form>

          <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-7">
            Don't have an account?{' '}
            <Link to="/register" className="text-emerald-500 font-semibold hover:underline">
              Create account
            </Link>
          </p>

        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          Track your effort. Measure your progress.
        </p>

      </div>
    </div>
  )
}

export default Login
