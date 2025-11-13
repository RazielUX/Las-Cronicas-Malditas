# 📺 ¿DÓNDE VER MIS VIDEOS Y RESULTADOS?

## 🎬 Ubicación de los Videos

Después de ejecutar `npm run generate`, todos tus archivos estarán en:

```
Las-Cronicas-Malditas/
└── output/
    ├── images/           ← 🖼️  Aquí están tus 16 IMÁGENES
    │   ├── scene_01.png
    │   ├── scene_02.png
    │   ├── scene_03.png
    │   └── ... (hasta scene_16.png)
    │
    ├── videos/           ← 🎬 Aquí están tus 16 VIDEOS
    │   ├── video_01.mp4
    │   ├── video_02.mp4
    │   ├── video_03.mp4
    │   └── ... (hasta video_16.mp4)
    │
    └── manifest.json     ← 📋 Resumen completo de todo
```

## 🔍 Cómo Ver los Archivos

### En Windows:

```bash
# Ver la carpeta de imágenes
explorer output\images

# Ver la carpeta de videos
explorer output\videos
```

### En Mac:

```bash
# Ver la carpeta de imágenes
open output/images

# Ver la carpeta de videos
open output/videos
```

### En Linux:

```bash
# Ver la carpeta de imágenes
xdg-open output/images

# Ver la carpeta de videos
xdg-open output/videos
```

### Desde tu terminal (listar):

```bash
# Ver lista de imágenes
ls -lh output/images/

# Ver lista de videos
ls -lh output/videos/
```

## 📱 Formato de los Archivos

### ✅ FORMATO VERTICAL (9:16)
- **Imágenes**: 1024x1792 píxeles (vertical)
- **Videos**: Formato vertical tipo Instagram Stories / TikTok / YouTube Shorts
- **Perfectos para**: Redes sociales verticales

### 📄 Archivos:
- **Imágenes**: PNG de alta calidad
- **Videos**: MP4 (compatible con todo)

## 🎥 Cómo Ver los Videos

### Opción 1: Explorador de archivos
1. Abre la carpeta `output/videos/`
2. Haz doble clic en cualquier video
3. Se abrirá con tu reproductor predeterminado

### Opción 2: VLC (recomendado)
1. Descarga VLC si no lo tienes: https://www.videolan.org/
2. Arrastra los videos a VLC
3. Reproduce y disfruta

### Opción 3: En el navegador
1. Arrastra el archivo MP4 a tu navegador
2. Se reproducirá directamente

## 📊 Ver el Resumen Completo

El archivo `manifest.json` contiene toda la información:

```bash
# Ver el contenido
cat output/manifest.json

# O abrirlo en tu editor
code output/manifest.json    # VS Code
nano output/manifest.json    # Terminal
```

El manifest incluye:
- ✅ Qué imágenes se generaron exitosamente
- ✅ Qué videos se crearon
- ✅ Costos estimados
- ✅ Prompts usados para cada escena
- ✅ Timestamp de generación

## 🔗 Compartir tus Videos

### Copiar a otro lugar:

```bash
# Copiar todos los videos a tu carpeta de descargas
cp output/videos/*.mp4 ~/Downloads/

# Copiar a una carpeta específica
cp output/videos/*.mp4 /ruta/a/tu/carpeta/
```

### Subir a redes sociales:

Los videos están optimizados para:
- 📱 Instagram Stories
- 📱 TikTok
- 📱 YouTube Shorts
- 📱 Facebook Stories

Solo:
1. Abre la app
2. Selecciona "subir video"
3. Navega a `output/videos/`
4. Selecciona el video
5. ¡Publica!

## 🎬 Editar o Combinar Videos

### Unir todos en uno solo:

```bash
# Crear lista de videos
cd output/videos
for f in video_*.mp4; do echo "file '$f'" >> lista.txt; done

# Unirlos con FFmpeg
ffmpeg -f concat -safe 0 -i lista.txt -c copy video_completo.mp4
```

### Añadir música:

```bash
ffmpeg -i video_completo.mp4 -i tu_musica.mp3 -c:v copy -c:a aac -shortest video_final.mp4
```

### Apps de edición recomendadas:

**Gratis:**
- DaVinci Resolve (Windows/Mac/Linux)
- CapCut (muy fácil, ideal para redes)
- Shotcut

**De pago:**
- Adobe Premiere Pro
- Final Cut Pro (Mac)

## 📈 Verificar el Progreso Durante la Generación

Mientras el sistema corre, verás mensajes como:

```
🎨 Generando imagen 5/16...
   ✅ Imagen guardada: scene_05.png

🎬 Generando video 3/16...
   ⏳ Procesando video (ID: abc123)...
   ✅ Video guardado: video_03.mp4
```

Puedes ir viendo los archivos conforme se crean:

```bash
# Ver cuántas imágenes se han generado
ls output/images/ | wc -l

# Ver cuántos videos se han generado
ls output/videos/ | wc -l

# Ver el tamaño total
du -sh output/
```

## ⚠️ Si no ves la carpeta `output/`

La carpeta se crea automáticamente al ejecutar el script.

Si no existe todavía:
```bash
# El script la creará, pero puedes crearla manualmente
mkdir -p output/images output/videos
```

## 💾 Hacer Backup de tus Videos

### Recomendado: Hacer copia de seguridad

```bash
# Comprimir todo
zip -r mis_videos_$(date +%Y%m%d).zip output/

# O con tar
tar -czf mis_videos_$(date +%Y%m%d).tar.gz output/
```

Luego guarda el archivo .zip o .tar.gz en:
- Google Drive
- Dropbox
- Disco externo
- Otra ubicación segura

## 🎉 ¡Eso es todo!

Tus videos estarán esperándote en:
```
📁 output/videos/
```

¡Listos para ver, compartir y disfrutar! 🚀
