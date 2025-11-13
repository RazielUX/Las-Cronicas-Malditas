import { NextRequest, NextResponse } from 'next/server'
import PDFParser from 'pdf2json'
import { writeFileSync, unlinkSync } from 'fs'
import { join } from 'path'
import { tmpdir } from 'os'

export async function POST(request: NextRequest) {
  let tempFilePath: string | null = null

  try {
    const formData = await request.formData()
    const file = formData.get('pdf') as File

    if (!file) {
      return NextResponse.json(
        { error: 'No se proporcionó ningún PDF' },
        { status: 400 }
      )
    }

    console.log('📄 Procesando PDF:', file.name, file.size, 'bytes')

    // Convertir File a Buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Guardar temporalmente el archivo
    tempFilePath = join(tmpdir(), `pdf-${Date.now()}.pdf`)
    writeFileSync(tempFilePath, buffer)

    console.log('✓ PDF guardado temporalmente, iniciando extracción...')

    // Parsear PDF con pdf2json
    const pdfParser = new (PDFParser as any)(null, 1)

    const text = await new Promise<string>((resolve, reject) => {
      pdfParser.on('pdfParser_dataError', (errData: any) => {
        reject(new Error(errData.parserError))
      })

      pdfParser.on('pdfParser_dataReady', () => {
        try {
          const rawText = (pdfParser as any).getRawTextContent()
          resolve(rawText)
        } catch (err) {
          reject(err)
        }
      })

      pdfParser.loadPDF(tempFilePath)
    })

    console.log(`✓ Texto extraído: ${text.length} caracteres`)

    // Limpiar archivo temporal
    if (tempFilePath) {
      unlinkSync(tempFilePath)
      tempFilePath = null
    }

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

    console.log(`✓ Prompts extraídos - Imágenes: ${extractedImagePrompts.length}, Videos: ${extractedVideoPrompts.length}`)

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
    console.error('❌ Error extrayendo PDF:', error)
    console.error('Stack:', error.stack)

    // Limpiar archivo temporal si existe
    if (tempFilePath) {
      try {
        unlinkSync(tempFilePath)
      } catch (cleanupError) {
        console.error('Error limpiando archivo temporal:', cleanupError)
      }
    }

    const errorMessage = error.message || 'Error desconocido al procesar el PDF'
    const errorDetails = {
      message: errorMessage,
      type: error.name || 'Error',
      stack: error.stack?.split('\n').slice(0, 3).join('\n') || ''
    }

    return NextResponse.json(
      {
        error: `Error al procesar el PDF: ${errorMessage}`,
        details: errorDetails
      },
      { status: 500 }
    )
  }
}
