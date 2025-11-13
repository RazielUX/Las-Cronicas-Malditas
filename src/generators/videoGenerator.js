import fs from 'fs';
import path from 'path';

/**
 * Generador de videos desde imágenes
 * Soporta múltiples APIs de generación de video
 */
export class VideoGenerator {
  constructor(config = {}) {
    this.apiProvider = config.provider || 'runway'; // runway, stability, replicate
    this.apiKey = config.apiKey;
    this.outputDir = './output/videos';
  }

  /**
   * Genera un video a partir de una imagen y un prompt
   * @param {string} imagePath - Ruta de la imagen de entrada
   * @param {string} videoPrompt - Prompt para el video
   * @param {number} index - Índice de la escena
   * @returns {Promise<string>} - Ruta del video generado
   */
  async generateVideo(imagePath, videoPrompt, index = 0) {
    try {
      console.log(`\n🎬 Generando video ${index + 1}/16...`);
      console.log(`   Imagen: ${path.basename(imagePath)}`);
      console.log(`   Prompt: ${videoPrompt.substring(0, 100)}...`);

      // Crear directorio de salida
      if (!fs.existsSync(this.outputDir)) {
        fs.mkdirSync(this.outputDir, { recursive: true });
      }

      const filename = `video_${String(index + 1).padStart(2, '0')}.mp4`;
      const outputPath = path.join(this.outputDir, filename);

      // Generar video según el proveedor
      let videoPath;

      switch (this.apiProvider) {
        case 'runway':
          videoPath = await this.generateWithRunway(imagePath, videoPrompt, outputPath);
          break;
        case 'stability':
          videoPath = await this.generateWithStability(imagePath, videoPrompt, outputPath);
          break;
        case 'replicate':
          videoPath = await this.generateWithReplicate(imagePath, videoPrompt, outputPath);
          break;
        default:
          throw new Error(`Proveedor no soportado: ${this.apiProvider}`);
      }

      console.log(`   ✅ Video guardado: ${filename}`);
      return videoPath;

    } catch (error) {
      console.error(`   ❌ Error generando video ${index + 1}:`, error.message);
      throw error;
    }
  }

  /**
   * Genera video con Runway ML Gen-2/Gen-3
   */
  async generateWithRunway(imagePath, prompt, outputPath) {
    console.log('   🎥 Usando Runway ML API...');

    // Leer la imagen en base64
    const imageBuffer = fs.readFileSync(imagePath);
    const imageBase64 = imageBuffer.toString('base64');

    try {
      // Iniciar generación de video
      const createResponse = await fetch('https://api.runwayml.com/v1/gen2/create', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          promptText: prompt,
          init_image: imageBase64,
          duration: 4, // segundos
          ratio: "16:9"
        })
      });

      if (!createResponse.ok) {
        throw new Error(`Runway API error: ${createResponse.status}`);
      }

      const createData = await createResponse.json();
      const taskId = createData.id;

      console.log(`   ⏳ Procesando video (ID: ${taskId})...`);

      // Polling para esperar a que el video esté listo
      let videoUrl = null;
      let attempts = 0;
      const maxAttempts = 60; // 5 minutos máximo

      while (!videoUrl && attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 5000)); // Esperar 5 segundos

        const statusResponse = await fetch(`https://api.runwayml.com/v1/tasks/${taskId}`, {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`
          }
        });

        const statusData = await statusResponse.json();

        if (statusData.status === 'SUCCEEDED') {
          videoUrl = statusData.output[0];
        } else if (statusData.status === 'FAILED') {
          throw new Error('Video generation failed');
        }

        attempts++;
      }

      if (!videoUrl) {
        throw new Error('Video generation timeout');
      }

      // Descargar el video
      const videoResponse = await fetch(videoUrl);
      const arrayBuffer = await videoResponse.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      fs.writeFileSync(outputPath, buffer);

      return outputPath;

    } catch (error) {
      console.error('   ❌ Error en Runway API:', error.message);
      throw error;
    }
  }

  /**
   * Genera video con Stability AI Video
   */
  async generateWithStability(imagePath, prompt, outputPath) {
    console.log('   🎥 Usando Stability AI Video API...');

    // Implementación similar a Runway
    // https://platform.stability.ai/docs/api-reference#tag/v2betastable-image

    throw new Error('Stability AI Video aún no implementado. Usa "runway" como provider.');
  }

  /**
   * Genera video con Replicate (ej: Stable Video Diffusion)
   */
  async generateWithReplicate(imagePath, prompt, outputPath) {
    console.log('   🎥 Usando Replicate API (Stable Video Diffusion)...');

    const imageBuffer = fs.readFileSync(imagePath);
    const imageBase64 = `data:image/png;base64,${imageBuffer.toString('base64')}`;

    try {
      // Crear predicción
      const createResponse = await fetch('https://api.replicate.com/v1/predictions', {
        method: 'POST',
        headers: {
          'Authorization': `Token ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          version: "3f0457e4619daac51203dedb472816fd4af51f3149fa7a9e0b5ffcf1b8172438", // Stable Video Diffusion
          input: {
            image: imageBase64,
            motion_bucket_id: 127,
            fps: 24,
            frames_per_second: 24
          }
        })
      });

      if (!createResponse.ok) {
        throw new Error(`Replicate API error: ${createResponse.status}`);
      }

      const prediction = await createResponse.json();
      const predictionId = prediction.id;

      console.log(`   ⏳ Procesando video (ID: ${predictionId})...`);

      // Polling
      let videoUrl = null;
      let attempts = 0;
      const maxAttempts = 60;

      while (!videoUrl && attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 3000));

        const statusResponse = await fetch(`https://api.replicate.com/v1/predictions/${predictionId}`, {
          headers: {
            'Authorization': `Token ${this.apiKey}`
          }
        });

        const statusData = await statusResponse.json();

        if (statusData.status === 'succeeded') {
          videoUrl = statusData.output;
        } else if (statusData.status === 'failed') {
          throw new Error('Video generation failed');
        }

        attempts++;
      }

      if (!videoUrl) {
        throw new Error('Video generation timeout');
      }

      // Descargar el video
      const videoResponse = await fetch(videoUrl);
      const arrayBuffer = await videoResponse.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      fs.writeFileSync(outputPath, buffer);

      return outputPath;

    } catch (error) {
      console.error('   ❌ Error en Replicate API:', error.message);
      throw error;
    }
  }

  /**
   * Genera todos los videos del proyecto
   */
  async generateAllVideos(imagePaths, videoPrompts) {
    console.log('\n🚀 Iniciando generación de videos...');
    console.log(`   Total de videos a generar: ${imagePaths.length}`);
    console.log(`   Proveedor: ${this.apiProvider}`);

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

        // Pausa entre generaciones
        if (i < imagePaths.length - 1) {
          console.log('   ⏳ Esperando 5 segundos antes del siguiente video...');
          await new Promise(resolve => setTimeout(resolve, 5000));
        }

      } catch (error) {
        console.error(`   ❌ Falló la generación de video ${i + 1}, continuando...`);
        generatedVideos.push(null);
      }
    }

    const successCount = generatedVideos.filter(v => v !== null).length;
    console.log(`\n✅ Generación completa: ${successCount}/${imagePaths.length} videos exitosos`);

    return generatedVideos;
  }
}
