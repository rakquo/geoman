import topology from 'world-atlas/countries-50m.json'

export { topology }

export const projectionConfig = {
  asia: { center: [85, 30], scale: 400 },
  europe: { center: [15, 54], scale: 700 },
  africa: { center: [20, 2], scale: 400 },
  'north-america': { center: [-100, 45], scale: 350 },
  'south-america': { center: [-58, -18], scale: 400 },
  oceania: { center: [145, -28], scale: 500 },
}

export function getProjectionConfig(continentId) {
  return projectionConfig[continentId] || { center: [0, 20], scale: 150 }
}
