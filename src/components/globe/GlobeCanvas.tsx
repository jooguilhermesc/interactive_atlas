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
    ctx.fillStyle = '#0d1f3c'
    ctx.fill()

    // Graticule
    const graticule = d3.geoGraticule()()
    ctx.beginPath()
    path(graticule)
    ctx.strokeStyle = 'rgba(255,255,255,0.07)'
    ctx.lineWidth = 0.5
    ctx.stroke()

    // Camada de terra
    const landColor = viewMode === 'geologico' ? '#3d5a3e' : '#5a7a4a'
    const borderColor = viewMode === 'geologico' ? '#2a4a2b' : '#4a6a3a'

    const geoData = viewMode === 'geologico' ? paleoData : holoceneData

    if (geoData) {
      // Se for GeoJSON direto (paleogeográfico)
      if (geoData.type === 'FeatureCollection') {
        ctx.beginPath()
        path(geoData)
        ctx.fillStyle = landColor
        ctx.fill()
        ctx.strokeStyle = borderColor
        ctx.lineWidth = 0.5
        ctx.stroke()
      }
      // Se for TopoJSON (holocene basemaps)
      else if (geoData.type === 'Topology' && geoData.objects) {
        const layerKey = Object.keys(geoData.objects)[0]
        const geojson = feature(geoData, geoData.objects[layerKey])
        ctx.beginPath()
        path(geojson)
        ctx.fillStyle = landColor
        ctx.fill()
        ctx.strokeStyle = borderColor
        ctx.lineWidth = 0.5
        ctx.stroke()
      }
    } else if (baseData) {
      // Fallback: Natural Earth base (TopoJSON)
      const landFeature = feature(baseData, baseData.objects.land)
      ctx.beginPath()
      path(landFeature)
      ctx.fillStyle = landColor
      ctx.fill()
      ctx.strokeStyle = borderColor
      ctx.lineWidth = 0.5
      ctx.stroke()
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

  // Projeta coordenadas geográficas para tela
  const projectPoint = useCallback(
    (lon: number, lat: number): [number, number] | null => {
      const proj = getProjection()
      if (!proj) return null
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
