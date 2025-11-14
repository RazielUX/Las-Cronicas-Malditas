import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

// Función para sanitizar y acortar prompts que OpenAI rechaza
function sanitizePrompt(originalPrompt: string): string {
  let sanitized = originalPrompt

  // Remover palabras que pueden activar filtros de seguridad
  const bannedWords = [
    /\bsangre\b/gi, /\bensangrentad[oa]\b/gi, /\bcuerpos?\s+(sin\s+vida|muertos?)\b/gi,
    /\brostros?\s+pálidos?\s+y\s+sin\s+vida\b/gi, /\bojos?\s+abiertos?\s+mirando\s+al\s+vacío\b/gi,
    /\bescena\s+del\s+crimen\s+explícita\b/gi, /\bmano\s+femenina\s+ensangrentada\b/gi,
    /\bcharco\b/gi, /\bderramada\b/gi, /\bforcejeo\b/gi, /\bbrutal\b/gi, /\bangustiante\b/gi,
    /\bexplícit[oa]\b/gi, /\bcrud[oa]\b/gi, /\bmanchad[oa]\s+de\s+sangre\b/gi,
    /\bextremidades\s+manchadas\b/gi, /\bsábana\s+blanca.*sangre\b/gi
  ]

  bannedWords.forEach(regex => {
    sanitized = sanitized.replace(regex, '')
  })

  // Acortar si es muy largo (DALL-E 3 prefiere prompts < 1000 caracteres)
  if (sanitized.length > 1000) {
    // Extraer solo las partes esenciales
    const essentials = []

    // Mantener formato y estilo visual
    const formatMatch = sanitized.match(/Vertical\s+9:16[^.]*/)
    if (formatMatch) essentials.push(formatMatch[0])

    // Mantener descripción principal
    const mainDescMatch = sanitized.match(/(?:Plano|Tight|Split-screen)[^.]{0,300}/)
    if (mainDescMatch) essentials.push(mainDescMatch[0])

    // Mantener paleta de colores
    const paletteMatch = sanitized.match(/Color palette:[^.]{0,200}/)
    if (paletteMatch) essentials.push(paletteMatch[0])

    sanitized = essentials.join('. ') + '.'
  }

  // Limpiar múltiples espacios y puntos
  sanitized = sanitized.replace(/\s+/g, ' ').replace(/\.+/g, '.').trim()

  return sanitized
}

// Función para analizar imágenes previas y extraer características visuales
async function analyzeImageStyle(imageUrls: string[], openai: OpenAI): Promise<string> {
  if (!imageUrls || imageUrls.length === 0) return ''

  try {
    console.log(`🔍 Analizando ${imageUrls.length} imagen(es) previa(s) para extraer estilo...`)

    // Analizar cada imagen con GPT-4 Vision
    const analysisPromises = imageUrls.map(async (url) => {
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Analiza esta imagen y extrae SOLO: 1) Paleta de colores dominantes, 2) Estilo artístico/visual, 3) Tipo de iluminación. Sé conciso (max 100 caracteres total)."
              },
              {
                type: "image_url",
                image_url: { url }
              }
            ]
          }
        ],
        max_tokens: 150
      })

      return response.choices[0].message.content || ''
    })

    const analyses = await Promise.all(analysisPromises)

    // Combinar análisis y crear prefijo de coherencia
    const stylePrefix = `[COHERENCIA VISUAL CON IMÁGENES PREVIAS: ${analyses.join('; ')}]`
    console.log(`✓ Características extraídas: ${stylePrefix.slice(0, 150)}...`)

    return stylePrefix

  } catch (error) {
    console.warn('⚠️ Error al analizar imágenes previas, continuando sin coherencia:', error)
    return ''
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { prompt, sceneId, previousImageUrls = [] } = body

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
    console.log(`📏 Longitud del prompt: ${prompt.length} caracteres`)
    if (previousImageUrls.length > 0) {
      console.log(`🔗 Se usarán ${previousImageUrls.length} imagen(es) como referencia visual`)
    }

    // Analizar imágenes previas para extraer estilo (si existen)
    const stylePrefix = await analyzeImageStyle(previousImageUrls, openai)

    let finalPrompt = stylePrefix ? `${stylePrefix}\n\n${prompt}` : prompt
    let usedSanitized = false

    try {
      // Primer intento con prompt original
      const response = await openai.images.generate({
        model: "dall-e-3",
        prompt: finalPrompt,
        n: 1,
        size: "1024x1792", // Formato vertical 9:16 - IMPORTANTE: debe coincidir con Sora
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
        sceneId: sceneId,
        usedSanitized: false
      })

    } catch (firstError: any) {
      // Si falla por contenido prohibido, intentar con versión sanitizada
      if (firstError.status === 400 && firstError.message?.includes('safety system')) {
        console.log(`⚠️ Prompt rechazado por seguridad, intentando con versión sanitizada...`)

        finalPrompt = sanitizePrompt(prompt)
        console.log(`📏 Longitud del prompt sanitizado: ${finalPrompt.length} caracteres`)
        console.log(`🔄 Prompt sanitizado: ${finalPrompt.slice(0, 200)}...`)

        usedSanitized = true

        // Segundo intento con prompt sanitizado
        const response = await openai.images.generate({
          model: "dall-e-3",
          prompt: finalPrompt,
          n: 1,
          size: "1024x1792",
          quality: "hd",
          style: "vivid"
        })

        const imageUrl = response.data?.[0]?.url

        if (!imageUrl) {
          throw new Error('No se recibió URL de imagen')
        }

        console.log(`✅ Imagen generada para escena ${sceneId} (versión sanitizada)`)

        return NextResponse.json({
          success: true,
          imageUrl: imageUrl,
          sceneId: sceneId,
          usedSanitized: true,
          warning: 'Prompt modificado por políticas de OpenAI'
        })
      }

      // Si no es error de seguridad, lanzar el error original
      throw firstError
    }

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
