import { create } from 'zustand'

export type ViewMode = 'geologico' | 'holoceno'

interface AtlasState {
  viewMode: ViewMode
  currentTime: number
  selectedEventId: string | null
  globeRotation: [number, number, number]
  isPlaying: boolean
  playSpeed: number

  setViewMode: (mode: ViewMode) => void
  setCurrentTime: (t: number) => void
  setSelectedEvent: (id: string | null) => void
  setGlobeRotation: (r: [number, number, number]) => void
  setIsPlaying: (v: boolean) => void
  setPlaySpeed: (v: number) => void
}

export const useAtlasStore = create<AtlasState>((set) => ({
  viewMode: 'geologico',
  currentTime: 66,        // começa no K-Pg (extinção dos dinossauros) como default interessante
  selectedEventId: null,
  globeRotation: [0, -20, 0],
  isPlaying: false,
  playSpeed: 10,          // Ma/s em modo geológico, anos×100/s em modo holoceno

  setViewMode: (mode) =>
    set({
      viewMode: mode,
      currentTime: mode === 'geologico' ? 66 : -3000,
      selectedEventId: null,
    }),
  setCurrentTime: (t) => set({ currentTime: t }),
  setSelectedEvent: (id) => set({ selectedEventId: id }),
  setGlobeRotation: (r) => set({ globeRotation: r }),
  setIsPlaying: (v) => set({ isPlaying: v }),
  setPlaySpeed: (v) => set({ playSpeed: v }),
}))
