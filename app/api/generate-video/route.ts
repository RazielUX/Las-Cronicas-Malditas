import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

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

    // Inicializar OpenAI dentro de la función para evitar errores en build time
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    })

    console.log(`🎬 Generando video para escena ${sceneId}...`)
    console.log(`📏 Longitud del prompt de video: ${videoPrompt.length} caracteres`)

    try {
      // Generar video con Sora usando el endpoint correcto
      // Sora acepta tanto texto como imagen como entrada
      const response = await openai.chat.completions.create({
        model: "gpt-4o-video-preview", // Modelo correcto para Sora
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: videoPrompt
              },
              {
                type: "image_url",
                image_url: {
                  url: imageUrl
                }
              }
            ]
          }
        ],
        // @ts-ignore - Parámetros específicos de Sora
        modalities: ["video"],
        max_tokens: 1000
      } as any)

      console.log('📦 Respuesta de Sora:', JSON.stringify(response, null, 2))

      // Extraer URL del video de la respuesta
      let videoUrl: string | null = null

      // Intentar diferentes posibles ubicaciones de la URL del video
      // @ts-ignore
      if (response.choices?.[0]?.message?.video_url) {
        // @ts-ignore
        videoUrl = response.choices[0].message.video_url
      }
      // @ts-ignore
      else if (response.choices?.[0]?.message?.content?.[0]?.video_url) {
        // @ts-ignore
        videoUrl = response.choices[0].message.content[0].video_url
      }
      // @ts-ignore
      else if (response.data?.[0]?.url) {
        // @ts-ignore
        videoUrl = response.data[0].url
      }

      if (!videoUrl) {
        console.error('❌ Estructura de respuesta inesperada:', response)
        throw new Error('No se pudo extraer la URL del video de la respuesta de Sora. Estructura: ' + JSON.stringify(response).slice(0, 500))
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
      console.error('Error code:', apiError.code)
      console.error('Error status:', apiError.status)

      // Analizar el tipo de error
      if (apiError.code === 'model_not_found') {
        return NextResponse.json(
          {
            error: 'Modelo Sora no encontrado',
            details: 'El modelo "gpt-4o-video-preview" no está disponible. Verifica que tengas acceso beta a Sora.',
            code: apiError.code
          },
          { status: 404 }
        )
      } else if (apiError.status === 401) {
        return NextResponse.json(
          {
            error: 'API Key inválida',
            details: 'La OPENAI_API_KEY no tiene permisos para usar Sora.',
            code: apiError.code
          },
          { status: 401 }
        )
      } else if (apiError.status === 403) {
        return NextResponse.json(
          {
            error: 'Acceso denegado a Sora',
            details: 'Tu cuenta no tiene acceso al programa beta de Sora.',
            code: apiError.code
          },
          { status: 403 }
        )
      }

      throw apiError
    }

  } catch (error: any) {
    console.error('❌ Error general generando video:', error)

    return NextResponse.json(
      {
        error: 'Error al generar video',
        details: error.message || 'Error desconocido',
        code: error.code,
        status: error.status
      },
      { status: error.status || 500 }
    )
  }
}
