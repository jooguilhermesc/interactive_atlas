import { useRef, useEffect, useCallback } from 'react'
import * as d3 from 'd3'
import { useAtlasStore } from '../store/atlasStore'

export function useGlobe(width: number, height: number) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const projectionRef = useRef<d3.GeoProjection | undefined>(undefined)
  const pathRef = useRef<d3.GeoPath<unknown, d3.GeoPermissibleObjects> | undefined>(undefined)
  const globeRotation = useAtlasStore((s) => s.globeRotation)
  const setGlobeRotation = useAtlasStore((s) => s.setGlobeRotation)

  // Draw callback set by GlobeCanvas so drag can redraw without going through React
  const drawCallbackRef = useRef<(() => void) | null>(null)

  useEffect(() => {
    if (!canvasRef.current || width === 0 || height === 0) return

    const scale = Math.min(width, height) * 0.44
    const projection = d3
      .geoOrthographic()
      .scale(scale)
      .translate([width / 2, height / 2])
      .rotate(globeRotation)
      .clipAngle(90)

    projectionRef.current = projection

    const context = canvasRef.current.getContext('2d')!
    pathRef.current = d3.geoPath(projection, context)

    let dragStart: [number, number] | null = null
    let rotationStart: [number, number, number] = [0, 0, 0]
    let dragRafId = 0

    const drag = d3
      .drag<HTMLCanvasElement, unknown>()
      .on('start', (event) => {
        dragStart = [event.x, event.y]
        rotationStart = [...(projectionRef.current!.rotate() as [number, number, number])]
      })
      .on('drag', (event) => {
        if (!dragStart) return
        const dx = event.x - dragStart[0]
        const dy = event.y - dragStart[1]
        const sensitivity = 0.65
        const newRotation: [number, number, number] = [
          rotationStart[0] + dx * sensitivity,
          Math.max(-80, Math.min(80, rotationStart[1] - dy * sensitivity)),
          rotationStart[2],
        ]
        projectionRef.current!.rotate(newRotation)
        // Draw directly via rAF — avoids React re-renders on every pixel of drag
        cancelAnimationFrame(dragRafId)
        dragRafId = requestAnimationFrame(() => drawCallbackRef.current?.())
      })
      .on('end', () => {
        cancelAnimationFrame(dragRafId)
        // Sync final rotation to Zustand so EventMarkers and play animation pick it up
        const rot = projectionRef.current!.rotate() as [number, number, number]
        setGlobeRotation(rot)
      })

    d3.select(canvasRef.current).call(drag)
  }, [width, height])

  // Keep projection in sync when rotation changes from outside (play animation, store init)
  useEffect(() => {
    if (projectionRef.current) {
      projectionRef.current.rotate(globeRotation)
    }
  }, [globeRotation])

  const getProjection = useCallback(() => projectionRef.current, [])
  const getPath = useCallback(() => pathRef.current, [])
  const setDrawCallback = useCallback((fn: () => void) => {
    drawCallbackRef.current = fn
  }, [])

  return { canvasRef, getProjection, getPath, setDrawCallback }
}
