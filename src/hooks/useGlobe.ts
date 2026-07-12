import { useRef, useEffect, useCallback } from 'react'
import * as d3 from 'd3'
import { useAtlasStore } from '../store/atlasStore'

export function useGlobe(width: number, height: number) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const projectionRef = useRef<d3.GeoProjection | undefined>(undefined)
  const pathRef = useRef<d3.GeoPath<unknown, d3.GeoPermissibleObjects> | undefined>(undefined)
  const globeRotation = useAtlasStore((s) => s.globeRotation)
  const setGlobeRotation = useAtlasStore((s) => s.setGlobeRotation)

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

    // Drag to rotate
    let dragStart: [number, number] | null = null
    let rotationStart: [number, number, number] = [0, 0, 0]

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
        const sensitivity = 0.3
        const newRotation: [number, number, number] = [
          rotationStart[0] + dx * sensitivity,
          Math.max(-90, Math.min(90, rotationStart[1] - dy * sensitivity)),
          rotationStart[2],
        ]
        projectionRef.current!.rotate(newRotation)
        setGlobeRotation(newRotation)
      })

    d3.select(canvasRef.current).call(drag)
  }, [width, height])

  // Update projection rotation when store changes externally
  useEffect(() => {
    if (projectionRef.current) {
      projectionRef.current.rotate(globeRotation)
    }
  }, [globeRotation])

  const getProjection = useCallback(() => projectionRef.current, [])
  const getPath = useCallback(() => pathRef.current, [])

  return { canvasRef, getProjection, getPath }
}
