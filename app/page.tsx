'use client'

import FileUploader from '@/components/FileUploader'
import MassiveMode from '@/components/MassiveMode'
import SceneCard from '@/components/SceneCard'
import { useVideoStore } from '@/store/videoStore'

export default function Home() {
  const { scenes } = useVideoStore()

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            🎬 Generador de Videos IA
          </h1>
          <p className="text-gray-600">
            Transforma tu PDF en 16 videos verticales con DALL-E 3 + Sora
          </p>
          <div className="mt-2 flex items-center justify-center gap-4 text-sm text-gray-500">
            <span>📱 Formato: 9:16 (vertical)</span>
            <span>⏱️ Duración: 8 segundos</span>
            <span>🎨 HD Quality</span>
          </div>
        </div>

        {/* Subida de archivos */}
        <div className="mb-8">
          <FileUploader />
        </div>

        {/* Modo Masivo */}
        <div className="mb-8">
          <MassiveMode />
        </div>

        {/* Grid de escenas */}
        <div className="mb-4">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            📹 Control Individual de Escenas
          </h2>
          <p className="text-gray-600 mb-6">
            Genera y descarga cada escena de forma individual. Puedes rehacer las imágenes que no te gusten.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {scenes.map((scene) => (
            <SceneCard key={scene.id} scene={scene} />
          ))}
        </div>

        {/* Footer Info */}
        <div className="mt-12 bg-blue-50 rounded-lg p-6">
          <h3 className="font-bold text-gray-900 mb-2">ℹ️ Cómo usar:</h3>
          <ol className="list-decimal list-inside space-y-2 text-gray-700 text-sm">
            <li>Sube tu PDF con el formato: "Imagen 1", "Video 1", "Imagen 2", "Video 2"...</li>
            <li>(Opcional) Sube hasta 4 imágenes de referencia para mantener consistencia visual</li>
            <li><strong>Modo Masivo:</strong> Click en "Generar Todo" para procesar las 16 escenas automáticamente</li>
            <li><strong>Modo Individual:</strong> Genera cada imagen una por una, rehacer si no te gusta, y luego genera el video</li>
            <li>Descarga tus imágenes y videos directamente desde cada tarjeta</li>
          </ol>

          <div className="mt-4 pt-4 border-t border-blue-200">
            <h4 className="font-semibold text-gray-900 mb-2">💰 Costos estimados:</h4>
            <div className="grid grid-cols-2 gap-4 text-sm text-gray-700">
              <div>
                <strong>16 Imágenes (DALL-E 3):</strong> ~$1.28 USD
              </div>
              <div>
                <strong>16 Videos (Sora 8seg):</strong> ~$5.12 USD
              </div>
              <div className="col-span-2 text-lg font-bold text-purple-600">
                Total: ~$6.40 USD por proyecto completo
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-gray-500 text-sm">
          <p>Powered by OpenAI • DALL-E 3 + Sora • Next.js 14</p>
          <p className="mt-2">Las Crónicas Malditas © 2024</p>
        </div>
      </div>
    </div>
  )
}
