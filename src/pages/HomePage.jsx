import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ChevronRight, MapPin, Mountain, Waves, Trophy } from 'lucide-react'
import { continents } from '../data/continents'
import { useQuizContext } from '../context/QuizContext'
import Globe from '../components/Globe'

/* Each continent gets a gradient pair from the theme palette + an emoji */
const CONTINENTS = [
  { id: 'asia',          emoji: '🏔️', desc: 'Himalayas · Gobi · Mekong',          p: ['--p1','--p2'] },
  { id: 'europe',        emoji: '🏛️', desc: 'Alps · Rhine · Mediterranean',        p: ['--p3','--p2'] },
  { id: 'africa',        emoji: '🦁', desc: 'Sahara · Nile · Kilimanjaro',         p: ['--p1','--p3'] },
  { id: 'north-america', emoji: '🗽', desc: 'Rockies · Mississippi · Great Lakes', p: ['--p4','--p2'] },
  { id: 'south-america', emoji: '🌿', desc: 'Amazon · Andes · Atacama',            p: ['--p2','--p4'] },
  { id: 'oceania',       emoji: '🐨', desc: 'Outback · Barrier Reef · Fiordland',  p: ['--p3','--p4'] },
]

const FEATURES = [
  { icon: MapPin,   label: 'Cities & Capitals' },
  { icon: Mountain, label: 'Mountains & Peaks' },
  { icon: Waves,    label: 'Rivers & Lakes' },
]

export default function HomePage() {
  const navigate = useNavigate()
  const { state } = useQuizContext()
  const hasAnyScore = state.totalAttempted > 0

  return (
    <div className="w-full">

      {/* ═══ HERO ═══ */}
      <div className="relative overflow-hidden">
        {/* Background gradient blobs */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div
            className="absolute -top-24 -right-24 w-[500px] h-[500px] rounded-full blur-[80px] opacity-50"
            style={{ background: 'radial-gradient(circle, var(--p1), var(--p2))' }}
          />
          <div
            className="absolute -bottom-24 -left-24 w-[400px] h-[400px] rounded-full blur-[70px] opacity-40"
            style={{ background: 'radial-gradient(circle, var(--p3), var(--p4))' }}
          />
        </div>

        <div className="relative w-full max-w-[1200px] mx-auto px-5 sm:px-10 py-14 sm:py-20 flex flex-col lg:flex-row items-center gap-10 lg:gap-16">
          {/* Text side */}
          <motion.div
            className="flex-1 text-center lg:text-left z-10"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55 }}
          >
            {/* Badge */}
            <div
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[11px] font-bold tracking-[0.14em] uppercase mb-6"
              style={{ background: 'var(--accent-light)', color: 'var(--accent)' }}
            >
              <span
                className="w-1.5 h-1.5 rounded-full"
                style={{
                  background: 'var(--accent)',
                  animation: 'pulse-dot 2s ease-in-out infinite',
                }}
              />
              Interactive Geography Quiz
            </div>

            {/* Headline */}
            <h1
              className="text-5xl sm:text-6xl lg:text-[68px] leading-[1.1] mb-5 tracking-tight"
              style={{ fontFamily: 'var(--font-display)', color: 'var(--text)' }}
            >
              How well do<br />
              you know the{' '}
              <span
                className="relative inline-block"
                style={{ color: 'var(--accent)' }}
              >
                world?
              </span>
            </h1>

            <p
              className="text-lg sm:text-xl max-w-md mx-auto lg:mx-0 leading-relaxed mb-8"
              style={{ color: 'var(--text-secondary)' }}
            >
              Pick a continent, click markers on the map, and name cities, mountains, rivers & more.
            </p>

            {/* Feature pills */}
            <div className="flex flex-wrap justify-center lg:justify-start gap-2 mb-8">
              {FEATURES.map(({ icon: Icon, label }) => (
                <div
                  key={label}
                  className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium"
                  style={{
                    background: 'var(--surface)',
                    color: 'var(--text-secondary)',
                    border: '1.5px solid var(--border)',
                    boxShadow: '0 1px 4px var(--shadow)',
                  }}
                >
                  <Icon className="w-4 h-4" style={{ color: 'var(--accent)' }} />
                  {label}
                </div>
              ))}
            </div>

            {/* Score summary if played */}
            {hasAnyScore && (
              <div
                className="inline-flex items-center gap-3 px-5 py-3 rounded-2xl"
                style={{
                  background: 'var(--accent-light)',
                  border: '1.5px solid var(--accent)',
                }}
              >
                <Trophy className="w-5 h-5" style={{ color: 'var(--accent)' }} />
                <span className="text-sm font-semibold" style={{ color: 'var(--accent)' }}>
                  {state.totalCorrect} / {state.totalAttempted} answered correctly
                </span>
              </div>
            )}
          </motion.div>

          {/* Globe side */}
          <motion.div
            className="shrink-0 relative z-10"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.1, type: 'spring', stiffness: 80 }}
          >
            {/* Glow ring behind globe */}
            <div
              className="absolute inset-0 m-auto w-72 h-72 sm:w-80 sm:h-80 rounded-full blur-3xl opacity-30"
              style={{ background: 'radial-gradient(circle, var(--accent), transparent)' }}
            />
            <Globe size={340} />
          </motion.div>
        </div>
      </div>

      {/* ═══ CONTINENTS ═══ */}
      <div className="w-full max-w-[1200px] mx-auto px-5 sm:px-10 pb-16">
        {/* Section header */}
        <motion.div
          className="flex items-center gap-4 mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.25 }}
        >
          <div className="h-px flex-1" style={{ background: 'var(--border)' }} />
          <span
            className="text-[11px] font-bold tracking-[0.18em] uppercase"
            style={{ color: 'var(--text-muted)' }}
          >
            Choose a continent
          </span>
          <div className="h-px flex-1" style={{ background: 'var(--border)' }} />
        </motion.div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {CONTINENTS.map((item, i) => {
            const continent = continents[item.id]
            const hasScore = Object.keys(state.scores).some(k => k.startsWith(item.id))

            return (
              <motion.button
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.07, duration: 0.4 }}
                onClick={() => navigate(`/continent/${item.id}`)}
                className="group text-left cursor-pointer overflow-hidden rounded-2xl transition-all duration-300 shadow-card hover:shadow-hover"
                style={{
                  background: 'var(--surface)',
                  border: '1.5px solid var(--border)',
                  transform: 'translateY(0)',
                }}
                whileHover={{ y: -4 }}
              >
                {/* Colorful gradient header */}
                <div
                  className="relative h-24 flex items-end px-6 pb-4 overflow-hidden"
                  style={{
                    background: `linear-gradient(135deg, var(${item.p[0]}), var(${item.p[1]}))`,
                  }}
                >
                  {/* Big emoji */}
                  <span
                    className="text-5xl leading-none select-none"
                    style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))' }}
                  >
                    {item.emoji}
                  </span>

                  {/* Decorative circles */}
                  <div
                    className="absolute -top-4 -right-4 w-24 h-24 rounded-full opacity-25"
                    style={{ background: 'white' }}
                  />
                  <div
                    className="absolute top-4 right-10 w-12 h-12 rounded-full opacity-15"
                    style={{ background: 'white' }}
                  />

                  {/* Scored badge */}
                  {hasScore && (
                    <div
                      className="absolute top-3 right-3 flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold"
                      style={{ background: 'rgba(255,255,255,0.85)', color: 'var(--accent)' }}
                    >
                      <Trophy className="w-2.5 h-2.5" />
                      Played
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-5 pt-4">
                  <h2
                    className="text-xl mb-1"
                    style={{ fontFamily: 'var(--font-display)', color: 'var(--text)' }}
                  >
                    {continent.name}
                  </h2>
                  <p className="text-sm leading-relaxed mb-4" style={{ color: 'var(--text-muted)' }}>
                    {item.desc}
                  </p>
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-semibold" style={{ color: 'var(--accent)' }}>
                      {hasScore ? 'Play again' : 'Start quiz'}
                    </span>
                    <ChevronRight
                      className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1"
                      style={{ color: 'var(--accent)' }}
                    />
                  </div>
                </div>
              </motion.button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
