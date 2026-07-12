import { useAtlasStore, type ViewMode } from '../../store/atlasStore'

export default function ViewToggle() {
  const viewMode = useAtlasStore((s) => s.viewMode)
  const setViewMode = useAtlasStore((s) => s.setViewMode)

  const options: { value: ViewMode; label: string; emoji: string }[] = [
    { value: 'geologico', label: 'Eras Geológicas', emoji: '🌋' },
    { value: 'holoceno', label: 'Holoceno', emoji: '🏛️' },
  ]

  return (
    <div
      style={{
        position: 'absolute',
        top: 16,
        left: 16,
        zIndex: 40,
        background: 'rgba(8, 20, 45, 0.85)',
        backdropFilter: 'blur(10px)',
        borderRadius: 10,
        padding: 4,
        border: '1px solid rgba(100, 160, 255, 0.2)',
        display: 'flex',
        gap: 4,
      }}
    >
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => setViewMode(opt.value)}
          style={{
            padding: '8px 14px',
            borderRadius: 7,
            border: 'none',
            cursor: 'pointer',
            fontSize: 13,
            fontWeight: 500,
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            transition: 'all 0.2s',
            background: viewMode === opt.value ? 'rgba(59, 130, 246, 0.35)' : 'transparent',
            color: viewMode === opt.value ? '#93c5fd' : '#64748b',
            boxShadow: viewMode === opt.value ? '0 0 0 1px rgba(59,130,246,0.4)' : 'none',
          }}
        >
          <span>{opt.emoji}</span>
          <span>{opt.label}</span>
        </button>
      ))}
    </div>
  )
}
