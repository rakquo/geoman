import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { MapPin, Mountain, Waves, ChevronRight } from 'lucide-react'
import { continents } from '../data/continents'
import { useQuizContext } from '../context/QuizContext'
import Globe from '../components/Globe'

const continentList = [
  { id: 'asia', gradient: 'from-amber-500 to-orange-600', bg: 'bg-amber-50/70', text: 'text-amber-700', ring: 'ring-amber-200', description: 'Himalayas, Gobi, 48 countries' },
  { id: 'europe', gradient: 'from-blue-500 to-indigo-600', bg: 'bg-blue-50/70', text: 'text-blue-700', ring: 'ring-blue-200', description: 'Alps, Mediterranean, 44 countries' },
  { id: 'africa', gradient: 'from-emerald-500 to-teal-600', bg: 'bg-emerald-50/70', text: 'text-emerald-700', ring: 'ring-emerald-200', description: 'Sahara, Nile, 54 countries' },
  { id: 'north-america', gradient: 'from-red-500 to-rose-600', bg: 'bg-red-50/70', text: 'text-red-700', ring: 'ring-red-200', description: 'Rockies, Great Lakes, 23 countries' },
  { id: 'south-america', gradient: 'from-violet-500 to-purple-600', bg: 'bg-violet-50/70', text: 'text-violet-700', ring: 'ring-violet-200', description: 'Amazon, Andes, 12 countries' },
  { id: 'oceania', gradient: 'from-cyan-500 to-sky-600', bg: 'bg-cyan-50/70', text: 'text-cyan-700', ring: 'ring-cyan-200', description: 'Great Barrier Reef, 14 countries' },
]

export default function HomePage() {
  const navigate = useNavigate()
  const { state } = useQuizContext()

  return (
    <div className="max-w-4xl mx-auto">
      {/* Hero with Globe */}
      <motion.div
        className="text-center mb-6 sm:mb-10"
        initial={{ opacity: 0, y: -15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-indigo-100 to-purple-100 text-[var(--color-accent)] text-xs font-semibold mb-4 tracking-wide uppercase shadow-sm">
          <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-accent)] animate-[pulse-marker_2s_ease-in-out_infinite]" />
          Interactive Geography Quiz
        </div>
        <h1 className="text-4xl sm:text-5xl lg:text-6xl mb-4 leading-tight">
          How well do you<br />know the world?
        </h1>
        <p className="text-lg text-[var(--color-text-muted)] max-w-lg mx-auto mb-6">
          Pick a continent. Choose political or physical. Click markers on the map and name what you see.
        </p>
      </motion.div>

      {/* 3D Globe */}
      <motion.div
        className="flex justify-center mb-10 sm:mb-14"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, delay: 0.2 }}
      >
        <Globe size={380} />
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
              transition={{ delay: 0.3 + i * 0.06, duration: 0.4 }}
              onClick={() => navigate(`/continent/${item.id}`)}
              className={`group relative overflow-hidden rounded-2xl ${item.bg} backdrop-blur-sm border border-white/40 hover:shadow-xl hover:shadow-indigo-500/5 hover:ring-2 ${item.ring} transition-all duration-300 cursor-pointer text-left p-5`}
            >
              {/* Gradient accent blob */}
              <div className={`absolute top-0 right-0 w-28 h-28 rounded-full bg-gradient-to-br ${item.gradient} opacity-[0.08] -translate-y-10 translate-x-10 group-hover:scale-[2] transition-transform duration-700`} />
              <div className={`absolute bottom-0 left-0 w-20 h-20 rounded-full bg-gradient-to-br ${item.gradient} opacity-[0.05] translate-y-8 -translate-x-8 group-hover:scale-[2] transition-transform duration-700`} />
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
        transition={{ delay: 0.7 }}
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
