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
  { id: 'cities',    label: 'Cities',    icon: Building2, color: '#3B82F6' },
  { id: 'mountains', label: 'Mountains', icon: Mountain,  color: '#8B5CF6' },
  { id: 'rivers',    label: 'Rivers',    icon: Waves,     color: '#06B6D4' },
  { id: 'lakes',     label: 'Lakes',     icon: Droplets,  color: '#14B8A6' },
  { id: 'features',  label: 'Features',  icon: Landmark,  color: '#F59E0B' },
]

/* ── Map styles ── */
const MAP_STYLES = [
  { id: 'clean',     label: 'Clean',     icon: MapIcon   },
  { id: 'terrain',   label: 'Terrain',   icon: TreePine  },
  { id: 'satellite', label: 'Satellite', icon: Satellite },
]

/* ── Continent view defaults ── */
const VIEW = {
  asia:            { center: [30, 85],   zoom: 3 },
  europe:          { center: [52, 15],   zoom: 4 },
  africa:          { center: [5, 20],    zoom: 3 },
  'north-america': { center: [45, -100], zoom: 3 },
  'south-america': { center: [-15, -58], zoom: 3 },
  oceania:         { center: [-25, 140], zoom: 4 },
}

const ATTR = '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>'

function MapReady() {
  const map = useMap()
  useEffect(() => {
    const t = setTimeout(() => map.invalidateSize(), 200)
    return () => clearTimeout(t)
  }, [map])
  return null
}

/* ═══════════════════════════════════════════════════════ */
export default function QuizPage() {
  const { continentId } = useParams()
  const navigate = useNavigate()
  const continent = continents[continentId]
  const view = VIEW[continentId] || { center: [20, 0], zoom: 2 }
  const { dispatch } = useQuizContext()
  const { isDark } = useTheme()

  const [selectedCats, setSelectedCats] = useState(['cities'])
  const [catData, setCatData]           = useState({})
  const [loadingCats, setLoadingCats]   = useState({})
  const [mapStyle, setMapStyle]         = useState('clean')
  const [showLabels, setShowLabels]     = useState(false)
  const [itemStates, setItemStates]     = useState({})
  const [activeId, setActiveId]         = useState(null)
  const [inputValue, setInputValue]     = useState('')
  const [lastResult, setLastResult]     = useState(null)
  const inputRef  = useRef(null)
  const timeoutRef = useRef(null)

  /* Tile URLs */
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
        const items = (mod.default || mod).map(item => ({
          ...item, category: cat, _uid: `${cat}-${item.id}`,
        }))
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
    setSelectedCats(p => p.includes(id) ? (p.length > 1 ? p.filter(c => c !== id) : p) : [...p, id])
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

  const answered   = visibleItems.filter(i => itemStates[i._uid]).length
  const correct    = visibleItems.filter(i => itemStates[i._uid] === 'correct').length
  const total      = visibleItems.length
  const done       = answered === total && total > 0
  const pct        = total > 0 ? Math.round((answered / total) * 100) : 0
  const activeItem = visibleItems.find(q => q._uid === activeId)

  const tileKey      = mapStyle === 'clean' && showLabels ? 'cleanLabels' : mapStyle
  const tile         = tiles[tileKey] || tiles.clean
  const showOverlay  = showLabels && mapStyle === 'satellite'
  const labelsBuiltIn = mapStyle === 'terrain'

  useEffect(() => {
    if (done) dispatch({ type: 'RECORD_SCORE', payload: { continentId, category: selectedCats.join('+'), correct, total } })
  }, [done]) // eslint-disable-line

  if (!continent) {
    return (
      <div className="text-center py-20">
        <p className="text-2xl mb-6" style={{ color: 'var(--text-muted)' }}>Continent not found</p>
        <Button variant="primary" onClick={() => navigate('/')}>← Go Home</Button>
      </div>
    )
  }

  return (
    <div className="w-full max-w-[1200px] mx-auto px-4 sm:px-8 py-5 sm:py-8">

      {/* ─── Page header ─── */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-1.5 text-sm font-medium transition-colors cursor-pointer"
          style={{ color: 'var(--text-muted)', background: 'none', border: 'none', padding: 0 }}
          onMouseEnter={e => e.currentTarget.style.color = 'var(--text)'}
          onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="hidden sm:inline">All continents</span>
        </button>

        <div className="h-5 w-px" style={{ background: 'var(--border)' }} />

        <h1
          className="text-2xl sm:text-3xl leading-none"
          style={{ fontFamily: 'var(--font-display)', color: 'var(--text)' }}
        >
          {continent.name}
        </h1>

        {/* Score pill */}
        {total > 0 && (
          <div
            className="ml-auto flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold"
            style={{ background: 'var(--accent-light)', color: 'var(--accent)' }}
          >
            <span className="text-base font-bold">{correct}</span>
            <span style={{ opacity: 0.45 }}>/</span>
            <span style={{ opacity: 0.65 }}>{total}</span>
          </div>
        )}
      </div>

      {/* ─── Controls card ─── */}
      <motion.div
        className="rounded-2xl mb-5 overflow-hidden"
        style={{
          background: 'var(--surface)',
          border: '1.5px solid var(--border)',
          boxShadow: '0 1px 4px var(--shadow)',
        }}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {/* ── Row 1: Categories ── */}
        <div
          className="px-5 py-4"
          style={{ borderBottom: '1px solid var(--border)' }}
        >
          <p
            className="text-[10px] font-bold tracking-[0.16em] uppercase mb-3"
            style={{ color: 'var(--text-muted)' }}
          >
            Categories
          </p>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map(cat => {
              const Icon = cat.icon
              const active = selectedCats.includes(cat.id)
              const loading = loadingCats[cat.id] && !catData[cat.id]
              return (
                <button
                  key={cat.id}
                  onClick={() => toggleCat(cat.id)}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-[13px] font-semibold transition-all duration-200 cursor-pointer"
                  style={{
                    background: active ? cat.color : 'var(--bg)',
                    color: active ? '#ffffff' : 'var(--text-secondary)',
                    border: `1.5px solid ${active ? cat.color : 'var(--border)'}`,
                    boxShadow: active ? `0 2px 8px ${cat.color}44` : 'none',
                  }}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {cat.label}
                  {loading && (
                    <span className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* ── Row 2: Map + Labels + Progress ── */}
        <div className="px-5 py-3 flex flex-wrap items-center gap-3">
          {/* Map style segmented control */}
          <div
            className="flex rounded-xl p-1"
            style={{ background: 'var(--bg)', border: '1.5px solid var(--border)' }}
          >
            {MAP_STYLES.map(s => {
              const Icon = s.icon
              const isActive = mapStyle === s.id
              return (
                <button
                  key={s.id}
                  onClick={() => setMapStyle(s.id)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-all duration-200 cursor-pointer"
                  style={{
                    background: isActive ? 'var(--accent)' : 'transparent',
                    color: isActive ? '#fff' : 'var(--text-muted)',
                    border: 'none',
                    fontFamily: 'var(--font-body)',
                  }}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{s.label}</span>
                </button>
              )
            })}
          </div>

          {/* Labels toggle */}
          <button
            onClick={() => !labelsBuiltIn && setShowLabels(v => !v)}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-[12px] font-semibold transition-all duration-200"
            style={{
              background: (showLabels && !labelsBuiltIn) ? 'var(--accent-light)' : 'var(--bg)',
              color: (showLabels && !labelsBuiltIn) ? 'var(--accent)' : 'var(--text-muted)',
              border: `1.5px solid ${(showLabels && !labelsBuiltIn) ? 'var(--accent)' : 'var(--border)'}`,
              cursor: labelsBuiltIn ? 'default' : 'pointer',
              opacity: labelsBuiltIn ? 0.5 : 1,
              fontFamily: 'var(--font-body)',
            }}
          >
            {showLabels && !labelsBuiltIn
              ? <Tag className="w-3.5 h-3.5" />
              : <Tags className="w-3.5 h-3.5" />
            }
            {labelsBuiltIn ? 'Built-in' : showLabels ? 'Labels on' : 'Labels off'}
          </button>

          {/* Progress bar */}
          {total > 0 && (
            <div className="flex items-center gap-3 ml-auto">
              <span
                className="text-xs font-semibold tabular-nums"
                style={{ color: 'var(--text-muted)' }}
              >
                {answered}/{total} · {pct}%
              </span>
              <div
                className="w-24 sm:w-40 h-2.5 rounded-full overflow-hidden"
                style={{ background: 'var(--border)' }}
              >
                <motion.div
                  className="h-full rounded-full"
                  style={{ background: 'var(--accent)' }}
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 0.4 }}
                />
              </div>
            </div>
          )}
        </div>
      </motion.div>

      {/* ─── Map ─── */}
      <motion.div
        className="relative w-full rounded-2xl overflow-hidden"
        style={{
          height: 'clamp(400px, 65vh, 680px)',
          border: '1.5px solid var(--border)',
          boxShadow: '0 4px 32px -8px var(--shadow)',
        }}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.1 }}
      >
        <MapContainer
          key={`${continentId}-${isDark}`}
          center={view.center}
          zoom={view.zoom}
          minZoom={2}
          maxZoom={14}
          scrollWheelZoom
          style={{ height: '100%', width: '100%', background: 'var(--map-bg)' }}
        >
          <MapReady />
          <TileLayer key={tileKey} url={tile.url} attribution={tile.attr} />
          {showOverlay && <TileLayer url={labelOverlayUrl} attribution="" pane="overlayPane" />}

          {visibleItems.map(item => {
            const st = itemStates[item._uid]
            const isActive = activeId === item._uid
            const catConf = CATEGORIES.find(c => c.id === item.category)
            let fillColor = catConf?.color || '#3B82F6'
            let radius = 7
            let fillOpacity = 0.85

            if (st === 'correct')   { fillColor = '#22C55E'; radius = 8 }
            if (st === 'incorrect') { fillColor = '#EF4444'; radius = 8 }
            if (isActive)           { radius = 12; fillOpacity = 1 }

            return (
              <CircleMarker
                key={item._uid}
                center={[item.lat, item.lng]}
                radius={radius}
                pathOptions={{
                  fillColor,
                  color: isActive ? '#ffffff' : 'rgba(255,255,255,0.7)',
                  weight: isActive ? 3 : 1.5,
                  fillOpacity,
                }}
                eventHandlers={{ click: () => handleMarkerClick(item) }}
              >
                {st && (
                  <Tooltip permanent direction="top" offset={[0, -12]} className="quiz-tooltip">
                    <span style={{
                      color: st === 'correct' ? '#16A34A' : '#DC2626',
                      fontWeight: 700,
                    }}>
                      {item.name}
                    </span>
                  </Tooltip>
                )}
              </CircleMarker>
            )
          })}
        </MapContainer>

        {/* No category selected hint */}
        {selectedCats.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/20 z-[900]">
            <div
              className="px-6 py-4 rounded-2xl text-sm font-medium text-center shadow-elevated"
              style={{ background: 'var(--surface)', color: 'var(--text-secondary)' }}
            >
              Select at least one category above
            </div>
          </div>
        )}

        {/* ─── Answer popup ─── */}
        <AnimatePresence>
          {activeId !== null && activeItem && (
            <motion.div
              key={activeId}
              initial={{ opacity: 0, y: 12, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.95 }}
              transition={{ duration: 0.18 }}
              className="absolute bottom-5 left-1/2 -translate-x-1/2 w-[380px] max-w-[92%] z-[1000]"
            >
              {lastResult && lastResult.uid === activeId ? (
                /* Result card */
                <div
                  className="p-4 rounded-2xl"
                  style={{
                    background: lastResult.correct ? 'var(--correct-bg)' : 'var(--incorrect-bg)',
                    border: `2px solid ${lastResult.correct ? 'var(--correct)' : 'var(--incorrect)'}`,
                    backdropFilter: 'blur(20px)',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                      style={{ background: lastResult.correct ? 'var(--correct)' : 'var(--incorrect)' }}
                    >
                      {lastResult.correct
                        ? <CheckCircle className="w-5 h-5 text-white" />
                        : <XCircle className="w-5 h-5 text-white" />
                      }
                    </div>
                    <div>
                      <p className="font-bold text-sm" style={{ color: lastResult.correct ? 'var(--correct)' : 'var(--incorrect)' }}>
                        {lastResult.correct ? '✓ Correct!' : lastResult.answer ? '✗ Not quite' : 'Skipped'}
                      </p>
                      <p className="text-xs opacity-80" style={{ color: lastResult.correct ? 'var(--correct)' : 'var(--incorrect)' }}>
                        {lastResult.correct ? lastResult.name : <>It was <strong>{lastResult.name}</strong></>}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                /* Input card */
                <div
                  className="rounded-2xl overflow-hidden"
                  style={{
                    background: 'var(--surface)',
                    border: '1.5px solid var(--border)',
                    backdropFilter: 'blur(24px)',
                    boxShadow: '0 12px 48px rgba(0,0,0,0.18)',
                  }}
                >
                  {/* Hint bar */}
                  <div
                    className="px-4 py-2.5 flex items-center gap-2"
                    style={{ background: 'var(--bg)', borderBottom: '1px solid var(--border)' }}
                  >
                    {(() => {
                      const catConf = CATEGORIES.find(c => c.id === activeItem.category)
                      const Icon = catConf?.icon || MapIcon
                      return <Icon className="w-3.5 h-3.5 shrink-0" style={{ color: catConf?.color || 'var(--accent)' }} />
                    })()}
                    <span className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                      {activeItem.hint || `Name this ${activeItem.category}`}
                    </span>
                  </div>

                  {/* Input */}
                  <form onSubmit={handleSubmit} className="p-3 flex gap-2 items-center">
                    <input
                      ref={inputRef}
                      type="text"
                      value={inputValue}
                      onChange={e => setInputValue(e.target.value)}
                      placeholder="Type your answer…"
                      autoComplete="off"
                      className="flex-1 h-11 px-4 rounded-xl text-sm outline-none transition-all"
                      style={{
                        fontFamily: 'var(--font-body)',
                        background: 'var(--bg)',
                        border: '1.5px solid var(--border)',
                        color: 'var(--text)',
                      }}
                      onFocus={e => { e.target.style.borderColor = 'var(--accent)'; e.target.style.boxShadow = '0 0 0 3px var(--accent-light)' }}
                      onBlur={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none' }}
                    />
                    <button
                      type="submit"
                      disabled={!inputValue.trim()}
                      className="h-11 px-5 rounded-xl text-sm font-semibold text-white transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                      style={{ background: 'var(--accent)', border: 'none', fontFamily: 'var(--font-body)' }}
                    >
                      Go
                    </button>
                  </form>

                  <div className="px-3 pb-3">
                    <button
                      type="button"
                      onClick={handleSkip}
                      className="text-[11px] transition-colors cursor-pointer"
                      style={{ color: 'var(--text-muted)', background: 'none', border: 'none', padding: 0, fontFamily: 'var(--font-body)' }}
                      onMouseEnter={e => { e.target.style.color = 'var(--incorrect)' }}
                      onMouseLeave={e => { e.target.style.color = 'var(--text-muted)' }}
                    >
                      Skip — I don't know
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* ─── Completion screen ─── */}
      <AnimatePresence>
        {done && (
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mt-10"
          >
            {/* Score */}
            <div className="text-center mb-10">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', delay: 0.2, stiffness: 120 }}
                className="inline-flex items-center justify-center w-24 h-24 rounded-full mb-5"
                style={{ background: 'var(--accent-light)' }}
              >
                {correct === total
                  ? <Sparkles className="w-10 h-10" style={{ color: 'var(--accent)' }} />
                  : <Trophy className="w-10 h-10" style={{ color: 'var(--accent)' }} />
                }
              </motion.div>
              <h2
                className="text-5xl mb-2"
                style={{ fontFamily: 'var(--font-display)', color: 'var(--text)' }}
              >
                {correct}
                <span className="text-3xl ml-2" style={{ color: 'var(--text-muted)' }}>/ {total}</span>
              </h2>
              <p className="text-lg" style={{ color: 'var(--text-secondary)' }}>
                {correct === total       ? '🎉 Perfect score! Geography genius!' :
                 correct >= total * 0.8  ? '🌟 Excellent work!' :
                 correct >= total * 0.5  ? '👍 Good effort — keep at it!' :
                                           '📚 Room to improve — try again!'}
              </p>
            </div>

            {/* Results grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 mb-8 max-w-4xl mx-auto">
              {visibleItems.map((item, idx) => {
                const st = itemStates[item._uid]
                return (
                  <motion.div
                    key={item._uid}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.02 }}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl"
                    style={{
                      background: st === 'correct' ? 'var(--correct-bg)' : 'var(--incorrect-bg)',
                      border: `1px solid ${st === 'correct' ? 'var(--correct)' : 'var(--incorrect)'}22`,
                    }}
                  >
                    {st === 'correct'
                      ? <CheckCircle className="w-4 h-4 shrink-0" style={{ color: 'var(--correct)' }} />
                      : <XCircle    className="w-4 h-4 shrink-0" style={{ color: 'var(--incorrect)' }} />
                    }
                    <span
                      className="font-semibold text-sm truncate"
                      style={{ color: st === 'correct' ? 'var(--correct)' : 'var(--incorrect)' }}
                    >
                      {item.name}
                    </span>
                    <span
                      className="text-[10px] ml-auto capitalize shrink-0"
                      style={{ color: 'var(--text-muted)' }}
                    >
                      {item.category}
                    </span>
                  </motion.div>
                )
              })}
            </div>

            {/* Actions */}
            <div className="flex gap-3 justify-center flex-wrap">
              <Button size="lg" onClick={handleReset}>
                <RotateCcw className="w-4 h-4" /> Try Again
              </Button>
              <Button variant="primary" size="lg" onClick={() => navigate('/')}>
                Choose Another
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
