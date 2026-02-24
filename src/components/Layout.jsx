import { Link } from 'react-router-dom'
import { Globe, Trophy } from 'lucide-react'
import { useQuizContext } from '../context/QuizContext'

export default function Layout({ children }) {
  const { state } = useQuizContext()

  return (
    <div className="min-h-screen flex flex-col bg-[var(--color-bg)]">
      <header className="sticky top-0 z-30 bg-[var(--color-bg)]/80 backdrop-blur-lg border-b border-[var(--color-border)]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5 no-underline text-[var(--color-text)] hover:opacity-80 transition-opacity">
            <div className="w-8 h-8 rounded-lg bg-[var(--color-accent)] flex items-center justify-center">
              <Globe className="w-4.5 h-4.5 text-white" />
            </div>
            <span className="font-[var(--font-display)] text-lg">GeoQuiz</span>
          </Link>
          {state.totalAttempted > 0 && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[var(--color-accent-light)] text-[var(--color-accent)] text-sm font-medium">
              <Trophy className="w-3.5 h-3.5" />
              <span>{state.totalCorrect}/{state.totalAttempted}</span>
            </div>
          )}
        </div>
      </header>
      <main className="flex-1 max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-10 w-full">
        {children}
      </main>
      <footer className="text-center py-6 text-xs text-[var(--color-text-muted)] border-t border-[var(--color-border)]">
        Made for geography nerds everywhere
      </footer>
    </div>
  )
}
