import { Link } from 'react-router-dom'
import { Globe, Trophy } from 'lucide-react'
import { useQuizContext } from '../context/QuizContext'

export default function Layout({ children }) {
  const { state } = useQuizContext()

  return (
    <div className="min-h-screen flex flex-col relative">
      {/* Ambient orbs */}
      <div className="orb orb-1" />
      <div className="orb orb-2" />
      <div className="orb orb-3" />

      <header className="sticky top-0 z-40 glass-light">
        <div className="w-full max-w-[1400px] mx-auto px-6 sm:px-10 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 no-underline text-[var(--color-text)] hover:text-[var(--color-accent)] transition-colors">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[var(--color-accent)] to-amber-800 flex items-center justify-center shadow-lg shadow-[var(--color-accent-glow)]">
              <Globe className="w-[18px] h-[18px] text-white" />
            </div>
            <span className="font-[var(--font-display)] text-xl tracking-wide">GeoQuiz</span>
          </Link>
          {state.totalAttempted > 0 && (
            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full glass text-[var(--color-accent)] text-sm font-medium">
              <Trophy className="w-3.5 h-3.5" />
              <span>{state.totalCorrect}/{state.totalAttempted}</span>
            </div>
          )}
        </div>
      </header>

      <main className="flex-1 w-full relative z-10">
        {children}
      </main>

      <footer className="text-center py-8 text-xs text-[var(--color-text-muted)] tracking-wider uppercase relative z-10">
        Made for geography nerds everywhere
      </footer>
    </div>
  )
}
