import { createContext, useContext, useState, useEffect } from 'react'

export const THEMES = {
  summer:   { name: 'Summer',   dot: '#BFD4ED' },
  lavender: { name: 'Lavender', dot: '#A49AF7' },
  blush:    { name: 'Blush',    dot: '#F09EE9' },
  grape:    { name: 'Grape',    dot: '#AC8EF8' },
  light:    { name: 'White',    dot: '#D1D5DB' },
  dark:     { name: 'Dark',     dot: '#475569' },
}

const ThemeContext = createContext()

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    try { return localStorage.getItem('geoquiz-theme') || 'grape' }
    catch { return 'grape' }
  })

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    try { localStorage.setItem('geoquiz-theme', theme) } catch {}
  }, [theme])

  const isDark = theme === 'dark'

  return (
    <ThemeContext.Provider value={{ theme, setTheme, isDark }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  return useContext(ThemeContext)
}
