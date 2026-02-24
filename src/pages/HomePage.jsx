import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { MapPin, Mountain, Waves } from 'lucide-react'
import { continents } from '../data/continents'

const continentList = [
  { id: 'asia', emoji: '🌏', description: 'Himalayas to archipelagos' },
  { id: 'europe', emoji: '🌍', description: 'From Alps to Mediterranean' },
  { id: 'africa', emoji: '🌍', description: 'Sahara to Serengeti' },
  { id: 'north-america', emoji: '🌎', description: 'Rockies to Great Lakes' },
  { id: 'south-america', emoji: '🌎', description: 'Amazon to Andes' },
  { id: 'oceania', emoji: '🌏', description: 'Reefs to Outback' },
]

export default function HomePage() {
  const navigate = useNavigate()

  return (
    <div className="max-w-3xl mx-auto">
      <motion.div
        className="text-center mb-10"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="text-4xl sm:text-5xl mb-3">Test Your Geography</h1>
        <p className="text-lg text-[var(--color-text-muted)]">
          Pick a continent, choose your map type, and see how much you know
        </p>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {continentList.map((item, i) => {
          const continent = continents[item.id]
          return (
            <motion.button
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07, duration: 0.35 }}
              onClick={() => navigate(`/continent/${item.id}`)}
              className="group relative flex items-center gap-4 p-5 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl hover:border-[var(--color-accent)] hover:shadow-md transition-all duration-200 cursor-pointer text-left"
            >
              <span className="text-4xl shrink-0">{item.emoji}</span>
              <div className="min-w-0">
                <h2 className="text-xl font-[var(--font-display)] text-[var(--color-text)] group-hover:text-[var(--color-accent)] transition-colors">
                  {continent.name}
                </h2>
                <p className="text-sm text-[var(--color-text-muted)] mt-0.5">
                  {item.description}
                </p>
              </div>
              <div className="ml-auto shrink-0 opacity-0 group-hover:opacity-100 transition-opacity text-[var(--color-accent)]">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M7 4l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </motion.button>
          )
        })}
      </div>

      <motion.div
        className="mt-10 text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <div className="flex items-center justify-center gap-6 text-sm text-[var(--color-text-muted)]">
          <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4" /> Cities</span>
          <span className="flex items-center gap-1.5"><Mountain className="w-4 h-4" /> Mountains</span>
          <span className="flex items-center gap-1.5"><Waves className="w-4 h-4" /> Rivers & Lakes</span>
        </div>
      </motion.div>
    </div>
  )
}
