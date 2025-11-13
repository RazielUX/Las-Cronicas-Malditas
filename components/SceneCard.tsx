'use client'

import { Scene, useVideoStore } from '@/store/videoStore'
import { Download, RefreshCw, Play, Loader2 } from 'lucide-react'
import { useState } from 'react'

interface SceneCardProps {
  scene: Scene
}

export default function SceneCard({ scene }: SceneCardProps) {
  const { updateScene } = useVideoStore()
  const [generating, setGenerating] = useState(false)

  const generateImage = async () => {
    if (!scene.imagePrompt) return

    setGenerating(true)
    updateScene(scene.id, { imageStatus: 'generating', error: null })

    try {
      const response = await fetch('/api/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: scene.imagePrompt,
          sceneId: scene.id
        })
      })

      const data = await response.json()

      if (!response.ok) {
        const errorMsg = data.details || data.error || 'Error al generar imagen'
        console.error('Error de la API:', data)
        throw new Error(errorMsg)
      }

      // Mostrar warning si se usó versión sanitizada
      if (data.usedSanitized) {
        console.warn(`⚠️ Escena ${scene.id}: ${data.warning}`)
      }

      updateScene(scene.id, {
        imageUrl: data.imageUrl,
        imageStatus: 'completed',
        ...(data.usedSanitized ? {
          error: '⚠️ ' + data.warning
        } : {})
      })

      console.log(`✅ Imagen generada para escena ${scene.id}`)

    } catch (error: any) {
      console.error(`❌ Error en escena ${scene.id}:`, error.message)
      updateScene(scene.id, {
        imageStatus: 'error',
        error: error.message
      })
    } finally {
      setGenerating(false)
    }
  }

  const generateVideo = async () => {
    if (!scene.imageUrl || !scene.videoPrompt) return

    setGenerating(true)
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
        // Si Sora no está disponible
        if (data.placeholder) {
          updateScene(scene.id, {
            videoStatus: 'error',
            error: 'Sora aún no disponible. Se usará la imagen como placeholder.'
          })
          return
        }
        throw new Error(data.error || 'Error al generar video')
      }

      updateScene(scene.id, {
        videoUrl: data.videoUrl,
        videoStatus: 'completed'
      })

    } catch (error: any) {
      updateScene(scene.id, {
        videoStatus: 'error',
        error: error.message
      })
    } finally {
      setGenerating(false)
    }
  }

  const downloadFile = (url: string, filename: string) => {
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-4 space-y-4 border-2 border-gray-200">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-gray-900">Escena {scene.id}</h3>
        {scene.error && (
          <span className="text-xs text-red-600">⚠️</span>
        )}
      </div>

      {/* Debug info - Mostrar prompts */}
      {scene.imagePrompt && (
        <div className="text-xs text-gray-600 bg-gray-50 p-2 rounded">
          <strong>📝 Prompt Imagen:</strong> {scene.imagePrompt.slice(0, 100)}...
        </div>
      )}
      {!scene.imagePrompt && (
        <div className="text-xs text-yellow-600 bg-yellow-50 p-2 rounded">
          ⚠️ Sin prompt de imagen
        </div>
      )}

      {/* Preview de Imagen */}
      <div className="relative aspect-[9/16] bg-gray-100 rounded-lg overflow-hidden">
        {scene.imageUrl ? (
          <img
            src={scene.imageUrl}
            alt={`Escena ${scene.id}`}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400">
            <span className="text-sm">Sin imagen</span>
          </div>
        )}
        {scene.imageStatus === 'generating' && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-white animate-spin" />
          </div>
        )}
      </div>

      {/* Controles de Imagen */}
      <div className="space-y-2">
        <button
          onClick={generateImage}
          disabled={generating || !scene.imagePrompt || scene.imageStatus === 'generating'}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          {scene.imageStatus === 'generating' ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Generando Imagen...
            </>
          ) : scene.imageUrl ? (
            <>
              <RefreshCw className="w-4 h-4" />
              Rehacer Imagen
            </>
          ) : (
            'Generar Imagen'
          )}
        </button>

        {scene.imageUrl && (
          <button
            onClick={() => downloadFile(scene.imageUrl!, `scene_${scene.id}_image.png`)}
            className="w-full bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <Download className="w-4 h-4" />
            Descargar Imagen
          </button>
        )}
      </div>

      {/* Controles de Video */}
      {scene.imageUrl && (
        <div className="space-y-2 pt-2 border-t border-gray-200">
          <button
            onClick={generateVideo}
            disabled={generating || !scene.videoPrompt || scene.videoStatus === 'generating'}
            className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            {scene.videoStatus === 'generating' ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Generando Video...
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                Generar Video (8 seg)
              </>
            )}
          </button>

          {scene.videoUrl && (
            <button
              onClick={() => downloadFile(scene.videoUrl!, `scene_${scene.id}_video.mp4`)}
              className="w-full bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" />
              Descargar Video
            </button>
          )}
        </div>
      )}

      {/* Mensaje de error */}
      {scene.error && (
        <div className="text-xs text-red-600 bg-red-50 p-2 rounded">
          {scene.error}
        </div>
      )}
    </div>
  )
}
