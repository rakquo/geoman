import { useParams, useNavigate } from 'react-router-dom'
import { useState, useEffect, useRef, useCallback, memo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
} from 'react-simple-maps'
import { CheckCircle, XCircle, RotateCcw, ArrowLeft, Trophy, Sparkles } from 'lucide-react'
import { continents } from '../data/continents'
import { getProjectionConfig, topology } from '../utils/mapConfig'
import { checkAnswer } from '../utils/scoring'
import { useQuizContext } from '../context/QuizContext'

const modeConfig = {
  political: { categories: ['cities'], label: 'Political Map', color: 'var(--color-political)' },
  physical: { categories: ['rivers', 'lakes', 'mountains', 'features'], label: 'Physical Map', color: 'var(--color-physical)' },
}

const geoStyle = {
  default: { fill: 'var(--color-land)', stroke: 'var(--color-border-geo)', strokeWidth: 0.4, outline: 'none' },
  hover: { fill: 'var(--color-land)', stroke: 'var(--color-border-geo)', strokeWidth: 0.4, outline: 'none' },
  pressed: { fill: 'var(--color-land)', stroke: 'var(--color-border-geo)', strokeWidth: 0.4, outline: 'none' },
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
  const [itemStates, setItemStates] = useState({})
  const [activeId, setActiveId] = useState(null)
  const [activeCategory, setActiveCategory] = useState(null)
  const [inputValue, setInputValue] = useState('')
  const [lastResult, setLastResult] = useState(null)
  const inputRef = useRef(null)
  const timeoutRef = useRef(null)

  useEffect(() => {
    async function load() {
      const modeConf = modeConfig[mode]
      if (!modeConf) { setLoading(false); return }
      const allItems = []
      for (const cat of modeConf.categories) {
        try {
          const data = await import(`../data/${continentId}/${cat}.json`)
          const items = (data.default || data).map((item) => ({
            ...item,
            category: cat,
            _uid: `${cat}-${item.id}`,
          }))
          allItems.push(...items)
        } catch { /* skip */ }
      }
      setQuizItems(allItems)
      setLoading(false)
    }
    load()
  }, [continentId, mode])

  useEffect(() => {
    if (activeId !== null && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [activeId])

  // Cleanup timeout on unmount
  useEffect(() => () => clearTimeout(timeoutRef.current), [])

  const handleMarkerClick = useCallback((item) => {
    if (itemStates[item._uid]) return
    clearTimeout(timeoutRef.current)
    setActiveId(item._uid)
    setActiveCategory(item.category)
    setInputValue('')
    setLastResult(null)
  }, [itemStates])

  const handleSubmitAnswer = useCallback((e) => {
    e.preventDefault()
    if (!activeId) return
    const item = quizItems.find((q) => q._uid === activeId)
    if (!item || itemStates[item._uid]) return

    const isCorrect = checkAnswer(inputValue, item.acceptedAnswers)
    setItemStates((prev) => ({ ...prev, [item._uid]: isCorrect ? 'correct' : 'incorrect' }))
    setLastResult({ uid: item._uid, correct: isCorrect, correctName: item.name, userAnswer: inputValue })

    timeoutRef.current = setTimeout(() => {
      setActiveId(null)
      setActiveCategory(null)
      setInputValue('')
      setLastResult(null)
    }, 1800)
  }, [activeId, inputValue, quizItems, itemStates])

  const handleSkip = useCallback(() => {
    if (!activeId) return
    const item = quizItems.find((q) => q._uid === activeId)
    if (!item) return
    setItemStates((prev) => ({ ...prev, [item._uid]: 'incorrect' }))
    setLastResult({ uid: item._uid, correct: false, correctName: item.name, userAnswer: '' })
    timeoutRef.current = setTimeout(() => {
      setActiveId(null)
      setActiveCategory(null)
      setInputValue('')
      setLastResult(null)
    }, 1800)
  }, [activeId, quizItems])

  const handleReset = useCallback(() => {
    clearTimeout(timeoutRef.current)
    setItemStates({})
    setActiveId(null)
    setActiveCategory(null)
    setInputValue('')
    setLastResult(null)
  }, [])

  const answeredCount = Object.keys(itemStates).length
  const correctCount = Object.values(itemStates).filter((s) => s === 'correct').length
  const totalCount = quizItems.length
  const isComplete = answeredCount === totalCount && totalCount > 0
  const pct = totalCount > 0 ? Math.round((answeredCount / totalCount) * 100) : 0

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
      <div className="flex flex-col items-center justify-center py-32 gap-4">
        <div className="w-10 h-10 border-3 border-[var(--color-accent)] border-t-transparent rounded-full animate-spin" />
        <p className="text-[var(--color-text-muted)] text-sm">Loading map data...</p>
      </div>
    )
  }

  if (quizItems.length === 0) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl mb-2">Coming Soon</h2>
        <p className="text-[var(--color-text-muted)] mb-4">No data yet.</p>
        <button onClick={() => navigate(-1)} className="text-[var(--color-accent)] underline cursor-pointer bg-transparent border-none font-[var(--font-body)]">Go Back</button>
      </div>
    )
  }

  const modeColor = modeConfig[mode].color
  const activeItem = quizItems.find((q) => q._uid === activeId)

  return (
    <div className="max-w-5xl mx-auto pb-8">
      {/* Top bar */}
      <div className="flex items-center justify-between mb-5">
        <motion.button
          onClick={() => navigate(`/continent/${continentId}`)}
          className="flex items-center gap-1.5 text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors cursor-pointer bg-transparent border-none p-0 font-[var(--font-body)]"
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <ArrowLeft className="w-4 h-4" />
          {continent.name}
        </motion.button>

        {/* Score pill */}
        <motion.div
          className="flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium"
          style={{ backgroundColor: modeColor + '12', color: modeColor }}
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <span>{correctCount}</span>
          <span className="opacity-50">/</span>
          <span className="opacity-50">{totalCount}</span>
        </motion.div>
      </div>

      {/* Title row */}
      <motion.div className="mb-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <h1 className="text-2xl sm:text-3xl">
          {continent.name}
          <span className="text-[var(--color-text-muted)]"> — </span>
          <span style={{ color: modeColor }}>{modeConfig[mode].label}</span>
        </h1>
      </motion.div>

      {/* Progress */}
      <div className="h-1 bg-[var(--color-border)] rounded-full mb-5 overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: modeColor }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.4 }}
        />
      </div>

      {!isComplete && (
        <p className="text-sm text-[var(--color-text-muted)] mb-4">
          Click any dot on the map to identify it — {totalCount - answeredCount} remaining
        </p>
      )}

      {/* Map container */}
      <div className="relative w-full rounded-2xl overflow-hidden shadow-sm border border-[var(--color-border)]" style={{ backgroundColor: 'var(--color-water)' }}>
        <ComposableMap
          projection="geoMercator"
          projectionConfig={{ center: config.center, scale: config.scale }}
          width={900}
          height={560}
          style={{ width: '100%', height: 'auto', display: 'block' }}
        >
          <Geographies geography={topology}>
            {({ geographies }) =>
              geographies.map((geo) => <MemoGeo key={geo.rsmKey} geo={geo} />)
            }
          </Geographies>

          {quizItems.map((item) => {
            const state = itemStates[item._uid]
            const isActive = activeId === item._uid
            let fill = modeColor
            let r = 5
            if (state === 'correct') { fill = 'var(--color-correct)'; r = 6 }
            else if (state === 'incorrect') { fill = 'var(--color-incorrect)'; r = 6 }
            if (isActive) r = 8

            return (
              <Marker key={item._uid} coordinates={[item.lng, item.lat]}>
                <g
                  onClick={() => handleMarkerClick(item)}
                  style={{ cursor: state ? 'default' : 'pointer' }}
                >
                  {/* Glow for active */}
                  {isActive && !state && (
                    <circle r={14} fill={modeColor} opacity={0.15} className="marker-pulse" />
                  )}
                  <circle
                    r={r}
                    fill={fill}
                    stroke="#fff"
                    strokeWidth={1.5}
                    style={{ transition: 'all 0.25s ease', filter: isActive ? 'drop-shadow(0 0 4px rgba(0,0,0,0.3))' : 'none' }}
                  />
                  {state === 'correct' && (
                    <text textAnchor="middle" dominantBaseline="central" fill="#fff" fontSize={8} fontWeight={700} style={{ pointerEvents: 'none' }}>✓</text>
                  )}
                  {state === 'incorrect' && (
                    <text textAnchor="middle" dominantBaseline="central" fill="#fff" fontSize={8} fontWeight={700} style={{ pointerEvents: 'none' }}>✗</text>
                  )}
                </g>
              </Marker>
            )
          })}
        </ComposableMap>

        {/* Answer popup */}
        <AnimatePresence>
          {activeId !== null && activeItem && (
            <motion.div
              key={activeId}
              initial={{ opacity: 0, y: 8, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.97 }}
              transition={{ duration: 0.2 }}
              className="absolute bottom-4 left-1/2 -translate-x-1/2 w-80 max-w-[92%] z-10"
            >
              {lastResult && lastResult.uid === activeId ? (
                <div className={`p-4 rounded-2xl shadow-xl backdrop-blur-sm border ${
                  lastResult.correct
                    ? 'bg-[var(--color-correct-bg)]/95 border-[var(--color-correct)]/30'
                    : 'bg-[var(--color-incorrect-bg)]/95 border-[var(--color-incorrect)]/30'
                }`}>
                  <div className="flex items-center gap-2.5">
                    {lastResult.correct ? (
                      <>
                        <div className="w-8 h-8 rounded-full bg-[var(--color-correct)] flex items-center justify-center shrink-0">
                          <CheckCircle className="w-4.5 h-4.5 text-white" />
                        </div>
                        <div>
                          <p className="font-semibold text-[var(--color-correct)] text-sm">Correct!</p>
                          <p className="text-xs text-[var(--color-correct)]/70">{lastResult.correctName}</p>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="w-8 h-8 rounded-full bg-[var(--color-incorrect)] flex items-center justify-center shrink-0">
                          <XCircle className="w-4.5 h-4.5 text-white" />
                        </div>
                        <div>
                          <p className="font-semibold text-[var(--color-incorrect)] text-sm">
                            {lastResult.userAnswer ? 'Not quite' : 'Skipped'}
                          </p>
                          <p className="text-xs text-[var(--color-incorrect)]/70">
                            It's <strong>{lastResult.correctName}</strong>
                          </p>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmitAnswer} className="bg-white/95 backdrop-blur-sm p-4 rounded-2xl shadow-xl border border-[var(--color-border)]">
                  <p className="text-[10px] uppercase tracking-widest text-[var(--color-text-muted)] font-semibold mb-2">{activeCategory}</p>
                  <div className="flex gap-2">
                    <input
                      ref={inputRef}
                      type="text"
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      placeholder="Name this place..."
                      autoComplete="off"
                      className="flex-1 px-3.5 py-2.5 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl text-sm focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent)]/10 focus:outline-none transition-all font-[var(--font-body)]"
                    />
                    <button
                      type="submit"
                      disabled={!inputValue.trim()}
                      className="px-4 py-2.5 text-white text-sm font-semibold rounded-xl disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer font-[var(--font-body)]"
                      style={{ backgroundColor: modeColor }}
                    >
                      Go
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={handleSkip}
                    className="mt-2.5 text-[11px] text-[var(--color-text-muted)] hover:text-[var(--color-incorrect)] transition-colors cursor-pointer bg-transparent border-none p-0 font-[var(--font-body)]"
                  >
                    Skip — I don't know
                  </button>
                </form>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Completion */}
      <AnimatePresence>
        {isComplete && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mt-8"
          >
            {/* Score hero */}
            <div className="text-center mb-6">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', delay: 0.2 }}
                className="inline-flex items-center justify-center w-20 h-20 rounded-full mb-3"
                style={{ backgroundColor: modeColor + '12' }}
              >
                {correctCount === totalCount ? (
                  <Sparkles className="w-9 h-9" style={{ color: modeColor }} />
                ) : (
                  <Trophy className="w-9 h-9" style={{ color: modeColor }} />
                )}
              </motion.div>
              <h2 className="text-3xl font-[var(--font-display)]">
                {correctCount} <span className="text-[var(--color-text-muted)]">/ {totalCount}</span>
              </h2>
              <p className="text-[var(--color-text-muted)] mt-1">
                {correctCount === totalCount ? 'Perfect score! You\'re a geography genius!' :
                 correctCount >= totalCount * 0.8 ? 'Excellent work!' :
                 correctCount >= totalCount * 0.5 ? 'Good effort — keep at it!' :
                 'Room for improvement — try again!'}
              </p>
            </div>

            {/* Answer grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-6">
              {quizItems.map((item, i) => {
                const state = itemStates[item._uid]
                return (
                  <motion.div
                    key={item._uid}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-sm ${
                      state === 'correct' ? 'bg-[var(--color-correct-bg)]' : 'bg-[var(--color-incorrect-bg)]'
                    }`}
                  >
                    {state === 'correct' ? (
                      <CheckCircle className="w-4 h-4 text-[var(--color-correct)] shrink-0" />
                    ) : (
                      <XCircle className="w-4 h-4 text-[var(--color-incorrect)] shrink-0" />
                    )}
                    <span className={`font-medium truncate ${state === 'correct' ? 'text-[var(--color-correct)]' : 'text-[var(--color-incorrect)]'}`}>
                      {item.name}
                    </span>
                    <span className="text-[10px] text-[var(--color-text-muted)] ml-auto capitalize shrink-0">{item.category}</span>
                  </motion.div>
                )
              })}
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={handleReset}
                className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-white border border-[var(--color-border)] rounded-xl hover:border-[var(--color-accent)] hover:shadow-sm transition-all cursor-pointer text-sm font-semibold font-[var(--font-body)]"
              >
                <RotateCcw className="w-4 h-4" /> Try Again
              </button>
              <button
                onClick={() => navigate(`/continent/${continentId}`)}
                className="flex-1 py-3.5 text-white rounded-xl hover:opacity-90 transition-all cursor-pointer text-sm font-semibold font-[var(--font-body)]"
                style={{ backgroundColor: modeColor }}
              >
                Switch Mode
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
