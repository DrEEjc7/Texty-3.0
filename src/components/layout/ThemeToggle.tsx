import { Moon, Sun } from 'lucide-react'
import { useTextStore } from '@/store/textStore'
import { useEffect } from 'react'

export function ThemeToggle() {
  const { theme, toggleTheme } = useTextStore()

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [theme])

  return (
    <button
      onClick={toggleTheme}
      className="fixed top-6 right-6 w-11 h-11 border border-[var(--color-border)] rounded-lg bg-[var(--color-bg-primary)] text-[var(--color-text-primary)] flex items-center justify-center transition-all hover:border-[var(--color-text-primary)] hover:-translate-y-0.5 hover:shadow-md z-[100]"
      aria-label="Toggle theme"
    >
      {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
    </button>
  )
}
