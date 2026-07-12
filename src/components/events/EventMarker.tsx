import { useAtlasStore } from '../../store/atlasStore'
import type { GeologicalEvent, HoloceneEvent } from '../../types/events'

type AnyEvent = GeologicalEvent | HoloceneEvent

const ICON_MAP: Record<string, string> = {
  caveira: '💀',
  peixe: '🐟',
  dinossauro: '🦕',
  mamifero: '🦣',
  tubarao: '🦈',
  jabuti: '🐊',
  pajaro: '🦅',
  primata: '🦍',
  humano: '🦴',
  trigo: '🌾',
  coroa: '👑',
  espada: '⚔️',
  navio: '⛵',
  passadas: '👣',
  chama: '🔥',
  templo: '🏛️',
  livro: '📜',
  escudo: '🛡️',
  estrela: '⭐',
  virus: '🦠',
  meteorito: '☄️',
  planta: '🌿',
  agua: '💧',
  fogo: '🌋',
}

interface Props {
  event: AnyEvent
  x: number
  y: number
}

export default function EventMarker({ event, x, y }: Props) {
  const setSelectedEvent = useAtlasStore((s) => s.setSelectedEvent)
  const selectedEventId = useAtlasStore((s) => s.selectedEventId)
  const isSelected = selectedEventId === event.id

  const emoji = ICON_MAP[event.icone] ?? '📍'

  return (
    <button
      onClick={() => setSelectedEvent(isSelected ? null : event.id)}
      style={{
        position: 'absolute',
        left: x - 16,
        top: y - 16,
        width: 32,
        height: 32,
        border: isSelected ? `2px solid ${event.cor}` : 'none',
        borderRadius: '50%',
        background: isSelected ? 'rgba(0,0,0,0.7)' : 'rgba(0,0,0,0.5)',
        cursor: 'pointer',
        fontSize: 16,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'transform 0.15s, box-shadow 0.15s',
        boxShadow: isSelected ? `0 0 12px ${event.cor}` : '0 2px 8px rgba(0,0,0,0.4)',
        zIndex: isSelected ? 20 : 10,
        transform: isSelected ? 'scale(1.25)' : 'scale(1)',
      }}
      title={event.titulo}
    >
      {emoji}
    </button>
  )
}
