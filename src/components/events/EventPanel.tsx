import { AnimatePresence, motion } from 'motion/react'
import { useAtlasStore } from '../../store/atlasStore'
import { useQuery } from '@tanstack/react-query'
import type { GeologicalEvent, HoloceneEvent } from '../../types/events'

type AnyEvent = GeologicalEvent | HoloceneEvent

function isGeoEvent(e: AnyEvent): e is GeologicalEvent {
  return 'timeMa' in e
}

async function fetchJson(url: string) {
  const res = await fetch(url)
  return res.json()
}

export default function EventPanel() {
  const selectedEventId = useAtlasStore((s) => s.selectedEventId)
  const viewMode = useAtlasStore((s) => s.viewMode)
  const setSelectedEvent = useAtlasStore((s) => s.setSelectedEvent)

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

  const allEvents: AnyEvent[] = viewMode === 'geologico' ? geoEvents : holoEvents
  const event = allEvents.find((e) => e.id === selectedEventId)

  const timeLabel = event
    ? isGeoEvent(event)
      ? `${event.timeMa} milhões de anos atrás`
      : event.anoInicio < 0
        ? `${Math.abs(event.anoInicio)} a.C. — ${event.anoFim < 0 ? Math.abs(event.anoFim) + ' a.C.' : event.anoFim + ' d.C.'}`
        : `${event.anoInicio} — ${event.anoFim} d.C.`
    : ''

  return (
    <AnimatePresence>
      {event && (
        <motion.div
          key={event.id}
          initial={{ x: 320, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 320, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          style={{
            position: 'absolute',
            top: 80,
            right: 16,
            width: 300,
            background: 'rgba(8, 20, 45, 0.92)',
            border: `1px solid ${event.cor}44`,
            borderRadius: 12,
            padding: 20,
            backdropFilter: 'blur(12px)',
            boxShadow: `0 8px 32px rgba(0,0,0,0.5), 0 0 0 1px ${event.cor}22`,
            zIndex: 30,
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
            <div
              style={{
                fontSize: 11,
                fontWeight: 600,
                color: event.cor,
                textTransform: 'uppercase',
                letterSpacing: 1.2,
              }}
            >
              {event.tipo}
            </div>
            <button
              onClick={() => setSelectedEvent(null)}
              style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: 18, lineHeight: 1 }}
            >
              ×
            </button>
          </div>

          <h3 style={{ fontSize: 15, fontWeight: 600, color: '#f1f5f9', marginBottom: 8, lineHeight: 1.4 }}>
            {event.titulo}
          </h3>

          <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 12, fontStyle: 'italic' }}>
            {timeLabel}
          </div>

          <p style={{ fontSize: 13, color: '#cbd5e1', lineHeight: 1.65 }}>
            {event.descricao}
          </p>

          {event.wikiUrl && (
            <a
              href={event.wikiUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-block',
                marginTop: 14,
                fontSize: 12,
                color: event.cor,
                textDecoration: 'none',
                borderBottom: `1px solid ${event.cor}44`,
                paddingBottom: 2,
              }}
            >
              Saiba mais →
            </a>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
