import { Link } from 'react-router-dom'
import { Globe, Trophy } from 'lucide-react'
import { useQuizContext } from '../context/QuizContext'

export default function Layout({ children }) {
  const { state } = useQuizContext()

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      <header className="border-b border-[var(--color-border)]">
        <div className="max-w-[1200px] mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 no-underline text-[var(--color-text)]">
            <Globe className="w-6 h-6 text-[var(--color-accent)]" />
            <span className="font-[var(--font-display)] text-xl font-normal">GeoQuiz</span>
          </Link>
          <div className="flex items-center gap-4">
            {state.totalAttempted > 0 && (
              <div className="flex items-center gap-1.5 text-sm text-[var(--color-text-muted)]">
                <Trophy className="w-4 h-4" />
                <span>{state.totalCorrect}/{state.totalAttempted}</span>
              </div>
            )}
          </div>
        </div>
      </header>
      <main className="max-w-[1200px] mx-auto px-6 py-8">
        {children}
      </main>
    </div>
  )
}
