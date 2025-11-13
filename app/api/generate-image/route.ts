import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { prompt, sceneId } = body

    if (!prompt) {
      return NextResponse.json(
        { error: 'No se proporcionó el prompt' },
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

    console.log(`🎨 Generando imagen para escena ${sceneId}...`)

    // Generar imagen con DALL-E 3
    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt: prompt,
      n: 1,
      size: "1024x1792", // Formato vertical
      quality: "hd",
      style: "vivid"
    })

    const imageUrl = response.data?.[0]?.url

    if (!imageUrl) {
      throw new Error('No se recibió URL de imagen')
    }

    console.log(`✅ Imagen generada para escena ${sceneId}`)

    return NextResponse.json({
      success: true,
      imageUrl: imageUrl,
      sceneId: sceneId
    })

  } catch (error: any) {
    console.error('Error generando imagen:', error)
    return NextResponse.json(
      {
        error: 'Error al generar imagen',
        details: error.message,
        code: error.code
      },
      { status: 500 }
    )
  }
}
