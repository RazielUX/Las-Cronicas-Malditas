# 🎬 Generador de Videos desde PDF

Sistema automatizado para generar imágenes y videos a partir de prompts estructurados en un PDF.

## 📋 Descripción

Este sistema toma un PDF con prompts organizados y:
1. **Extrae** 16 prompts de imagen y 16 prompts de video
2. **Genera** 16 imágenes de alta calidad usando OpenAI DALL-E 3
3. **Crea** 16 videos usando las imágenes generadas y los prompts de video
4. **Utiliza** 4 imágenes de referencia para mantener consistencia visual

## 🚀 Instalación Rápida

### 1. Instalar dependencias

Las dependencias ya están instaladas. Si necesitas reinstalar:

```bash
npm install
```

### 2. Configurar API Keys

Copia el archivo de ejemplo y añade tus keys:

```bash
cp .env.example .env
```

Edita `.env` y añade tus claves:

```env
OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxxxxxxxxxx
VIDEO_PROVIDER=replicate
VIDEO_API_KEY=r8_xxxxxxxxxxxxxxxxxxxxx
```

#### Obtener API Keys:

- **OpenAI**: https://platform.openai.com/api-keys
- **Replicate**: https://replicate.com/account/api-tokens
- **Runway ML**: https://runwayml.com/ (en la sección Account/API)

### 3. Preparar tus archivos

#### Estructura de carpetas:

```
input/
├── tu_guion.pdf          # Tu PDF con los prompts
└── references/           # 4 imágenes de referencia
    ├── ref1.jpg
    ├── ref2.jpg
    ├── ref3.jpg
    └── ref4.jpg
```

## 📝 Formato del PDF

Tu PDF debe tener este formato:

```
Imagen 1:
Un caballero medieval caminando por un bosque oscuro,
atmósfera misteriosa, estilo cinematográfico.

Video 1:
El caballero camina lentamente, las hojas se mueven con el viento,
la cámara lo sigue desde atrás.

Imagen 2:
El mismo caballero descubre una cueva iluminada por cristales azules,
luz mágica, alta calidad.

Video 2:
El caballero se acerca a la cueva con cautela, los cristales brillan
más intensamente, movimiento suave de cámara.

[... continuar hasta Imagen 16 / Video 16]
```

### Reglas importantes:

- ✅ Usa "Imagen 1:", "Imagen 2:", etc.
- ✅ Usa "Video 1:", "Video 2:", etc.
- ✅ Los números deben estar en orden (1-16)
- ✅ Cada prompt puede tener varias líneas
- ✅ Deja línea en blanco entre prompts

### Variaciones aceptadas:

El sistema también reconoce:
- "Prompt Imagen 1:"
- "Image 1:"
- "Prompt Video 1:"
- "Video Prompt 1:"

## 🎯 Uso

### Ejecutar el generador completo:

```bash
node src/main.js
```

El proceso:
1. Lee tu PDF de `./input/`
2. Extrae los prompts
3. Genera 16 imágenes (tarda ~5-10 min)
4. Genera 16 videos (tarda ~1-2 horas)
5. Guarda todo en `./output/`

### Salida:

```
output/
├── images/
│   ├── scene_01.png
│   ├── scene_02.png
│   └── ... (16 imágenes)
├── videos/
│   ├── video_01.mp4
│   ├── video_02.mp4
│   └── ... (16 videos)
└── manifest.json          # Resumen completo
```

## 💰 Costos Estimados

### OpenAI DALL-E 3 (Imágenes):
- Resolución: 1792x1024 (HD, horizontal)
- Precio: ~$0.08 USD por imagen
- **Total 16 imágenes: ~$1.28 USD**

### Replicate (Videos):
- Modelo: Stable Video Diffusion
- Precio: ~$0.01-0.05 USD por video (4 segundos)
- **Total 16 videos: ~$0.16-0.80 USD**

### Runway ML (Videos):
- Gen-2: ~$0.05 por segundo
- 4 segundos × 16 videos = ~$3.20 USD

### Total estimado: **$1.50 - $5.00 USD**

## ⚙️ Proveedores de Video

### 1. Replicate (Recomendado para empezar)

**Pros:**
- ✅ Fácil de usar
- ✅ Económico
- ✅ No requiere aprobación previa

**Contras:**
- ⚠️ Calidad media
- ⚠️ Videos cortos (4 segundos)

**Configuración:**
```env
VIDEO_PROVIDER=replicate
VIDEO_API_KEY=r8_xxxxx
```

### 2. Runway ML (Mejor calidad)

**Pros:**
- ✅ Alta calidad
- ✅ Control de duración
- ✅ Movimientos más naturales

**Contras:**
- ⚠️ Más caro
- ⚠️ Requiere cuenta verificada

**Configuración:**
```env
VIDEO_PROVIDER=runway
VIDEO_API_KEY=tu_runway_key
```

### 3. Stability AI (Alternativa)

**Nota:** Requiere implementación adicional.

## 🎨 Imágenes de Referencia

Las imágenes de referencia ayudan a mantener consistencia visual:

1. Coloca hasta 4 imágenes en `./input/references/`
2. Formatos: JPG, PNG, WEBP
3. Recomendado: imágenes del estilo visual que deseas

**Ejemplos de referencias:**
- Paleta de colores específica
- Estilo artístico (anime, realista, etc.)
- Iluminación y atmósfera
- Diseño de personajes

## 🔧 Solución de Problemas

### Error: "OPENAI_API_KEY no está configurada"

```bash
# Asegúrate de tener el archivo .env
cp .env.example .env
# Edita .env y añade tu key
```

### Error: "No se encontró ningún PDF"

```bash
# Crea la carpeta y añade tu PDF
mkdir -p input
cp tu_guion.pdf input/
```

### Error: Rate limit de OpenAI

El sistema incluye pausas automáticas de 3 segundos entre generaciones.
Si aún tienes problemas:
1. Espera unos minutos
2. Verifica tu límite de uso en OpenAI
3. Considera actualizar tu plan de OpenAI

### Videos con errores

Si algunos videos fallan:
1. Revisa el archivo `output/manifest.json`
2. El sistema continúa aunque fallen algunos
3. Puedes regenerar solo los fallidos editando `main.js`

## 📊 Monitoreo del Proceso

El script muestra progreso en tiempo real:

```
═══════════════════════════════════════════════════════
PASO 2: GENERANDO IMÁGENES CON DALL-E 3
═══════════════════════════════════════════════════════

🎨 Generando imagen 1/16...
   Prompt: Un caballero medieval caminando por...
   ✅ Imagen guardada: scene_01.png
   ⏳ Esperando 3 segundos antes de la siguiente generación...

🎨 Generando imagen 2/16...
   ...
```

## 📁 Estructura del Proyecto

```
Las-Cronicas-Malditas/
├── src/
│   ├── main.js                    # Script principal
│   ├── generators/
│   │   ├── imageGenerator.js      # Generador de imágenes
│   │   └── videoGenerator.js      # Generador de videos
│   └── utils/
│       └── pdfExtractor.js        # Extractor de PDF
├── input/
│   ├── tu_guion.pdf
│   └── references/
├── output/
│   ├── images/
│   ├── videos/
│   └── manifest.json
├── .env                           # TUS API KEYS (no commitear)
├── .env.example                   # Plantilla de configuración
└── GENERATOR_README.md            # Esta documentación
```

## 🚀 Ejemplo Completo

### 1. Preparar proyecto:

```bash
# Copiar configuración
cp .env.example .env

# Editar y añadir tus keys
nano .env

# Crear carpetas
mkdir -p input/references output
```

### 2. Añadir archivos:

```bash
# Copiar tu PDF
cp ~/Downloads/mi_guion.pdf input/

# Copiar referencias (opcional)
cp ~/Referencias/*.jpg input/references/
```

### 3. Ejecutar:

```bash
node src/main.js
```

### 4. Revisar resultados:

```bash
# Ver imágenes generadas
ls output/images/

# Ver videos generados
ls output/videos/

# Ver resumen
cat output/manifest.json
```

## 🎬 Siguiente Paso: Edición

Una vez generados los videos individuales, puedes:

1. **Unir todos los videos:**
```bash
# Usando FFmpeg
ffmpeg -f concat -i lista.txt -c copy video_final.mp4
```

2. **Añadir música:**
```bash
ffmpeg -i video_final.mp4 -i musica.mp3 -c copy -map 0:v:0 -map 1:a:0 -shortest final_con_musica.mp4
```

3. **Añadir transiciones:** Usa software de edición como:
   - DaVinci Resolve (gratis)
   - Adobe Premiere Pro
   - Final Cut Pro

## 💡 Tips y Mejores Prácticas

### Escribir buenos prompts de imagen:

✅ **Bueno:**
```
Un astronauta flotando en el espacio profundo, estrellas brillantes
en el fondo, nebulosa púrpura, iluminación cinematográfica,
alta calidad, 8k, estilo realista fotográfico
```

❌ **Malo:**
```
astronauta espacio
```

### Escribir buenos prompts de video:

✅ **Bueno:**
```
El astronauta flota lentamente hacia la derecha, su visor refleja
las estrellas, movimiento suave y fluido, la cámara hace zoom in gradual
```

❌ **Malo:**
```
se mueve
```

### Consistencia visual:

1. Menciona los mismos elementos en prompts consecutivos
2. Usa las mismas palabras clave de estilo
3. Mantén la iluminación consistente
4. Usa referencias visuales de calidad

## 🆘 Soporte

Si tienes problemas:

1. Revisa este README completo
2. Verifica tus API keys en `.env`
3. Comprueba el formato de tu PDF
4. Revisa los logs del proceso
5. Consulta `output/manifest.json` para detalles

## 📜 Licencia

Este proyecto es parte de Las Crónicas Malditas.

## 🎉 ¡Listo!

Ahora tienes todo lo necesario para generar tus videos.

**Comando final:**
```bash
node src/main.js
```

¡Que disfrutes creando tus videos! 🎬✨
