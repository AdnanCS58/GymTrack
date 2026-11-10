import {
  createContext,
  useContext,
  useEffect,
  useState,
} from 'react'

import api from '../services/api'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  const [theme, setTheme] = useState(
    localStorage.getItem('gymtrack_theme') || 'dark'
  )

  // Apply theme
  useEffect(() => {
    document.documentElement.classList.toggle(
      'dark',
      theme === 'dark'
    )

    localStorage.setItem('gymtrack_theme', theme)
  }, [theme])

  // Restore login session
  useEffect(() => {
    const restoreSession = async () => {
      const token = localStorage.getItem('gymtrack_token')

      if (!token) {
        setLoading(false)
        return
      }

      try {
        const response = await api.get('/auth/me')
        setUser(response.data.user)
      } catch (error) {
        localStorage.removeItem('gymtrack_token')
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    restoreSession()
  }, [])

  // Register
  const register = async (formData) => {
    const response = await api.post(
      '/auth/register',
      formData
    )

    localStorage.setItem(
      'gymtrack_token',
      response.data.token
    )

    setUser(response.data.user)

    return response.data
  }

  // Login
  const login = async (formData) => {
    const response = await api.post(
      '/auth/login',
      formData
    )

    localStorage.setItem(
      'gymtrack_token',
      response.data.token
    )

    setUser(response.data.user)

    return response.data
  }

  // Refresh user information
  const refreshUser = async () => {
    const response = await api.get('/auth/me')

    setUser(response.data.user)

    return response.data.user
  }

  // Update profile
  const updateProfile = async (profileData) => {
    const response = await api.put(
      '/auth/profile',
      profileData
    )

    setUser(response.data.user)

    return response.data
  }

  // Upload profile picture
  const uploadProfilePicture = async (imageFile) => {
    const formData = new FormData()

    formData.append('profilePicture', imageFile)

    const response = await api.post(
      '/auth/profile-picture',
      formData
    )

    setUser(response.data.user)

    return response.data
  }

  // Change password
  const changePassword = async (passwordData) => {
    const response = await api.put(
      '/auth/change-password',
      passwordData
    )

    return response.data
  }

  // Logout
  const logout = () => {
    localStorage.removeItem('gymtrack_token')
    setUser(null)
  }

  // Theme toggle
  const toggleTheme = () => {
    setTheme((prev) =>
      prev === 'dark' ? 'light' : 'dark'
    )
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        theme,
        login,
        register,
        logout,
        toggleTheme,
        refreshUser,
        updateProfile,
        uploadProfilePicture,
        changePassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  return useContext(AuthContext)
}