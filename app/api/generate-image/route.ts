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
    console.error('❌ Error generando imagen:', error)
    console.error('Error type:', error.constructor.name)
    console.error('Error message:', error.message)
    console.error('Error code:', error.code)
    console.error('Error status:', error.status)

    // Intentar extraer más detalles del error de OpenAI
    let errorMessage = 'Error al generar imagen'
    let errorDetails = error.message || 'Error desconocido'

    if (error.status === 401) {
      errorMessage = 'API Key inválida o expirada'
      errorDetails = 'La OPENAI_API_KEY configurada no es válida'
    } else if (error.status === 429) {
      errorMessage = 'Límite de rate limit alcanzado'
      errorDetails = 'Demasiadas peticiones. Espera un momento e intenta de nuevo.'
    } else if (error.status === 400) {
      errorMessage = 'Petición inválida'
      errorDetails = error.message || 'El prompt o los parámetros son inválidos'
    } else if (error.code === 'insufficient_quota') {
      errorMessage = 'Sin créditos en la cuenta de OpenAI'
      errorDetails = 'Tu cuenta de OpenAI no tiene créditos suficientes'
    }

    return NextResponse.json(
      {
        error: errorMessage,
        details: errorDetails,
        code: error.code,
        status: error.status
      },
      { status: error.status || 500 }
    )
  }
}
