import { useRef, useEffect } from 'react'
import createGlobe from 'cobe'
import { useTheme } from '../context/ThemeContext'

export default function Globe({ size = 400, className = '' }) {
  const canvasRef = useRef(null)
  const pointerDown = useRef(false)
  const pointerX = useRef(0)
  const dragOffset = useRef(0)
  const phiRef = useRef(0)
  const velocityRef = useRef(0)
  const { isDark } = useTheme()

  useEffect(() => {
    if (!canvasRef.current) return

    const globe = createGlobe(canvasRef.current, {
      devicePixelRatio: Math.min(window.devicePixelRatio, 2),
      width: size * 2,
      height: size * 2,
      phi: 0,
      theta: 0.15,
      dark: isDark ? 1 : 0,
      diffuse: isDark ? 3 : 1.5,
      mapSamples: 24000,
      mapBrightness: isDark ? 6 : 8,
      baseColor: isDark ? [0.15, 0.18, 0.22] : [0.93, 0.95, 0.98],
      markerColor: isDark ? [0.8, 0.58, 0.42] : [0.29, 0.54, 0.72],
      glowColor: isDark ? [0.08, 0.1, 0.14] : [0.93, 0.95, 0.98],
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
          velocityRef.current *= 0.94
          if (Math.abs(velocityRef.current) < 0.0001) velocityRef.current = 0
          phiRef.current += 0.003 + velocityRef.current
          dragOffset.current *= 0.92
        }
        state.phi = phiRef.current + dragOffset.current
        state.width = size * 2
        state.height = size * 2
      },
    })

    return () => globe.destroy()
  }, [size, isDark])

  const onDown = (e) => {
    pointerDown.current = true
    pointerX.current = e.clientX || e.touches?.[0]?.clientX || 0
    velocityRef.current = 0
    if (canvasRef.current) canvasRef.current.style.cursor = 'grabbing'
  }
  const onMove = (e) => {
    if (!pointerDown.current) return
    const x = e.clientX || e.touches?.[0]?.clientX || 0
    const dx = x - pointerX.current
    pointerX.current = x
    dragOffset.current += dx / 150
    velocityRef.current = dx / 150
  }
  const onUp = () => {
    pointerDown.current = false
    if (canvasRef.current) canvasRef.current.style.cursor = 'grab'
  }

  return (
    <div className={`relative ${className}`} style={{ width: size, height: size, maxWidth: '100%', aspectRatio: '1' }}>
      <div
        className="absolute inset-0 rounded-full"
        style={{
          background: `radial-gradient(circle, var(--accent-light) 0%, transparent 60%)`,
          transform: 'scale(1.5)',
        }}
      />
      <canvas
        ref={canvasRef}
        style={{ width: size, height: size, maxWidth: '100%', cursor: 'grab', contain: 'layout paint size' }}
        onPointerDown={onDown}
        onPointerUp={onUp}
        onPointerOut={onUp}
        onPointerMove={onMove}
        onTouchStart={onDown}
        onTouchMove={onMove}
        onTouchEnd={onUp}
      />
    </div>
  )
}
