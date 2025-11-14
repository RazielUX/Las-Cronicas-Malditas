import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { imageUrl, videoPrompt, sceneId } = body

    if (!imageUrl || !videoPrompt) {
      return NextResponse.json(
        { error: 'Faltan parámetros requeridos' },
        { status: 400 }
      )
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'OPENAI_API_KEY no configurada' },
        { status: 500 }
      )
    }

    console.log(`🎬 Generando video para escena ${sceneId}...`)
    console.log(`📏 Longitud del prompt de video: ${videoPrompt.length} caracteres`)

    try {
      // Descargar la imagen de DALL-E para enviarla como archivo
      console.log('⬇️ Descargando imagen de DALL-E...')
      const imageResponse = await fetch(imageUrl)
      if (!imageResponse.ok) {
        throw new Error('No se pudo descargar la imagen de DALL-E')
      }
      const imageBlob = await imageResponse.blob()
      console.log(`✓ Imagen descargada: ${imageBlob.size} bytes`)

      // Crear FormData para multipart/form-data
      const formData = new FormData()
      formData.append('model', 'sora-2') // Usar sora-2 para rapidez (sora-2-pro para calidad)
      formData.append('prompt', videoPrompt)
      formData.append('size', '1024x1792') // DEBE coincidir con el tamaño de la imagen DALL-E (vertical 9:16)
      formData.append('seconds', '8')
      formData.append('input_reference', imageBlob, 'reference.jpg')

      // Generar video con Sora usando el endpoint correcto /v1/videos
      console.log('📤 Enviando request a Sora...')
      const response = await fetch('https://api.openai.com/v1/videos', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        body: formData
      })

      console.log('📦 Status de respuesta:', response.status, response.statusText)

      if (!response.ok) {
        const errorText = await response.text()
        console.error('❌ Error de Sora:', errorText)

        let errorData
        try {
          errorData = JSON.parse(errorText)
        } catch {
          errorData = { message: errorText }
        }

        throw new Error(errorData.error?.message || errorData.message || 'Error desconocido de Sora')
      }

      const data = await response.json()
      console.log('📦 Respuesta completa de Sora:', JSON.stringify(data, null, 2))

      // La respuesta inicial contiene un ID y status
      // Necesitamos hacer polling hasta que esté "completed"
      if (!data.id) {
        console.error('❌ Respuesta sin ID:', data)
        throw new Error('La respuesta de Sora no contiene un ID de video')
      }

      console.log(`⏳ Video creado con ID: ${data.id}, status inicial: ${data.status}`)
      console.log(`🔄 Iniciando polling para monitorear progreso...`)

      // Hacer polling del estado del video
      const videoUrl = await pollVideoStatus(data.id, process.env.OPENAI_API_KEY!)

      console.log(`✅ Video completado para escena ${sceneId}: ${videoUrl}`)

      return NextResponse.json({
        success: true,
        videoUrl: videoUrl,
        sceneId: sceneId,
        videoId: data.id
      })

    } catch (apiError: any) {
      console.error('❌ Error de la API de Sora:', apiError)
      console.error('Error message:', apiError.message)

      return NextResponse.json(
        {
          error: 'Error al generar video con Sora',
          details: apiError.message || 'Error desconocido',
        },
        { status: 500 }
      )
    }

  } catch (error: any) {
    console.error('❌ Error general generando video:', error)

    return NextResponse.json(
      {
        error: 'Error al generar video',
        details: error.message || 'Error desconocido',
      },
      { status: 500 }
    )
  }
}

// Función para hacer polling del estado del video según la documentación de Sora
async function pollVideoStatus(videoId: string, apiKey: string, maxAttempts = 120): Promise<string> {
  console.log(`🔄 Iniciando polling para video ID: ${videoId}`)

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    // Esperar antes de cada check (10 segundos)
    await new Promise(resolve => setTimeout(resolve, 10000))

    // Obtener el estado actual del video
    const response = await fetch(`https://api.openai.com/v1/videos/${videoId}`, {
      headers: {
        'Authorization': `Bearer ${apiKey}`
      }
    })

    if (!response.ok) {
      console.error(`❌ Error checking video status: ${response.status}`)
      const errorText = await response.text()
      console.error('Error details:', errorText)
      continue
    }

    const data = await response.json()
    const progress = data.progress || 0
    console.log(`📊 Intento ${attempt + 1}/${maxAttempts} - Estado: ${data.status}, Progreso: ${progress}%`)

    if (data.status === 'completed') {
      console.log(`✅ Video completado! Descargando contenido...`)

      // Descargar el video usando el endpoint /content
      const downloadUrl = `https://api.openai.com/v1/videos/${videoId}/content`
      console.log(`⬇️ Descargando desde: ${downloadUrl}`)

      // En producción, Vercel generará una URL temporal
      // Por ahora retornamos la URL del endpoint de descarga
      // El cliente puede hacer otra petición para obtener el video
      return downloadUrl

    } else if (data.status === 'failed') {
      const errorMessage = data.error?.message || 'La generación del video falló en Sora'
      console.error('❌ Video generation failed:', errorMessage)
      throw new Error(errorMessage)
    }

    // Continuar esperando si está en estado: queued, in_progress
  }

  throw new Error('Timeout: El video tardó más de 20 minutos en generarse')
}
