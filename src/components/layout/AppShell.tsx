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
  const isMobile = dims.width < 640

  useEffect(() => {
    const handler = () => setDims({ width: window.innerWidth, height: window.innerHeight })
    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler)
  }, [])

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

      {/* Top bar: toggle à esquerda, título centralizado apenas em telas grandes */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 40,
        display: 'flex',
        alignItems: 'center',
        padding: '12px 16px',
        pointerEvents: 'none',
      }}>
        <div style={{ pointerEvents: 'auto' }}>
          <ViewToggle />
        </div>

        {!isMobile && (
          <div style={{
            position: 'absolute',
            left: '50%',
            transform: 'translateX(-50%)',
            fontSize: 11,
            color: '#334155',
            letterSpacing: 2,
            textTransform: 'uppercase',
            fontWeight: 500,
            whiteSpace: 'nowrap',
            pointerEvents: 'none',
          }}>
            Atlas Histórico-Geográfico
          </div>
        )}
      </div>

      <TimeSlider />
      <EventPanel />

      {/* Hint — só desktop */}
      {!isMobile && (
        <div style={{
          position: 'absolute',
          bottom: 130,
          left: '50%',
          transform: 'translateX(-50%)',
          fontSize: 11,
          color: '#1e293b',
          pointerEvents: 'none',
          whiteSpace: 'nowrap',
        }}>
          Arraste o globo para girar · Espaço para reproduzir
        </div>
      )}
    </div>
  )
}
