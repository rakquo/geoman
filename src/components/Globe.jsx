import { useRef, useEffect } from 'react'
import createGlobe from 'cobe'

export default function Globe({ size = 360, className = '' }) {
  const canvasRef = useRef(null)
  const pointerDown = useRef(false)
  const pointerX = useRef(0)
  const dragOffset = useRef(0)
  const phiRef = useRef(0)
  const velocityRef = useRef(0)

  useEffect(() => {
    if (!canvasRef.current) return
    let animFrame

    const globe = createGlobe(canvasRef.current, {
      devicePixelRatio: Math.min(window.devicePixelRatio, 2),
      width: size * 2,
      height: size * 2,
      phi: 0,
      theta: 0.2,
      dark: 0,
      diffuse: 1.4,
      mapSamples: 24000,
      mapBrightness: 8,
      baseColor: [0.95, 0.93, 0.88],
      markerColor: [0.31, 0.27, 0.9],
      glowColor: [0.92, 0.9, 0.87],
      markers: [
        { location: [48.8566, 2.3522], size: 0.04 },
        { location: [40.7128, -74.006], size: 0.04 },
        { location: [35.6762, 139.6503], size: 0.04 },
        { location: [-33.8688, 151.2093], size: 0.04 },
        { location: [55.7558, 37.6173], size: 0.04 },
        { location: [-22.9068, -43.1729], size: 0.04 },
        { location: [28.6139, 77.209], size: 0.04 },
        { location: [30.0444, 31.2357], size: 0.04 },
        { location: [1.3521, 103.8198], size: 0.04 },
        { location: [51.5074, -0.1278], size: 0.04 },
      ],
      onRender: (state) => {
        if (!pointerDown.current) {
          // Apply friction to drag velocity, then blend into auto-rotation
          velocityRef.current *= 0.95
          if (Math.abs(velocityRef.current) < 0.0001) {
            velocityRef.current = 0
          }
          phiRef.current += 0.003 + velocityRef.current
          dragOffset.current *= 0.95 // smoothly return drag offset to 0
        }
        state.phi = phiRef.current + dragOffset.current
        state.width = size * 2
        state.height = size * 2
      },
    })

    return () => globe.destroy()
  }, [size])

  const handlePointerDown = (e) => {
    pointerDown.current = true
    pointerX.current = e.clientX || (e.touches && e.touches[0]?.clientX) || 0
    velocityRef.current = 0
    if (canvasRef.current) canvasRef.current.style.cursor = 'grabbing'
  }

  const handlePointerMove = (e) => {
    if (!pointerDown.current) return
    const x = e.clientX || (e.touches && e.touches[0]?.clientX) || 0
    const dx = x - pointerX.current
    pointerX.current = x
    dragOffset.current += dx / 150
    velocityRef.current = dx / 150
  }

  const handlePointerUp = () => {
    pointerDown.current = false
    // velocity persists — friction in onRender handles deceleration
    if (canvasRef.current) canvasRef.current.style.cursor = 'grab'
  }

  return (
    <div className={`relative ${className}`} style={{ width: size, height: size, maxWidth: '100%', aspectRatio: '1' }}>
      <div
        className="absolute inset-0 rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(79,70,229,0.12) 0%, rgba(79,70,229,0.04) 40%, transparent 70%)',
          transform: 'scale(1.35)',
        }}
      />
      <canvas
        ref={canvasRef}
        style={{ width: size, height: size, maxWidth: '100%', cursor: 'grab', contain: 'layout paint size' }}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerOut={handlePointerUp}
        onPointerMove={handlePointerMove}
        onTouchStart={handlePointerDown}
        onTouchMove={handlePointerMove}
        onTouchEnd={handlePointerUp}
      />
    </div>
  )
}
