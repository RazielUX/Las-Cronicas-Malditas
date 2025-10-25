// Inserta/usa este snippet en el <script> de tu index.html (en lugar de hacer llamadas directas a la YouTube Data API desde el navegador).
// Llama a /api/videos para obtener la lista de videoIds.

async function fetchVideosFromServer() {
  try {
    const resp = await fetch('/api/videos');
    if (!resp.ok) {
      throw new Error('No se pudieron cargar los videos desde el servidor');
    }
    const data = await resp.json();
    // channelVideoIds es la lista que ya usa tu script
    channelVideoIds = (data.videoIds || []).filter(Boolean);
    console.log('Videos cargados desde servidor:', channelVideoIds.length);
  } catch (err) {
    console.warn('fetchVideosFromServer error:', err);
    // fallback: si quieres, puedes añadir IDs manuales en VIDEO_IDS
  }
}

// En tu flow actual, antes de reproducir haz:
await fetchVideosFromServer();
playRandomVideo();
