import { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Globe, Trophy, Palette, X, Check } from 'lucide-react'
import { useQuizContext } from '../context/QuizContext'
import { useTheme, THEMES } from '../context/ThemeContext'

export default function Layout({ children }) {
  const { state }             = useQuizContext()
  const { theme, setTheme }   = useTheme()
  const [showPicker, setShowPicker] = useState(false)
  const pickerRef = useRef(null)

  /* Close picker when clicking outside */
  useEffect(() => {
    if (!showPicker) return
    const handler = e => {
      if (pickerRef.current && !pickerRef.current.contains(e.target)) {
        setShowPicker(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [showPicker])

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: 'var(--bg)', transition: 'background 0.3s ease' }}
    >
      {/* ─── Header ─── */}
      <header
        className="sticky top-0 z-40"
        style={{
          background: 'var(--surface)',
          borderBottom: '1px solid var(--border)',
          boxShadow: '0 1px 12px var(--shadow)',
        }}
      >
        <div className="w-full max-w-[1200px] mx-auto px-5 sm:px-10 h-16 flex items-center justify-between gap-4">

          {/* Logo */}
          <Link
            to="/"
            className="flex items-center gap-3 no-underline hover:opacity-80 transition-opacity"
            style={{ color: 'var(--text)' }}
          >
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{
                background: 'var(--accent)',
                boxShadow: '0 2px 8px var(--shadow)',
              }}
            >
              <Globe className="w-[18px] h-[18px] text-white" />
            </div>
            <span
              className="text-xl font-bold"
              style={{ fontFamily: 'var(--font-display)', color: 'var(--text)' }}
            >
              GeoQuiz
            </span>
          </Link>

          {/* Right side */}
          <div className="flex items-center gap-2">

            {/* Score badge */}
            {state.totalAttempted > 0 && (
              <div
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-sm font-semibold"
                style={{
                  background: 'var(--accent-light)',
                  color: 'var(--accent)',
                  border: '1px solid var(--accent)',
                }}
              >
                <Trophy className="w-3.5 h-3.5" />
                <span>{state.totalCorrect}<span className="opacity-50 mx-0.5">/</span>{state.totalAttempted}</span>
              </div>
            )}

            {/* Theme picker */}
            <div className="relative" ref={pickerRef}>
              <button
                onClick={() => setShowPicker(v => !v)}
                className="w-9 h-9 rounded-xl flex items-center justify-center transition-all cursor-pointer"
                style={{
                  background: showPicker ? 'var(--accent-light)' : 'var(--surface-hover)',
                  border: `1.5px solid ${showPicker ? 'var(--accent)' : 'var(--border)'}`,
                  color: showPicker ? 'var(--accent)' : 'var(--text-secondary)',
                }}
                title="Change theme"
              >
                {showPicker ? <X className="w-4 h-4" /> : <Palette className="w-4 h-4" />}
              </button>

              {/* Dropdown */}
              {showPicker && (
                <div
                  className="absolute right-0 top-12 rounded-2xl z-50 overflow-hidden"
                  style={{
                    background: 'var(--surface)',
                    border: '1.5px solid var(--border)',
                    boxShadow: '0 8px 40px var(--shadow), 0 1px 8px rgba(0,0,0,0.06)',
                    minWidth: '180px',
                  }}
                >
                  <div className="p-2">
                    <p
                      className="text-[10px] font-bold uppercase tracking-[0.16em] mb-2 px-2 pt-1"
                      style={{ color: 'var(--text-muted)' }}
                    >
                      Theme
                    </p>
                    {Object.entries(THEMES).map(([key, t]) => (
                      <button
                        key={key}
                        onClick={() => { setTheme(key); setShowPicker(false) }}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer text-left"
                        style={{
                          background: theme === key ? 'var(--accent-light)' : 'transparent',
                          color: theme === key ? 'var(--accent)' : 'var(--text-secondary)',
                          border: 'none',
                          fontFamily: 'var(--font-body)',
                        }}
                      >
                        {/* Color dot */}
                        <span
                          className="w-5 h-5 rounded-full shrink-0 flex items-center justify-center"
                          style={{
                            background: t.dot,
                            boxShadow: `0 1px 4px ${t.dot}88`,
                          }}
                        >
                          {theme === key && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
                        </span>
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
      <main className="flex-1 w-full">
        {children}
      </main>

      {/* Footer */}
      <footer
        className="text-center py-6 text-xs tracking-widest uppercase"
        style={{ color: 'var(--text-muted)', borderTop: '1px solid var(--border)' }}
      >
        Made for geography nerds everywhere 🌍
      </footer>
    </div>
  )
}
