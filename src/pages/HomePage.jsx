import { motion } from 'framer-motion'
import WorldMap from '../components/WorldMap'

export default function HomePage() {
  return (
    <div>
      <motion.div
        className="text-center mb-8"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="text-4xl mb-2">Explore the World</h1>
        <p className="text-[var(--color-text-muted)]">
          Click a continent to start revising your geography
        </p>
      </motion.div>
      <WorldMap />
    </div>
  )
}
