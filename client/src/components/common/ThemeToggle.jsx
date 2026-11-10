
import { Sun, Moon } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

const ThemeToggle = () => {
  const { theme, toggleTheme } = useAuth()

  return (
    <button
      onClick={toggleTheme}
      className="p-3 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
      aria-label="Toggle theme"
    >
      {theme === 'dark' ? (
        <Sun size={20} className="text-amber-400" />
      ) : (
        <Moon size={20} className="text-gray-700" />
      )}
    </button>
  )
}

export default ThemeToggle
