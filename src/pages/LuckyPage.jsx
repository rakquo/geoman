import { useState, useCallback, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, ArrowRight, Trophy, RotateCcw, Home, CheckCircle, XCircle } from 'lucide-react'
import Button from '../components/Button'

export default function LuckyPage() {
  const navigate = useNavigate()
  const [trivia, setTrivia] = useState([])
  const [current, setCurrent] = useState(0)
  const [selected, setSelected] = useState(null)
  const [score, setScore] = useState(0)
  const [answered, setAnswered] = useState(0)
  const [streak, setStreak] = useState(0)
  const [bestStreak, setBestStreak] = useState(0)
  const [showResult, setShowResult] = useState(false)
  const [shuffled, setShuffled] = useState([])

  /* Load & shuffle trivia */
  useEffect(() => {
    import('../data/trivia.json').then(mod => {
      const data = mod.default || mod
      const arr = [...data].sort(() => Math.random() - 0.5)
      setTrivia(arr)
    })
  }, [])

  /* Shuffle options for current question */
  useEffect(() => {
    if (trivia.length > 0 && trivia[current % trivia.length]) {
      const q = trivia[current % trivia.length]
      setShuffled([...q.options].sort(() => Math.random() - 0.5))
    }
  }, [current, trivia])

  const question = trivia.length > 0 ? trivia[current % trivia.length] : null

  const handleSelect = useCallback((option) => {
    if (selected !== null) return
    setSelected(option)
    setShowResult(true)
    setAnswered(a => a + 1)

    const isCorrect = option === question.answer
    if (isCorrect) {
      setScore(s => s + 1)
      setStreak(s => {
        const next = s + 1
        setBestStreak(b => Math.max(b, next))
        return next
      })
    } else {
      setStreak(0)
    }
  }, [selected, question])

  const handleNext = useCallback(() => {
    setSelected(null)
    setShowResult(false)
    setCurrent(c => c + 1)
  }, [])

  const handleRestart = useCallback(() => {
    const arr = [...trivia].sort(() => Math.random() - 0.5)
    setTrivia(arr)
    setCurrent(0)
    setSelected(null)
    setShowResult(false)
    setScore(0)
    setAnswered(0)
    setStreak(0)
    setBestStreak(0)
  }, [trivia])

  if (!question) {
    return (
      <div className="w-full max-w-[800px] mx-auto px-5 sm:px-8 py-20 text-center">
        <div
          className="w-10 h-10 border-3 rounded-full animate-spin mx-auto"
          style={{ borderColor: 'var(--border)', borderTopColor: 'var(--accent)' }}
        />
        <p className="mt-4 text-sm" style={{ color: 'var(--text-muted)' }}>Loading trivia...</p>
      </div>
    )
  }

  const pct = answered > 0 ? Math.round((score / answered) * 100) : 0

  return (
    <div className="w-full max-w-[800px] mx-auto px-5 sm:px-8 py-8 sm:py-12">

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => navigate('/')}>
            <Home className="w-4 h-4" />
          </Button>
          <div>
            <h1
              className="text-3xl sm:text-4xl leading-none"
              style={{ fontFamily: 'var(--font-display)', color: 'var(--text)' }}
            >
              I'm Feeling Lucky
            </h1>
            <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
              Random geography trivia — test your knowledge!
            </p>
          </div>
        </div>
      </div>

      {/* Stats bar */}
      <div className="flex flex-wrap gap-3 mb-8">
        {[
          { label: 'Score', value: `${score}/${answered}`, icon: Trophy },
          { label: 'Accuracy', value: answered > 0 ? `${pct}%` : '—' },
          { label: 'Streak', value: `${streak} 🔥` },
          { label: 'Best', value: `${bestStreak} ⭐` },
        ].map(stat => (
          <div
            key={stat.label}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm"
            style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
          >
            <span style={{ color: 'var(--text-muted)' }}>{stat.label}</span>
            <span className="font-semibold" style={{ color: 'var(--text)' }}>{stat.value}</span>
          </div>
        ))}
      </div>

      {/* Question card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -30 }}
          transition={{ duration: 0.25 }}
        >
          <div
            className="rounded-2xl overflow-hidden shadow-card mb-6"
            style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
          >
            {/* Question header */}
            <div
              className="px-6 sm:px-8 py-5 flex items-start gap-3"
              style={{ borderBottom: '1px solid var(--border)' }}
            >
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                style={{ background: 'var(--accent-light)' }}
              >
                <Sparkles className="w-5 h-5" style={{ color: 'var(--accent)' }} />
              </div>
              <div>
                <p
                  className="text-[10px] font-bold uppercase tracking-[0.16em] mb-1"
                  style={{ color: 'var(--text-muted)' }}
                >
                  Question {answered + (selected === null ? 1 : 0)} · {question.category}
                </p>
                <h2
                  className="text-xl sm:text-2xl leading-snug"
                  style={{ fontFamily: 'var(--font-display)', color: 'var(--text)' }}
                >
                  {question.question}
                </h2>
              </div>
            </div>

            {/* Options */}
            <div className="p-4 sm:p-6 grid gap-3">
              {shuffled.map((option, i) => {
                const isCorrect = option === question.answer
                const isSelected = selected === option
                let bg = 'var(--bg)'
                let border = 'var(--border)'
                let color = 'var(--text)'

                if (showResult) {
                  if (isCorrect) {
                    bg = 'var(--correct-bg)'
                    border = 'var(--correct)'
                    color = 'var(--correct)'
                  } else if (isSelected && !isCorrect) {
                    bg = 'var(--incorrect-bg)'
                    border = 'var(--incorrect)'
                    color = 'var(--incorrect)'
                  } else {
                    color = 'var(--text-muted)'
                  }
                }

                return (
                  <motion.button
                    key={option}
                    onClick={() => handleSelect(option)}
                    disabled={selected !== null}
                    className="w-full text-left px-5 py-4 rounded-xl flex items-center gap-3 transition-all cursor-pointer border-none disabled:cursor-default"
                    style={{
                      background: bg,
                      boxShadow: `inset 0 0 0 1.5px ${border}`,
                      color,
                    }}
                    whileHover={selected === null ? { scale: 1.01 } : {}}
                    whileTap={selected === null ? { scale: 0.99 } : {}}
                  >
                    {/* Letter */}
                    <span
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold shrink-0"
                      style={{
                        background: showResult && isCorrect ? 'var(--correct)' :
                                   showResult && isSelected ? 'var(--incorrect)' :
                                   'var(--accent-light)',
                        color: showResult && (isCorrect || isSelected) ? '#fff' : 'var(--accent)',
                      }}
                    >
                      {showResult && isCorrect ? <CheckCircle className="w-4 h-4" /> :
                       showResult && isSelected ? <XCircle className="w-4 h-4" /> :
                       String.fromCharCode(65 + i)}
                    </span>

                    <span className="font-medium text-sm sm:text-base">{option}</span>
                  </motion.button>
                )
              })}
            </div>
          </div>

          {/* Next / Restart buttons */}
          {showResult && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex gap-3 justify-center"
            >
              <Button size="lg" variant="primary" onClick={handleNext}>
                Next Question <ArrowRight className="w-4 h-4" />
              </Button>
              <Button size="lg" onClick={handleRestart}>
                <RotateCcw className="w-4 h-4" /> Restart
              </Button>
            </motion.div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
