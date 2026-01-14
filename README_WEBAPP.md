# 🎬 Generador de Videos IA - Web App

**Aplicación web Next.js para generar videos verticales desde PDF usando DALL-E 3 y Sora**

## ✨ Características

### 📤 Subida de Archivos
- **PDF** con 16 prompts de imagen + 16 prompts de video
- **4 imágenes de referencia** (opcional) para consistencia visual

### 🎯 Dos Modos de Generación

#### 1️⃣ Modo Masivo
- Genera automáticamente las 16 escenas completas
- Primero crea todas las imágenes
- Luego genera todos los videos
- Barra de progreso en tiempo real
- ⏱️ Tiempo: ~1-2 horas
- 💰 Costo: ~$6.40 USD

#### 2️⃣ Modo Individual
- Control total sobre cada escena
- Genera imagen → Revisa → Rehacer si no te gusta → Genera video
- Descarga individual de cada archivo
- Perfecto para ajustar resultados

### 🎨 Especificaciones
- **Imágenes**: DALL-E 3, 1024x1792 (vertical), HD
- **Videos**: Sora, 8 segundos, 9:16 (vertical), 24 fps
- **Formato**: Optimizado para Instagram Stories, TikTok, YouTube Shorts

---

## 🚀 Instalación y Deployment

### 1. Instalar dependencias

```bash
npm install
```

### 2. Configurar variables de entorno

Crea un archivo `.env.local`:

```bash
OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxxxxxxxxxx
```

### 3. Ejecutar en desarrollo

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000)

### 4. Deployar en Vercel

#### Opción A: Desde GitHub (Recomendado)

1. Push tu código a GitHub
2. Ve a [vercel.com](https://vercel.com)
3. Click en "New Project"
4. Importa tu repositorio
5. Añade la variable de entorno:
   - `OPENAI_API_KEY`: Tu API key de OpenAI
6. Click en "Deploy"

#### Opción B: Desde CLI

```bash
npm install -g vercel
vercel
```

Sigue las instrucciones y añade tu `OPENAI_API_KEY` cuando te lo pida.

---

## 📝 Formato del PDF

Tu PDF debe seguir este formato:

```
Imagen 1:
Un dragón dorado volando sobre montañas nevadas al atardecer,
cielo púrpura y naranja, nubes dramáticas, estilo épico.

Video 1:
El dragón bate sus alas majestuosamente, las nubes se mueven,
luz dorada del atardecer, movimiento fluido.

Imagen 2:
Bosque encantado con árboles bioluminiscentes azules...

Video 2:
Las luces bioluminiscentes parpadean suavemente...

[... continuar hasta Imagen 16 / Video 16]
```

**Ver `EJEMPLO_FORMATO_PDF.txt` para un ejemplo completo.**

---

## 💻 Uso de la Web App

### Paso 1: Subir archivos
1. Click en "Subir PDF"
2. Selecciona tu PDF con los prompts
3. (Opcional) Sube hasta 4 imágenes de referencia

### Paso 2: Elegir modo

#### Modo Masivo (Automático):
1. Click en "Generar Todo Automáticamente"
2. Espera ~1-2 horas
3. Descarga todos los archivos cuando termine

#### Modo Individual (Manual):
1. Navega a cualquier escena (1-16)
2. Click en "Generar Imagen"
3. Revisa el resultado
4. Si no te gusta: "Rehacer Imagen"
5. Si te gusta: "Generar Video (8 seg)"
6. Descarga imagen y video

### Paso 3: Descargar resultados
- Click en "Descargar Imagen" o "Descargar Video" en cada tarjeta
- Los archivos se descargan directamente al navegador

---

## 🏗️ Estructura del Proyecto

```
Las-Cronicas-Malditas/
├── app/
│   ├── api/
│   │   ├── extract-pdf/route.ts      # API: Extrae prompts del PDF
│   │   ├── generate-image/route.ts   # API: Genera imágenes con DALL-E 3
│   │   └── generate-video/route.ts   # API: Genera videos con Sora
│   ├── globals.css                    # Estilos globales (Tailwind)
│   ├── layout.tsx                     # Layout principal
│   └── page.tsx                       # Página principal
├── components/
│   ├── FileUploader.tsx              # Componente de subida de archivos
│   ├── MassiveMode.tsx               # Componente de modo masivo
│   └── SceneCard.tsx                 # Tarjeta de escena individual
├── store/
│   └── videoStore.ts                 # Estado global (Zustand)
├── lib/                              # Utilidades
├── public/                           # Archivos estáticos
├── src/                              # Generador CLI (legacy)
├── next.config.js                    # Configuración de Next.js
├── tailwind.config.js                # Configuración de Tailwind
└── package.json                      # Dependencias
```

---

## 🔧 Tecnologías Usadas

- **Next.js 14** - Framework React con App Router
- **TypeScript** - Tipado estático
- **Tailwind CSS** - Estilos
- **Zustand** - Gestión de estado
- **OpenAI SDK** - DALL-E 3 + Sora
- **pdf-parse** - Extracción de PDF
- **Lucide React** - Iconos

---

## 💰 Costos

### Por proyecto completo (16 escenas):
- **16 imágenes DALL-E 3 (1024x1792 HD)**: ~$1.28 USD ($0.08/imagen)
- **16 videos Sora (8 segundos, vertical)**: ~$5.12 USD ($0.32/video)
- **Total**: ~**$6.40 USD**

### Por escena individual:
- **1 imagen**: ~$0.08 USD
- **1 video**: ~$0.32 USD
- **Total por escena**: ~$0.40 USD

---

## ⚠️ Limitaciones Actuales

### Sora (API de Video)
- **Actualmente en beta limitada**
- Puede no estar disponible para todas las cuentas de OpenAI
- Si no está disponible, la app mostrará un mensaje de error
- Cuando Sora esté disponible públicamente, funcionará automáticamente

### Soluciones temporales:
1. **Usar solo generación de imágenes** hasta que Sora esté disponible
2. **Animar las imágenes** con herramientas externas
3. **Esperar** al lanzamiento público de Sora

---

## 🐛 Solución de Problemas

### Error: "OPENAI_API_KEY no configurada"
- Añade la variable de entorno en Vercel:
  1. Settings → Environment Variables
  2. Añade `OPENAI_API_KEY` con tu key
  3. Redeploy el proyecto

### Error: "No se encontró el PDF"
- Verifica que tu PDF tiene el formato correcto
- Revisa que las secciones estén etiquetadas como "Imagen 1:", "Video 1:", etc.

### Error: "Sora aún no disponible"
- Sora está en beta limitada
- Por ahora, usa solo la generación de imágenes
- Los videos se habilitarán automáticamente cuando Sora esté disponible

### Las imágenes no se generan
- Verifica tu saldo en OpenAI: https://platform.openai.com/usage
- Revisa los logs en Vercel: Project → Deployments → [latest] → Logs

---

## 📊 Variables de Entorno

Configura estas variables en Vercel:

```bash
# Requerida
OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxxxxxxxxxx

# Opcionales (con valores por defecto)
NEXT_PUBLIC_MAX_SCENES=16
NEXT_PUBLIC_IMAGE_SIZE=1024x1792
NEXT_PUBLIC_VIDEO_DURATION=8
```

---

## 🎯 Próximas Mejoras

- [ ] Soporte para más de 16 escenas
- [ ] Edición de prompts antes de generar
- [ ] Previsualización de videos
- [ ] Exportación masiva (ZIP)
- [ ] Plantillas de prompts
- [ ] Historial de proyectos
- [ ] Integración con otros modelos de video

---

## 📞 Soporte

Si tienes problemas:

1. Revisa la consola del navegador (F12)
2. Revisa los logs de Vercel
3. Verifica tu API key de OpenAI
4. Asegúrate de tener crédito suficiente en OpenAI

---

## 📜 Licencia

Este proyecto es parte de **Las Crónicas Malditas**.

---

## 🎉 ¡Listo!

Tu aplicación web está lista para:

1. **Desarrollo**: `npm run dev`
2. **Producción**: Deploy en Vercel
3. **Generación**: Sube PDF y genera videos

**¡Disfruta creando tus videos con IA!** 🚀✨
