import { useQuery } from '@tanstack/react-query'
import type { GeologicalEvent, HoloceneEvent } from '../types/events'

async function fetchJson(url: string) {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Falha ao carregar ${url}`)
  return res.json()
}

export function useGeologicalEvents(timeMa: number) {
  const { data: allEvents = [] } = useQuery<GeologicalEvent[]>({
    queryKey: ['geo-events'],
    queryFn: () => fetchJson('/data/events/geological_events.json'),
    staleTime: Infinity,
    gcTime: Infinity,
  })

  return allEvents.filter(
    (e) => timeMa >= e.timeRangeMa[1] && timeMa <= e.timeRangeMa[0]
  )
}

export function useHoloceneEvents(year: number) {
  const { data: allEvents = [] } = useQuery<HoloceneEvent[]>({
    queryKey: ['holo-events'],
    queryFn: () => fetchJson('/data/events/holocene_events.json'),
    staleTime: Infinity,
    gcTime: Infinity,
  })

  return allEvents.filter(
    (e) => year >= e.anoInicio && year <= e.anoFim
  )
}
