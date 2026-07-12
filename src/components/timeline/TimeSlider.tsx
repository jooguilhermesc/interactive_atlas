import { useRef, useCallback } from 'react'
import { useAtlasStore } from '../../store/atlasStore'
import { GEOLOGICAL_EPOCHS, PALEO_SNAPSHOTS } from '../../data/geologicalEpochs'
import { formatGeologicalTime, formatHistoricalYear } from '../../lib/geoUtils'
import PlayButton from './PlayButton'

export default function TimeSlider() {
  const viewMode = useAtlasStore((s) => s.viewMode)
  const currentTime = useAtlasStore((s) => s.currentTime)
  const setCurrentTime = useAtlasStore((s) => s.setCurrentTime)
  const trackRef = useRef<HTMLDivElement>(null)

  const isGeo = viewMode === 'geologico'
  const min = isGeo ? 0 : -10000
  const max = isGeo ? 541 : 1994

  const pct = ((currentTime - min) / (max - min)) * 100

  const label = isGeo
    ? formatGeologicalTime(currentTime)
    : formatHistoricalYear(currentTime)

  const handleTrackClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!trackRef.current) return
      const rect = trackRef.current.getBoundingClientRect()
      const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
      const val = min + ratio * (max - min)

      if (isGeo) {
        const snapped = PALEO_SNAPSHOTS.reduce((p, c) =>
          Math.abs(c - val) < Math.abs(p - val) ? c : p
        )
        setCurrentTime(snapped)
      } else {
        setCurrentTime(Math.round(val))
      }
    },
    [min, max, isGeo, setCurrentTime]
  )

  // Current epoch label for geological view
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
        background: 'linear-gradient(transparent, rgba(5,13,26,0.95) 30%)',
        padding: '32px 24px 20px',
        userSelect: 'none',
      }}
    >
      {/* Epoch label (geological only) */}
      {isGeo && currentEpoch && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            marginBottom: 8,
            fontSize: 11,
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: 1.5,
            color: currentEpoch.cor,
          }}
        >
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: currentEpoch.cor, display: 'inline-block' }} />
          {currentEpoch.label} · {currentEpoch.periodo}
        </div>
      )}

      {/* Current time label */}
      <div
        style={{
          fontSize: 22,
          fontWeight: 700,
          color: '#f1f5f9',
          marginBottom: 12,
          letterSpacing: -0.5,
        }}
      >
        {label}
      </div>

      {/* Track + thumb */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <PlayButton />

        <div
          ref={trackRef}
          onClick={handleTrackClick}
          style={{
            flex: 1,
            height: 6,
            background: 'rgba(255,255,255,0.1)',
            borderRadius: 3,
            cursor: 'pointer',
            position: 'relative',
          }}
        >
          {/* Epoch color segments (geological only) */}
          {isGeo && GEOLOGICAL_EPOCHS.map((epoch, i) => {
            const nextMa = i < GEOLOGICAL_EPOCHS.length - 1 ? GEOLOGICAL_EPOCHS[i + 1].ma : 0
            const left = ((max - epoch.ma) / (max - min)) * 100
            const width = ((epoch.ma - nextMa) / (max - min)) * 100
            return (
              <div
                key={epoch.ma}
                style={{
                  position: 'absolute',
                  left: `${left}%`,
                  width: `${width}%`,
                  height: '100%',
                  background: epoch.cor + '44',
                  borderRadius: 3,
                }}
              />
            )
          })}

          {/* Filled portion */}
          <div
            style={{
              position: 'absolute',
              left: 0,
              width: `${pct}%`,
              height: '100%',
              background: 'linear-gradient(90deg, #3b82f6, #60a5fa)',
              borderRadius: 3,
              pointerEvents: 'none',
            }}
          />

          {/* Thumb */}
          <div
            style={{
              position: 'absolute',
              left: `${pct}%`,
              top: '50%',
              transform: 'translate(-50%, -50%)',
              width: 16,
              height: 16,
              borderRadius: '50%',
              background: '#60a5fa',
              border: '2px solid #1e3a5f',
              boxShadow: '0 0 8px rgba(96,165,250,0.6)',
              cursor: 'grab',
              pointerEvents: 'none',
            }}
          />
        </div>

        {/* Min/Max labels */}
        <div style={{ fontSize: 11, color: '#475569', whiteSpace: 'nowrap' }}>
          {isGeo ? '541 Ma' : '10.000 a.C.'}
        </div>
      </div>

      {/* Geological snapshots dots */}
      {isGeo && (
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, paddingLeft: 52 }}>
          {PALEO_SNAPSHOTS.map((snap) => (
            <button
              key={snap}
              onClick={() => setCurrentTime(snap)}
              style={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                border: 'none',
                cursor: 'pointer',
                padding: 0,
                background: currentTime === snap ? '#60a5fa' : 'rgba(255,255,255,0.2)',
                transition: 'background 0.15s',
              }}
              title={`${snap} Ma`}
            />
          ))}
        </div>
      )}
    </div>
  )
}
