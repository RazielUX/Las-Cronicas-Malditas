'use client'

import { useVideoStore } from '@/store/videoStore'
import { Zap, Loader2 } from 'lucide-react'
import { useState } from 'react'

export default function MassiveMode() {
  const { scenes, updateScene } = useVideoStore()
  const [generating, setGenerating] = useState(false)
  const [currentScene, setCurrentScene] = useState(0)
  const [progress, setProgress] = useState({ images: 0, videos: 0 })

  const generateAll = async () => {
    setGenerating(true)
    setProgress({ images: 0, videos: 0 })

    // Filtrar solo escenas con prompts
    const validScenes = scenes.filter(s => s.imagePrompt && s.videoPrompt)

    // Array para mantener coherencia visual (últimas 2 imágenes)
    const previousImageUrls: string[] = []
    const MAX_REFERENCE_IMAGES = 2

    // FASE 1: Generar todas las imágenes
    console.log('🚀 Iniciando generación masiva de imágenes con coherencia visual...')
    for (let i = 0; i < validScenes.length; i++) {
      const scene = validScenes[i]
      setCurrentScene(i + 1)

      updateScene(scene.id, { imageStatus: 'generating', error: null })

      try {
        const response = await fetch('/api/generate-image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt: scene.imagePrompt,
            sceneId: scene.id,
            previousImageUrls: previousImageUrls.slice(-MAX_REFERENCE_IMAGES) // Últimas 2 imágenes
          })
        })

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || 'Error al generar imagen')
        }

        updateScene(scene.id, {
          imageUrl: data.imageUrl,
          imageStatus: 'completed'
        })

        // Añadir esta imagen al historial para coherencia visual
        if (data.imageUrl) {
          previousImageUrls.push(data.imageUrl)
        }

        setProgress(p => ({ ...p, images: p.images + 1 }))

        // Pausa para evitar rate limits
        await new Promise(resolve => setTimeout(resolve, 3000))

      } catch (error: any) {
        updateScene(scene.id, {
          imageStatus: 'error',
          error: error.message
        })
      }
    }

    // FASE 2: Generar todos los videos
    console.log('🎬 Iniciando generación masiva de videos...')
    for (let i = 0; i < validScenes.length; i++) {
      const scene = scenes.find(s => s.id === validScenes[i].id)!

      if (!scene.imageUrl) {
        console.log(`⏭️ Saltando video ${scene.id} (sin imagen)`)
        continue
      }

      setCurrentScene(i + 1)
      updateScene(scene.id, { videoStatus: 'generating', error: null })

      try {
        const response = await fetch('/api/generate-video', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            imageUrl: scene.imageUrl,
            videoPrompt: scene.videoPrompt,
            sceneId: scene.id
          })
        })

        const data = await response.json()

        if (!response.ok) {
          if (data.placeholder) {
            updateScene(scene.id, {
              videoStatus: 'error',
              error: 'Sora aún no disponible'
            })
            setProgress(p => ({ ...p, videos: p.videos + 1 }))
            continue
          }
          throw new Error(data.error || 'Error al generar video')
        }

        updateScene(scene.id, {
          videoUrl: data.videoUrl,
          videoStatus: 'completed'
        })

        setProgress(p => ({ ...p, videos: p.videos + 1 }))

        // Pausa para evitar rate limits
        await new Promise(resolve => setTimeout(resolve, 5000))

      } catch (error: any) {
        updateScene(scene.id, {
          videoStatus: 'error',
          error: error.message
        })
      }
    }

    setGenerating(false)
    setCurrentScene(0)
    console.log('✅ Generación masiva completada')
  }

  const hasValidScenes = scenes.some(s => s.imagePrompt && s.videoPrompt)

  return (
    <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg shadow-lg p-6 text-white">
      <div className="flex items-center gap-3 mb-4">
        <Zap className="w-8 h-8" />
        <div>
          <h2 className="text-2xl font-bold">Modo Masivo</h2>
          <p className="text-sm text-purple-100">Genera todas las escenas automáticamente</p>
        </div>
      </div>

      {generating && (
        <div className="mb-4 space-y-2">
          <div className="flex items-center gap-2">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Procesando escena {currentScene}/16...</span>
          </div>
          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <span>Imágenes: {progress.images}/16</span>
              <span>{Math.round((progress.images / 16) * 100)}%</span>
            </div>
            <div className="w-full bg-purple-800 rounded-full h-2">
              <div
                className="bg-white h-2 rounded-full transition-all"
                style={{ width: `${(progress.images / 16) * 100}%` }}
              />
            </div>
          </div>
          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <span>Videos: {progress.videos}/16</span>
              <span>{Math.round((progress.videos / 16) * 100)}%</span>
            </div>
            <div className="w-full bg-purple-800 rounded-full h-2">
              <div
                className="bg-white h-2 rounded-full transition-all"
                style={{ width: `${(progress.videos / 16) * 100}%` }}
              />
            </div>
          </div>
        </div>
      )}

      <button
        onClick={generateAll}
        disabled={!hasValidScenes || generating}
        className="w-full bg-white text-purple-600 font-bold py-3 px-6 rounded-lg hover:bg-purple-50 disabled:bg-gray-300 disabled:text-gray-500 transition-colors flex items-center justify-center gap-2"
      >
        {generating ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Generando... ({progress.images + progress.videos}/32)
          </>
        ) : (
          <>
            <Zap className="w-5 h-5" />
            Generar Todo Automáticamente
          </>
        )}
      </button>

      {!hasValidScenes && (
        <p className="text-sm text-purple-200 mt-2 text-center">
          ⚠️ Primero sube un PDF con los prompts
        </p>
      )}

      <div className="mt-4 text-sm text-purple-100 space-y-1">
        <p>⏱️ Tiempo estimado: ~1-2 horas</p>
        <p>💰 Costo aproximado: ~$6.40 USD</p>
      </div>
    </div>
  )
}
