import topology from 'world-atlas/countries-110m.json'

export { topology }

export const projectionConfig = {
  asia: { center: [85, 30], scale: 350 },
  europe: { center: [15, 52], scale: 600 },
  africa: { center: [20, 2], scale: 350 },
  'north-america': { center: [-100, 45], scale: 350 },
  'south-america': { center: [-58, -20], scale: 350 },
  oceania: { center: [140, -25], scale: 450 },
}

export function getProjectionConfig(continentId) {
  return projectionConfig[continentId] || { center: [0, 20], scale: 150 }
}
