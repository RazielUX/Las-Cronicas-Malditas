```markdown
# Las Crónicas Malditas — Reproducción segura de vídeos del canal

Resumen
- Evita poner la API Key en el cliente.
- Usa una función serverless (Vercel / Netlify / Cloud Functions) que llame a la YouTube Data API y devuelva los IDs de vídeo a tu frontend.
- El frontend solo hace `fetch('/api/videos')` y reproduce con la IFrame API de YouTube.

Archivos de ejemplo incluidos
- /api/videos.js — función serverless para Vercel (igual idea para Netlify).
- index.html — tu página (añade el snippet `fetchVideosFromServer()` antes de llamar a playRandomVideo()).
- .gitignore — evita subir archivos de configuración privados.

Configuración — Vercel (recomendada)
1. Crea el proyecto en Vercel y apunta al repositorio.
2. En Settings → Environment Variables añade:
   - YT_API_KEY = tu_api_key_de_google_cloud
   - CHANNEL_ID = UCxxxxxx (el id de tu canal)
   - (opcionales) YOUTUBE_API_KEY, NEXT_PUBLIC_YT_API_KEY, YOUTUBE_CHANNEL_ID, NEXT_PUBLIC_CHANNEL_ID — acepta cualquiera de esos nombres.
3. Despliega. La ruta serverless estará disponible en `/api/videos`.

Configuración — Netlify
1. Crea una Netlify Function (netlify/functions/videos.js) con el código del serverless.
2. En Site settings → Build & deploy → Environment, añade YT_API_KEY y CHANNEL_ID.
3. Despliega.

Buenas prácticas y seguridad
- No publiques la API key en el repo.
- Preferible: crea un endpoint servidor que haga la llamada y devuelva solo lo necesario (IDs).
- Restringe la API key en Google Cloud Console:
  - Si la usas desde servidor: restringir por IP (si es posible).
  - Si la expones al navegador (no recomendado): restringir por HTTP referrers y limitar el uso a YouTube Data API v3.
- Considera caché en el servidor (ej. 5 minutos) para no gastar cuota.

Desarrollo local
- Pasa la API key y CHANNEL_ID como variables de entorno locales (por ejemplo, en .env y usa un pequeño servidor/función local).
- En Vercel, usa `vercel dev` y `vercel env pull` para sincronizar.

Configuraciones rápidas desde el HTML
- Si quieres evitar dependencias del endpoint mientras haces pruebas, abre `index.html` y añade IDs en el array `STATIC_VIDEO_IDS`.
- Alternativamente, antes del `<script>` principal define `window.__LASCronicasConfig = { videoIds: ['abc123'], channelId: 'UC...' }` para cargar IDs personalizados o pasar `channelId`/`maxResults` sin editar el archivo principal.
- Si estableces `window.__LASCronicasConfig.disableApi = true`, el botón CTA solo usará los IDs manuales (útil si no configurarás `/api/videos`).

Si quieres, preparo:
- 1) Un `config.example.js` para el caso en que **temporalmente** pruebes con una key en local (no commiteada).
- 2) Un comando git listo para crear el repo y subir los archivos que te mostré (si quieres que reemplace todo en la rama principal, o te doy un script para crear rama `clean-start` y push forzado).
```
