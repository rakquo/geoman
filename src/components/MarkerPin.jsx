import { motion } from 'framer-motion'

export default function MarkerPin({
  number,
  coordinates,
  isActive = false,
  status = 'default', // 'default' | 'correct' | 'incorrect'
  onClick,
}) {
  const colors = {
    default: { bg: 'var(--color-marker)', text: 'var(--color-marker-text)' },
    correct: { bg: 'var(--color-correct)', text: '#FFFFFF' },
    incorrect: { bg: 'var(--color-incorrect)', text: '#FFFFFF' },
  }

  const { bg, text } = colors[status]

  return (
    <motion.g
      onClick={onClick}
      style={{ cursor: 'pointer' }}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: (number - 1) * 0.05, duration: 0.3 }}
    >
      <motion.circle
        cx={0}
        cy={0}
        r={10}
        fill={bg}
        stroke="#FFFFFF"
        strokeWidth={2}
        className={isActive ? 'marker-pulse' : ''}
        animate={
          status !== 'default'
            ? { fill: bg, scale: [1, 1.2, 1] }
            : isActive
              ? { scale: [1, 1.15, 1] }
              : {}
        }
        transition={{ duration: 0.3 }}
        whileHover={{ scale: 1.15 }}
      />
      <text
        x={0}
        y={0}
        textAnchor="middle"
        dominantBaseline="central"
        fill={text}
        fontSize={10}
        fontWeight={600}
        fontFamily="var(--font-body)"
        style={{ pointerEvents: 'none', userSelect: 'none' }}
      >
        {number}
      </text>
      {status === 'correct' && (
        <motion.text
          x={8}
          y={-8}
          fontSize={10}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          ✓
        </motion.text>
      )}
      {status === 'incorrect' && (
        <motion.text
          x={8}
          y={-8}
          fontSize={10}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          ✗
        </motion.text>
      )}
    </motion.g>
  )
}
