import { useParams, useNavigate } from 'react-router-dom'
import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { memo } from 'react'
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
} from 'react-simple-maps'
import { CheckCircle, XCircle, RotateCcw, ArrowLeft, Trophy } from 'lucide-react'
import { continents } from '../data/continents'
// world-atlas only has numeric IDs, not ISO_A3 — we show all land and zoom via projection
import { getProjectionConfig, topology } from '../utils/mapConfig'
import { checkAnswer } from '../utils/scoring'
import { useQuizContext } from '../context/QuizContext'

const modeConfig = {
  political: { categories: ['cities'], label: 'Political Map' },
  physical: { categories: ['rivers', 'lakes', 'mountains', 'features'], label: 'Physical Map' },
}

const geoStyle = {
  default: {
    fill: 'var(--color-land)',
    stroke: 'var(--color-border-geo)',
    strokeWidth: 0.5,
    outline: 'none',
  },
  hover: {
    fill: 'var(--color-land)',
    stroke: 'var(--color-border-geo)',
    strokeWidth: 0.5,
    outline: 'none',
  },
  pressed: {
    fill: 'var(--color-land)',
    stroke: 'var(--color-border-geo)',
    strokeWidth: 0.5,
    outline: 'none',
  },
}

const MemoGeo = memo(function MemoGeo({ geo }) {
  return <Geography geography={geo} style={geoStyle} />
})

export default function QuizPage() {
  const { continentId, mode } = useParams()
  const navigate = useNavigate()
  const continent = continents[continentId]
  const config = getProjectionConfig(continentId)
  const { dispatch } = useQuizContext()

  const [quizItems, setQuizItems] = useState([])
  const [loading, setLoading] = useState(true)

  // Per-item state: null = untouched, 'correct', 'incorrect'
  const [itemStates, setItemStates] = useState({})
  // Which marker is currently open for answering
  const [activeId, setActiveId] = useState(null)
  const [inputValue, setInputValue] = useState('')
  const [lastResult, setLastResult] = useState(null) // { id, correct, correctName }
  const inputRef = useRef(null)

  // Load quiz data
  useEffect(() => {
    async function load() {
      const modeConf = modeConfig[mode]
      if (!modeConf) { setLoading(false); return }
      const allItems = []
      for (const cat of modeConf.categories) {
        try {
          const data = await import(`../data/${continentId}/${cat}.json`)
          const items = (data.default || data).map((item) => ({ ...item, category: cat }))
          allItems.push(...items)
        } catch { /* skip missing */ }
      }
      setQuizItems(allItems)
      setLoading(false)
    }
    load()
  }, [continentId, mode])

  // Focus input when marker is selected
  useEffect(() => {
    if (activeId !== null && inputRef.current) {
      inputRef.current.focus()
    }
  }, [activeId])

  const handleMarkerClick = useCallback((item) => {
    // If already answered, don't reopen
    if (itemStates[item.id]) return
    setActiveId(item.id)
    setInputValue('')
    setLastResult(null)
  }, [itemStates])

  const handleSubmitAnswer = useCallback((e) => {
    e.preventDefault()
    if (!activeId) return
    const item = quizItems.find((q) => q.id === activeId && (!itemStates[q.id]))
    if (!item) return

    const isCorrect = checkAnswer(inputValue, item.acceptedAnswers)
    setItemStates((prev) => ({ ...prev, [item.id]: isCorrect ? 'correct' : 'incorrect' }))
    setLastResult({ id: item.id, correct: isCorrect, correctName: item.name, userAnswer: inputValue })

    // Auto-close after brief delay
    setTimeout(() => {
      setActiveId(null)
      setInputValue('')
      setLastResult(null)
    }, 1500)
  }, [activeId, inputValue, quizItems, itemStates])

  const handleSkip = useCallback(() => {
    if (!activeId) return
    const item = quizItems.find((q) => q.id === activeId)
    if (item) {
      setItemStates((prev) => ({ ...prev, [item.id]: 'incorrect' }))
      setLastResult({ id: item.id, correct: false, correctName: item.name, userAnswer: '' })
      setTimeout(() => {
        setActiveId(null)
        setInputValue('')
        setLastResult(null)
      }, 1500)
    }
  }, [activeId, quizItems])

  const handleReset = useCallback(() => {
    setItemStates({})
    setActiveId(null)
    setInputValue('')
    setLastResult(null)
  }, [])

  // Score calculation
  const answeredCount = Object.keys(itemStates).length
  const correctCount = Object.values(itemStates).filter((s) => s === 'correct').length
  const totalCount = quizItems.length
  const isComplete = answeredCount === totalCount && totalCount > 0

  // Record score when complete
  useEffect(() => {
    if (isComplete) {
      dispatch({
        type: 'RECORD_SCORE',
        payload: { continentId, category: mode, correct: correctCount, total: totalCount },
      })
    }
  }, [isComplete])

  if (!continent || !modeConfig[mode]) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl mb-4">Not found</h2>
        <button onClick={() => navigate('/')} className="text-[var(--color-accent)] underline cursor-pointer bg-transparent border-none font-[var(--font-body)]">Go Home</button>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="text-center py-20">
        <div className="w-8 h-8 border-2 border-[var(--color-accent)] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-[var(--color-text-muted)]">Loading quiz...</p>
      </div>
    )
  }

  if (quizItems.length === 0) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl mb-2">Coming Soon</h2>
        <p className="text-[var(--color-text-muted)] mb-4">No data available yet for this combination.</p>
        <button onClick={() => navigate(-1)} className="text-[var(--color-accent)] underline cursor-pointer bg-transparent border-none font-[var(--font-body)]">Go Back</button>
      </div>
    )
  }

  const activeItem = quizItems.find((q) => q.id === activeId)

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => navigate(`/continent/${continentId}`)}
          className="flex items-center gap-1.5 text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors cursor-pointer bg-transparent border-none p-0 font-[var(--font-body)]"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to {continent.name}
        </button>
        <div className="flex items-center gap-2 text-sm">
          <span className="font-medium">{correctCount}</span>
          <span className="text-[var(--color-text-muted)]">/ {totalCount}</span>
        </div>
      </div>

      {/* Title */}
      <motion.h1
        className="text-2xl sm:text-3xl mb-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        {continent.name} — {modeConfig[mode].label}
      </motion.h1>

      {/* Progress bar */}
      <div className="h-1.5 bg-[var(--color-border)] rounded-full mb-6 overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: 'var(--color-correct)' }}
          initial={{ width: 0 }}
          animate={{ width: `${totalCount > 0 ? (answeredCount / totalCount) * 100 : 0}%` }}
          transition={{ duration: 0.4 }}
        />
      </div>

      {/* Instruction */}
      {!isComplete && (
        <p className="text-sm text-[var(--color-text-muted)] mb-4">
          Click on any marker to identify it. Names are hidden — it's a quiz!
        </p>
      )}

      {/* Map */}
      <div className="relative w-full bg-[var(--color-water)] rounded-xl overflow-hidden shadow-sm">
        <ComposableMap
          projection="geoMercator"
          projectionConfig={{ center: config.center, scale: config.scale }}
          width={800}
          height={500}
          style={{ width: '100%', height: 'auto', display: 'block' }}
        >
          <Geographies geography={topology}>
            {({ geographies }) =>
              geographies.map((geo) => (
                <MemoGeo key={geo.rsmKey} geo={geo} />
              ))
            }
          </Geographies>

          {quizItems.map((item) => {
            const state = itemStates[item.id]
            const isActive = activeId === item.id
            let fill = 'var(--color-marker)'
            if (state === 'correct') fill = 'var(--color-correct)'
            else if (state === 'incorrect') fill = 'var(--color-incorrect)'

            return (
              <Marker key={`${item.category}-${item.id}`} coordinates={[item.lng, item.lat]}>
                <g
                  onClick={() => handleMarkerClick(item)}
                  style={{ cursor: state ? 'default' : 'pointer' }}
                >
                  <circle
                    r={isActive ? 9 : 7}
                    fill={fill}
                    stroke="#fff"
                    strokeWidth={2}
                    style={{ transition: 'all 0.2s ease' }}
                  />
                  {state === 'correct' && (
                    <text textAnchor="middle" dominantBaseline="central" fill="#fff" fontSize={9} fontWeight={700} style={{ pointerEvents: 'none' }}>✓</text>
                  )}
                  {state === 'incorrect' && (
                    <text textAnchor="middle" dominantBaseline="central" fill="#fff" fontSize={9} fontWeight={700} style={{ pointerEvents: 'none' }}>✗</text>
                  )}
                  {!state && (
                    <circle r={3} fill="#fff" style={{ pointerEvents: 'none' }} />
                  )}
                </g>
              </Marker>
            )
          })}
        </ComposableMap>

        {/* Answer popup — floats over the map */}
        <AnimatePresence>
          {activeId !== null && activeItem && (
            <motion.div
              key={activeId}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.2 }}
              className="absolute bottom-4 left-1/2 -translate-x-1/2 w-80 max-w-[90%]"
            >
              {lastResult && lastResult.id === activeId ? (
                /* Feedback */
                <div className={`p-4 rounded-xl shadow-lg border ${
                  lastResult.correct
                    ? 'bg-[var(--color-correct-bg)] border-[var(--color-correct)]'
                    : 'bg-[var(--color-incorrect-bg)] border-[var(--color-incorrect)]'
                }`}>
                  <div className="flex items-center gap-2">
                    {lastResult.correct ? (
                      <>
                        <CheckCircle className="w-5 h-5 text-[var(--color-correct)]" />
                        <span className="font-semibold text-[var(--color-correct)]">Correct! {lastResult.correctName}</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="w-5 h-5 text-[var(--color-incorrect)]" />
                        <div>
                          <span className="font-semibold text-[var(--color-incorrect)]">
                            {lastResult.userAnswer ? `Nope` : 'Skipped'}
                          </span>
                          <span className="text-[var(--color-incorrect)] ml-1">
                            — it's <strong>{lastResult.correctName}</strong>
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              ) : (
                /* Input form */
                <form onSubmit={handleSubmitAnswer} className="bg-white p-4 rounded-xl shadow-lg border border-[var(--color-border)]">
                  <p className="text-xs text-[var(--color-text-muted)] mb-2 capitalize">{activeItem.category}</p>
                  <div className="flex gap-2">
                    <input
                      ref={inputRef}
                      type="text"
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      placeholder="What is this?"
                      autoComplete="off"
                      className="flex-1 px-3 py-2 border border-[var(--color-border)] rounded-lg text-sm focus:border-[var(--color-accent)] focus:outline-none transition-colors font-[var(--font-body)]"
                    />
                    <button
                      type="submit"
                      disabled={!inputValue.trim()}
                      className="px-4 py-2 bg-[var(--color-accent)] text-white text-sm font-medium rounded-lg hover:bg-[var(--color-accent-hover)] disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer font-[var(--font-body)]"
                    >
                      Go
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={handleSkip}
                    className="mt-2 text-xs text-[var(--color-text-muted)] hover:text-[var(--color-incorrect)] transition-colors cursor-pointer bg-transparent border-none p-0 font-[var(--font-body)]"
                  >
                    Skip / I don't know
                  </button>
                </form>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Completion card */}
      <AnimatePresence>
        {isComplete && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 p-6 bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] shadow-sm"
          >
            <div className="flex items-center gap-3 mb-4">
              <Trophy className="w-6 h-6 text-[var(--color-accent)]" />
              <h2 className="text-2xl font-[var(--font-display)]">
                {correctCount} / {totalCount}
              </h2>
              <span className="text-[var(--color-text-muted)]">
                {correctCount === totalCount ? 'Perfect score!' : correctCount >= totalCount * 0.7 ? 'Great job!' : 'Keep practicing!'}
              </span>
            </div>

            {/* Show all answers */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-5">
              {quizItems.map((item) => {
                const state = itemStates[item.id]
                return (
                  <div
                    key={`${item.category}-${item.id}`}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${
                      state === 'correct' ? 'bg-[var(--color-correct-bg)]' : 'bg-[var(--color-incorrect-bg)]'
                    }`}
                  >
                    {state === 'correct' ? (
                      <CheckCircle className="w-4 h-4 text-[var(--color-correct)] shrink-0" />
                    ) : (
                      <XCircle className="w-4 h-4 text-[var(--color-incorrect)] shrink-0" />
                    )}
                    <span className={state === 'correct' ? 'text-[var(--color-correct)] font-medium' : 'text-[var(--color-incorrect)]'}>
                      {item.name}
                    </span>
                    <span className="text-[var(--color-text-muted)] text-xs ml-auto capitalize">{item.category}</span>
                  </div>
                )
              })}
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleReset}
                className="flex-1 flex items-center justify-center gap-2 py-3 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg hover:border-[var(--color-accent)] transition-all cursor-pointer text-sm font-medium font-[var(--font-body)]"
              >
                <RotateCcw className="w-4 h-4" /> Try Again
              </button>
              <button
                onClick={() => navigate(`/continent/${continentId}`)}
                className="flex-1 py-3 bg-[var(--color-accent)] text-white rounded-lg hover:bg-[var(--color-accent-hover)] transition-all cursor-pointer text-sm font-medium font-[var(--font-body)]"
              >
                Change Mode
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
