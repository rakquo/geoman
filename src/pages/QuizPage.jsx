import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { MapContainer, TileLayer, CircleMarker, Tooltip, useMap } from 'react-leaflet'
import {
  Building2, Mountain, Waves, Droplets, Landmark,
  Map as MapIcon, Satellite, TreePine, Tag, Tags,
  ArrowLeft, CheckCircle, XCircle, RotateCcw, Trophy, Sparkles,
} from 'lucide-react'
import { continents } from '../data/continents'
import { checkAnswer } from '../utils/scoring'
import { useQuizContext } from '../context/QuizContext'
import 'leaflet/dist/leaflet.css'

/* ── Tile layer configs (all free, no API key) ── */
const TILES = {
  clean: {
    url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager_nolabels/{z}/{x}/{y}{r}.png',
    attr: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>',
  },
  cleanLabels: {
    url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
    attr: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>',
  },
  terrain: {
    url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
    attr: '&copy; <a href="https://opentopomap.org">OpenTopoMap</a> &copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>',
  },
  satellite: {
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attr: '&copy; <a href="https://www.esri.com/">Esri</a>',
  },
}

/* ── Category definitions ── */
const CATEGORIES = [
  { id: 'cities', label: 'Cities', icon: Building2, color: '#4F46E5' },
  { id: 'mountains', label: 'Mountains', icon: Mountain, color: '#7C3AED' },
  { id: 'rivers', label: 'Rivers', icon: Waves, color: '#0EA5E9' },
  { id: 'lakes', label: 'Lakes', icon: Droplets, color: '#06B6D4' },
  { id: 'features', label: 'Features', icon: Landmark, color: '#D97706' },
]

/* ── Continent map centers and zoom ── */
const VIEW = {
  asia:            { center: [30, 85],   zoom: 3 },
  europe:          { center: [52, 15],   zoom: 4 },
  africa:          { center: [5, 20],    zoom: 3 },
  'north-america': { center: [45, -100], zoom: 3 },
  'south-america': { center: [-15, -58], zoom: 3 },
  oceania:         { center: [-25, 140], zoom: 4 },
}

/* ── Map style button defs ── */
const MAP_STYLES = [
  { id: 'clean', label: 'Clean', icon: MapIcon },
  { id: 'terrain', label: 'Terrain', icon: TreePine },
  { id: 'satellite', label: 'Satellite', icon: Satellite },
]

/* Helper: Invalidate map size after mount */
function MapReady() {
  const map = useMap()
  useEffect(() => {
    const t = setTimeout(() => map.invalidateSize(), 200)
    return () => clearTimeout(t)
  }, [map])
  return null
}

/* ═══════════════════════════════════════════════════ */
export default function QuizPage() {
  const { continentId } = useParams()
  const navigate = useNavigate()
  const continent = continents[continentId]
  const view = VIEW[continentId] || { center: [20, 0], zoom: 2 }
  const { dispatch } = useQuizContext()

  /* ── state ── */
  const [selectedCats, setSelectedCats] = useState(['cities'])
  const [catData, setCatData] = useState({})
  const [loadingCats, setLoadingCats] = useState({})
  const [mapStyle, setMapStyle] = useState('clean')
  const [showLabels, setShowLabels] = useState(false)
  const [itemStates, setItemStates] = useState({})
  const [activeId, setActiveId] = useState(null)
  const [inputValue, setInputValue] = useState('')
  const [lastResult, setLastResult] = useState(null)
  const inputRef = useRef(null)
  const timeoutRef = useRef(null)

  /* ── load category data on toggle ── */
  useEffect(() => {
    selectedCats.forEach(async (cat) => {
      if (catData[cat] || loadingCats[cat]) return
      setLoadingCats(prev => ({ ...prev, [cat]: true }))
      try {
        const mod = await import(`../data/${continentId}/${cat}.json`)
        const items = (mod.default || mod).map(item => ({
          ...item,
          category: cat,
          _uid: `${cat}-${item.id}`,
        }))
        setCatData(prev => ({ ...prev, [cat]: items }))
      } catch { /* no data for this combo */ }
      setLoadingCats(prev => ({ ...prev, [cat]: false }))
    })
  }, [selectedCats, continentId, catData, loadingCats])

  /* ── focus input ── */
  useEffect(() => {
    if (activeId && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 80)
    }
  }, [activeId])

  useEffect(() => () => clearTimeout(timeoutRef.current), [])

  const toggleCat = useCallback((id) => {
    setSelectedCats(prev =>
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    )
  }, [])

  const visibleItems = useMemo(() =>
    selectedCats.flatMap(cat => catData[cat] || []),
    [selectedCats, catData],
  )

  const handleMarkerClick = useCallback((item) => {
    if (itemStates[item._uid]) return
    clearTimeout(timeoutRef.current)
    setActiveId(item._uid)
    setInputValue('')
    setLastResult(null)
  }, [itemStates])

  const handleSubmit = useCallback((e) => {
    e.preventDefault()
    if (!activeId) return
    const item = visibleItems.find(q => q._uid === activeId)
    if (!item || itemStates[item._uid]) return
    const ok = checkAnswer(inputValue, item.acceptedAnswers)
    setItemStates(prev => ({ ...prev, [item._uid]: ok ? 'correct' : 'incorrect' }))
    setLastResult({ uid: item._uid, correct: ok, name: item.name, answer: inputValue })
    timeoutRef.current = setTimeout(() => {
      setActiveId(null)
      setInputValue('')
      setLastResult(null)
    }, 1800)
  }, [activeId, inputValue, visibleItems, itemStates])

  const handleSkip = useCallback(() => {
    if (!activeId) return
    const item = visibleItems.find(q => q._uid === activeId)
    if (!item) return
    setItemStates(prev => ({ ...prev, [item._uid]: 'incorrect' }))
    setLastResult({ uid: item._uid, correct: false, name: item.name, answer: '' })
    timeoutRef.current = setTimeout(() => {
      setActiveId(null)
      setInputValue('')
      setLastResult(null)
    }, 1800)
  }, [activeId, visibleItems])

  const handleReset = useCallback(() => {
    clearTimeout(timeoutRef.current)
    setItemStates({})
    setActiveId(null)
    setInputValue('')
    setLastResult(null)
  }, [])

  const answered = visibleItems.filter(i => itemStates[i._uid]).length
  const correct  = visibleItems.filter(i => itemStates[i._uid] === 'correct').length
  const total    = visibleItems.length
  const done     = answered === total && total > 0
  const pct      = total > 0 ? Math.round((answered / total) * 100) : 0
  const activeItem = visibleItems.find(q => q._uid === activeId)

  useEffect(() => {
    if (done) {
      dispatch({
        type: 'RECORD_SCORE',
        payload: { continentId, category: selectedCats.join('+'), correct, total },
      })
    }
  }, [done]) // eslint-disable-line

  const tileKey = mapStyle === 'clean' && showLabels ? 'cleanLabels' : mapStyle
  const tile = TILES[tileKey] || TILES.clean

  if (!continent) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl mb-4">Continent not found</h2>
        <button onClick={() => navigate('/')} className="text-[var(--color-accent)] underline cursor-pointer bg-transparent border-none font-[var(--font-body)]">Go Home</button>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto pb-8">
      {/* ── Header ── */}
      <div className="flex items-center justify-between mb-5">
        <motion.button
          onClick={() => navigate('/')}
          className="flex items-center gap-1.5 text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors cursor-pointer bg-transparent border-none p-0 font-[var(--font-body)]"
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <ArrowLeft className="w-4 h-4" />
          All continents
        </motion.button>
        <motion.div
          className="flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium glass-card shadow-sm text-[var(--color-accent)]"
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <span>{correct}</span>
          <span className="opacity-40">/</span>
          <span className="opacity-40">{total}</span>
        </motion.div>
      </div>

      {/* ── Title ── */}
      <motion.h1
        className="text-3xl sm:text-4xl text-center mb-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        {continent.name}
      </motion.h1>

      {/* ── Category toggles ── */}
      <motion.div
        className="flex flex-wrap justify-center gap-2 mb-4"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        {CATEGORIES.map(cat => {
          const Icon = cat.icon
          const active = selectedCats.includes(cat.id)
          const isLoading = loadingCats[cat.id] && !catData[cat.id]
          return (
            <button
              key={cat.id}
              onClick={() => toggleCat(cat.id)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-medium transition-all cursor-pointer border font-[var(--font-body)] ${
                active
                  ? 'text-white shadow-md'
                  : 'bg-white/60 text-[var(--color-text-muted)] border-[var(--color-border)] hover:bg-white/80'
              }`}
              style={active ? { backgroundColor: cat.color, borderColor: cat.color } : {}}
            >
              <Icon className="w-3.5 h-3.5" />
              {cat.label}
              {isLoading && <span className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />}
            </button>
          )
        })}
      </motion.div>

      {/* ── Map controls ── */}
      <motion.div
        className="flex flex-wrap items-center justify-center gap-2 mb-5"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
      >
        <div className="flex bg-white/60 rounded-lg p-0.5 border border-[var(--color-border)]">
          {MAP_STYLES.map(s => {
            const Icon = s.icon
            return (
              <button
                key={s.id}
                onClick={() => setMapStyle(s.id)}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs font-medium transition-all cursor-pointer border-none font-[var(--font-body)] ${
                  mapStyle === s.id
                    ? 'bg-white text-[var(--color-text)] shadow-sm'
                    : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
                }`}
              >
                <Icon className="w-3 h-3" />
                {s.label}
              </button>
            )
          })}
        </div>
        <button
          onClick={() => setShowLabels(v => !v)}
          className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer border font-[var(--font-body)] ${
            showLabels
              ? 'bg-[var(--color-accent)] text-white border-[var(--color-accent)] shadow-sm'
              : 'bg-white/60 text-[var(--color-text-muted)] border-[var(--color-border)] hover:bg-white/80'
          }`}
        >
          {showLabels ? <Tag className="w-3 h-3" /> : <Tags className="w-3 h-3" />}
          Labels {showLabels ? 'ON' : 'OFF'}
        </button>
      </motion.div>

      {/* ── Progress ── */}
      {total > 0 && (
        <div className="mb-4">
          <div className="flex justify-between text-xs text-[var(--color-text-muted)] mb-1.5 px-0.5">
            <span>{answered} of {total} answered</span>
            <span>{pct}%</span>
          </div>
          <div className="h-1.5 bg-white/60 rounded-full overflow-hidden shadow-inner">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-[var(--color-accent)] to-purple-500"
              animate={{ width: `${pct}%` }}
              transition={{ duration: 0.4 }}
            />
          </div>
        </div>
      )}
      {total === 0 && selectedCats.length > 0 && (
        <p className="text-center text-sm text-[var(--color-text-muted)] mb-4">Loading quiz data...</p>
      )}
      {selectedCats.length === 0 && (
        <p className="text-center text-sm text-[var(--color-text-muted)] mb-4">Select at least one category above to start</p>
      )}

      {/* ── MAP ── */}
      <motion.div
        className="relative w-full rounded-2xl overflow-hidden shadow-lg border border-white/30"
        style={{ height: 'clamp(400px, 60vh, 600px)' }}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <MapContainer
          key={continentId}
          center={view.center}
          zoom={view.zoom}
          minZoom={2}
          maxZoom={14}
          scrollWheelZoom={true}
          style={{ height: '100%', width: '100%', background: '#B8D4E8' }}
          zoomControl={true}
        >
          <MapReady />
          <TileLayer key={tileKey} url={tile.url} attribution={tile.attr} />

          {visibleItems.map(item => {
            const st = itemStates[item._uid]
            const isActive = activeId === item._uid
            const catConf = CATEGORIES.find(c => c.id === item.category)
            let fillColor = catConf?.color || '#4F46E5'
            let radius = 7
            let fillOpacity = 0.9
            if (st === 'correct')   { fillColor = '#16A34A'; radius = 8 }
            if (st === 'incorrect') { fillColor = '#DC2626'; radius = 8 }
            if (isActive)           { radius = 10; fillOpacity = 1 }

            return (
              <CircleMarker
                key={item._uid}
                center={[item.lat, item.lng]}
                radius={radius}
                pathOptions={{ fillColor, color: '#fff', weight: 2, fillOpacity, opacity: 1 }}
                eventHandlers={{ click: () => handleMarkerClick(item) }}
              >
                {st && (
                  <Tooltip permanent direction="top" offset={[0, -10]} className="quiz-tooltip">
                    <span style={{
                      color: st === 'correct' ? '#16A34A' : '#DC2626',
                      fontWeight: 600,
                      fontSize: '11px',
                    }}>
                      {item.name}
                    </span>
                  </Tooltip>
                )}
              </CircleMarker>
            )
          })}
        </MapContainer>

        {/* ── Answer popup ── */}
        <AnimatePresence>
          {activeId !== null && activeItem && (
            <motion.div
              key={activeId}
              initial={{ opacity: 0, y: 8, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.97 }}
              transition={{ duration: 0.2 }}
              className="absolute bottom-4 left-1/2 -translate-x-1/2 w-80 max-w-[92%] z-[1000]"
            >
              {lastResult && lastResult.uid === activeId ? (
                <div className={`p-4 rounded-2xl shadow-xl border ${
                  lastResult.correct
                    ? 'bg-[var(--color-correct-bg)] border-[var(--color-correct)]/30'
                    : 'bg-[var(--color-incorrect-bg)] border-[var(--color-incorrect)]/30'
                }`}>
                  <div className="flex items-center gap-2.5">
                    {lastResult.correct ? (
                      <>
                        <div className="w-8 h-8 rounded-full bg-[var(--color-correct)] flex items-center justify-center shrink-0">
                          <CheckCircle className="w-4.5 h-4.5 text-white" />
                        </div>
                        <div>
                          <p className="font-semibold text-[var(--color-correct)] text-sm">Correct!</p>
                          <p className="text-xs text-[var(--color-correct)]/70">{lastResult.name}</p>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="w-8 h-8 rounded-full bg-[var(--color-incorrect)] flex items-center justify-center shrink-0">
                          <XCircle className="w-4.5 h-4.5 text-white" />
                        </div>
                        <div>
                          <p className="font-semibold text-[var(--color-incorrect)] text-sm">
                            {lastResult.answer ? 'Not quite' : 'Skipped'}
                          </p>
                          <p className="text-xs text-[var(--color-incorrect)]/70">
                            It's <strong>{lastResult.name}</strong>
                          </p>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="glass-card p-4 rounded-2xl shadow-xl">
                  <p className="text-[10px] uppercase tracking-widest text-[var(--color-text-muted)] font-semibold mb-2">
                    {activeItem.category} — {activeItem.hint || 'Name this place'}
                  </p>
                  <div className="flex gap-2">
                    <input
                      ref={inputRef}
                      type="text"
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      placeholder="Your answer..."
                      autoComplete="off"
                      className="flex-1 px-3.5 py-2.5 bg-white/80 border border-[var(--color-border)] rounded-xl text-sm focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent)]/10 focus:outline-none transition-all font-[var(--font-body)]"
                    />
                    <button
                      type="submit"
                      disabled={!inputValue.trim()}
                      className="px-4 py-2.5 bg-[var(--color-accent)] text-white text-sm font-semibold rounded-xl disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer font-[var(--font-body)] shadow-md hover:bg-[var(--color-accent-hover)]"
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
      </motion.div>

      {/* ── Completion ── */}
      <AnimatePresence>
        {done && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mt-8"
          >
            <div className="text-center mb-6">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', delay: 0.2 }}
                className="inline-flex items-center justify-center w-20 h-20 rounded-full mb-3 bg-[var(--color-accent-light)]"
              >
                {correct === total ? (
                  <Sparkles className="w-9 h-9 text-[var(--color-accent)]" />
                ) : (
                  <Trophy className="w-9 h-9 text-[var(--color-accent)]" />
                )}
              </motion.div>
              <h2 className="text-3xl font-[var(--font-display)]">
                {correct} <span className="text-[var(--color-text-muted)]">/ {total}</span>
              </h2>
              <p className="text-[var(--color-text-muted)] mt-1">
                {correct === total ? 'Perfect score! Geography genius!' :
                 correct >= total * 0.8 ? 'Excellent work!' :
                 correct >= total * 0.5 ? 'Good effort — keep at it!' :
                 'Room for improvement — try again!'}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-6 max-w-2xl mx-auto">
              {visibleItems.map((item, i) => {
                const st = itemStates[item._uid]
                return (
                  <motion.div
                    key={item._uid}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-sm ${
                      st === 'correct' ? 'bg-[var(--color-correct-bg)]' : 'bg-[var(--color-incorrect-bg)]'
                    }`}
                  >
                    {st === 'correct' ? (
                      <CheckCircle className="w-4 h-4 text-[var(--color-correct)] shrink-0" />
                    ) : (
                      <XCircle className="w-4 h-4 text-[var(--color-incorrect)] shrink-0" />
                    )}
                    <span className={`font-medium truncate ${st === 'correct' ? 'text-[var(--color-correct)]' : 'text-[var(--color-incorrect)]'}`}>
                      {item.name}
                    </span>
                    <span className="text-[10px] text-[var(--color-text-muted)] ml-auto capitalize shrink-0">{item.category}</span>
                  </motion.div>
                )
              })}
            </div>

            <div className="flex gap-3 justify-center">
              <button
                onClick={handleReset}
                className="flex items-center justify-center gap-2 px-6 py-3.5 glass-card rounded-xl hover:shadow-md transition-all cursor-pointer text-sm font-semibold font-[var(--font-body)]"
              >
                <RotateCcw className="w-4 h-4" /> Try Again
              </button>
              <button
                onClick={() => navigate('/')}
                className="px-6 py-3.5 bg-[var(--color-accent)] text-white rounded-xl hover:bg-[var(--color-accent-hover)] transition-all cursor-pointer text-sm font-semibold font-[var(--font-body)] shadow-md"
              >
                Pick Another
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
