import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useAtlasStore } from '../../store/atlasStore'
import type { GeologicalEvent, HoloceneEvent } from '../../types/events'

type AnyEvent = GeologicalEvent | HoloceneEvent

function isGeoEvent(e: AnyEvent): e is GeologicalEvent {
  return 'timeMa' in e
}

function formatTime(e: AnyEvent): string {
  if (isGeoEvent(e)) return `${e.timeMa} Ma`
  return e.anoInicio < 0
    ? `${Math.abs(e.anoInicio)} a.C.`
    : `${e.anoInicio} d.C.`
}

async function fetchJson(url: string) {
  const res = await fetch(url)
  return res.json()
}

export default function EventNavigator() {
  const [open, setOpen] = useState(false)
  const viewMode = useAtlasStore((s) => s.viewMode)
  const setCurrentTime = useAtlasStore((s) => s.setCurrentTime)
  const setSelectedEvent = useAtlasStore((s) => s.setSelectedEvent)
  const setIsPlaying = useAtlasStore((s) => s.setIsPlaying)

  const { data: geoEvents = [] } = useQuery<GeologicalEvent[]>({
    queryKey: ['geo-events'],
    queryFn: () => fetchJson('/data/events/geological_events.json'),
    staleTime: Infinity,
  })
  const { data: holoEvents = [] } = useQuery<HoloceneEvent[]>({
    queryKey: ['holo-events'],
    queryFn: () => fetchJson('/data/events/holocene_events.json'),
    staleTime: Infinity,
  })

  const events: AnyEvent[] = viewMode === 'geologico' ? geoEvents : holoEvents

  const sorted = [...events].sort((a, b) => {
    if (isGeoEvent(a) && isGeoEvent(b)) return b.timeMa - a.timeMa
    if (!isGeoEvent(a) && !isGeoEvent(b)) return a.anoInicio - b.anoInicio
    return 0
  })

  const handleSelect = (event: AnyEvent) => {
    const time = isGeoEvent(event) ? event.timeMa : event.anoInicio
    setCurrentTime(time)
    setSelectedEvent(event.id)
    setIsPlaying(false)
    setOpen(false)
  }

  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          height: 36,
          padding: '0 14px',
          borderRadius: 7,
          border: '1px solid rgba(100, 160, 255, 0.2)',
          background: open ? 'rgba(59,130,246,0.25)' : 'rgba(8,20,45,0.85)',
          backdropFilter: 'blur(10px)',
          color: open ? '#93c5fd' : '#64748b',
          cursor: 'pointer',
          fontSize: 13,
          fontWeight: 500,
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          whiteSpace: 'nowrap',
          transition: 'all 0.2s',
        }}
        title="Navegar para um evento específico"
      >
        <span style={{ fontSize: 16, lineHeight: 1 }}>≡</span>
        <span>Eventos</span>
      </button>

      {open && (
        <>
          <div
            style={{ position: 'fixed', inset: 0, zIndex: 45 }}
            onClick={() => setOpen(false)}
          />
          <div
            style={{
              position: 'absolute',
              top: 'calc(100% + 8px)',
              left: 0,
              width: 280,
              maxWidth: '85vw',
              maxHeight: '70vh',
              overflowY: 'auto',
              background: 'rgba(8, 20, 45, 0.96)',
              border: '1px solid rgba(100, 160, 255, 0.2)',
              borderRadius: 10,
              backdropFilter: 'blur(12px)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
              zIndex: 50,
            }}
          >
            <div style={{
              padding: '10px 14px 8px',
              fontSize: 10,
              fontWeight: 600,
              color: '#475569',
              textTransform: 'uppercase',
              letterSpacing: 1.2,
              borderBottom: '1px solid rgba(255,255,255,0.06)',
              position: 'sticky',
              top: 0,
              background: 'rgba(8,20,45,0.98)',
            }}>
              {sorted.length} eventos · {viewMode === 'geologico' ? 'Eras Geológicas' : 'Holoceno'}
            </div>

            {sorted.map((event) => (
              <button
                key={event.id}
                onClick={() => handleSelect(event)}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 10,
                  width: '100%',
                  padding: '9px 14px',
                  border: 'none',
                  borderBottom: '1px solid rgba(255,255,255,0.04)',
                  background: 'transparent',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'background 0.1s',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)' }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
              >
                <span style={{
                  width: 8, height: 8, borderRadius: '50%',
                  background: event.cor, flexShrink: 0, marginTop: 4,
                }} />
                <div>
                  <div style={{ fontSize: 13, fontWeight: 500, color: '#cbd5e1', lineHeight: 1.3 }}>
                    {event.titulo}
                  </div>
                  <div style={{ fontSize: 11, color: '#475569', marginTop: 2 }}>
                    {formatTime(event)}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
