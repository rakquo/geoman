import { motion } from 'framer-motion'
import { CheckCircle, XCircle, MinusCircle } from 'lucide-react'

export default function QuizResults({ results }) {
  if (!results) return null

  const { correct, total, results: itemResults } = results
  const percentage = Math.round((correct / total) * 100)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Score summary */}
      <div className="flex items-center gap-4 mb-6 p-4 bg-[var(--color-surface)] rounded-lg border border-[var(--color-border)]">
        <div className="relative w-16 h-16">
          <svg className="w-16 h-16 -rotate-90" viewBox="0 0 36 36">
            <circle
              cx="18"
              cy="18"
              r="15.5"
              fill="none"
              stroke="var(--color-border)"
              strokeWidth="3"
            />
            <motion.circle
              cx="18"
              cy="18"
              r="15.5"
              fill="none"
              stroke={percentage >= 70 ? 'var(--color-correct)' : percentage >= 40 ? 'var(--color-accent)' : 'var(--color-incorrect)'}
              strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray={`${percentage} ${100 - percentage}`}
              initial={{ strokeDasharray: '0 100' }}
              animate={{ strokeDasharray: `${percentage} ${100 - percentage}` }}
              transition={{ duration: 1, delay: 0.2, ease: 'easeOut' }}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-sm font-semibold">{percentage}%</span>
          </div>
        </div>
        <div>
          <h3 className="text-2xl font-[var(--font-display)]">
            {correct} / {total}
          </h3>
          <p className="text-sm text-[var(--color-text-muted)]">
            {percentage >= 90
              ? 'Excellent!'
              : percentage >= 70
                ? 'Great work!'
                : percentage >= 50
                  ? 'Good effort!'
                  : 'Keep practicing!'}
          </p>
        </div>
      </div>

      {/* Individual results */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2">
        {itemResults.map((item, i) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05, duration: 0.2 }}
            className={`flex items-center gap-3 py-2 px-3 rounded-md ${
              item.isCorrect
                ? 'bg-[var(--color-correct-bg)]'
                : item.isSkipped
                  ? 'bg-gray-50'
                  : 'bg-[var(--color-incorrect-bg)]'
            }`}
          >
            <span className="flex items-center justify-center w-6 h-6 rounded-full text-white text-xs font-semibold shrink-0"
              style={{
                backgroundColor: item.isCorrect
                  ? 'var(--color-correct)'
                  : item.isSkipped
                    ? 'var(--color-text-muted)'
                    : 'var(--color-incorrect)',
              }}
            >
              {item.id}
            </span>

            {item.isCorrect ? (
              <div className="flex items-center gap-1.5 flex-1 min-w-0">
                <CheckCircle className="w-4 h-4 text-[var(--color-correct)] shrink-0" />
                <span className="text-sm font-medium text-[var(--color-correct)] truncate">
                  {item.name}
                </span>
              </div>
            ) : item.isSkipped ? (
              <div className="flex items-center gap-1.5 flex-1 min-w-0">
                <MinusCircle className="w-4 h-4 text-[var(--color-text-muted)] shrink-0" />
                <span className="text-sm text-[var(--color-text-muted)]">
                  — <span className="font-medium">({item.name})</span>
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 flex-1 min-w-0">
                <XCircle className="w-4 h-4 text-[var(--color-incorrect)] shrink-0" />
                <span className="text-sm text-[var(--color-incorrect)] truncate">
                  <span className="line-through opacity-70">{item.userAnswer}</span>
                  {' → '}
                  <span className="font-medium">{item.name}</span>
                </span>
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}
