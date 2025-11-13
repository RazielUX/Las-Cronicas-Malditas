#!/usr/bin/env node

import 'dotenv/config';
import fs from 'fs';
import { extractDataFromPDF, loadReferenceImages } from './utils/pdfExtractor.js';
import { ImageGenerator } from './generators/imageGenerator.js';
import { VideoGenerator } from './generators/videoGenerator.js';

/**
 * Script principal para generar imágenes y videos desde un PDF
 */
async function main() {
  console.log('═══════════════════════════════════════════════════════');
  console.log('🎬  GENERADOR DE VIDEOS DESDE PDF');
  console.log('═══════════════════════════════════════════════════════\n');

  // 1. Verificar variables de entorno
  const openaiKey = process.env.OPENAI_API_KEY;
  const videoApiKey = process.env.VIDEO_API_KEY;
  const videoProvider = process.env.VIDEO_PROVIDER || 'replicate';

  if (!openaiKey) {
    console.error('❌ Error: OPENAI_API_KEY no está configurada');
    console.log('   Por favor, crea un archivo .env con tu API key de OpenAI');
    process.exit(1);
  }

  if (!videoApiKey) {
    console.error('❌ Error: VIDEO_API_KEY no está configurada');
    console.log('   Por favor, añade tu API key para generación de video');
    console.log(`   Proveedor actual: ${videoProvider}`);
    process.exit(1);
  }

  // 2. Buscar el PDF de entrada
  const inputDir = './input';
  if (!fs.existsSync(inputDir)) {
    console.log('📁 Creando directorio de entrada...');
    fs.mkdirSync(inputDir, { recursive: true });
    fs.mkdirSync(`${inputDir}/references`, { recursive: true });
  }

  const pdfFiles = fs.readdirSync(inputDir).filter(f => f.endsWith('.pdf'));

  if (pdfFiles.length === 0) {
    console.error('❌ Error: No se encontró ningún PDF en la carpeta ./input');
    console.log('   Por favor, coloca tu PDF con los prompts en ./input/');
    process.exit(1);
  }

  const pdfPath = `${inputDir}/${pdfFiles[0]}`;
  console.log(`📄 PDF encontrado: ${pdfFiles[0]}\n`);

  try {
    // 3. Extraer datos del PDF
    console.log('═══════════════════════════════════════════════════════');
    console.log('PASO 1: EXTRAYENDO DATOS DEL PDF');
    console.log('═══════════════════════════════════════════════════════');

    const { imagePrompts, videoPrompts, metadata } = await extractDataFromPDF(pdfPath);

    console.log('\n📊 Datos extraídos:');
    console.log(`   • Prompts de imagen: ${imagePrompts.length}`);
    console.log(`   • Prompts de video: ${videoPrompts.length}`);
    console.log(`   • Páginas del PDF: ${metadata.pdfPages}`);

    // 4. Cargar imágenes de referencia
    const referenceImages = loadReferenceImages(`${inputDir}/references`);

    if (referenceImages.length === 0) {
      console.log('\n⚠️  No se encontraron imágenes de referencia');
      console.log('   Coloca hasta 4 imágenes en ./input/references/ para mejor consistencia');
    } else {
      console.log(`\n✅ Imágenes de referencia: ${referenceImages.length}`);
      referenceImages.forEach((img, i) => {
        console.log(`   ${i + 1}. ${img.name}`);
      });
    }

    // Confirmar antes de continuar
    console.log('\n═══════════════════════════════════════════════════════');
    console.log('RESUMEN DE GENERACIÓN');
    console.log('═══════════════════════════════════════════════════════');
    console.log(`📸 Se generarán ${imagePrompts.length} imágenes con DALL-E 3`);
    console.log(`🎬 Se generarán ${videoPrompts.length} videos con ${videoProvider}`);
    console.log(`💰 Costo estimado:`);
    console.log(`   • Imágenes (DALL-E 3 HD): ~$${(imagePrompts.length * 0.08).toFixed(2)} USD`);
    console.log(`   • Videos (${videoProvider}): Variable según proveedor`);
    console.log('\n⏱️  Tiempo estimado: 1-2 horas\n');

    // En producción, podrías añadir una confirmación interactiva aquí
    // const readline = require('readline');
    // ...

    // 5. Generar imágenes
    console.log('═══════════════════════════════════════════════════════');
    console.log('PASO 2: GENERANDO IMÁGENES CON DALL-E 3');
    console.log('═══════════════════════════════════════════════════════');

    const imageGenerator = new ImageGenerator(openaiKey);
    const generatedImages = await imageGenerator.generateAllImages(
      imagePrompts,
      referenceImages
    );

    // 6. Generar videos
    console.log('\n═══════════════════════════════════════════════════════');
    console.log('PASO 3: GENERANDO VIDEOS');
    console.log('═══════════════════════════════════════════════════════');

    const videoGenerator = new VideoGenerator({
      provider: videoProvider,
      apiKey: videoApiKey
    });

    const generatedVideos = await videoGenerator.generateAllVideos(
      generatedImages,
      videoPrompts
    );

    // 7. Resumen final
    console.log('\n═══════════════════════════════════════════════════════');
    console.log('✨ PROCESO COMPLETADO');
    console.log('═══════════════════════════════════════════════════════');

    const successfulImages = generatedImages.filter(img => img !== null).length;
    const successfulVideos = generatedVideos.filter(vid => vid !== null).length;

    console.log(`\n📊 Resultados:`);
    console.log(`   ✅ Imágenes generadas: ${successfulImages}/${imagePrompts.length}`);
    console.log(`   ✅ Videos generados: ${successfulVideos}/${videoPrompts.length}`);

    console.log(`\n📁 Archivos guardados en:`);
    console.log(`   • Imágenes: ./output/images/`);
    console.log(`   • Videos: ./output/videos/`);

    // Guardar manifiesto
    const manifest = {
      timestamp: new Date().toISOString(),
      input: {
        pdf: pdfFiles[0],
        referenceImages: referenceImages.map(img => img.name)
      },
      results: {
        images: generatedImages.map((path, i) => ({
          index: i + 1,
          path: path,
          prompt: imagePrompts[i],
          success: path !== null
        })),
        videos: generatedVideos.map((path, i) => ({
          index: i + 1,
          path: path,
          prompt: videoPrompts[i],
          success: path !== null
        }))
      },
      metadata: {
        imagesGenerated: successfulImages,
        videosGenerated: successfulVideos,
        totalCost: {
          estimated: true,
          images: successfulImages * 0.08,
          currency: 'USD'
        }
      }
    };

    fs.writeFileSync(
      './output/manifest.json',
      JSON.stringify(manifest, null, 2)
    );

    console.log(`\n📋 Manifiesto guardado: ./output/manifest.json`);
    console.log('\n🎉 ¡Proceso completado exitosamente!\n');

  } catch (error) {
    console.error('\n❌ Error fatal:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// Ejecutar el script
main();
