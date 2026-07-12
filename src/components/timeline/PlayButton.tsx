import { useEffect, useRef } from 'react'
import { useAtlasStore } from '../../store/atlasStore'
import { PALEO_SNAPSHOTS } from '../../data/geologicalEpochs'

export default function PlayButton() {
  const isPlaying = useAtlasStore((s) => s.isPlaying)
  const setIsPlaying = useAtlasStore((s) => s.setIsPlaying)
  const setCurrentTime = useAtlasStore((s) => s.setCurrentTime)
  const rafRef = useRef<number>(0)
  const lastTsRef = useRef<number>(0)
  // Use refs to avoid stale closures in the animation loop
  const currentTimeRef = useRef(useAtlasStore.getState().currentTime)
  const viewModeRef = useRef(useAtlasStore.getState().viewMode)

  // Keep refs in sync with store
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
      const dt = ts - lastTsRef.current
      lastTsRef.current = ts

      const t = currentTimeRef.current
      const mode = viewModeRef.current

      if (mode === 'geologico') {
        const newTime = Math.max(0, t - (dt / 1000) * 30)
        const snapped = PALEO_SNAPSHOTS.reduce((p, c) =>
          Math.abs(c - newTime) < Math.abs(p - newTime) ? c : p
        )
        setCurrentTime(snapped)
        if (snapped === 0) {
          setIsPlaying(false)
          return
        }
      } else {
        const newTime = Math.min(1994, t + (dt / 1000) * 500)
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

  return (
    <button
      onClick={() => setIsPlaying(!isPlaying)}
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
