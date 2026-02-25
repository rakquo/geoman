import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ChevronRight } from 'lucide-react'
import { continents } from '../data/continents'
import { useQuizContext } from '../context/QuizContext'
import Globe from '../components/Globe'

const CONTINENTS = [
  { id: 'asia',          color: '#D4956B', desc: '48 countries · Himalayas · Gobi Desert' },
  { id: 'europe',        color: '#6B93D4', desc: '44 countries · Alps · Mediterranean Sea' },
  { id: 'africa',        color: '#D4B96B', desc: '54 countries · Sahara · River Nile' },
  { id: 'north-america', color: '#D47B6B', desc: '23 countries · Rocky Mountains · Great Lakes' },
  { id: 'south-america', color: '#82D46B', desc: '12 countries · Amazon · Andes' },
  { id: 'oceania',       color: '#6BD4C4', desc: '14 countries · Great Barrier Reef · Outback' },
]

export default function HomePage() {
  const navigate = useNavigate()
  const { state } = useQuizContext()

  return (
    <div className="w-full max-w-[1400px] mx-auto px-6 sm:px-10 py-8 sm:py-14">
      {/* ── Hero ── */}
      <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-16 mb-16 lg:mb-20">
        {/* Text */}
        <motion.div
          className="flex-1 text-center lg:text-left"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass text-[var(--color-accent)] text-[11px] font-semibold tracking-[0.15em] uppercase mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-accent)] animate-[pulse-dot_2s_ease-in-out_infinite]" />
            Interactive Geography Quiz
          </div>
          <h1 className="text-5xl sm:text-6xl lg:text-7xl leading-[1.1] mb-5 tracking-tight">
            How well do<br />you know the<br />
            <span className="italic text-[var(--color-accent)]">world</span>?
          </h1>
          <p className="text-lg text-[var(--color-text-muted)] max-w-md mx-auto lg:mx-0 font-light leading-relaxed">
            Pick a continent. Toggle categories. Click markers on the map and name what you see.
          </p>
        </motion.div>

        {/* Globe */}
        <motion.div
          className="flex-shrink-0"
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.15 }}
        >
          <Globe size={420} />
        </motion.div>
      </div>

      {/* ── Section label ── */}
      <motion.div
        className="flex items-center gap-4 mb-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <div className="h-px flex-1 bg-[var(--color-border)]" />
        <span className="text-[11px] font-semibold tracking-[0.2em] uppercase text-[var(--color-text-muted)]">Choose a continent</span>
        <div className="h-px flex-1 bg-[var(--color-border)]" />
      </motion.div>

      {/* ── Continent grid ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
        {CONTINENTS.map((item, i) => {
          const continent = continents[item.id]
          const hasScore = Object.keys(state.scores).some(k => k.startsWith(item.id))
          return (
            <motion.button
              key={item.id}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 + i * 0.07, duration: 0.45 }}
              onClick={() => navigate(`/continent/${item.id}`)}
              className="group relative overflow-hidden rounded-2xl glass text-left cursor-pointer transition-all duration-300 hover:border-[var(--color-accent)]/20 hover:shadow-xl hover:shadow-[var(--color-accent)]/5"
              style={{ minHeight: '160px' }}
            >
              {/* Background accent gradient */}
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{ background: `linear-gradient(135deg, ${item.color}08, ${item.color}03)` }}
              />
              {/* Corner accent */}
              <div
                className="absolute -top-12 -right-12 w-32 h-32 rounded-full opacity-[0.07] group-hover:opacity-[0.14] group-hover:scale-150 transition-all duration-700"
                style={{ background: `radial-gradient(circle, ${item.color}, transparent 70%)` }}
              />

              <div className="relative p-6 sm:p-7 flex flex-col h-full">
                {/* Continent color bar */}
                <div
                  className="w-8 h-1 rounded-full mb-5 transition-all duration-300 group-hover:w-12"
                  style={{ backgroundColor: item.color }}
                />
                <h2 className="text-2xl sm:text-3xl font-[var(--font-display)] mb-2 tracking-wide">
                  {continent.name}
                </h2>
                <p className="text-[13px] text-[var(--color-text-muted)] mb-4 font-light leading-relaxed">
                  {item.desc}
                </p>
                <div className="mt-auto flex items-center gap-2">
                  <span
                    className="text-[13px] font-medium transition-colors"
                    style={{ color: item.color }}
                  >
                    {hasScore ? 'Continue' : 'Start quiz'}
                  </span>
                  <ChevronRight
                    className="w-4 h-4 group-hover:translate-x-1 transition-transform"
                    style={{ color: item.color }}
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
