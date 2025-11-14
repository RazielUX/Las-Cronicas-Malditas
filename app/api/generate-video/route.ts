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
      // Generar video con Sora usando el endpoint correcto /v1/videos
      // Formato: https://platform.openai.com/docs/api-reference/videos
      const response = await fetch('https://api.openai.com/v1/videos', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: "sora-turbo",
          prompt: videoPrompt,
          input_image_url: imageUrl, // Parámetro correcto para la imagen de entrada
          duration: 8,
          aspect_ratio: "9:16",
          resolution: "1080p"
        })
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

      // Extraer URL del video de la respuesta
      let videoUrl: string | null = null

      // Intentar diferentes posibles ubicaciones de la URL del video
      if (data.url) {
        videoUrl = data.url
      } else if (data.video_url) {
        videoUrl = data.video_url
      } else if (data.data && data.data[0] && data.data[0].url) {
        videoUrl = data.data[0].url
      } else if (data.id) {
        // Si solo devuelve un ID, necesitamos hacer polling para obtener el video
        console.log(`⏳ Video en proceso, ID: ${data.id}. Iniciando polling...`)
        videoUrl = await pollVideoStatus(data.id, process.env.OPENAI_API_KEY!)
      }

      if (!videoUrl) {
        console.error('❌ Estructura de respuesta inesperada:', data)
        throw new Error('No se pudo extraer la URL del video de la respuesta de Sora. Estructura: ' + JSON.stringify(data).slice(0, 500))
      }

      console.log(`✅ Video generado para escena ${sceneId}`)

      return NextResponse.json({
        success: true,
        videoUrl: videoUrl,
        sceneId: sceneId
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

// Función para hacer polling del estado del video si Sora devuelve un job ID
async function pollVideoStatus(videoId: string, apiKey: string, maxAttempts = 60): Promise<string> {
  console.log(`🔄 Polling video status para ID: ${videoId}`)

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    await new Promise(resolve => setTimeout(resolve, 5000)) // Esperar 5 segundos

    const response = await fetch(`https://api.openai.com/v1/videos/${videoId}`, {
      headers: {
        'Authorization': `Bearer ${apiKey}`
      }
    })

    if (!response.ok) {
      console.error(`❌ Error checking video status: ${response.status}`)
      continue
    }

    const data = await response.json()
    console.log(`📊 Intento ${attempt + 1}/${maxAttempts} - Estado: ${data.status}`)

    if (data.status === 'completed' && data.url) {
      console.log(`✅ Video completado: ${data.url}`)
      return data.url
    } else if (data.status === 'failed') {
      throw new Error('La generación del video falló en Sora')
    }

    // Continuar esperando si está en proceso
  }

  throw new Error('Timeout esperando que el video se genere')
}
