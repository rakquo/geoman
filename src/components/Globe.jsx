import { useRef, useEffect, useCallback } from 'react'
import createGlobe from 'cobe'

export default function Globe({ size = 500, className = '' }) {
  const canvasRef = useRef(null)
  const pointerInteracting = useRef(null)
  const pointerInteractionMovement = useRef(0)
  const phiRef = useRef(0)
  const widthRef = useRef(0)

  const onResize = useCallback(() => {
    if (canvasRef.current) {
      widthRef.current = canvasRef.current.offsetWidth
    }
  }, [])

  useEffect(() => {
    onResize()
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [onResize])

  useEffect(() => {
    if (!canvasRef.current) return

    const globe = createGlobe(canvasRef.current, {
      devicePixelRatio: 2,
      width: size * 2,
      height: size * 2,
      phi: 0,
      theta: 0.25,
      dark: 0,
      diffuse: 1.2,
      mapSamples: 20000,
      mapBrightness: 8,
      baseColor: [0.95, 0.93, 0.9],
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
        if (!pointerInteracting.current) {
          phiRef.current += 0.005
        }
        state.phi = phiRef.current + pointerInteractionMovement.current
        state.width = size * 2
        state.height = size * 2
      },
    })

    return () => globe.destroy()
  }, [size])

  return (
    <div className={`relative ${className}`} style={{ width: size, height: size, maxWidth: '100%', aspectRatio: '1' }}>
      {/* Glow behind globe */}
      <div
        className="absolute inset-0 rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(79,70,229,0.15) 0%, rgba(79,70,229,0.05) 40%, transparent 70%)',
          transform: 'scale(1.3)',
        }}
      />
      <canvas
        ref={canvasRef}
        style={{ width: size, height: size, maxWidth: '100%', cursor: 'grab', contain: 'layout paint size' }}
        onPointerDown={(e) => {
          pointerInteracting.current = e.clientX - pointerInteractionMovement.current
          canvasRef.current.style.cursor = 'grabbing'
        }}
        onPointerUp={() => {
          pointerInteracting.current = null
          canvasRef.current.style.cursor = 'grab'
        }}
        onPointerOut={() => {
          pointerInteracting.current = null
          if (canvasRef.current) canvasRef.current.style.cursor = 'grab'
        }}
        onMouseMove={(e) => {
          if (pointerInteracting.current !== null) {
            const delta = e.clientX - pointerInteracting.current
            pointerInteractionMovement.current = delta / 200
          }
        }}
        onTouchMove={(e) => {
          if (pointerInteracting.current !== null && e.touches[0]) {
            const delta = e.touches[0].clientX - pointerInteracting.current
            pointerInteractionMovement.current = delta / 200
          }
        }}
      />
    </div>
  )
}
