import { create } from 'zustand'

export interface Scene {
  id: number
  imagePrompt: string
  videoPrompt: string
  imageUrl: string | null
  videoUrl: string | null
  imageStatus: 'idle' | 'generating' | 'completed' | 'error'
  videoStatus: 'idle' | 'generating' | 'completed' | 'error'
  error: string | null
}

interface VideoStore {
  scenes: Scene[]
  pdfFile: File | null
  referenceImages: File[]
  mode: 'individual' | 'massive'

  // Actions
  setPdfFile: (file: File | null) => void
  setReferenceImages: (files: File[]) => void
  setMode: (mode: 'individual' | 'massive') => void
  initializeScenes: (prompts: { imagePrompts: string[], videoPrompts: string[] }) => void
  updateScene: (id: number, updates: Partial<Scene>) => void
  resetStore: () => void
}

const initialScenes: Scene[] = Array.from({ length: 16 }, (_, i) => ({
  id: i + 1,
  imagePrompt: '',
  videoPrompt: '',
  imageUrl: null,
  videoUrl: null,
  imageStatus: 'idle',
  videoStatus: 'idle',
  error: null,
}))

export const useVideoStore = create<VideoStore>((set) => ({
  scenes: initialScenes,
  pdfFile: null,
  referenceImages: [],
  mode: 'individual',

  setPdfFile: (file) => set({ pdfFile: file }),

  setReferenceImages: (files) => set({ referenceImages: files }),

  setMode: (mode) => set({ mode }),

  initializeScenes: (prompts) => set((state) => ({
    scenes: state.scenes.map((scene, index) => ({
      ...scene,
      imagePrompt: prompts.imagePrompts[index] || '',
      videoPrompt: prompts.videoPrompts[index] || '',
    }))
  })),

  updateScene: (id, updates) => set((state) => ({
    scenes: state.scenes.map(scene =>
      scene.id === id ? { ...scene, ...updates } : scene
    )
  })),

  resetStore: () => set({
    scenes: initialScenes,
    pdfFile: null,
    referenceImages: [],
    mode: 'individual',
  }),
}))
