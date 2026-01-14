# 🚀 Inicio Rápido - Generador de Videos

## ✅ FORMATO VERTICAL (9:16) - Ideal para TikTok/Instagram/Shorts
## ✅ TODO CON OPENAI - DALL-E 3 + Sora

---

## 🎉 ¡YA ESTÁ CONFIGURADO!

Tu API key de OpenAI ya está lista. No necesitas nada más.

- ✅ **Imágenes**: DALL-E 3 (1024x1792 vertical)
- ✅ **Videos**: Sora (8 segundos, vertical 9:16)
- ✅ **Una sola API key** para todo

---

## 📝 En 3 pasos:

### 1️⃣ Preparar tu PDF

Crea un documento con este formato:

```
Imagen 1:
Un castillo gótico en la montaña, niebla, luna llena...

Video 1:
La cámara se acerca al castillo, la niebla se mueve...

Imagen 2:
Interior de biblioteca antigua...

Video 2:
Las velas parpadean...

[... hasta Imagen 16 / Video 16]
```

📄 Ver `EJEMPLO_FORMATO_PDF.txt` para un ejemplo completo.

### 2️⃣ Colocar archivos

```bash
# Tu PDF
cp tu_guion.pdf input/

# Referencias (opcional pero recomendado)
cp ref1.jpg ref2.jpg ref3.jpg ref4.jpg input/references/
```

### 3️⃣ Ejecutar

```bash
npm run generate
```

O directamente:
```bash
node src/main.js
```

---

## 🎬 ¿DÓNDE VER MIS VIDEOS?

Tus videos estarán en:

```
output/
├── images/
│   ├── scene_01.png    ← 🖼️ Tus 16 imágenes (1024x1792 vertical)
│   ├── scene_02.png
│   └── ...
├── videos/
│   ├── video_01.mp4    ← 🎥 Tus 16 videos (8 seg, vertical 9:16)
│   ├── video_02.mp4
│   └── ...
└── manifest.json       ← 📋 Resumen completo
```

### Ver los archivos:

**Windows:**
```bash
explorer output\videos
```

**Mac:**
```bash
open output/videos
```

**Linux:**
```bash
xdg-open output/videos
```

**📖 Guía completa:** Ver `DONDE_VER_RESULTADOS.md`

---

## 💰 Costos

Con OpenAI (DALL-E 3 + Sora):

- **16 imágenes DALL-E 3**: ~$1.28 USD
- **16 videos Sora (8 seg)**: ~$5.12 USD
- **Total**: ~**$6.40 USD** por proyecto completo

Mucho mejor que usar múltiples APIs. Todo en un solo lugar.

---

## ⏱️ Tiempos

- ⚡ Extracción del PDF: Instantáneo
- 🎨 Generación de 16 imágenes: ~10 minutos
- 🎬 Generación de 16 videos: ~30-60 minutos
- **Total**: ~1 hora automático

---

## ✅ Checklist antes de ejecutar

- [x] Archivo `.env` con tu API key de OpenAI ✅ **YA ESTÁ**
- [ ] PDF en `./input/` con formato correcto
- [ ] (Opcional) 4 imágenes de referencia en `./input/references/`
- [ ] Suficiente crédito en OpenAI (~$7 USD)
- [ ] Conexión a internet estable

---

## 🆘 Si tienes problemas

**El PDF no se detecta:**
```bash
ls input/  # Verifica que tu PDF está ahí
```

**Error de API:**
- Verifica que tienes crédito en OpenAI
- Revisa tu API key en https://platform.openai.com/api-keys

**Los prompts no se extraen:**
- Usa exactamente: "Imagen 1:", "Video 1:", etc.
- Números consecutivos del 1 al 16

---

¡Listo para generar! 🎬

```bash
npm run generate
```
