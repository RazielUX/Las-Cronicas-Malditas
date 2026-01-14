import OpenAI from 'openai';
import fs from 'fs';
import path from 'path';

/**
 * Generador de videos usando OpenAI Sora
 */
export class VideoGenerator {
  constructor(apiKey) {
    this.openai = new OpenAI({ apiKey });
    this.outputDir = './output/videos';
  }

  /**
   * Convierte imagen a base64 para enviar a la API
   */
  imageToBase64(imagePath) {
    const imageBuffer = fs.readFileSync(imagePath);
    return imageBuffer.toString('base64');
  }

  /**
   * Genera un video a partir de una imagen y un prompt usando Sora
   * @param {string} imagePath - Ruta de la imagen de entrada
   * @param {string} videoPrompt - Prompt para el video
   * @param {number} index - Índice de la escena
   * @returns {Promise<string>} - Ruta del video generado
   */
  async generateVideo(imagePath, videoPrompt, index = 0) {
    try {
      console.log(`\n🎬 Generando video ${index + 1}/16 con Sora...`);
      console.log(`   Imagen: ${path.basename(imagePath)}`);
      console.log(`   Prompt: ${videoPrompt.substring(0, 100)}...`);

      // Crear directorio de salida
      if (!fs.existsSync(this.outputDir)) {
        fs.mkdirSync(this.outputDir, { recursive: true });
      }

      // Leer imagen como base64
      const imageBase64 = this.imageToBase64(imagePath);

      // Combinar el prompt con referencia a la imagen
      const fullPrompt = `Based on the provided image: ${videoPrompt}`;

      console.log('   🎥 Llamando a OpenAI Sora API...');

      // Generar video con Sora
      // Nota: La API de Sora usa el endpoint de generaciones
      const response = await this.openai.chat.completions.create({
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
        // Parámetros específicos de Sora
        max_tokens: 1,
        temperature: 0.7,
        // Configuración de video
        response_format: {
          type: "video",
          duration: 8,  // 8 segundos
          aspect_ratio: "9:16",  // Vertical
          fps: 24
        }
      });

      // Alternativa: Si Sora tiene su propio endpoint específico
      // const response = await this.openai.videos.generate({
      //   model: "sora-1.0-turbo",
      //   prompt: fullPrompt,
      //   image: `data:image/png;base64,${imageBase64}`,
      //   duration: 8,
      //   aspect_ratio: "9:16",
      //   quality: "standard"
      // });

      console.log(`   ⏳ Procesando video...`);

      // Extraer la URL del video
      let videoUrl;

      if (response.data && response.data[0] && response.data[0].url) {
        videoUrl = response.data[0].url;
      } else if (response.choices && response.choices[0]) {
        // Si la respuesta viene en formato de chat
        videoUrl = response.choices[0].video_url || response.choices[0].url;
      } else {
        throw new Error('No se pudo obtener la URL del video de la respuesta');
      }

      if (!videoUrl) {
        throw new Error('La API no devolvió una URL de video válida');
      }

      // Descargar el video
      console.log('   📥 Descargando video...');
      const videoResponse = await fetch(videoUrl);

      if (!videoResponse.ok) {
        throw new Error(`Error al descargar video: ${videoResponse.status}`);
      }

      const arrayBuffer = await videoResponse.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      // Guardar el video
      const filename = `video_${String(index + 1).padStart(2, '0')}.mp4`;
      const outputPath = path.join(this.outputDir, filename);

      fs.writeFileSync(outputPath, buffer);

      console.log(`   ✅ Video guardado: ${filename} (${(buffer.length / 1024 / 1024).toFixed(2)} MB)`);

      return outputPath;

    } catch (error) {
      console.error(`   ❌ Error generando video ${index + 1}:`, error.message);

      // Si es un error de API, mostrar más detalles
      if (error.response) {
        console.error('   📋 Detalles del error:', error.response.data);
      }

      throw error;
    }
  }

  /**
   * Genera todos los videos del proyecto
   * @param {Array<string>} imagePaths - Array de rutas de imágenes
   * @param {Array<string>} videoPrompts - Array de prompts de video
   * @returns {Promise<Array<string>>} - Array de rutas de videos generados
   */
  async generateAllVideos(imagePaths, videoPrompts) {
    console.log('\n🚀 Iniciando generación de videos con OpenAI Sora...');
    console.log(`   Total de videos a generar: ${imagePaths.length}`);
    console.log(`   Configuración: 8 segundos, formato vertical (9:16), 24 fps`);

    const generatedVideos = [];

    for (let i = 0; i < imagePaths.length; i++) {
      if (!imagePaths[i]) {
        console.log(`   ⏭️  Saltando video ${i + 1} (imagen no disponible)`);
        generatedVideos.push(null);
        continue;
      }

      try {
        const videoPath = await this.generateVideo(imagePaths[i], videoPrompts[i], i);
        generatedVideos.push(videoPath);

        // Pausa entre generaciones para evitar rate limits
        if (i < imagePaths.length - 1) {
          console.log('   ⏳ Esperando 5 segundos antes del siguiente video...');
          await new Promise(resolve => setTimeout(resolve, 5000));
        }

      } catch (error) {
        console.error(`   ❌ Falló la generación de video ${i + 1}, continuando...`);
        generatedVideos.push(null);

        // Si es un error de rate limit, esperar más tiempo
        if (error.message && error.message.includes('rate_limit')) {
          console.log('   ⏳ Rate limit alcanzado, esperando 60 segundos...');
          await new Promise(resolve => setTimeout(resolve, 60000));
        }
      }
    }

    const successCount = generatedVideos.filter(v => v !== null).length;
    console.log(`\n✅ Generación completa: ${successCount}/${imagePaths.length} videos exitosos`);

    return generatedVideos;
  }
}
