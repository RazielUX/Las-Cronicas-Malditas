# 🚀 Configuración de Google Analytics 4 - Guía Paso a Paso

## Paso 1: Crear Cuenta de Google Analytics

### 1.1 Acceder a Google Analytics
1. Ve a [https://analytics.google.com](https://analytics.google.com)
2. Inicia sesión con tu cuenta de Google
3. Si es tu primera vez, verás un botón **"Empezar a medir"** o **"Start measuring"**

### 1.2 Crear una cuenta
1. Click en **"Empezar a medir"**
2. **Nombre de la cuenta**: `Las Cronicas Malditas` (o el nombre que prefieras)
3. Marca todas las casillas de verificación de intercambio de datos (opcional pero recomendado)
4. Click en **"Siguiente"**

---

## Paso 2: Crear una Propiedad

### 2.1 Configurar la propiedad
1. **Nombre de la propiedad**: `Las Cronicas Malditas Web`
2. **Zona horaria**: Selecciona tu zona horaria
3. **Moneda**: Selecciona tu moneda (USD, EUR, etc.)
4. Click en **"Siguiente"**

### 2.2 Información del negocio
1. **Sector**: Selecciona "Arts & Entertainment" o "Online Communities"
2. **Tamaño de la empresa**: Selecciona el que corresponda (puedes poner "Small" si es personal)
3. **Uso de Google Analytics**: Marca las opciones que te interesen
4. Click en **"Crear"**
5. Acepta los Términos de Servicio

---

## Paso 3: Configurar Recopilación de Datos

### 3.1 Seleccionar plataforma
1. Verás "Configurar una secuencia de datos"
2. Selecciona **"Web"** (el icono del navegador)

### 3.2 Configurar la secuencia
1. **URL del sitio web**:
   - Si ya tienes el dominio: `https://tu-dominio.com`
   - Si estás en Vercel: `https://tu-proyecto.vercel.app`
   - Si no lo sabes aún, pon cualquier URL (lo puedes cambiar después)

2. **Nombre de la secuencia**: `Las Cronicas Malditas`

3. ✅ Marca **"Activar las mediciones mejoradas"** (MUY IMPORTANTE)
   - Esto activa el seguimiento automático de:
     - Vistas de página
     - Desplazamientos
     - Clics en enlaces salientes
     - Búsquedas en el sitio
     - Interacciones con videos
     - Descargas de archivos

4. Click en **"Crear secuencia"**

---

## Paso 4: Obtener tu ID de Medición

### 4.1 Copiar el ID
1. Después de crear la secuencia, verás una pantalla con código
2. En la parte superior verás tu **ID de medición**: `G-XXXXXXXXXX`
3. **¡COPIA ESTE ID!** Lo necesitarás en el siguiente paso

**Ejemplo de cómo se ve:**
```
ID de medición
G-ABC123XYZ4
```

Si cierras esta pantalla:
1. Ve a **Admin** (⚙️ esquina inferior izquierda)
2. En la columna de **Propiedad**, click en **"Secuencias de datos"**
3. Click en tu secuencia web
4. Ahí verás tu **ID de medición**

---

## Paso 5: Configurar en tu Sitio Web

### 5.1 Actualizar index.html

Ahora necesitas poner tu ID real en el código:

1. Abre tu proyecto en tu editor de código
2. Abre el archivo `index.html`
3. Busca la **línea 14** (cerca del inicio, en el `<head>`)

**ANTES (línea 14):**
```html
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
```

**DESPUÉS (reemplaza G-XXXXXXXXXX con tu ID real):**
```html
<script async src="https://www.googletagmanager.com/gtag/js?id=G-ABC123XYZ4"></script>
```

4. Ahora busca la **línea 19**

**ANTES (línea 19):**
```javascript
gtag('config', 'G-XXXXXXXXXX'); // Reemplaza con tu ID real
```

**DESPUÉS:**
```javascript
gtag('config', 'G-ABC123XYZ4'); // Tu ID real
```

### 5.2 Guardar y Desplegar

1. Guarda los cambios en `index.html`
2. Haz commit y push:
   ```bash
   git add index.html
   git commit -m "feat: configurar Google Analytics con ID real"
   git push
   ```
3. Vercel desplegará automáticamente la nueva versión

---

## Paso 6: Verificar que Funciona

### 6.1 Prueba en tiempo real
1. Ve a Google Analytics
2. En el menú de la izquierda, click en **"Informes"** → **"Tiempo real"**
3. Abre tu sitio web en otra pestaña
4. En Google Analytics deberías ver **"1 usuario activo en este momento"**
5. Haz click en el botón CTA de tu sitio
6. En GA4 deberías ver el evento `cta_click` aparecer

### 6.2 Probar eventos
En tu sitio web, abre la consola del navegador (F12) y verás logs como:
```
📊 Analytics: page_view {page_title: "Las Crónicas Malditas", ...}
📊 Analytics: cta_click {button_name: "Revelar Historia", ...}
```

Si ves estos logs, ¡todo está funcionando!

---

## Paso 7: Ver tus Datos

### En 24-48 horas:
Los datos completos empezarán a aparecer en:

1. **Informes → Adquisición → Visión general del tráfico**
   - Verás de dónde viene tu tráfico

2. **Informes → Interacción → Eventos**
   - Aquí verás TODOS tus eventos:
     - `page_view` - Visitas totales
     - `cta_click` - Clicks en el botón
     - `video_play` - Videos reproducidos
     - `another_video_click` - Clicks en "Otra Historia"
     - `back_to_start_click` - Clicks en "Volver al Inicio"

3. **Explorar → Crear nueva exploración**
   - Para hacer análisis personalizados

---

## 📊 Cómo Calcular tu Tasa de Conversión

### En Google Analytics:

1. Ve a **Informes → Interacción → Eventos**
2. Busca `page_view` - Anota el número de eventos (ej: 200)
3. Busca `cta_click` - Anota el número de eventos (ej: 50)
4. Calcula: **(50 / 200) × 100 = 25% de conversión**

### ¿Es buena mi conversión?

- **Menos de 10%**: Hay que mejorar el diseño o el mensaje
- **10-20%**: Aceptable
- **20-30%**: ¡Muy bien!
- **Más de 30%**: ¡Excelente! 🎉

---

## 🎯 Eventos Configurados

Ya tienes estos eventos funcionando automáticamente:

| Nombre del Evento | Qué Mide | Parámetros Adicionales |
|-------------------|----------|------------------------|
| `page_view` | Cada visita a tu página | `page_title`, `page_location`, `page_path` |
| `cta_click` | Clicks en "Revelar Historia" | `button_name`, `button_location` |
| `video_play` | Cuando se reproduce un video | `video_id`, `video_source` |
| `another_video_click` | Clicks en "Otra Historia" | `button_name` |
| `back_to_start_click` | Clicks en "Volver al Inicio" | `button_name` |

---

## 🔧 Personalización Avanzada (Opcional)

### Crear un Informe Personalizado

1. Ve a **Explorar** en el menú izquierdo
2. Click en **"Crear nueva exploración"**
3. Selecciona **"Exploración de forma libre"**
4. Configura:
   - **Dimensiones**: Añade `Event name`
   - **Métricas**: Añade `Event count`
   - **Filas**: Arrastra `Event name`
   - **Valores**: Arrastra `Event count`

¡Ahora verás un resumen bonito de todos tus eventos!

### Crear un Panel de Tasa de Conversión

1. En **Explorar**, crea una nueva exploración
2. Añade una métrica calculada:
   - Click en "+" junto a Métricas
   - Nombre: `Tasa de Conversión`
   - Fórmula: `(count(cta_click) / count(page_view)) * 100`

---

## 🐛 Solución de Problemas

### No veo datos en Tiempo Real

**Posibles causas:**
1. ✅ Verifica que tu ID sea correcto en líneas 14 y 19
2. ✅ Asegúrate de haber desplegado los cambios a Vercel
3. ✅ Revisa la consola del navegador (F12) para errores
4. ✅ Verifica que no tengas bloqueadores de anuncios activos

### Los eventos no aparecen

1. Abre la consola del navegador (F12)
2. Deberías ver logs con 📊
3. Si no los ves, revisa que el código JavaScript no tenga errores

### Aparece "gtag is not defined"

Esto significa que el script de Google Analytics no cargó:
1. Verifica que la línea 14 tenga tu ID correcto
2. Verifica que no tengas bloqueadores de anuncios
3. Intenta en modo incógnito

---

## 📱 App Móvil de Google Analytics

Para ver tus datos desde el móvil:

1. Descarga **Google Analytics** desde:
   - [App Store (iOS)](https://apps.apple.com/app/google-analytics/id881599038)
   - [Google Play (Android)](https://play.google.com/store/apps/details?id=com.google.android.apps.giant)

2. Inicia sesión con tu cuenta
3. ¡Revisa tus estadísticas en tiempo real! 📊

---

## ✅ Checklist Final

Marca cuando completes cada paso:

- [ ] Creé mi cuenta de Google Analytics
- [ ] Creé una propiedad
- [ ] Copié mi ID de medición (G-XXXXXXXXXX)
- [ ] Actualicé la línea 14 de index.html con mi ID
- [ ] Actualicé la línea 19 de index.html con mi ID
- [ ] Hice commit y push de los cambios
- [ ] Verifiqué en "Tiempo Real" que funciona
- [ ] Vi aparecer los eventos al hacer click en el CTA
- [ ] Descargué la app móvil (opcional)

---

## 🎉 ¡Listo!

Ya tienes Google Analytics configurado. En 24-48 horas empezarás a ver datos completos y gráficas bonitas.

**Próximos pasos:**
1. Comparte tu URL con amigos/redes sociales
2. Revisa las estadísticas cada día
3. Optimiza tu página según los datos que veas

**¿Necesitas ayuda?**
Si tienes problemas, revisa la sección de "Solución de Problemas" arriba.

---

**Fecha de actualización**: Enero 2025
**Versión de Google Analytics**: GA4
