import { useParams, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Clock, RotateCcw, ArrowRight } from 'lucide-react'
import BackButton from '../components/BackButton'
import QuizMap from '../components/QuizMap'
import QuizInput from '../components/QuizInput'
import QuizResults from '../components/QuizResults'
import { useQuiz } from '../hooks/useQuiz'
import { useTimer } from '../hooks/useTimer'
import { useQuizContext } from '../context/QuizContext'
import { continents } from '../data/continents'

const categoryLabels = {
  cities: 'Cities',
  rivers: 'Rivers',
  lakes: 'Lakes',
  mountains: 'Mountains',
  features: 'Features',
}

export default function QuizPage() {
  const { continentId, category } = useParams()
  const navigate = useNavigate()
  const continent = continents[continentId]
  const { dispatch } = useQuizContext()

  const [quizData, setQuizData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      try {
        const data = await import(`../data/${continentId}/${category}.json`)
        setQuizData(data.default || data)
      } catch {
        setQuizData(null)
      }
      setLoading(false)
    }
    setLoading(true)
    loadData()
  }, [continentId, category])

  const quiz = useQuiz(quizData)
  const timer = useTimer(180, true)

  // Auto-submit when timer expires
  useEffect(() => {
    if (timer.isExpired && quiz.phase === 'active' && quizData) {
      quiz.submit()
    }
  }, [timer.isExpired, quiz.phase, quizData])

  // Record score when submitted
  useEffect(() => {
    if (quiz.results) {
      timer.stop()
      dispatch({
        type: 'RECORD_SCORE',
        payload: {
          continentId,
          category,
          correct: quiz.results.correct,
          total: quiz.results.total,
        },
      })
    }
  }, [quiz.results])

  const handleRetry = () => {
    quiz.retry()
    timer.reset()
  }

  if (!continent) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl mb-2">Not found</h2>
        <BackButton to="/" label="Back to World Map" />
      </div>
    )
  }

  if (loading) {
    return (
      <div>
        <BackButton to={`/continent/${continentId}`} label={`Back to ${continent.name}`} />
        <div className="mt-8 text-center py-20">
          <div className="w-8 h-8 border-2 border-[var(--color-accent)] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[var(--color-text-muted)]">Loading quiz...</p>
        </div>
      </div>
    )
  }

  if (!quizData || quizData.length === 0) {
    return (
      <div>
        <BackButton to={`/continent/${continentId}`} label={`Back to ${continent.name}`} />
        <div className="mt-8 text-center py-20">
          <h2 className="text-2xl mb-2">Coming Soon</h2>
          <p className="text-[var(--color-text-muted)]">
            {categoryLabels[category]} data for {continent.name} is not available yet.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <BackButton to={`/continent/${continentId}`} label={`Back to ${continent.name}`} />
        {quiz.phase === 'active' && (
          <div className="flex items-center gap-1.5 text-sm text-[var(--color-text-muted)]">
            <Clock className="w-4 h-4" />
            <span className={timer.seconds <= 30 ? 'text-[var(--color-incorrect)] font-medium' : ''}>
              {timer.formatted}
            </span>
          </div>
        )}
      </div>

      {/* Title */}
      <motion.h1
        className="text-3xl mb-6"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {continent.name} — {categoryLabels[category]}
      </motion.h1>

      {/* Layout: map + inputs */}
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Map section */}
        <div className="lg:w-[58%] shrink-0">
          <QuizMap
            continentId={continentId}
            items={quizData}
            focusedId={quiz.focusedId}
            onMarkerClick={(id) => quiz.setFocusedId(id)}
            results={quiz.results?.results || null}
          />
        </div>

        {/* Input/Results section */}
        <div className="flex-1 min-w-0">
          {quiz.phase === 'active' ? (
            <>
              <QuizInput
                items={quizData}
                answers={quiz.answers}
                onAnswerChange={quiz.updateAnswer}
                focusedId={quiz.focusedId}
                onFocus={(id) => quiz.setFocusedId(id)}
              />
              <motion.button
                onClick={quiz.submit}
                disabled={!quiz.hasAnyAnswer}
                className="mt-6 w-full py-3 px-6 bg-[var(--color-accent)] text-white font-medium rounded-lg hover:bg-[var(--color-accent-hover)] disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 cursor-pointer text-sm font-[var(--font-body)]"
                whileHover={quiz.hasAnyAnswer ? { scale: 1.01 } : {}}
                whileTap={quiz.hasAnyAnswer ? { scale: 0.99 } : {}}
              >
                Submit Answers
              </motion.button>
            </>
          ) : (
            <>
              <QuizResults results={quiz.results} />
              <div className="flex gap-3 mt-6">
                <button
                  onClick={handleRetry}
                  className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text)] font-medium rounded-lg hover:border-[var(--color-accent)] transition-all duration-200 cursor-pointer text-sm font-[var(--font-body)]"
                >
                  <RotateCcw className="w-4 h-4" />
                  Retry Quiz
                </button>
                <button
                  onClick={() => navigate(`/continent/${continentId}`)}
                  className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-[var(--color-accent)] text-white font-medium rounded-lg hover:bg-[var(--color-accent-hover)] transition-all duration-200 cursor-pointer text-sm font-[var(--font-body)]"
                >
                  New Category
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
