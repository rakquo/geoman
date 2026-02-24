import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Building2, Mountain, Waves, Droplets, TreePine } from 'lucide-react'
import { useQuizContext } from '../context/QuizContext'

const categories = [
  { id: 'cities', label: 'Cities', icon: Building2, description: 'Capitals and major cities' },
  { id: 'mountains', label: 'Mountains', icon: Mountain, description: 'Peaks and ranges' },
  { id: 'rivers', label: 'Rivers', icon: Waves, description: 'Major rivers and waterways' },
  { id: 'lakes', label: 'Lakes', icon: Droplets, description: 'Lakes and water bodies' },
  { id: 'features', label: 'Features', icon: TreePine, description: 'Deserts, plains, forests' },
]

export default function CategoryPicker({ continentId, dataCounts = {} }) {
  const navigate = useNavigate()
  const { state } = useQuizContext()

  return (
    <div>
      <p className="text-[var(--color-text-muted)] mb-4">Choose a category to quiz yourself:</p>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {categories.map((cat, i) => {
          const Icon = cat.icon
          const count = dataCounts[cat.id] || 0
          const scoreKey = `${continentId}-${cat.id}`
          const prevScore = state.scores[scoreKey]

          return (
            <motion.button
              key={cat.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08, duration: 0.3 }}
              onClick={() => navigate(`/continent/${continentId}/${cat.id}`)}
              className="flex flex-col items-center gap-2 p-6 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg hover:border-[var(--color-accent)] hover:shadow-sm transition-all duration-200 cursor-pointer group"
            >
              <Icon className="w-7 h-7 text-[var(--color-text-muted)] group-hover:text-[var(--color-accent)] transition-colors" />
              <span className="font-medium text-[var(--color-text)]">{cat.label}</span>
              {count > 0 && (
                <span className="text-xs text-[var(--color-text-muted)]">{count} questions</span>
              )}
              {prevScore && (
                <span className="text-xs text-[var(--color-correct)] font-medium">
                  Best: {prevScore.correct}/{prevScore.total}
                </span>
              )}
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}
