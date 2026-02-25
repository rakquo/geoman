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
import { useTheme } from '../context/ThemeContext'
import Button from '../components/Button'
import 'leaflet/dist/leaflet.css'

/* ── Categories ── */
const CATEGORIES = [
  { id: 'cities',    label: 'Cities',    icon: Building2, color: '#4A8AB8' },
  { id: 'mountains', label: 'Mountains', icon: Mountain,  color: '#8B6CE0' },
  { id: 'rivers',    label: 'Rivers',    icon: Waves,     color: '#2BA0D8' },
  { id: 'lakes',     label: 'Lakes',     icon: Droplets,  color: '#18B8C8' },
  { id: 'features',  label: 'Features',  icon: Landmark,  color: '#D89018' },
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

const ATTR = '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>'

function MapReady() {
  const map = useMap()
  useEffect(() => {
    const t = setTimeout(() => map.invalidateSize(), 200)
    return () => clearTimeout(t)
  }, [map])
  return null
}

/* ══════════════════════════════════════════════════ */
export default function QuizPage() {
  const { continentId } = useParams()
  const navigate = useNavigate()
  const continent = continents[continentId]
  const view = VIEW[continentId] || { center: [20, 0], zoom: 2 }
  const { dispatch } = useQuizContext()
  const { isDark } = useTheme()

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

  /* Tile URLs depend on dark/light theme */
  const tiles = useMemo(() => ({
    clean: {
      url: isDark
        ? 'https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png'
        : 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager_nolabels/{z}/{x}/{y}{r}.png',
      attr: ATTR,
    },
    cleanLabels: {
      url: isDark
        ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
        : 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
      attr: ATTR,
    },
    terrain: {
      url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
      attr: '&copy; <a href="https://opentopomap.org">OpenTopoMap</a>',
    },
    satellite: {
      url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      attr: '&copy; Esri',
    },
  }), [isDark])

  const labelOverlayUrl = isDark
    ? 'https://{s}.basemaps.cartocdn.com/dark_only_labels/{z}/{x}/{y}{r}.png'
    : 'https://{s}.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}{r}.png'

  /* Load category data */
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
    setActiveId(item._uid); setInputValue(''); setLastResult(null)
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

  const tileKey = mapStyle === 'clean' && showLabels ? 'cleanLabels' : mapStyle
  const tile = tiles[tileKey] || tiles.clean
  const showOverlay = showLabels && mapStyle === 'satellite'
  const labelsBuiltIn = mapStyle === 'terrain'

  if (!continent) {
    return (
      <div className="text-center py-20">
        <h2 className="text-3xl mb-4">Continent not found</h2>
        <Button variant="ghost" onClick={() => navigate('/')}>Go Home</Button>
      </div>
    )
  }

  return (
    <div className="w-full max-w-[1200px] mx-auto px-5 sm:px-8 py-6 sm:py-10">
      {/* ── Header ── */}
      <div className="flex items-center justify-between mb-8">
        <Button variant="ghost" size="sm" onClick={() => navigate('/')}>
          <ArrowLeft className="w-4 h-4" />
          <span className="hidden sm:inline">All continents</span>
        </Button>

        <motion.h1
          className="text-3xl sm:text-4xl"
          style={{ fontFamily: 'var(--font-display)', color: 'var(--text)' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {continent.name}
        </motion.h1>

        <div
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-semibold"
          style={{ background: 'var(--accent-light)', color: 'var(--accent)' }}
        >
          {correct}<span className="opacity-40 mx-0.5">/</span><span className="opacity-40">{total}</span>
        </div>
      </div>

      {/* ── Categories ── */}
      <motion.div
        className="mb-6"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.08 }}
      >
        <p className="text-[11px] font-bold tracking-[0.12em] uppercase mb-3" style={{ color: 'var(--text-muted)' }}>
          Categories
        </p>
        <div className="flex flex-wrap gap-3">
          {CATEGORIES.map(cat => {
            const Icon = cat.icon
            const active = selectedCats.includes(cat.id)
            const loading = loadingCats[cat.id] && !catData[cat.id]
            return (
              <Button
                key={cat.id}
                size="md"
                active={active}
                onClick={() => toggleCat(cat.id)}
                style={active ? { background: cat.color, borderColor: cat.color } : {}}
              >
                <Icon className="w-4 h-4" />
                {cat.label}
                {loading && <span className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />}
              </Button>
            )
          })}
        </div>
      </motion.div>

      {/* ── Map controls row ── */}
      <motion.div
        className="flex flex-wrap items-center gap-4 mb-6"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.12 }}
      >
        {/* Map style */}
        <div className="flex items-center gap-2">
          <p className="text-[11px] font-bold tracking-[0.12em] uppercase mr-1" style={{ color: 'var(--text-muted)' }}>Map</p>
          <div className="flex rounded-xl p-1 border" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
            {MAP_STYLES.map(s => {
              const Icon = s.icon
              const active = mapStyle === s.id
              return (
                <button
                  key={s.id}
                  onClick={() => setMapStyle(s.id)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-all cursor-pointer border-none"
                  style={{
                    fontFamily: 'var(--font-body)',
                    background: active ? 'var(--accent)' : 'transparent',
                    color: active ? '#fff' : 'var(--text-muted)',
                  }}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{s.label}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Divider */}
        <div className="w-px h-6 hidden sm:block" style={{ background: 'var(--border)' }} />

        {/* Labels toggle */}
        <Button
          size="sm"
          active={showLabels && !labelsBuiltIn}
          onClick={() => !labelsBuiltIn && setShowLabels(v => !v)}
          className={labelsBuiltIn ? 'opacity-50 pointer-events-none' : ''}
        >
          {showLabels ? <Tag className="w-3.5 h-3.5" /> : <Tags className="w-3.5 h-3.5" />}
          {labelsBuiltIn ? 'Labels built-in' : showLabels ? 'Labels ON' : 'Labels OFF'}
        </Button>

        {/* Progress */}
        {total > 0 && (
          <div className="flex items-center gap-3 ml-auto">
            <span className="text-[12px] font-medium" style={{ color: 'var(--text-muted)' }}>{answered}/{total}</span>
            <div className="w-24 sm:w-36 h-2 rounded-full overflow-hidden" style={{ background: 'var(--border)' }}>
              <motion.div
                className="h-full rounded-full"
                style={{ background: 'var(--accent)' }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 0.4 }}
              />
            </div>
          </div>
        )}
      </motion.div>

      {selectedCats.length === 0 && (
        <p className="text-center text-sm py-10" style={{ color: 'var(--text-muted)' }}>Select at least one category above to start</p>
      )}

      {/* ── MAP ── */}
      <motion.div
        className="relative w-full rounded-2xl overflow-hidden shadow-elevated"
        style={{ height: 'clamp(380px, 62vh, 660px)', border: '1px solid var(--border)' }}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.15 }}
      >
        <MapContainer
          key={`${continentId}-${isDark}`}
          center={view.center}
          zoom={view.zoom}
          minZoom={2}
          maxZoom={14}
          scrollWheelZoom={true}
          style={{ height: '100%', width: '100%', background: 'var(--map-bg)' }}
          zoomControl={true}
        >
          <MapReady />
          <TileLayer key={tileKey} url={tile.url} attribution={tile.attr} />
          {showOverlay && <TileLayer url={labelOverlayUrl} attribution="" pane="overlayPane" />}

          {visibleItems.map(item => {
            const st = itemStates[item._uid]
            const isActive = activeId === item._uid
            const catConf = CATEGORIES.find(c => c.id === item.category)
            let fillColor = catConf?.color || '#4A8AB8'
            let radius = 7
            let fillOpacity = 0.85
            if (st === 'correct')   { fillColor = 'var(--correct)'; radius = 8 }
            if (st === 'incorrect') { fillColor = 'var(--incorrect)'; radius = 8 }
            if (isActive)           { radius = 11; fillOpacity = 1 }

            return (
              <CircleMarker
                key={item._uid}
                center={[item.lat, item.lng]}
                radius={radius}
                pathOptions={{
                  fillColor,
                  color: isActive ? '#fff' : 'rgba(255,255,255,0.6)',
                  weight: isActive ? 2.5 : 1.5,
                  fillOpacity,
                }}
                eventHandlers={{ click: () => handleMarkerClick(item) }}
              >
                {st && (
                  <Tooltip permanent direction="top" offset={[0, -10]} className="quiz-tooltip">
                    <span style={{
                      color: st === 'correct' ? 'var(--correct)' : 'var(--incorrect)',
                      fontWeight: 700,
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
              className="absolute bottom-4 left-1/2 -translate-x-1/2 w-[360px] max-w-[92%] z-[1000]"
            >
              {lastResult && lastResult.uid === activeId ? (
                <div
                  className="p-4 rounded-2xl shadow-elevated border"
                  style={{
                    background: lastResult.correct ? 'var(--correct-bg)' : 'var(--incorrect-bg)',
                    borderColor: lastResult.correct ? 'var(--correct)' : 'var(--incorrect)',
                    backdropFilter: 'blur(20px)',
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
                      style={{ background: lastResult.correct ? 'var(--correct)' : 'var(--incorrect)' }}
                    >
                      {lastResult.correct
                        ? <CheckCircle className="w-5 h-5 text-white" />
                        : <XCircle className="w-5 h-5 text-white" />
                      }
                    </div>
                    <div>
                      <p className="font-bold text-sm" style={{ color: lastResult.correct ? 'var(--correct)' : 'var(--incorrect)' }}>
                        {lastResult.correct ? 'Correct!' : lastResult.answer ? 'Not quite' : 'Skipped'}
                      </p>
                      <p className="text-xs opacity-70" style={{ color: lastResult.correct ? 'var(--correct)' : 'var(--incorrect)' }}>
                        {lastResult.correct ? lastResult.name : <>It was <strong>{lastResult.name}</strong></>}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div
                  className="p-4 rounded-2xl shadow-elevated border"
                  style={{ background: 'var(--surface)', borderColor: 'var(--border)', backdropFilter: 'blur(20px)' }}
                >
                  <p className="text-[10px] font-bold uppercase tracking-[0.12em] mb-2.5" style={{ color: 'var(--text-muted)' }}>
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
                      className="flex-1 h-10 px-3.5 rounded-xl text-sm transition-all outline-none"
                      style={{
                        fontFamily: 'var(--font-body)',
                        background: 'var(--bg)',
                        border: '1px solid var(--border)',
                        color: 'var(--text)',
                      }}
                      onFocus={e => { e.target.style.borderColor = 'var(--accent)' }}
                      onBlur={e => { e.target.style.borderColor = 'var(--border)' }}
                    />
                    <Button variant="primary" size="md" disabled={!inputValue.trim()}>
                      Go
                    </Button>
                  </form>
                  <button
                    type="button"
                    onClick={handleSkip}
                    className="mt-2.5 text-[11px] transition-colors cursor-pointer bg-transparent border-none p-0"
                    style={{ fontFamily: 'var(--font-body)', color: 'var(--text-muted)' }}
                    onMouseEnter={e => { e.target.style.color = 'var(--incorrect)' }}
                    onMouseLeave={e => { e.target.style.color = 'var(--text-muted)' }}
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
                style={{ background: 'var(--accent-light)' }}
              >
                {correct === total
                  ? <Sparkles className="w-9 h-9" style={{ color: 'var(--accent)' }} />
                  : <Trophy className="w-9 h-9" style={{ color: 'var(--accent)' }} />
                }
              </motion.div>
              <h2 className="text-4xl" style={{ fontFamily: 'var(--font-display)' }}>
                {correct} <span style={{ color: 'var(--text-muted)' }}>/ {total}</span>
              </h2>
              <p className="mt-2" style={{ color: 'var(--text-secondary)' }}>
                {correct === total ? 'Perfect score! Geography genius!' :
                 correct >= total * 0.8 ? 'Excellent work!' :
                 correct >= total * 0.5 ? 'Good effort — keep at it!' :
                 'Room for improvement — try again!'}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 mb-8 max-w-4xl mx-auto">
              {visibleItems.map((item, i) => {
                const st = itemStates[item._uid]
                return (
                  <motion.div
                    key={item._uid}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.02 }}
                    className="flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm"
                    style={{ background: st === 'correct' ? 'var(--correct-bg)' : 'var(--incorrect-bg)' }}
                  >
                    {st === 'correct'
                      ? <CheckCircle className="w-4 h-4 shrink-0" style={{ color: 'var(--correct)' }} />
                      : <XCircle className="w-4 h-4 shrink-0" style={{ color: 'var(--incorrect)' }} />
                    }
                    <span className="font-semibold truncate" style={{ color: st === 'correct' ? 'var(--correct)' : 'var(--incorrect)' }}>
                      {item.name}
                    </span>
                    <span className="text-[10px] ml-auto capitalize shrink-0" style={{ color: 'var(--text-muted)' }}>{item.category}</span>
                  </motion.div>
                )
              })}
            </div>

            <div className="flex gap-4 justify-center">
              <Button size="lg" onClick={handleReset}>
                <RotateCcw className="w-4 h-4" /> Try Again
              </Button>
              <Button variant="primary" size="lg" onClick={() => navigate('/')}>
                Pick Another
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
