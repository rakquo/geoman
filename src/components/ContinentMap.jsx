import { memo } from 'react'
import {
  ComposableMap,
  Geographies,
  Geography,
} from 'react-simple-maps'
import { getProjectionConfig, MAP_URL } from '../utils/mapConfig'
import { continents } from '../data/continents'

const MemoGeography = memo(function MemoGeography({ geo, isInContinent }) {
  return (
    <Geography
      geography={geo}
      style={{
        default: {
          fill: isInContinent ? 'var(--color-land)' : 'transparent',
          stroke: isInContinent ? 'var(--color-border-geo)' : 'transparent',
          strokeWidth: 0.5,
          outline: 'none',
        },
        hover: {
          fill: isInContinent ? 'var(--color-land)' : 'transparent',
          stroke: isInContinent ? 'var(--color-border-geo)' : 'transparent',
          strokeWidth: 0.5,
          outline: 'none',
        },
        pressed: {
          fill: isInContinent ? 'var(--color-land)' : 'transparent',
          stroke: isInContinent ? 'var(--color-border-geo)' : 'transparent',
          strokeWidth: 0.5,
          outline: 'none',
        },
      }}
    />
  )
})

export default function ContinentMap({ continentId, children }) {
  const config = getProjectionConfig(continentId)
  const continent = continents[continentId]
  const countryCodes = new Set(continent?.countries || [])

  return (
    <div className="w-full bg-[var(--color-water)] rounded-lg overflow-hidden">
      <ComposableMap
        projection="geoMercator"
        projectionConfig={{ center: config.center, scale: config.scale }}
        width={800}
        height={500}
        style={{ width: '100%', height: 'auto' }}
      >
        <Geographies geography={MAP_URL}>
          {({ geographies }) =>
            geographies.map((geo) => {
              const code = geo.properties.ISO_A3 || geo.properties.iso_a3 || ''
              const isInContinent = countryCodes.has(code)
              return (
                <MemoGeography
                  key={geo.rsmKey}
                  geo={geo}
                  isInContinent={isInContinent}
                />
              )
            })
          }
        </Geographies>
        {children}
      </ComposableMap>
    </div>
  )
}
