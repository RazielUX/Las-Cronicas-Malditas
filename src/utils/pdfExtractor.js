import fs from 'fs';
import pdf from 'pdf-parse';

/**
 * Extrae información estructurada de un PDF con el formato esperado:
 * - 16 prompts de imagen
 * - 16 prompts de video
 * - 4 imágenes de referencia
 */
export async function extractDataFromPDF(pdfPath) {
  try {
    const dataBuffer = fs.readFileSync(pdfPath);
    const data = await pdf(dataBuffer);

    console.log('📄 PDF cargado correctamente');
    console.log(`   Páginas: ${data.numpages}`);

    // Parsear el texto del PDF
    const text = data.text;
    const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);

    // Extraer prompts de imagen (buscamos patrones como "Imagen 1:", "Prompt Imagen 1:", etc.)
    const imagePrompts = [];
    const videoPrompts = [];

    let currentSection = null;
    let currentPrompt = '';

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Detectar secciones de imagen
      if (line.match(/^(Imagen|Image|Prompt\s+Imagen|Image\s+Prompt)\s*\d+/i)) {
        if (currentPrompt && currentSection === 'image') {
          imagePrompts.push(currentPrompt.trim());
        }
        currentSection = 'image';
        currentPrompt = '';
        continue;
      }

      // Detectar secciones de video
      if (line.match(/^(Video|Prompt\s+Video|Video\s+Prompt)\s*\d+/i)) {
        if (currentPrompt && currentSection === 'image') {
          imagePrompts.push(currentPrompt.trim());
        }
        if (currentPrompt && currentSection === 'video') {
          videoPrompts.push(currentPrompt.trim());
        }
        currentSection = 'video';
        currentPrompt = '';
        continue;
      }

      // Acumular líneas del prompt actual
      if (currentSection) {
        currentPrompt += (currentPrompt ? ' ' : '') + line;
      }
    }

    // Añadir el último prompt
    if (currentPrompt && currentSection === 'image') {
      imagePrompts.push(currentPrompt.trim());
    }
    if (currentPrompt && currentSection === 'video') {
      videoPrompts.push(currentPrompt.trim());
    }

    // Extraer imágenes embebidas del PDF
    const referenceImages = [];

    // pdf-parse no extrae imágenes directamente, pero podemos guardar referencias
    // Por ahora, asumimos que las imágenes de referencia se proporcionan por separado
    console.log('⚠️  Nota: Las imágenes de referencia deben estar en la carpeta input/references/');

    // Validación
    if (imagePrompts.length !== 16) {
      console.warn(`⚠️  Se esperaban 16 prompts de imagen, se encontraron ${imagePrompts.length}`);
    }

    if (videoPrompts.length !== 16) {
      console.warn(`⚠️  Se esperaban 16 prompts de video, se encontraron ${videoPrompts.length}`);
    }

    return {
      imagePrompts: imagePrompts.slice(0, 16), // Tomar máximo 16
      videoPrompts: videoPrompts.slice(0, 16), // Tomar máximo 16
      referenceImages: referenceImages,
      metadata: {
        pdfPages: data.numpages,
        totalImagePrompts: imagePrompts.length,
        totalVideoPrompts: videoPrompts.length
      }
    };

  } catch (error) {
    console.error('❌ Error al extraer datos del PDF:', error.message);
    throw error;
  }
}

/**
 * Carga las imágenes de referencia desde un directorio
 */
export function loadReferenceImages(referenceDir = './input/references') {
  try {
    if (!fs.existsSync(referenceDir)) {
      console.warn(`⚠️  Directorio de referencias no existe: ${referenceDir}`);
      return [];
    }

    const files = fs.readdirSync(referenceDir);
    const imageFiles = files.filter(f =>
      f.match(/\.(jpg|jpeg|png|webp)$/i)
    );

    const images = imageFiles.slice(0, 4).map(file => ({
      name: file,
      path: `${referenceDir}/${file}`
    }));

    console.log(`🖼️  Imágenes de referencia cargadas: ${images.length}`);

    return images;

  } catch (error) {
    console.error('❌ Error al cargar imágenes de referencia:', error.message);
    return [];
  }
}
