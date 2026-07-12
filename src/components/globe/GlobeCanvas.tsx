import { useEffect, useRef, useCallback } from 'react'
import * as d3 from 'd3'
import { feature } from 'topojson-client'
import { useAtlasStore } from '../../store/atlasStore'
import { useGlobe } from '../../hooks/useGlobe'
import { usePaleoCoastlines, useHoloceneMap, useNaturalEarthBase } from '../../hooks/useGeoData'
import { useGeologicalEvents, useHoloceneEvents } from '../../hooks/useEvents'
import EventMarker from '../events/EventMarker'

interface Props {
  width: number
  height: number
}

export default function GlobeCanvas({ width, height }: Props) {
  const viewMode = useAtlasStore((s) => s.viewMode)
  const currentTime = useAtlasStore((s) => s.currentTime)
  const globeRotation = useAtlasStore((s) => s.globeRotation)
  const { canvasRef, getProjection, getPath } = useGlobe(width, height)
  const animFrameRef = useRef<number>(0)

  const { data: paleoData } = usePaleoCoastlines(viewMode === 'geologico' ? currentTime : 0)
  const { data: holoceneData } = useHoloceneMap(viewMode === 'holoceno' ? currentTime : 0)
  const { data: baseData } = useNaturalEarthBase()

  const geoEvents = useGeologicalEvents(viewMode === 'geologico' ? currentTime : -9999)
  const holoEvents = useHoloceneEvents(viewMode === 'holoceno' ? currentTime : -99999)
  const activeEvents = viewMode === 'geologico' ? geoEvents : holoEvents

  const draw = useCallback(() => {
    const canvas = canvasRef.current
    const projection = getProjection()
    const path = getPath()
    if (!canvas || !projection || !path) return

    const ctx = canvas.getContext('2d')!
    ctx.clearRect(0, 0, width, height)

    // Fundo do oceano
    ctx.beginPath()
    path({ type: 'Sphere' })
    ctx.fillStyle = '#0b2545'
    ctx.fill()

    // Graticule
    const graticule = d3.geoGraticule()()
    ctx.beginPath()
    path(graticule)
    ctx.strokeStyle = 'rgba(255,255,255,0.08)'
    ctx.lineWidth = 0.4
    ctx.stroke()

    const landColor = viewMode === 'geologico' ? '#5a7a3a' : '#5a7a4a'
    const borderColor = viewMode === 'geologico' ? '#3a5a28' : '#4a6a3a'

    const geoData = viewMode === 'geologico' ? paleoData : holoceneData

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const drawLand = (geojson: any) => {
      ctx.beginPath()
      path(geojson)
      ctx.fillStyle = landColor
      ctx.fill()
      ctx.strokeStyle = borderColor
      ctx.lineWidth = 0.4
      ctx.stroke()
    }

    if (geoData) {
      if (geoData.type === 'FeatureCollection') {
        drawLand(geoData)
      } else if (geoData.type === 'Topology' && geoData.objects) {
        const layerKey = Object.keys(geoData.objects)[0]
        drawLand(feature(geoData, geoData.objects[layerKey]))
      }
    } else if (baseData) {
      drawLand(feature(baseData, baseData.objects.land))
    }

    // Borda do globo
    ctx.beginPath()
    path({ type: 'Sphere' })
    ctx.strokeStyle = 'rgba(100, 160, 255, 0.3)'
    ctx.lineWidth = 1.5
    ctx.stroke()
  }, [width, height, viewMode, paleoData, holoceneData, baseData, getProjection, getPath, canvasRef])

  // Re-render quando dados ou rotação mudam
  useEffect(() => {
    cancelAnimationFrame(animFrameRef.current)
    animFrameRef.current = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(animFrameRef.current)
  }, [draw, globeRotation])

  // Projeta coordenadas geográficas para tela, retornando null se o ponto
  // estiver no hemisfério oculto (parte de trás do globo).
  const projectPoint = useCallback(
    (lon: number, lat: number): [number, number] | null => {
      const proj = getProjection()
      if (!proj) return null

      // A rotação [λ, φ, γ] gira o mundo; o centro visível é [−λ, −φ].
      const [rotLon, rotLat] = proj.rotate() as [number, number, number]
      const center: [number, number] = [-rotLon, -rotLat]

      // geoDistance retorna radianos; > π/2 significa hemisfério de trás.
      if (d3.geoDistance([lon, lat], center) > Math.PI / 2) return null

      const p = proj([lon, lat])
      return p ? [p[0], p[1]] : null
    },
    [getProjection, globeRotation]
  )

  return (
    <div className="relative" style={{ width, height }}>
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        style={{ cursor: 'grab' }}
      />
      {activeEvents.map((event) => {
        const screenPos = projectPoint(
          'lon' in event ? event.lon : 0,
          'lat' in event ? event.lat : 0
        )
        if (!screenPos) return null
        return (
          <EventMarker
            key={event.id}
            event={event}
            x={screenPos[0]}
            y={screenPos[1]}
          />
        )
      })}
    </div>
  )
}
