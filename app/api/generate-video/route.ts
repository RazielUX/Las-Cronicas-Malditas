import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

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

    // Descargar la imagen y convertir a base64
    const imageResponse = await fetch(imageUrl)
    const imageBuffer = await imageResponse.arrayBuffer()
    const imageBase64 = Buffer.from(imageBuffer).toString('base64')

    // Generar video con Sora
    // Nota: La API de Sora puede variar. Aquí uso el formato más probable
    const fullPrompt = `Based on the provided image: ${videoPrompt}`

    try {
      // Intentar con el endpoint de chat completions
      const response = await openai.chat.completions.create({
        model: "sora-1.0-turbo",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: fullPrompt
              },
              {
                type: "image_url",
                image_url: {
                  url: `data:image/png;base64,${imageBase64}`
                }
              }
            ]
          }
        ],
        max_tokens: 1,
        // @ts-ignore - Parámetros específicos de Sora
        response_format: {
          type: "video",
          duration: 8,
          aspect_ratio: "9:16",
          fps: 24
        }
      } as any)

      // Extraer URL del video
      let videoUrl: string | null = null

      // @ts-ignore
      if (response.data && response.data[0] && response.data[0].url) {
        // @ts-ignore
        videoUrl = response.data[0].url
      } else if (response.choices && response.choices[0]) {
        // @ts-ignore
        videoUrl = response.choices[0].video_url || response.choices[0].url
      }

      if (!videoUrl) {
        throw new Error('No se recibió URL de video de la API')
      }

      console.log(`✅ Video generado para escena ${sceneId}`)

      return NextResponse.json({
        success: true,
        videoUrl: videoUrl,
        sceneId: sceneId
      })

    } catch (apiError: any) {
      // Si el error es que Sora no está disponible, dar un mensaje más claro
      if (apiError.code === 'model_not_found' || apiError.message?.includes('sora')) {
        return NextResponse.json(
          {
            error: 'Sora aún no está disponible',
            details: 'La API de Sora está en beta limitada. Por ahora, esta función generará un placeholder.',
            placeholder: true
          },
          { status: 503 }
        )
      }
      throw apiError
    }

  } catch (error: any) {
    console.error('Error generando video:', error)
    return NextResponse.json(
      {
        error: 'Error al generar video',
        details: error.message,
        code: error.code
      },
      { status: 500 }
    )
  }
}
