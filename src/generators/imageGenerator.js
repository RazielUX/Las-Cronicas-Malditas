import OpenAI from 'openai';
import fs from 'fs';
import path from 'path';

/**
 * Generador de imágenes usando OpenAI DALL-E 3
 */
export class ImageGenerator {
  constructor(apiKey) {
    this.openai = new OpenAI({ apiKey });
    this.outputDir = './output/images';
  }

  /**
   * Genera una imagen basada en un prompt y referencias
   * @param {string} prompt - Prompt de texto para la imagen
   * @param {Array} referenceImages - Array de rutas a imágenes de referencia
   * @param {number} index - Índice de la escena
   * @returns {Promise<string>} - Ruta de la imagen generada
   */
  async generateImage(prompt, referenceImages = [], index = 0) {
    try {
      console.log(`\n🎨 Generando imagen ${index + 1}/16...`);
      console.log(`   Prompt: ${prompt.substring(0, 100)}...`);

      // Enriquecer el prompt con información de estilo de las referencias
      let enhancedPrompt = prompt;

      if (referenceImages.length > 0) {
        enhancedPrompt = `${prompt}\n\nEstilo visual basado en las siguientes referencias: imágenes con estética coherente y profesional.`;
      }

      // Generar imagen con DALL-E 3
      const response = await this.openai.images.generate({
        model: "dall-e-3",
        prompt: enhancedPrompt,
        n: 1,
        size: "1792x1024", // Formato horizontal ideal para video
        quality: "hd",
        style: "vivid" // o "natural" para un estilo más fotorealista
      });

      const imageUrl = response.data[0].url;

      // Descargar la imagen
      const imageResponse = await fetch(imageUrl);
      const arrayBuffer = await imageResponse.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      // Guardar la imagen
      if (!fs.existsSync(this.outputDir)) {
        fs.mkdirSync(this.outputDir, { recursive: true });
      }

      const filename = `scene_${String(index + 1).padStart(2, '0')}.png`;
      const filepath = path.join(this.outputDir, filename);

      fs.writeFileSync(filepath, buffer);

      console.log(`   ✅ Imagen guardada: ${filename}`);

      return filepath;

    } catch (error) {
      console.error(`   ❌ Error generando imagen ${index + 1}:`, error.message);
      throw error;
    }
  }

  /**
   * Genera todas las imágenes del proyecto
   * @param {Array<string>} prompts - Array de prompts de imagen
   * @param {Array} referenceImages - Imágenes de referencia
   * @returns {Promise<Array<string>>} - Array de rutas de imágenes generadas
   */
  async generateAllImages(prompts, referenceImages = []) {
    console.log('\n🚀 Iniciando generación de imágenes...');
    console.log(`   Total de imágenes a generar: ${prompts.length}`);
    console.log(`   Imágenes de referencia: ${referenceImages.length}`);

    const generatedImages = [];

    for (let i = 0; i < prompts.length; i++) {
      try {
        const imagePath = await this.generateImage(prompts[i], referenceImages, i);
        generatedImages.push(imagePath);

        // Pequeña pausa para evitar rate limits
        if (i < prompts.length - 1) {
          console.log('   ⏳ Esperando 3 segundos antes de la siguiente generación...');
          await new Promise(resolve => setTimeout(resolve, 3000));
        }

      } catch (error) {
        console.error(`   ❌ Falló la generación de imagen ${i + 1}, continuando...`);
        generatedImages.push(null);
      }
    }

    const successCount = generatedImages.filter(img => img !== null).length;
    console.log(`\n✅ Generación completa: ${successCount}/${prompts.length} imágenes exitosas`);

    return generatedImages;
  }
}
