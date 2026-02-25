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

/* ── Tile configs ── */
const TILES = {
  clean: {
    url: 'https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png',
    attr: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>',
  },
  cleanLabels: {
    url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    attr: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>',
  },
  terrain: {
    url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
    attr: '&copy; <a href="https://opentopomap.org">OpenTopoMap</a>',
  },
  satellite: {
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attr: '&copy; Esri',
  },
}

/* Labels-only overlay for satellite mode */
const LABEL_OVERLAY = 'https://{s}.basemaps.cartocdn.com/dark_only_labels/{z}/{x}/{y}{r}.png'

/* ── Categories ── */
const CATEGORIES = [
  { id: 'cities',    label: 'Cities',    icon: Building2, color: '#C8956C' },
  { id: 'mountains', label: 'Mountains', icon: Mountain,  color: '#A78BFA' },
  { id: 'rivers',    label: 'Rivers',    icon: Waves,     color: '#38BDF8' },
  { id: 'lakes',     label: 'Lakes',     icon: Droplets,  color: '#22D3EE' },
  { id: 'features',  label: 'Features',  icon: Landmark,  color: '#FBBF24' },
]

/* ── Continent views ── */
const VIEW = {
  asia:            { center: [30, 85],   zoom: 3 },
  europe:          { center: [52, 15],   zoom: 4 },
  africa:          { center: [5, 20],    zoom: 3 },
  'north-america': { center: [45, -100], zoom: 3 },
  'south-america': { center: [-15, -58], zoom: 3 },
  oceania:         { center: [-25, 140], zoom: 4 },
}

const MAP_STYLES = [
  { id: 'clean',     label: 'Clean',     icon: MapIcon },
  { id: 'terrain',   label: 'Terrain',   icon: TreePine },
  { id: 'satellite', label: 'Satellite', icon: Satellite },
]

function MapReady() {
  const map = useMap()
  useEffect(() => {
    const t = setTimeout(() => map.invalidateSize(), 200)
    return () => clearTimeout(t)
  }, [map])
  return null
}

/* ══════════════════════════════════════════════════════ */
export default function QuizPage() {
  const { continentId } = useParams()
  const navigate = useNavigate()
  const continent = continents[continentId]
  const view = VIEW[continentId] || { center: [20, 0], zoom: 2 }
  const { dispatch } = useQuizContext()

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

  /* load data */
  useEffect(() => {
    selectedCats.forEach(async (cat) => {
      if (catData[cat] || loadingCats[cat]) return
      setLoadingCats(p => ({ ...p, [cat]: true }))
      try {
        const mod = await import(`../data/${continentId}/${cat}.json`)
        const items = (mod.default || mod).map(item => ({ ...item, category: cat, _uid: `${cat}-${item.id}` }))
        setCatData(p => ({ ...p, [cat]: items }))
      } catch { /* skip */ }
      setLoadingCats(p => ({ ...p, [cat]: false }))
    })
  }, [selectedCats, continentId, catData, loadingCats])

  useEffect(() => {
    if (activeId && inputRef.current) setTimeout(() => inputRef.current?.focus(), 80)
  }, [activeId])

  useEffect(() => () => clearTimeout(timeoutRef.current), [])

  const toggleCat = useCallback(id => {
    setSelectedCats(p => p.includes(id) ? p.filter(c => c !== id) : [...p, id])
  }, [])

  const visibleItems = useMemo(() =>
    selectedCats.flatMap(cat => catData[cat] || []),
    [selectedCats, catData],
  )

  const handleMarkerClick = useCallback(item => {
    if (itemStates[item._uid]) return
    clearTimeout(timeoutRef.current)
    setActiveId(item._uid)
    setInputValue('')
    setLastResult(null)
  }, [itemStates])

  const handleSubmit = useCallback(e => {
    e.preventDefault()
    if (!activeId) return
    const item = visibleItems.find(q => q._uid === activeId)
    if (!item || itemStates[item._uid]) return
    const ok = checkAnswer(inputValue, item.acceptedAnswers)
    setItemStates(p => ({ ...p, [item._uid]: ok ? 'correct' : 'incorrect' }))
    setLastResult({ uid: item._uid, correct: ok, name: item.name, answer: inputValue })
    timeoutRef.current = setTimeout(() => { setActiveId(null); setInputValue(''); setLastResult(null) }, 1800)
  }, [activeId, inputValue, visibleItems, itemStates])

  const handleSkip = useCallback(() => {
    if (!activeId) return
    const item = visibleItems.find(q => q._uid === activeId)
    if (!item) return
    setItemStates(p => ({ ...p, [item._uid]: 'incorrect' }))
    setLastResult({ uid: item._uid, correct: false, name: item.name, answer: '' })
    timeoutRef.current = setTimeout(() => { setActiveId(null); setInputValue(''); setLastResult(null) }, 1800)
  }, [activeId, visibleItems])

  const handleReset = useCallback(() => {
    clearTimeout(timeoutRef.current)
    setItemStates({}); setActiveId(null); setInputValue(''); setLastResult(null)
  }, [])

  const answered = visibleItems.filter(i => itemStates[i._uid]).length
  const correct  = visibleItems.filter(i => itemStates[i._uid] === 'correct').length
  const total    = visibleItems.length
  const done     = answered === total && total > 0
  const pct      = total > 0 ? Math.round((answered / total) * 100) : 0
  const activeItem = visibleItems.find(q => q._uid === activeId)

  useEffect(() => {
    if (done) dispatch({ type: 'RECORD_SCORE', payload: { continentId, category: selectedCats.join('+'), correct, total } })
  }, [done]) // eslint-disable-line

  /* Tile layer logic */
  const tileKey = mapStyle === 'clean' && showLabels ? 'cleanLabels' : mapStyle
  const tile = TILES[tileKey] || TILES.clean
  /* Labels overlay: for satellite when labels ON */
  const showOverlay = showLabels && mapStyle === 'satellite'
  /* Terrain always has built-in labels */
  const labelsBuiltIn = mapStyle === 'terrain'

  if (!continent) {
    return (
      <div className="text-center py-20">
        <h2 className="text-3xl mb-4">Continent not found</h2>
        <button onClick={() => navigate('/')} className="text-[var(--color-accent)] underline cursor-pointer bg-transparent border-none font-[var(--font-body)]">Go Home</button>
      </div>
    )
  }

  return (
    <div className="w-full max-w-[1400px] mx-auto px-6 sm:px-10 py-6 sm:py-8">
      {/* ── Header row ── */}
      <div className="flex items-center justify-between mb-6">
        <motion.button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors cursor-pointer bg-transparent border-none p-0 font-[var(--font-body)]"
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="hidden sm:inline">All continents</span>
        </motion.button>

        <motion.h1
          className="text-3xl sm:text-4xl lg:text-5xl tracking-wide"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {continent.name}
        </motion.h1>

        <motion.div
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-full glass text-[var(--color-accent)] text-sm font-medium"
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
        >
          {correct}<span className="opacity-30">/</span><span className="opacity-30">{total}</span>
        </motion.div>
      </div>

      {/* ── Controls: Categories ── */}
      <motion.div
        className="mb-4"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <p className="text-[11px] font-semibold tracking-[0.15em] uppercase text-[var(--color-text-muted)] mb-2.5">Categories</p>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map(cat => {
            const Icon = cat.icon
            const active = selectedCats.includes(cat.id)
            const loading = loadingCats[cat.id] && !catData[cat.id]
            return (
              <button
                key={cat.id}
                onClick={() => toggleCat(cat.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-[13px] font-medium transition-all cursor-pointer border font-[var(--font-body)] ${
                  active
                    ? 'text-white shadow-lg'
                    : 'glass text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:border-[var(--color-accent)]/30'
                }`}
                style={active ? { backgroundColor: cat.color, borderColor: cat.color, boxShadow: `0 4px 16px ${cat.color}30` } : {}}
              >
                <Icon className="w-4 h-4" />
                {cat.label}
                {loading && <span className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />}
              </button>
            )
          })}
        </div>
      </motion.div>

      {/* ── Controls: Map style + Labels ── */}
      <motion.div
        className="flex flex-wrap items-center gap-3 mb-5"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
      >
        <p className="text-[11px] font-semibold tracking-[0.15em] uppercase text-[var(--color-text-muted)] mr-1">Map</p>
        <div className="flex glass rounded-xl p-1">
          {MAP_STYLES.map(s => {
            const Icon = s.icon
            return (
              <button
                key={s.id}
                onClick={() => setMapStyle(s.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium transition-all cursor-pointer border-none font-[var(--font-body)] ${
                  mapStyle === s.id
                    ? 'bg-[var(--color-surface-active)] text-[var(--color-text)] shadow-sm'
                    : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {s.label}
              </button>
            )
          })}
        </div>

        <div className="w-px h-5 bg-[var(--color-border)]" />

        <button
          onClick={() => setShowLabels(v => !v)}
          disabled={labelsBuiltIn}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-[12px] font-medium transition-all cursor-pointer border font-[var(--font-body)] ${
            labelsBuiltIn
              ? 'glass text-[var(--color-text-muted)]/50 cursor-default opacity-50'
              : showLabels
              ? 'bg-[var(--color-accent)] text-white border-[var(--color-accent)] shadow-md shadow-[var(--color-accent-glow)]'
              : 'glass text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:border-[var(--color-accent)]/30'
          }`}
        >
          {showLabels ? <Tag className="w-3.5 h-3.5" /> : <Tags className="w-3.5 h-3.5" />}
          {labelsBuiltIn ? 'Labels built-in' : showLabels ? 'Labels ON' : 'Labels OFF'}
        </button>

        {/* Progress pill */}
        {total > 0 && (
          <div className="ml-auto flex items-center gap-3">
            <span className="text-[12px] text-[var(--color-text-muted)]">{answered}/{total}</span>
            <div className="w-32 h-1.5 bg-[var(--color-surface)] rounded-full overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-[var(--color-accent)]"
                animate={{ width: `${pct}%` }}
                transition={{ duration: 0.4 }}
              />
            </div>
          </div>
        )}
      </motion.div>

      {selectedCats.length === 0 && (
        <p className="text-center text-sm text-[var(--color-text-muted)] py-8">Select at least one category above to start</p>
      )}

      {/* ── MAP ── */}
      <motion.div
        className="relative w-full rounded-2xl overflow-hidden border border-[var(--color-border)]"
        style={{ height: 'clamp(420px, 65vh, 700px)' }}
        initial={{ opacity: 0, y: 12 }}
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
          style={{ height: '100%', width: '100%', background: '#0B0F14' }}
          zoomControl={true}
        >
          <MapReady />
          <TileLayer key={tileKey} url={tile.url} attribution={tile.attr} />
          {showOverlay && (
            <TileLayer url={LABEL_OVERLAY} attribution="" pane="overlayPane" />
          )}

          {visibleItems.map(item => {
            const st = itemStates[item._uid]
            const isActive = activeId === item._uid
            const catConf = CATEGORIES.find(c => c.id === item.category)
            let fillColor = catConf?.color || '#C8956C'
            let radius = 7
            let fillOpacity = 0.85
            if (st === 'correct')   { fillColor = 'var(--color-correct)'; radius = 8 }
            if (st === 'incorrect') { fillColor = 'var(--color-incorrect)'; radius = 8 }
            if (isActive)           { radius = 11; fillOpacity = 1 }

            return (
              <CircleMarker
                key={item._uid}
                center={[item.lat, item.lng]}
                radius={radius}
                pathOptions={{
                  fillColor,
                  color: isActive ? '#fff' : 'rgba(255,255,255,0.4)',
                  weight: isActive ? 2.5 : 1.5,
                  fillOpacity,
                  opacity: 1,
                }}
                eventHandlers={{ click: () => handleMarkerClick(item) }}
              >
                {st && (
                  <Tooltip permanent direction="top" offset={[0, -10]} className="quiz-tooltip">
                    <span style={{
                      color: st === 'correct' ? 'var(--color-correct)' : 'var(--color-incorrect)',
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
              initial={{ opacity: 0, y: 10, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.96 }}
              transition={{ duration: 0.2 }}
              className="absolute bottom-5 left-1/2 -translate-x-1/2 w-[340px] max-w-[92%] z-[1000]"
            >
              {lastResult && lastResult.uid === activeId ? (
                <div className={`p-4 rounded-2xl shadow-2xl border ${
                  lastResult.correct
                    ? 'bg-[var(--color-correct-bg)] border-[var(--color-correct)]/20'
                    : 'bg-[var(--color-incorrect-bg)] border-[var(--color-incorrect)]/20'
                }`} style={{ backdropFilter: 'blur(20px)' }}>
                  <div className="flex items-center gap-3">
                    {lastResult.correct ? (
                      <>
                        <div className="w-9 h-9 rounded-full bg-[var(--color-correct)] flex items-center justify-center shrink-0">
                          <CheckCircle className="w-5 h-5 text-[var(--color-bg)]" />
                        </div>
                        <div>
                          <p className="font-semibold text-[var(--color-correct)] text-sm">Correct!</p>
                          <p className="text-xs text-[var(--color-correct)]/60">{lastResult.name}</p>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="w-9 h-9 rounded-full bg-[var(--color-incorrect)] flex items-center justify-center shrink-0">
                          <XCircle className="w-5 h-5 text-[var(--color-bg)]" />
                        </div>
                        <div>
                          <p className="font-semibold text-[var(--color-incorrect)] text-sm">
                            {lastResult.answer ? 'Not quite' : 'Skipped'}
                          </p>
                          <p className="text-xs text-[var(--color-incorrect)]/60">
                            It was <strong>{lastResult.name}</strong>
                          </p>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              ) : (
                <div className="glass-light p-4 rounded-2xl shadow-2xl">
                  <p className="text-[10px] uppercase tracking-[0.15em] text-[var(--color-text-muted)] font-semibold mb-2.5">
                    {activeItem.category} — {activeItem.hint || 'Name this place'}
                  </p>
                  <form onSubmit={handleSubmit} className="flex gap-2">
                    <input
                      ref={inputRef}
                      type="text"
                      value={inputValue}
                      onChange={e => setInputValue(e.target.value)}
                      placeholder="Your answer..."
                      autoComplete="off"
                      className="flex-1 px-3.5 py-2.5 bg-[var(--color-bg)]/60 border border-[var(--color-border)] rounded-xl text-sm text-[var(--color-text)] placeholder-[var(--color-text-muted)] focus:border-[var(--color-accent)] focus:ring-1 focus:ring-[var(--color-accent)]/30 focus:outline-none transition-all font-[var(--font-body)]"
                    />
                    <button
                      type="submit"
                      disabled={!inputValue.trim()}
                      className="px-4 py-2.5 bg-[var(--color-accent)] text-white text-sm font-semibold rounded-xl disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer font-[var(--font-body)] shadow-md shadow-[var(--color-accent-glow)] hover:bg-[var(--color-accent-hover)]"
                    >
                      Go
                    </button>
                  </form>
                  <button
                    type="button"
                    onClick={handleSkip}
                    className="mt-2.5 text-[11px] text-[var(--color-text-muted)] hover:text-[var(--color-incorrect)] transition-colors cursor-pointer bg-transparent border-none p-0 font-[var(--font-body)]"
                  >
                    Skip — I don't know
                  </button>
                </div>
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
            className="mt-10"
          >
            <div className="text-center mb-8">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', delay: 0.2 }}
                className="inline-flex items-center justify-center w-20 h-20 rounded-full mb-4"
                style={{ background: 'var(--color-accent-light)' }}
              >
                {correct === total
                  ? <Sparkles className="w-9 h-9 text-[var(--color-accent)]" />
                  : <Trophy className="w-9 h-9 text-[var(--color-accent)]" />
                }
              </motion.div>
              <h2 className="text-4xl font-[var(--font-display)] tracking-wide">
                {correct} <span className="text-[var(--color-text-muted)]">/ {total}</span>
              </h2>
              <p className="text-[var(--color-text-muted)] mt-2 font-light">
                {correct === total ? 'Perfect score! Geography genius!' :
                 correct >= total * 0.8 ? 'Excellent work!' :
                 correct >= total * 0.5 ? 'Good effort — keep at it!' :
                 'Room for improvement — try again!'}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 mb-8 max-w-4xl mx-auto">
              {visibleItems.map((item, i) => {
                const st = itemStates[item._uid]
                return (
                  <motion.div
                    key={item._uid}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.02 }}
                    className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-sm ${
                      st === 'correct' ? 'bg-[var(--color-correct-bg)]' : 'bg-[var(--color-incorrect-bg)]'
                    }`}
                  >
                    {st === 'correct'
                      ? <CheckCircle className="w-4 h-4 text-[var(--color-correct)] shrink-0" />
                      : <XCircle className="w-4 h-4 text-[var(--color-incorrect)] shrink-0" />
                    }
                    <span className={`font-medium truncate ${st === 'correct' ? 'text-[var(--color-correct)]' : 'text-[var(--color-incorrect)]'}`}>
                      {item.name}
                    </span>
                    <span className="text-[10px] text-[var(--color-text-muted)] ml-auto capitalize shrink-0">{item.category}</span>
                  </motion.div>
                )
              })}
            </div>

            <div className="flex gap-4 justify-center">
              <button
                onClick={handleReset}
                className="flex items-center justify-center gap-2 px-7 py-3.5 glass rounded-xl hover:border-[var(--color-accent)]/30 transition-all cursor-pointer text-sm font-semibold font-[var(--font-body)] text-[var(--color-text)]"
              >
                <RotateCcw className="w-4 h-4" /> Try Again
              </button>
              <button
                onClick={() => navigate('/')}
                className="px-7 py-3.5 bg-[var(--color-accent)] text-white rounded-xl hover:bg-[var(--color-accent-hover)] transition-all cursor-pointer text-sm font-semibold font-[var(--font-body)] shadow-lg shadow-[var(--color-accent-glow)]"
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
