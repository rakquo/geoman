import { Marker } from 'react-simple-maps'
import ContinentMap from './ContinentMap'
import MarkerPin from './MarkerPin'

export default function QuizMap({
  continentId,
  items,
  focusedId,
  onMarkerClick,
  results = null,
}) {
  return (
    <ContinentMap continentId={continentId}>
      {items.map((item) => {
        let status = 'default'
        if (results) {
          const result = results.find((r) => r.id === item.id)
          if (result) {
            status = result.isCorrect ? 'correct' : 'incorrect'
          }
        }

        return (
          <Marker key={item.id} coordinates={[item.lng, item.lat]}>
            <MarkerPin
              number={item.id}
              coordinates={[item.lng, item.lat]}
              isActive={focusedId === item.id}
              status={status}
              onClick={() => onMarkerClick?.(item.id)}
            />
          </Marker>
        )
      })}
    </ContinentMap>
  )
}
