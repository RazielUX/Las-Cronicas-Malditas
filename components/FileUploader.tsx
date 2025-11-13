'use client'

import { useVideoStore } from '@/store/videoStore'
import { Upload, FileText, Image } from 'lucide-react'
import { useState } from 'react'

export default function FileUploader() {
  const { setPdfFile, setReferenceImages, initializeScenes } = useVideoStore()
  const [extracting, setExtracting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setPdfFile(file)
    setExtracting(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append('pdf', file)

      const response = await fetch('/api/extract-pdf', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const text = await response.text()
        let errorMessage = 'Error al extraer PDF'
        try {
          const errorData = JSON.parse(text)
          errorMessage = errorData.error || errorMessage

          // Si hay detalles adicionales, mostrarlos
          if (errorData.details) {
            if (typeof errorData.details === 'object') {
              errorMessage += ` (${errorData.details.message || JSON.stringify(errorData.details)})`
            } else {
              errorMessage += ` (${errorData.details})`
            }
          }

          console.error('Error del servidor:', errorData)
        } catch {
          errorMessage = text.slice(0, 300) // Mostrar primeros 300 chars del error
          console.error('Error no-JSON:', text)
        }
        throw new Error(errorMessage)
      }

      const data = await response.json()

      initializeScenes({
        imagePrompts: data.imagePrompts,
        videoPrompts: data.videoPrompts
      })

      console.log('✅ PDF procesado:', data)

    } catch (err: any) {
      setError(err.message)
      console.error('Error:', err)
    } finally {
      setExtracting(false)
    }
  }

  const handleReferenceImagesUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []).slice(0, 4)
    setReferenceImages(files)
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">📤 Subir Archivos</h2>

      {/* Subida de PDF */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          PDF con Prompts (16 imágenes + 16 videos)
        </label>
        <div className="flex items-center justify-center w-full">
          <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <FileText className="w-10 h-10 mb-3 text-gray-400" />
              <p className="mb-2 text-sm text-gray-500">
                <span className="font-semibold">Click para subir PDF</span>
              </p>
              <p className="text-xs text-gray-500">Formato: Imagen 1, Video 1, Imagen 2...</p>
            </div>
            <input
              type="file"
              className="hidden"
              accept=".pdf"
              onChange={handlePdfUpload}
              disabled={extracting}
            />
          </label>
        </div>
        {extracting && (
          <p className="text-sm text-blue-600">⏳ Extrayendo prompts del PDF...</p>
        )}
        {error && (
          <p className="text-sm text-red-600">❌ {error}</p>
        )}
      </div>

      {/* Subida de imágenes de referencia */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Imágenes de Referencia (opcional, hasta 4)
        </label>
        <div className="flex items-center justify-center w-full">
          <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <Image className="w-10 h-10 mb-3 text-gray-400" />
              <p className="mb-2 text-sm text-gray-500">
                <span className="font-semibold">Click para subir imágenes</span>
              </p>
              <p className="text-xs text-gray-500">JPG, PNG, WEBP (max 4)</p>
            </div>
            <input
              type="file"
              className="hidden"
              accept="image/*"
              multiple
              onChange={handleReferenceImagesUpload}
            />
          </label>
        </div>
      </div>
    </div>
  )
}
