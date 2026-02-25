// Leaflet view configs per continent (center: [lat, lng], zoom: number)
export const viewConfig = {
  asia:            { center: [30, 85],   zoom: 3 },
  europe:          { center: [52, 15],   zoom: 4 },
  africa:          { center: [5, 20],    zoom: 3 },
  'north-america': { center: [45, -100], zoom: 3 },
  'south-america': { center: [-15, -58], zoom: 3 },
  oceania:         { center: [-25, 140], zoom: 4 },
}

export function getViewConfig(continentId) {
  return viewConfig[continentId] || { center: [20, 0], zoom: 2 }
}
