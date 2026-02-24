import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { MapPin, Mountain, Waves, ChevronRight } from 'lucide-react'
import { continents } from '../data/continents'
import { useQuizContext } from '../context/QuizContext'

const continentList = [
  { id: 'asia', gradient: 'from-amber-500 to-orange-600', bg: 'bg-amber-50', text: 'text-amber-700', description: 'Himalayas, Gobi, 48 countries' },
  { id: 'europe', gradient: 'from-blue-500 to-indigo-600', bg: 'bg-blue-50', text: 'text-blue-700', description: 'Alps, Mediterranean, 44 countries' },
  { id: 'africa', gradient: 'from-emerald-500 to-teal-600', bg: 'bg-emerald-50', text: 'text-emerald-700', description: 'Sahara, Nile, 54 countries' },
  { id: 'north-america', gradient: 'from-red-500 to-rose-600', bg: 'bg-red-50', text: 'text-red-700', description: 'Rockies, Great Lakes, 23 countries' },
  { id: 'south-america', gradient: 'from-violet-500 to-purple-600', bg: 'bg-violet-50', text: 'text-violet-700', description: 'Amazon, Andes, 12 countries' },
  { id: 'oceania', gradient: 'from-cyan-500 to-sky-600', bg: 'bg-cyan-50', text: 'text-cyan-700', description: 'Great Barrier Reef, 14 countries' },
]

export default function HomePage() {
  const navigate = useNavigate()
  const { state } = useQuizContext()

  return (
    <div className="max-w-3xl mx-auto">
      {/* Hero */}
      <motion.div
        className="text-center mb-10 sm:mb-14"
        initial={{ opacity: 0, y: -15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--color-accent-light)] text-[var(--color-accent)] text-xs font-semibold mb-4 tracking-wide uppercase">
          <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-accent)]" />
          Interactive Geography Quiz
        </div>
        <h1 className="text-4xl sm:text-5xl lg:text-6xl mb-4 leading-tight">
          How well do you<br />know the world?
        </h1>
        <p className="text-lg text-[var(--color-text-muted)] max-w-lg mx-auto">
          Pick a continent. Choose political or physical. Click markers on the map and name what you see.
        </p>
      </motion.div>

      {/* Continent grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {continentList.map((item, i) => {
          const continent = continents[item.id]
          const hasScore = Object.keys(state.scores).some(k => k.startsWith(item.id))
          return (
            <motion.button
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06, duration: 0.4 }}
              onClick={() => navigate(`/continent/${item.id}`)}
              className={`group relative overflow-hidden rounded-2xl ${item.bg} border border-transparent hover:border-[var(--color-border)] hover:shadow-lg transition-all duration-300 cursor-pointer text-left p-5`}
            >
              <div className={`absolute top-0 right-0 w-24 h-24 rounded-full bg-gradient-to-br ${item.gradient} opacity-10 -translate-y-8 translate-x-8 group-hover:scale-150 transition-transform duration-500`} />
              <div className="relative">
                <h2 className={`text-xl font-[var(--font-display)] ${item.text} mb-1`}>
                  {continent.name}
                </h2>
                <p className="text-xs text-[var(--color-text-muted)] mb-3">
                  {item.description}
                </p>
                <div className={`inline-flex items-center gap-1 text-xs font-medium ${item.text} opacity-70 group-hover:opacity-100 transition-opacity`}>
                  {hasScore ? 'Continue' : 'Start quiz'}
                  <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>
            </motion.button>
          )
        })}
      </div>

      {/* Footer hint */}
      <motion.div
        className="mt-10 flex items-center justify-center gap-5 text-xs text-[var(--color-text-muted)]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> Cities & Capitals</span>
        <span className="w-1 h-1 rounded-full bg-[var(--color-border)]" />
        <span className="flex items-center gap-1"><Mountain className="w-3.5 h-3.5" /> Mountains & Peaks</span>
        <span className="w-1 h-1 rounded-full bg-[var(--color-border)]" />
        <span className="flex items-center gap-1"><Waves className="w-3.5 h-3.5" /> Rivers & Lakes</span>
      </motion.div>
    </div>
  )
}
