import { NextRequest, NextResponse } from 'next/server'
import * as pdfParse from 'pdf-parse'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('pdf') as File

    if (!file) {
      return NextResponse.json(
        { error: 'No se proporcionó ningún PDF' },
        { status: 400 }
      )
    }

    // Convertir File a Buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Parsear PDF
    // @ts-ignore - pdf-parse types issue
    const data = await pdfParse.default(buffer)
    const text = data.text

    // Extraer prompts
    const lines = text.split('\n').map((line: string) => line.trim()).filter((line: string) => line.length > 0)

    const imagePrompts: string[] = []
    const videoPrompts: string[] = []

    let currentSection: 'image' | 'video' | null = null
    let currentPrompt = ''

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]

      // Detectar secciones de imagen
      if (line.match(/^(Imagen|Image|Prompt\s+Imagen|Image\s+Prompt)\s*\d+/i)) {
        if (currentPrompt && currentSection === 'image') {
          imagePrompts.push(currentPrompt.trim())
        }
        currentSection = 'image'
        currentPrompt = ''
        continue
      }

      // Detectar secciones de video
      if (line.match(/^(Video|Prompt\s+Video|Video\s+Prompt)\s*\d+/i)) {
        if (currentPrompt && currentSection === 'image') {
          imagePrompts.push(currentPrompt.trim())
        }
        if (currentPrompt && currentSection === 'video') {
          videoPrompts.push(currentPrompt.trim())
        }
        currentSection = 'video'
        currentPrompt = ''
        continue
      }

      // Acumular líneas del prompt actual
      if (currentSection) {
        currentPrompt += (currentPrompt ? ' ' : '') + line
      }
    }

    // Añadir el último prompt
    if (currentPrompt && currentSection === 'image') {
      imagePrompts.push(currentPrompt.trim())
    }
    if (currentPrompt && currentSection === 'video') {
      videoPrompts.push(currentPrompt.trim())
    }

    // Validación
    const extractedImagePrompts = imagePrompts.slice(0, 16)
    const extractedVideoPrompts = videoPrompts.slice(0, 16)

    return NextResponse.json({
      success: true,
      imagePrompts: extractedImagePrompts,
      videoPrompts: extractedVideoPrompts,
      totalFound: {
        images: imagePrompts.length,
        videos: videoPrompts.length
      }
    })

  } catch (error: any) {
    console.error('Error extrayendo PDF:', error)
    return NextResponse.json(
      { error: 'Error al procesar el PDF', details: error.message },
      { status: 500 }
    )
  }
}
