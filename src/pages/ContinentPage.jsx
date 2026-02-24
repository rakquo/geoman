import { useParams } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import BackButton from '../components/BackButton'
import ContinentMap from '../components/ContinentMap'
import CategoryPicker from '../components/CategoryPicker'
import { continents } from '../data/continents'

const categoryFiles = ['cities', 'rivers', 'lakes', 'mountains', 'features']

export default function ContinentPage() {
  const { continentId } = useParams()
  const continent = continents[continentId]
  const [dataCounts, setDataCounts] = useState({})

  useEffect(() => {
    async function loadCounts() {
      const counts = {}
      for (const cat of categoryFiles) {
        try {
          const data = await import(`../data/${continentId}/${cat}.json`)
          counts[cat] = (data.default || data).length
        } catch {
          counts[cat] = 0
        }
      }
      setDataCounts(counts)
    }
    loadCounts()
  }, [continentId])

  if (!continent) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl mb-2">Continent not found</h2>
        <BackButton to="/" label="Back to World Map" />
      </div>
    )
  }

  return (
    <div>
      <BackButton to="/" label="Back to World Map" />

      <motion.div
        className="mt-6 mb-8"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="text-4xl mb-6">{continent.name}</h1>
      </motion.div>

      <div className="mb-8">
        <ContinentMap continentId={continentId} />
      </div>

      <CategoryPicker continentId={continentId} dataCounts={dataCounts} />
    </div>
  )
}
