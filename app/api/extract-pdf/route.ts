import { NextRequest, NextResponse } from 'next/server'
import PDFParser from 'pdf2json'
import { writeFileSync, unlinkSync } from 'fs'
import { join } from 'path'
import { tmpdir } from 'os'

// API para extraer texto de PDFs usando pdf2json (compatible con Vercel serverless)
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
    console.log('📝 Primeros 500 caracteres del texto:', text.slice(0, 500))

    // Limpiar archivo temporal
    if (tempFilePath) {
      unlinkSync(tempFilePath)
      tempFilePath = null
    }

    // Extraer prompts con el formato específico del usuario
    console.log('🔍 Buscando prompts con formato: PROMPT DE IMAGEN / PROMPT DE VIDEO')

    const imagePrompts: string[] = []
    const videoPrompts: string[] = []

    // Dividir el texto en secciones por VIDEO X
    const videoSections = text.split(/VIDEO\s+\d+/i).filter(section => section.trim().length > 0)
    console.log(`📦 Secciones VIDEO encontradas: ${videoSections.length}`)

    for (let i = 0; i < videoSections.length; i++) {
      const section = videoSections[i]

      // Extraer prompt de imagen
      const imageMatch = section.match(/PROMPT\s+DE\s+IMAGEN[^:]*:([\s\S]*?)(?=PROMPT\s+DE\s+VIDEO|$)/i)
      if (imageMatch && imageMatch[1]) {
        const imagePrompt = imageMatch[1].trim()
        if (imagePrompt.length > 10) { // Validar que no esté vacío
          imagePrompts.push(imagePrompt)
          console.log(`✅ Imagen ${imagePrompts.length}: ${imagePrompt.slice(0, 80)}...`)
        }
      }

      // Extraer prompt de video
      const videoMatch = section.match(/PROMPT\s+DE\s+VIDEO[^:]*:([\s\S]*?)(?=VIDEO\s+\d+|$)/i)
      if (videoMatch && videoMatch[1]) {
        const videoPrompt = videoMatch[1].trim()
        if (videoPrompt.length > 10) { // Validar que no esté vacío
          videoPrompts.push(videoPrompt)
          console.log(`✅ Video ${videoPrompts.length}: ${videoPrompt.slice(0, 80)}...`)
        }
      }
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
