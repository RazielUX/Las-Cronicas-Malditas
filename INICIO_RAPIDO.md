# 🚀 Inicio Rápido - Generador de Videos

## ✅ FORMATO VERTICAL (9:16) - Ideal para TikTok/Instagram/Shorts

## En 5 pasos:

### 1️⃣ Configurar API Keys

**¡YA ESTÁ CONFIGURADA TU API DE OPENAI!** ✅

Solo necesitas añadir la API de video:

```bash
# Edita el archivo .env
nano .env  # o usa tu editor favorito
```

Reemplaza esta línea:
```
VIDEO_API_KEY=PENDIENTE_AÑADIR_TU_KEY_AQUI
```

Con tu API key de Replicate (consíguela GRATIS en https://replicate.com/account/api-tokens)
```
VIDEO_API_KEY=r8_xxxxx
```

### 2️⃣ Preparar tu PDF

Crea un documento con este formato:

```
Imagen 1:
Tu prompt de imagen aquí...

Video 1:
Tu prompt de video aquí...

Imagen 2:
...
```

Ver `EJEMPLO_FORMATO_PDF.txt` para un ejemplo completo.

### 3️⃣ Colocar archivos

```bash
# Tu PDF
cp tu_guion.pdf input/

# Referencias (opcional)
cp ref1.jpg ref2.jpg ref3.jpg ref4.jpg input/references/
```

### 4️⃣ Ejecutar

```bash
npm run generate
```

O directamente:
```bash
node src/main.js
```

### 5️⃣ Esperar y disfrutar

- ⏱️ Imágenes: ~10 minutos
- ⏱️ Videos: ~1-2 horas
- 📁 Resultados en: `./output/`

## 🎬 ¿DÓNDE VER MIS VIDEOS?

Tus videos estarán en:

```
output/
├── images/
│   ├── scene_01.png    ← 🖼️ Tus 16 imágenes (1024x1792 vertical)
│   ├── scene_02.png
│   └── ...
├── videos/
│   ├── video_01.mp4    ← 🎥 Tus 16 videos (formato vertical)
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

## 📋 Obtener API Keys

### OpenAI (para imágenes):
1. Ve a https://platform.openai.com/api-keys
2. Crea una nueva key
3. Añade $5-10 USD de crédito
4. Copia la key a `.env`

### Replicate (para videos):
1. Ve a https://replicate.com/
2. Crea cuenta
3. Ve a Account → API Tokens
4. Copia el token a `.env`

---

## 💰 Costos

- **16 imágenes DALL-E 3**: ~$1.28 USD
- **16 videos Replicate**: ~$0.20 USD
- **Total**: ~$1.50 USD

---

## 📖 Documentación completa

Ver `GENERATOR_README.md` para la guía completa.

---

## 🆘 Ayuda Rápida

**Error: No se encuentra el PDF**
```bash
ls input/  # Verifica que tu PDF está ahí
```

**Error: API Key inválida**
```bash
cat .env  # Verifica tus keys
```

**Los prompts no se detectan**
- Usa exactamente: "Imagen 1:", "Video 1:", etc.
- Números consecutivos del 1 al 16

---

## ✅ Checklist antes de ejecutar

- [ ] Archivo `.env` creado con API keys válidas
- [ ] PDF en `./input/` con formato correcto
- [ ] (Opcional) 4 imágenes de referencia en `./input/references/`
- [ ] Suficiente crédito en OpenAI (~$2 USD)
- [ ] Conexión a internet estable

---

¡Listo para generar! 🎬

```bash
npm run generate
```
