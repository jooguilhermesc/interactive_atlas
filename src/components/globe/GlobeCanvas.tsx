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

// Rotation speeds
const LERP_SPEED = 100   // max °/s when centering on an event
const IDLE_SPEED = 15    // °/s when no event is active (slow background spin)
const ZUSTAND_SYNC_MS = 120  // ms between Zustand globeRotation syncs

export default function GlobeCanvas({ width, height }: Props) {
  const viewMode = useAtlasStore((s) => s.viewMode)
  const currentTime = useAtlasStore((s) => s.currentTime)
  const globeRotation = useAtlasStore((s) => s.globeRotation)
  const isPlaying = useAtlasStore((s) => s.isPlaying)
  const setGlobeRotation = useAtlasStore((s) => s.setGlobeRotation)
  const { canvasRef, getProjection, getPath, setDrawCallback } = useGlobe(width, height)
  const animFrameRef = useRef<number>(0)
  const animRotRef = useRef<number>(0)

  const { data: paleoData } = usePaleoCoastlines(viewMode === 'geologico' ? currentTime : 0)
  const { data: holoceneData } = useHoloceneMap(viewMode === 'holoceno' ? currentTime : 0)
  const { data: baseData } = useNaturalEarthBase()

  const geoEvents = useGeologicalEvents(viewMode === 'geologico' ? currentTime : -9999)
  const holoEvents = useHoloceneEvents(viewMode === 'holoceno' ? currentTime : -99999)
  const activeEvents = viewMode === 'geologico' ? geoEvents : holoEvents

  // Refs so the rotation rAF always sees fresh values without stale closures
  const activeEventsRef = useRef(activeEvents)
  useEffect(() => { activeEventsRef.current = activeEvents }, [activeEvents])

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
    ctx.fillStyle = '#0d4f8a'
    ctx.fill()

    // Graticule
    const graticule = d3.geoGraticule()()
    ctx.beginPath()
    path(graticule)
    ctx.strokeStyle = 'rgba(255,255,255,0.14)'
    ctx.lineWidth = 0.4
    ctx.stroke()

    const landColor = viewMode === 'geologico' ? '#c9a870' : '#5da83a'
    const borderColor = viewMode === 'geologico' ? '#9a7a40' : '#3d7a22'

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
    ctx.strokeStyle = 'rgba(100, 160, 255, 0.4)'
    ctx.lineWidth = 1.5
    ctx.stroke()

    // Atmosphere glow — radial gradient for 3D depth
    const cx = width / 2
    const cy = height / 2
    const r = Math.min(width, height) * 0.44
    const glow = ctx.createRadialGradient(cx - r * 0.25, cy - r * 0.25, r * 0.1, cx, cy, r)
    glow.addColorStop(0, 'rgba(255,255,255,0.08)')
    glow.addColorStop(0.6, 'rgba(255,255,255,0.0)')
    glow.addColorStop(1, 'rgba(30,100,220,0.18)')
    ctx.beginPath()
    path({ type: 'Sphere' })
    ctx.fillStyle = glow
    ctx.fill()
  }, [width, height, viewMode, paleoData, holoceneData, baseData, getProjection, getPath, canvasRef])

  const drawRef = useRef(draw)
  useEffect(() => { drawRef.current = draw }, [draw])
  useEffect(() => { setDrawCallback(draw) }, [draw, setDrawCallback])

  // Redraws triggered by data/rotation changes (when not playing the rotation rAF handles it)
  useEffect(() => {
    if (isPlaying) return  // rotation rAF owns redraws during play
    cancelAnimationFrame(animFrameRef.current)
    animFrameRef.current = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(animFrameRef.current)
  }, [draw, globeRotation, isPlaying])

  // Globe rotation animation during play — updates D3 projection directly,
  // avoids going through Zustand at 60fps (which caused cascade / green map).
  useEffect(() => {
    if (!isPlaying) {
      cancelAnimationFrame(animRotRef.current)
      // Sync final projection rotation back to Zustand so drag picks it up correctly
      const proj = getProjection()
      if (proj) setGlobeRotation(proj.rotate() as [number, number, number])
      return
    }

    let lastTs = 0
    let lastSync = 0

    const animate = (ts: number) => {
      if (!lastTs) lastTs = ts
      const dt = Math.min((ts - lastTs) / 1000, 0.05)  // cap to avoid jumps after tab switch
      lastTs = ts

      const proj = getProjection()
      if (!proj) { animRotRef.current = requestAnimationFrame(animate); return }

      const [curλ, curφ, curγ] = proj.rotate() as [number, number, number]
      let newλ = curλ
      let newφ = curφ

      const events = activeEventsRef.current
      if (events.length > 0) {
        // Smoothly rotate to center on the first active event
        const evt = events[0] as { lon?: number; lat?: number }
        const evtLon = evt.lon ?? 0
        const evtLat = evt.lat ?? 0
        const tλ = -evtLon
        const tφ = -evtLat

        // Normalize longitude delta to [-180, 180] to take the short arc
        let dλ = ((tλ - curλ) % 360 + 540) % 360 - 180
        const dφ = tφ - curφ
        const step = LERP_SPEED * dt
        newλ = curλ + Math.sign(dλ) * Math.min(Math.abs(dλ), step)
        newφ = curφ + Math.sign(dφ) * Math.min(Math.abs(dφ), step)
      } else {
        // No active event — gentle idle spin
        newλ = curλ + IDLE_SPEED * dt
      }

      // Clamp latitude to avoid flipping
      newφ = Math.max(-80, Math.min(80, newφ))

      proj.rotate([newλ, newφ, curγ])
      drawRef.current()

      // Throttle Zustand sync (keeps EventMarker positions up to date without cascade)
      if (ts - lastSync > ZUSTAND_SYNC_MS) {
        setGlobeRotation(proj.rotate() as [number, number, number])
        lastSync = ts
      }

      animRotRef.current = requestAnimationFrame(animate)
    }

    animRotRef.current = requestAnimationFrame(animate)
    return () => {
      cancelAnimationFrame(animRotRef.current)
      const proj = getProjection()
      if (proj) setGlobeRotation(proj.rotate() as [number, number, number])
    }
  }, [isPlaying, getProjection, setGlobeRotation])

  const projectPoint = useCallback(
    (lon: number, lat: number): [number, number] | null => {
      const proj = getProjection()
      if (!proj) return null
      const [rotLon, rotLat] = proj.rotate() as [number, number, number]
      const center: [number, number] = [-rotLon, -rotLat]
      if (d3.geoDistance([lon, lat], center) > Math.PI / 2) return null
      const p = proj([lon, lat])
      return p ? [p[0], p[1]] : null
    },
    [getProjection, globeRotation]
  )

  return (
    <div className="relative" style={{ width, height }}>
      <canvas ref={canvasRef} width={width} height={height} style={{ cursor: 'grab' }} />
      {activeEvents.map((event) => {
        const screenPos = projectPoint(
          'lon' in event ? event.lon : 0,
          'lat' in event ? event.lat : 0
        )
        if (!screenPos) return null
        return (
          <EventMarker key={event.id} event={event} x={screenPos[0]} y={screenPos[1]} />
        )
      })}
    </div>
  )
}
