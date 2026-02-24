import { useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { HelpCircle } from 'lucide-react'

export default function QuizInput({
  items,
  answers,
  onAnswerChange,
  focusedId,
  onFocus,
  disabled = false,
}) {
  const inputRefs = useRef({})

  useEffect(() => {
    if (focusedId && inputRefs.current[focusedId]) {
      inputRefs.current[focusedId].focus()
      inputRefs.current[focusedId].scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      })
    }
  }, [focusedId])

  return (
    <div>
      <p className="text-[var(--color-text-muted)] mb-4 text-sm">Fill in the names:</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3">
        {items.map((item, i) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.03, duration: 0.2 }}
            className={`flex items-center gap-3 py-2 ${
              focusedId === item.id ? 'bg-blue-50 -mx-2 px-2 rounded-md' : ''
            }`}
          >
            <span className="flex items-center justify-center w-7 h-7 rounded-full bg-[var(--color-marker)] text-white text-xs font-semibold shrink-0">
              {item.id}
            </span>
            <input
              ref={(el) => (inputRefs.current[item.id] = el)}
              type="text"
              value={answers[item.id] || ''}
              onChange={(e) => onAnswerChange(item.id, e.target.value)}
              onFocus={() => onFocus(item.id)}
              disabled={disabled}
              placeholder="Type your answer..."
              autoComplete="off"
              className="flex-1 border-b-2 border-[var(--color-border)] bg-transparent py-1.5 text-sm text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] placeholder:opacity-40 focus:border-[var(--color-accent)] focus:outline-none transition-colors duration-200 disabled:opacity-50 font-[var(--font-body)]"
            />
            {item.hint && !disabled && (
              <button
                type="button"
                title={item.hint}
                className="shrink-0 text-[var(--color-text-muted)] hover:text-[var(--color-accent)] transition-colors bg-transparent border-none cursor-pointer p-0"
              >
                <HelpCircle className="w-4 h-4" />
              </button>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  )
}
