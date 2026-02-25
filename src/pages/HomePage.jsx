import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ChevronRight, MapPin, Mountain, Waves } from 'lucide-react'
import { continents } from '../data/continents'
import { useQuizContext } from '../context/QuizContext'
import Globe from '../components/Globe'

const CONTINENTS = [
  { id: 'asia',          desc: '48 countries · Himalayas · Gobi Desert' },
  { id: 'europe',        desc: '44 countries · Alps · Mediterranean Sea' },
  { id: 'africa',        desc: '54 countries · Sahara · River Nile' },
  { id: 'north-america', desc: '23 countries · Rocky Mountains · Great Lakes' },
  { id: 'south-america', desc: '12 countries · Amazon Rainforest · Andes' },
  { id: 'oceania',       desc: '14 countries · Great Barrier Reef · Outback' },
]

export default function HomePage() {
  const navigate = useNavigate()
  const { state } = useQuizContext()

  return (
    <div className="w-full max-w-[1200px] mx-auto px-5 sm:px-8 py-10 sm:py-16">
      {/* ── Hero ── */}
      <div className="flex flex-col lg:flex-row items-center gap-10 lg:gap-20 mb-16 lg:mb-20">
        {/* Text */}
        <motion.div
          className="flex-1 text-center lg:text-left"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-[11px] font-bold tracking-[0.12em] uppercase mb-6"
            style={{ background: 'var(--accent-light)', color: 'var(--accent)' }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full animate-[pulse-dot_2s_ease-in-out_infinite]"
              style={{ background: 'var(--accent)' }}
            />
            Interactive Geography Quiz
          </div>

          <h1
            className="text-4xl sm:text-5xl lg:text-6xl leading-[1.15] mb-5"
            style={{ fontFamily: 'var(--font-display)', color: 'var(--text)' }}
          >
            How well do you<br />know the{' '}
            <span style={{ color: 'var(--accent)' }}>world</span>?
          </h1>

          <p className="text-base sm:text-lg max-w-md mx-auto lg:mx-0 leading-relaxed mb-8" style={{ color: 'var(--text-secondary)' }}>
            Pick a continent, toggle categories, click markers on the map and name what you see.
          </p>

          {/* Feature pills */}
          <div className="flex flex-wrap justify-center lg:justify-start gap-3">
            {[
              { icon: MapPin, label: 'Cities & Capitals' },
              { icon: Mountain, label: 'Mountains & Peaks' },
              { icon: Waves, label: 'Rivers & Lakes' },
            ].map(({ icon: Icon, label }) => (
              <div
                key={label}
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium shadow-card"
                style={{ background: 'var(--surface)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}
              >
                <Icon className="w-3.5 h-3.5" style={{ color: 'var(--accent)' }} />
                {label}
              </div>
            ))}
          </div>
        </motion.div>

        {/* Globe */}
        <motion.div
          className="shrink-0"
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.15 }}
        >
          <Globe size={380} />
        </motion.div>
      </div>

      {/* ── Section divider ── */}
      <motion.div
        className="flex items-center gap-4 mb-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <div className="h-px flex-1" style={{ background: 'var(--border)' }} />
        <span className="text-[11px] font-bold tracking-[0.15em] uppercase" style={{ color: 'var(--text-muted)' }}>
          Choose a continent
        </span>
        <div className="h-px flex-1" style={{ background: 'var(--border)' }} />
      </motion.div>

      {/* ── Continent grid ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
        {CONTINENTS.map((item, i) => {
          const continent = continents[item.id]
          const hasScore = Object.keys(state.scores).some(k => k.startsWith(item.id))
          return (
            <motion.button
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 + i * 0.06, duration: 0.4 }}
              onClick={() => navigate(`/continent/${item.id}`)}
              className="group relative overflow-hidden rounded-2xl text-left cursor-pointer transition-all duration-300 shadow-card hover:shadow-elevated"
              style={{
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                minHeight: '170px',
              }}
            >
              {/* Accent gradient on hover */}
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{ background: 'linear-gradient(135deg, var(--accent-light), transparent 60%)' }}
              />

              <div className="relative p-6 sm:p-7 flex flex-col h-full">
                {/* Accent bar */}
                <div
                  className="w-8 h-1 rounded-full mb-5 transition-all duration-300 group-hover:w-14"
                  style={{ background: 'var(--accent)' }}
                />

                <h2
                  className="text-2xl sm:text-[26px] mb-2"
                  style={{ fontFamily: 'var(--font-display)', color: 'var(--text)' }}
                >
                  {continent.name}
                </h2>

                <p className="text-[13px] leading-relaxed mb-4" style={{ color: 'var(--text-muted)' }}>
                  {item.desc}
                </p>

                <div className="mt-auto flex items-center gap-1.5">
                  <span className="text-[13px] font-semibold" style={{ color: 'var(--accent)' }}>
                    {hasScore ? 'Continue' : 'Start quiz'}
                  </span>
                  <ChevronRight
                    className="w-4 h-4 group-hover:translate-x-1 transition-transform"
                    style={{ color: 'var(--accent)' }}
                  />
                </div>
              </div>
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}
