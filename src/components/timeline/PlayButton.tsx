import { useEffect, useRef } from 'react'
import { useAtlasStore } from '../../store/atlasStore'

// Geological: 541 Ma in ~135 s ≈ 10 s per major era
const GEO_SPEED = 4          // Ma/s
// Holocene: -10000 to 1994 (~12000 yrs) in ~120 s
const HOLO_SPEED = 100       // years/s
// Slow globe auto-rotation during playback
const ROTATE_SPEED = 5       // deg/s

export default function PlayButton() {
  const isPlaying = useAtlasStore((s) => s.isPlaying)
  const setIsPlaying = useAtlasStore((s) => s.setIsPlaying)
  const setCurrentTime = useAtlasStore((s) => s.setCurrentTime)
  const setGlobeRotation = useAtlasStore((s) => s.setGlobeRotation)

  const rafRef = useRef<number>(0)
  const lastTsRef = useRef<number>(0)
  const currentTimeRef = useRef(useAtlasStore.getState().currentTime)
  const viewModeRef = useRef(useAtlasStore.getState().viewMode)
  const rotationRef = useRef(useAtlasStore.getState().globeRotation)

  useEffect(() => useAtlasStore.subscribe((s) => {
    currentTimeRef.current = s.currentTime
    viewModeRef.current = s.viewMode
    rotationRef.current = s.globeRotation
  }), [])

  useEffect(() => {
    if (!isPlaying) {
      cancelAnimationFrame(rafRef.current)
      return
    }

    lastTsRef.current = 0

    const step = (ts: number) => {
      if (lastTsRef.current === 0) lastTsRef.current = ts
      const dt = (ts - lastTsRef.current) / 1000
      lastTsRef.current = ts

      const t = currentTimeRef.current
      const mode = viewModeRef.current
      const [λ, φ, γ] = rotationRef.current

      setGlobeRotation([λ + ROTATE_SPEED * dt, φ, γ])

      if (mode === 'geologico') {
        const newTime = Math.max(0, t - GEO_SPEED * dt)
        setCurrentTime(newTime)
        if (newTime <= 0) {
          setIsPlaying(false)
          return
        }
      } else {
        const newTime = Math.min(1994, t + HOLO_SPEED * dt)
        setCurrentTime(Math.round(newTime))
        if (newTime >= 1994) {
          setIsPlaying(false)
          return
        }
      }

      rafRef.current = requestAnimationFrame(step)
    }

    rafRef.current = requestAnimationFrame(step)
    return () => cancelAnimationFrame(rafRef.current)
  }, [isPlaying])

  const handleClick = () => {
    if (!isPlaying) {
      const t = currentTimeRef.current
      const mode = viewModeRef.current
      if (mode === 'geologico' && t <= 0) setCurrentTime(541)
      if (mode === 'holoceno' && t >= 1994) setCurrentTime(-10000)
    }
    setIsPlaying(!isPlaying)
  }

  return (
    <button
      onClick={handleClick}
      style={{
        width: 36,
        height: 36,
        borderRadius: '50%',
        border: '1px solid rgba(96,165,250,0.4)',
        background: isPlaying ? 'rgba(59,130,246,0.3)' : 'rgba(255,255,255,0.05)',
        color: '#93c5fd',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 14,
        flexShrink: 0,
        transition: 'all 0.15s',
      }}
      title={isPlaying ? 'Pausar' : 'Reproduzir'}
    >
      {isPlaying ? '⏸' : '▶'}
    </button>
  )
}
