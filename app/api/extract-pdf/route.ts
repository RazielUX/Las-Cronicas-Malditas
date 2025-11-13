import { NextRequest, NextResponse } from 'next/server'

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

    console.log('📄 Procesando PDF:', file.name, file.size, 'bytes')

    // Convertir File a Uint8Array
    const bytes = await file.arrayBuffer()
    const uint8Array = new Uint8Array(bytes)

    console.log('✓ PDF convertido a buffer, iniciando extracción...')

    // Importar pdfjs dinámicamente para evitar problemas en build
    const pdfjs = await import('pdfjs-dist')

    // Deshabilitar worker para entorno serverless
    pdfjs.GlobalWorkerOptions.workerSrc = ''

    // Parsear PDF con pdfjs (sin worker)
    const loadingTask = pdfjs.getDocument({
      data: uint8Array,
      useWorkerFetch: false,
      isEvalSupported: false,
      useSystemFonts: true,
    })
    const pdf = await loadingTask.promise

    console.log(`✓ PDF cargado, ${pdf.numPages} páginas encontradas`)

    // Extraer texto de todas las páginas
    let text = ''
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i)
      const textContent = await page.getTextContent()
      const pageText = textContent.items
        .map((item: any) => item.str)
        .join(' ')
      text += pageText + '\n'
    }

    console.log(`✓ Texto extraído: ${text.length} caracteres`)

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
