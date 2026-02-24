import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Building2, Mountain, Waves, Droplets, TreePine, Map, Globe2 } from 'lucide-react'
import BackButton from '../components/BackButton'
import { continents } from '../data/continents'

const modes = [
  {
    id: 'political',
    label: 'Political Map',
    description: 'Cities, capitals, and countries',
    icon: Building2,
    color: '#2563EB',
    categories: ['cities'],
  },
  {
    id: 'physical',
    label: 'Physical Map',
    description: 'Rivers, lakes, mountains, and landforms',
    icon: Mountain,
    color: '#2D6A4F',
    categories: ['rivers', 'lakes', 'mountains', 'features'],
  },
]

export default function ContinentPage() {
  const { continentId } = useParams()
  const navigate = useNavigate()
  const continent = continents[continentId]

  if (!continent) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl mb-4">Continent not found</h2>
        <BackButton to="/" label="Back to Home" />
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      <BackButton to="/" label="Back to Home" />

      <motion.div
        className="text-center mt-8 mb-10"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="text-4xl sm:text-5xl mb-2">{continent.name}</h1>
        <p className="text-[var(--color-text-muted)]">What would you like to study?</p>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {modes.map((mode, i) => {
          const Icon = mode.icon
          return (
            <motion.button
              key={mode.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1, duration: 0.35 }}
              onClick={() => navigate(`/continent/${continentId}/${mode.id}`)}
              className="group flex flex-col items-center gap-4 p-8 bg-[var(--color-surface)] border-2 border-[var(--color-border)] rounded-xl hover:shadow-lg transition-all duration-200 cursor-pointer"
              style={{ '--hover-border': mode.color }}
              onMouseEnter={(e) => e.currentTarget.style.borderColor = mode.color}
              onMouseLeave={(e) => e.currentTarget.style.borderColor = ''}
            >
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110"
                style={{ backgroundColor: mode.color + '15' }}
              >
                <Icon className="w-8 h-8" style={{ color: mode.color }} />
              </div>
              <div className="text-center">
                <h3 className="text-xl font-[var(--font-display)] mb-1">{mode.label}</h3>
                <p className="text-sm text-[var(--color-text-muted)]">{mode.description}</p>
              </div>
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}
