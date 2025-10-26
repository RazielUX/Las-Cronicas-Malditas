# 📊 Analytics Setup - Las Crónicas Malditas

Este documento explica cómo configurar y usar el sistema de analytics implementado en la página.

## 🎯 ¿Qué se rastrea?

El sistema rastrea los siguientes eventos:

1. **📄 Page View** - Cada vez que alguien visita la página
2. **🔘 CTA Click** - Cuando alguien hace click en "Revelar Historia"
3. **▶️ Video Play** - Cuando se reproduce un video
4. **🔄 Another Video** - Cuando hacen click en "Otra Historia"
5. **🔙 Back to Start** - Cuando regresan al inicio

## 🚀 Opción 1: Google Analytics 4 (Recomendado)

### Paso 1: Crear cuenta de Google Analytics

1. Ve a [Google Analytics](https://analytics.google.com)
2. Crea una cuenta o usa una existente
3. Crea una nueva propiedad
4. Selecciona "Web" como plataforma
5. Copia tu **Measurement ID** (formato: `G-XXXXXXXXXX`)

### Paso 2: Configurar en tu sitio

1. Abre `index.html`
2. Busca esta línea (cerca de la línea 14):
   ```html
   <script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
   ```
3. Reemplaza `G-XXXXXXXXXX` con tu ID real
4. También en la línea 19:
   ```javascript
   gtag('config', 'G-XXXXXXXXXX'); // Reemplaza con tu ID real
   ```

### Paso 3: Ver los datos

1. Ve a Google Analytics
2. Navega a **Reports > Engagement > Events**
3. Verás todos los eventos registrados:
   - `page_view` - Visitas totales
   - `cta_click` - Clicks en el botón
   - `video_play` - Reproducciones de video
   - `another_video_click` - Clicks en "Otra Historia"
   - `back_to_start_click` - Clicks en "Volver al Inicio"

### Tasa de Conversión

Para calcular la tasa de conversión:
- **Conversión = (cta_click / page_view) × 100**
- Ejemplo: 50 clicks de CTA / 200 visitas = 25% de conversión

---

## 🔧 Opción 2: API Propia (Almacenamiento Local)

Esta opción guarda los datos en un archivo JSON en tu servidor.

### Cómo funciona

- Los eventos se guardan en `analytics-data.json`
- Se calcula automáticamente un resumen con métricas clave
- No requiere servicios externos

### Endpoints disponibles

#### 1. POST /api/analytics
Registra un nuevo evento (se llama automáticamente desde el frontend)

#### 2. GET /api/analytics-stats
Consulta las estadísticas

**Ejemplo de uso:**
```bash
curl https://tu-dominio.vercel.app/api/analytics-stats
```

**Respuesta:**
```json
{
  "summary": {
    "total_page_views": 150,
    "total_cta_clicks": 45,
    "total_video_plays": 40,
    "conversion_rate": "30.00",
    "unique_visitors": 120
  },
  "recent_events": [...],
  "events_by_type": {
    "page_view": 150,
    "cta_click": 45,
    "video_play": 40
  }
}
```

### Consultar estadísticas desde navegador

Simplemente visita:
```
https://tu-dominio.vercel.app/api/analytics-stats
```

### Filtrar por fecha

```
https://tu-dominio.vercel.app/api/analytics-stats?since=2025-01-01
```

---

## ⚙️ Configuración

En `index.html`, líneas 604-605, puedes activar/desactivar cada sistema:

```javascript
const Analytics = {
    useGoogleAnalytics: true,  // Cambiar a false para desactivar GA4
    useCustomAPI: true,         // Cambiar a false para desactivar API propia
    // ...
}
```

### Opciones recomendadas:

- **Solo Google Analytics**: `useGoogleAnalytics: true`, `useCustomAPI: false`
- **Solo API propia**: `useGoogleAnalytics: false`, `useCustomAPI: true`
- **Ambos** (redundancia): `useGoogleAnalytics: true`, `useCustomAPI: true`

---

## 📈 Ver Métricas Clave

### En Google Analytics:
1. Ve a **Reports > Engagement > Events**
2. Filtra por evento específico
3. Mira las gráficas de tendencias

### En API Propia:
```bash
# Obtener resumen
curl https://tu-dominio.vercel.app/api/analytics-stats | jq '.summary'

# Ver últimos eventos
curl https://tu-dominio.vercel.app/api/analytics-stats | jq '.recent_events'
```

---

## 🎨 Dashboard Simple (Opcional)

Puedes crear una página simple para ver tus estadísticas:

```html
<!DOCTYPE html>
<html>
<head>
    <title>Dashboard - Las Crónicas Malditas</title>
</head>
<body>
    <h1>📊 Analytics Dashboard</h1>
    <div id="stats"></div>

    <script>
        fetch('/api/analytics-stats')
            .then(r => r.json())
            .then(data => {
                document.getElementById('stats').innerHTML = `
                    <h2>Resumen</h2>
                    <p>👁️ Visitas: ${data.summary.total_page_views}</p>
                    <p>🔘 Clicks en CTA: ${data.summary.total_cta_clicks}</p>
                    <p>📈 Tasa de Conversión: ${data.summary.conversion_rate}%</p>
                    <p>▶️ Videos reproducidos: ${data.summary.total_video_plays}</p>
                `;
            });
    </script>
</body>
</html>
```

---

## 🔒 Seguridad

- El archivo `analytics-data.json` está en `.gitignore` (no se sube a GitHub)
- En producción, considera usar una base de datos real
- Para proteger el endpoint `/api/analytics-stats`, agrega autenticación

---

## 🐛 Debugging

En la consola del navegador verás logs como:
```
📊 Analytics: page_view {page_title: "Las Crónicas Malditas", ...}
📊 Analytics: cta_click {button_name: "Revelar Historia", ...}
```

Si no ves estos logs, revisa que el JavaScript se esté ejecutando correctamente.

---

## 📞 Soporte

Si tienes problemas:
1. Revisa la consola del navegador (F12)
2. Verifica que tu ID de Google Analytics sea correcto
3. Asegúrate de que los endpoints `/api/analytics` y `/api/analytics-stats` funcionen

---

## 🎉 ¡Listo!

Ahora puedes saber:
- ✅ Cuánta gente visita tu página
- ✅ Cuántos hacen click en el CTA
- ✅ Tu tasa de conversión
- ✅ Qué tan exitosa es tu página

**Pro tip**: Una buena tasa de conversión para páginas de landing es 10-30%.
