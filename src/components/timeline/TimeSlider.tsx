import { useAtlasStore } from '../../store/atlasStore'
import { GEOLOGICAL_EPOCHS, PALEO_SNAPSHOTS } from '../../data/geologicalEpochs'
import { formatGeologicalTime, formatHistoricalYear } from '../../lib/geoUtils'
import PlayButton from './PlayButton'

export default function TimeSlider() {
  const viewMode = useAtlasStore((s) => s.viewMode)
  const currentTime = useAtlasStore((s) => s.currentTime)
  const setCurrentTime = useAtlasStore((s) => s.setCurrentTime)

  const isGeo = viewMode === 'geologico'
  const min = isGeo ? 0 : -10000
  const max = isGeo ? 541 : 1994

  // For geological: slider is inverted — left=541 Ma (oldest), right=0 Ma (present).
  // We map: sliderValue = max - currentTime, so dragging right → currentTime decreases.
  const sliderValue = isGeo ? (max - currentTime) : currentTime

  // Fill % goes left→right as we move toward the present in both modes.
  const pct = isGeo
    ? Math.max(0, Math.min(100, ((max - currentTime) / (max - min)) * 100))
    : Math.max(0, Math.min(100, ((currentTime - min) / (max - min)) * 100))

  const label = isGeo
    ? formatGeologicalTime(currentTime)
    : formatHistoricalYear(currentTime)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value)
    setCurrentTime(isGeo ? (max - val) : Math.round(val))
  }

  const currentEpoch = isGeo
    ? GEOLOGICAL_EPOCHS.find(
        (e, i) =>
          currentTime <= e.ma &&
          (i === GEOLOGICAL_EPOCHS.length - 1 || currentTime > GEOLOGICAL_EPOCHS[i + 1].ma)
      )
    : null

  return (
    <div
      style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 40,
        background: 'linear-gradient(transparent, rgba(5,13,26,0.97) 30%)',
        padding: '32px 24px 20px',
        userSelect: 'none',
      }}
    >
      {/* Epoch label */}
      {isGeo && currentEpoch && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8,
          fontSize: 11, fontWeight: 600, textTransform: 'uppercase',
          letterSpacing: 1.5, color: currentEpoch.cor,
        }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: currentEpoch.cor, display: 'inline-block' }} />
          {currentEpoch.label} · {currentEpoch.periodo}
        </div>
      )}

      {/* Time label */}
      <div style={{ fontSize: 22, fontWeight: 700, color: '#f1f5f9', marginBottom: 16, letterSpacing: -0.5 }}>
        {label}
      </div>

      {/* Controls row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <PlayButton />

        {/* Track area */}
        <div style={{ flex: 1, position: 'relative', height: 36, display: 'flex', alignItems: 'center' }}>

          {/* Decorative background track */}
          <div style={{
            position: 'absolute', left: 0, right: 0,
            height: 6, borderRadius: 3,
            background: 'rgba(255,255,255,0.08)',
            pointerEvents: 'none',
          }}>
            {/* Epoch color segments — for geo, oldest (541) is on the LEFT */}
            {isGeo && GEOLOGICAL_EPOCHS.map((epoch, i) => {
              const nextMa = i < GEOLOGICAL_EPOCHS.length - 1 ? GEOLOGICAL_EPOCHS[i + 1].ma : 0
              // Inverted: segment starts at (max - epoch.ma) / max * 100 from the left
              const segLeft = ((max - epoch.ma) / (max - min)) * 100
              const segWidth = ((epoch.ma - nextMa) / (max - min)) * 100
              return (
                <div key={epoch.ma} style={{
                  position: 'absolute',
                  left: `${segLeft}%`,
                  width: `${segWidth}%`,
                  height: '100%',
                  background: epoch.cor + '55',
                  borderRadius: 3,
                }} />
              )
            })}

            {/* Progress fill from left */}
            <div style={{
              position: 'absolute', left: 0, width: `${pct}%`,
              height: '100%',
              background: 'linear-gradient(90deg, #1d4ed8, #60a5fa)',
              borderRadius: 3,
            }} />
          </div>

          {/* Native range input */}
          <input
            type="range"
            min={0}
            max={max - min}
            step={isGeo ? 1 : 10}
            value={sliderValue - (isGeo ? 0 : min)}
            onChange={handleChange}
            style={{
              position: 'absolute',
              left: 0, right: 0,
              width: '100%',
              margin: 0,
              appearance: 'none',
              WebkitAppearance: 'none',
              background: 'transparent',
              cursor: 'pointer',
              height: 36,
              touchAction: 'none',
            }}
            className="atlas-range"
          />
        </div>

        <div style={{ fontSize: 11, color: '#475569', whiteSpace: 'nowrap', minWidth: 60, textAlign: 'right' }}>
          {isGeo ? '541 Ma → Presente' : '10.000 a.C. → 1994'}
        </div>
      </div>

      {/* Snapshot dots — ordered oldest→newest (left→right) for geo */}
      {isGeo && (
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, paddingLeft: 48, paddingRight: 70 }}>
          {[...PALEO_SNAPSHOTS].reverse().map((snap) => {
            const isActive = Math.abs(currentTime - snap) < 5
            return (
              <button
                key={snap}
                onClick={() => setCurrentTime(snap)}
                title={`${snap} Ma`}
                style={{
                  width: isActive ? 8 : 5,
                  height: isActive ? 8 : 5,
                  borderRadius: '50%',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 0,
                  background: isActive ? '#60a5fa' : 'rgba(255,255,255,0.18)',
                  transition: 'all 0.15s',
                  flexShrink: 0,
                }}
              />
            )
          })}
        </div>
      )}
    </div>
  )
}
