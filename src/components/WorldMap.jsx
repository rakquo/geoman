import { useState, memo, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ComposableMap,
  Geographies,
  Geography,
  ZoomableGroup,
} from 'react-simple-maps'
import { motion } from 'framer-motion'
import { continents, countryToContinent } from '../data/continents'
import { MAP_URL } from '../utils/mapConfig'

const MemoGeography = memo(function MemoGeography({
  geo,
  continentId,
  hoveredContinent,
  onMouseEnter,
  onMouseLeave,
  onClick,
}) {
  const isHovered = hoveredContinent === continentId
  const fill = isHovered ? 'var(--color-land-hover)' : 'var(--color-land)'

  return (
    <Geography
      geography={geo}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onClick={onClick}
      style={{
        default: {
          fill,
          stroke: 'var(--color-border-geo)',
          strokeWidth: 0.5,
          outline: 'none',
          transition: 'fill 0.2s ease',
        },
        hover: {
          fill: 'var(--color-land-hover)',
          stroke: 'var(--color-border-geo)',
          strokeWidth: 0.5,
          outline: 'none',
          cursor: 'pointer',
        },
        pressed: {
          fill: 'var(--color-land-active)',
          stroke: 'var(--color-border-geo)',
          strokeWidth: 0.5,
          outline: 'none',
        },
      }}
    />
  )
})

export default function WorldMap() {
  const navigate = useNavigate()
  const [hoveredContinent, setHoveredContinent] = useState(null)
  const [tooltip, setTooltip] = useState({ show: false, x: 0, y: 0, name: '' })

  const handleMouseMove = useCallback(
    (continentId, e) => {
      if (continentId) {
        setTooltip({
          show: true,
          x: e.clientX,
          y: e.clientY,
          name: continents[continentId]?.name || '',
        })
      }
    },
    []
  )

  const handleMouseEnter = useCallback((continentId) => {
    setHoveredContinent(continentId)
  }, [])

  const handleMouseLeave = useCallback(() => {
    setHoveredContinent(null)
    setTooltip((t) => ({ ...t, show: false }))
  }, [])

  const handleClick = useCallback(
    (continentId) => {
      if (continentId) {
        navigate(`/continent/${continentId}`)
      }
    },
    [navigate]
  )

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div
        className="w-full bg-[var(--color-water)] rounded-lg overflow-hidden"
        onMouseMove={(e) => handleMouseMove(hoveredContinent, e)}
      >
        <ComposableMap
          projection="geoMercator"
          projectionConfig={{ center: [0, 20], scale: 130 }}
          width={800}
          height={450}
          style={{ width: '100%', height: 'auto' }}
        >
          <ZoomableGroup>
            <Geographies geography={MAP_URL}>
              {({ geographies }) =>
                geographies.map((geo) => {
                  const countryCode = geo.properties.ISO_A3 || geo.properties.iso_a3 || ''
                  const continentId = countryToContinent[countryCode]
                  return (
                    <MemoGeography
                      key={geo.rsmKey}
                      geo={geo}
                      continentId={continentId}
                      hoveredContinent={hoveredContinent}
                      onMouseEnter={() => handleMouseEnter(continentId)}
                      onMouseLeave={handleMouseLeave}
                      onClick={() => handleClick(continentId)}
                    />
                  )
                })
              }
            </Geographies>
          </ZoomableGroup>
        </ComposableMap>
      </div>
      {tooltip.show && (
        <div
          className="map-tooltip"
          style={{ left: tooltip.x, top: tooltip.y }}
        >
          {tooltip.name}
        </div>
      )}
    </motion.div>
  )
}
