import { useQuery } from '@tanstack/react-query'
import { findNearestPaleoSnapshot, findNearestHoloceneSnapshot } from '../lib/geoUtils'

async function fetchJson(url: string) {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Falha ao carregar ${url}: ${res.status}`)
  return res.json()
}

export function usePaleoCoastlines(timeMa: number) {
  const snapped = findNearestPaleoSnapshot(timeMa)
  return useQuery({
    queryKey: ['paleo-coastlines', snapped],
    queryFn: () => fetchJson(`/data/paleo/coastlines_${snapped}Ma.geojson`),
    staleTime: Infinity,
    gcTime: Infinity,
  })
}

export function useHoloceneMap(year: number) {
  const filename = findNearestHoloceneSnapshot(year)
  return useQuery({
    queryKey: ['holocene-map', filename],
    queryFn: () => fetchJson(`/data/holocene/${filename}.geojson`),
    staleTime: Infinity,
    gcTime: Infinity,
  })
}

export function useNaturalEarthBase() {
  return useQuery({
    queryKey: ['ne-base'],
    queryFn: () => fetchJson('/data/ne_110m_land.json'),
    staleTime: Infinity,
    gcTime: Infinity,
  })
}
