import { Link } from 'react-router-dom'
import { Globe, Trophy } from 'lucide-react'
import { useQuizContext } from '../context/QuizContext'

export default function Layout({ children }) {
  const { state } = useQuizContext()

  return (
    <div className="min-h-screen flex flex-col bg-[var(--color-bg)] relative overflow-hidden">
      {/* Animated disco orbs */}
      <div className="orb orb-1" />
      <div className="orb orb-2" />
      <div className="orb orb-3" />

      <header className="sticky top-0 z-30 backdrop-blur-xl border-b border-white/30" style={{ background: 'rgba(247,246,243,0.7)' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5 no-underline text-[var(--color-text)] hover:opacity-80 transition-opacity">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-md shadow-indigo-500/20">
              <Globe className="w-4.5 h-4.5 text-white" />
            </div>
            <span className="font-[var(--font-display)] text-lg">GeoQuiz</span>
          </Link>
          {state.totalAttempted > 0 && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full glass-card text-[var(--color-accent)] text-sm font-medium shadow-sm">
              <Trophy className="w-3.5 h-3.5" />
              <span>{state.totalCorrect}/{state.totalAttempted}</span>
            </div>
          )}
        </div>
      </header>
      <main className="flex-1 max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-10 w-full relative z-10">
        {children}
      </main>
      <footer className="text-center py-6 text-xs text-[var(--color-text-muted)] border-t border-white/30 relative z-10">
        Made for geography nerds everywhere
      </footer>
    </div>
  )
}
