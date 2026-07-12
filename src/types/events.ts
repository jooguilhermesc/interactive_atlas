export interface GeologicalEvent {
  id: string
  tipo: 'extincao' | 'surgimento' | 'clima' | 'geologico' | 'evolutivo'
  titulo: string
  descricao: string
  timeMa: number
  timeRangeMa: [number, number]
  lat: number
  lon: number
  icone: string
  cor: string
  wikiUrl?: string
  imageUrl?: string
}

export interface HoloceneEvent {
  id: string
  tipo: 'civilizacao' | 'imperio' | 'migracao' | 'guerra' | 'descoberta' | 'colapso' | 'clima'
  titulo: string
  descricao: string
  anoInicio: number
  anoFim: number
  lat: number
  lon: number
  icone: string
  cor: string
  wikiUrl?: string
  imageUrl?: string
  rotaGeoJSON?: GeoJSON.LineString
}
