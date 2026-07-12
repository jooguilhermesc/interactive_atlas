import { PALEO_SNAPSHOTS } from '../data/geologicalEpochs'
import { HOLOCENE_SNAPSHOTS } from '../data/holoceneSnapshots'

export function findNearestPaleoSnapshot(timeMa: number): number {
  return PALEO_SNAPSHOTS.reduce((prev, curr) =>
    Math.abs(curr - timeMa) < Math.abs(prev - timeMa) ? curr : prev
  )
}

export function findNearestHoloceneSnapshot(year: number): string {
  const snap = HOLOCENE_SNAPSHOTS.reduce((prev, curr) =>
    Math.abs(curr.year - year) < Math.abs(prev.year - year) ? curr : prev
  )
  return snap.filename
}

export function formatGeologicalTime(ma: number): string {
  if (ma === 0) return 'Presente'
  if (ma < 1) return `${(ma * 1000).toFixed(0)} mil anos atrás`
  if (ma >= 1000) return `${(ma / 1000).toFixed(1)} bilhões de anos atrás`
  return `${ma} milhões de anos atrás`
}

export function formatHistoricalYear(year: number): string {
  if (year < 0) return `${Math.abs(year)} a.C.`
  if (year === 0) return '1 d.C.'
  return `${year} d.C.`
}
