import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Building2, Mountain, ArrowLeft } from 'lucide-react'
import { continents } from '../data/continents'
import { useQuizContext } from '../context/QuizContext'

const modes = [
  {
    id: 'political',
    label: 'Political Map',
    description: 'Identify cities, capitals, and major urban centers on the map',
    icon: Building2,
    color: 'var(--color-political)',
    gradient: 'from-indigo-500 to-blue-600',
    lightBg: 'bg-indigo-50',
  },
  {
    id: 'physical',
    label: 'Physical Map',
    description: 'Name rivers, lakes, mountains, deserts, and geographic features',
    icon: Mountain,
    color: 'var(--color-physical)',
    gradient: 'from-teal-500 to-emerald-600',
    lightBg: 'bg-teal-50',
  },
]

export default function ContinentPage() {
  const { continentId } = useParams()
  const navigate = useNavigate()
  const continent = continents[continentId]
  const { state } = useQuizContext()

  if (!continent) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl mb-4">Continent not found</h2>
        <button onClick={() => navigate('/')} className="text-[var(--color-accent)] underline cursor-pointer bg-transparent border-none font-[var(--font-body)]">Go Home</button>
      </div>
    )
  }

  return (
    <div className="max-w-xl mx-auto">
      <motion.button
        onClick={() => navigate('/')}
        className="flex items-center gap-1.5 text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors cursor-pointer bg-transparent border-none p-0 font-[var(--font-body)] mb-8"
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
      >
        <ArrowLeft className="w-4 h-4" />
        All continents
      </motion.button>

      <motion.div
        className="text-center mb-10"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="text-4xl sm:text-5xl mb-2">{continent.name}</h1>
        <p className="text-[var(--color-text-muted)]">Choose your quiz type</p>
      </motion.div>

      <div className="flex flex-col gap-4">
        {modes.map((mode, i) => {
          const Icon = mode.icon
          const scoreKey = `${continentId}-${mode.id}`
          const prevScore = state.scores[scoreKey]
          return (
            <motion.button
              key={mode.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1, duration: 0.4 }}
              onClick={() => navigate(`/continent/${continentId}/${mode.id}`)}
              className={`group relative overflow-hidden flex items-start gap-5 p-6 ${mode.lightBg} rounded-2xl border border-transparent hover:shadow-lg transition-all duration-300 cursor-pointer text-left`}
            >
              <div className={`absolute top-0 right-0 w-32 h-32 rounded-full bg-gradient-to-br ${mode.gradient} opacity-10 -translate-y-12 translate-x-12 group-hover:scale-150 transition-transform duration-500`} />
              <div
                className="w-14 h-14 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform"
                style={{ backgroundColor: mode.color + '18' }}
              >
                <Icon className="w-7 h-7" style={{ color: mode.color }} />
              </div>
              <div className="relative min-w-0">
                <h3 className="text-xl font-[var(--font-display)] mb-1">{mode.label}</h3>
                <p className="text-sm text-[var(--color-text-muted)] mb-2">{mode.description}</p>
                {prevScore ? (
                  <span className="inline-flex items-center text-xs font-medium px-2 py-0.5 rounded-full" style={{ backgroundColor: mode.color + '15', color: mode.color }}>
                    Best: {prevScore.correct}/{prevScore.total}
                  </span>
                ) : (
                  <span className="text-xs font-medium" style={{ color: mode.color }}>
                    Start quiz →
                  </span>
                )}
              </div>
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}
