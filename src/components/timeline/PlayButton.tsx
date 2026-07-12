import { useEffect, useRef } from 'react'
import { useAtlasStore } from '../../store/atlasStore'

const GEO_SPEED = 4        // Ma/s  → 541 Ma em ~135 s ≈ 10 s por era
const HOLO_SPEED = 100     // anos/s → ~120 s para o período completo
const HOLO_END = 2025

export default function PlayButton() {
  const isPlaying = useAtlasStore((s) => s.isPlaying)
  const setIsPlaying = useAtlasStore((s) => s.setIsPlaying)
  const setCurrentTime = useAtlasStore((s) => s.setCurrentTime)

  const rafRef = useRef<number>(0)
  const lastTsRef = useRef<number>(0)
  const currentTimeRef = useRef(useAtlasStore.getState().currentTime)
  const viewModeRef = useRef(useAtlasStore.getState().viewMode)

  useEffect(() => useAtlasStore.subscribe((s) => {
    currentTimeRef.current = s.currentTime
    viewModeRef.current = s.viewMode
  }), [])

  useEffect(() => {
    if (!isPlaying) {
      cancelAnimationFrame(rafRef.current)
      return
    }

    lastTsRef.current = 0

    const step = (ts: number) => {
      if (lastTsRef.current === 0) lastTsRef.current = ts
      const dt = Math.min((ts - lastTsRef.current) / 1000, 0.05)
      lastTsRef.current = ts

      const t = currentTimeRef.current
      const mode = viewModeRef.current

      if (mode === 'geologico') {
        const newTime = Math.max(0, t - GEO_SPEED * dt)
        setCurrentTime(newTime)
        if (newTime <= 0) { setIsPlaying(false); return }
      } else {
        const newTime = Math.min(HOLO_END, t + HOLO_SPEED * dt)
        setCurrentTime(Math.round(newTime))
        if (newTime >= HOLO_END) { setIsPlaying(false); return }
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
      if (mode === 'holoceno' && t >= HOLO_END) setCurrentTime(-10000)
    }
    setIsPlaying(!isPlaying)
  }

  return (
    <button
      onClick={handleClick}
      style={{
        width: 36, height: 36,
        borderRadius: '50%',
        border: '1px solid rgba(96,165,250,0.4)',
        background: isPlaying ? 'rgba(59,130,246,0.3)' : 'rgba(255,255,255,0.05)',
        color: '#93c5fd',
        cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 14, flexShrink: 0, transition: 'all 0.15s',
      }}
      title={isPlaying ? 'Pausar' : 'Reproduzir'}
    >
      {isPlaying ? '⏸' : '▶'}
    </button>
  )
}
