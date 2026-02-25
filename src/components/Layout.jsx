import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Globe, Trophy, Palette, X } from 'lucide-react'
import { useQuizContext } from '../context/QuizContext'
import { useTheme, THEMES } from '../context/ThemeContext'

export default function Layout({ children }) {
  const { state } = useQuizContext()
  const { theme, setTheme } = useTheme()
  const [showPicker, setShowPicker] = useState(false)

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--bg)', transition: 'background 0.3s' }}>
      {/* Header */}
      <header
        className="sticky top-0 z-40 border-b"
        style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
      >
        <div className="w-full max-w-[1200px] mx-auto px-5 sm:px-8 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 no-underline hover:opacity-80 transition-opacity" style={{ color: 'var(--text)' }}>
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center shadow-md"
              style={{ background: 'var(--accent)' }}
            >
              <Globe className="w-[18px] h-[18px] text-white" />
            </div>
            <span className="text-xl font-bold" style={{ fontFamily: 'var(--font-display)' }}>GeoQuiz</span>
          </Link>

          {/* Right side */}
          <div className="flex items-center gap-3">
            {/* Score */}
            {state.totalAttempted > 0 && (
              <div
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium"
                style={{ background: 'var(--accent-light)', color: 'var(--accent)' }}
              >
                <Trophy className="w-3.5 h-3.5" />
                <span>{state.totalCorrect}/{state.totalAttempted}</span>
              </div>
            )}

            {/* Theme picker toggle */}
            <div className="relative">
              <button
                onClick={() => setShowPicker(v => !v)}
                className="w-9 h-9 rounded-xl flex items-center justify-center transition-all cursor-pointer border"
                style={{
                  background: 'var(--surface-hover)',
                  borderColor: 'var(--border)',
                  color: 'var(--text-secondary)',
                }}
              >
                {showPicker ? <X className="w-4 h-4" /> : <Palette className="w-4 h-4" />}
              </button>

              {/* Theme dropdown */}
              {showPicker && (
                <div
                  className="absolute right-0 top-12 p-3 rounded-2xl shadow-elevated z-50 min-w-[200px] border"
                  style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
                >
                  <p className="text-[11px] font-semibold uppercase tracking-wider mb-2.5 px-1" style={{ color: 'var(--text-muted)' }}>
                    Theme
                  </p>
                  <div className="flex flex-col gap-1">
                    {Object.entries(THEMES).map(([key, t]) => (
                      <button
                        key={key}
                        onClick={() => { setTheme(key); setShowPicker(false) }}
                        className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all cursor-pointer border-none"
                        style={{
                          background: theme === key ? 'var(--accent-light)' : 'transparent',
                          color: theme === key ? 'var(--accent)' : 'var(--text-secondary)',
                          fontFamily: 'var(--font-body)',
                        }}
                      >
                        <span
                          className="w-5 h-5 rounded-full border-2 shrink-0"
                          style={{
                            backgroundColor: t.dot,
                            borderColor: theme === key ? 'var(--accent)' : 'transparent',
                          }}
                        />
                        {t.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 w-full relative">
        {children}
      </main>

      {/* Footer */}
      <footer
        className="text-center py-8 text-xs tracking-wider uppercase border-t"
        style={{ color: 'var(--text-muted)', borderColor: 'var(--border)' }}
      >
        Made for geography nerds everywhere
      </footer>
    </div>
  )
}
