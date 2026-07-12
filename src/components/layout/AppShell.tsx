import { useState, useEffect, useCallback } from 'react'
import GlobeCanvas from '../globe/GlobeCanvas'
import ViewToggle from './ViewToggle'
import TimeSlider from '../timeline/TimeSlider'
import EventPanel from '../events/EventPanel'
import { useAtlasStore } from '../../store/atlasStore'

export default function AppShell() {
  const [dims, setDims] = useState({ width: window.innerWidth, height: window.innerHeight })
  const setIsPlaying = useAtlasStore((s) => s.setIsPlaying)
  const isPlaying = useAtlasStore((s) => s.isPlaying)

  useEffect(() => {
    const handler = () => setDims({ width: window.innerWidth, height: window.innerHeight })
    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler)
  }, [])

  // Keyboard shortcuts
  const handleKey = useCallback((e: KeyboardEvent) => {
    if (e.code === 'Space') {
      e.preventDefault()
      setIsPlaying(!isPlaying)
    }
  }, [isPlaying, setIsPlaying])

  useEffect(() => {
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [handleKey])

  return (
    <div style={{ position: 'relative', width: dims.width, height: dims.height, overflow: 'hidden' }}>
      <GlobeCanvas width={dims.width} height={dims.height} />
      <ViewToggle />
      <TimeSlider />
      <EventPanel />

      {/* Title */}
      <div
        style={{
          position: 'absolute',
          top: 16,
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 40,
          textAlign: 'center',
          pointerEvents: 'none',
        }}
      >
        <div style={{ fontSize: 12, color: '#475569', letterSpacing: 2, textTransform: 'uppercase', fontWeight: 500 }}>
          Atlas Histórico-Geográfico
        </div>
      </div>

      {/* Hint */}
      <div
        style={{
          position: 'absolute',
          bottom: 120,
          left: '50%',
          transform: 'translateX(-50%)',
          fontSize: 11,
          color: '#334155',
          pointerEvents: 'none',
          whiteSpace: 'nowrap',
        }}
      >
        Arraste o globo para girar · Espaço para reproduzir
      </div>
    </div>
  )
}
