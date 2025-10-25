module.exports = async function handler(req, res) {
  try {
    const YT_KEY = process.env.YT_API_KEY || '';
    const CHANNEL_ID = process.env.CHANNEL_ID || '';
    const maxResults = req.query.maxResults || 50;

    if (!YT_KEY || !CHANNEL_ID) {
      res.status(500).json({ error: 'Missing env variables', details: { YT_KEY_present: !!YT_KEY, CHANNEL_ID_present: !!CHANNEL_ID } });
      return;
    }

    const url =
      `https://www.googleapis.com/youtube/v3/search?` +
      `key=${encodeURIComponent(YT_KEY)}` +
      `&channelId=${encodeURIComponent(CHANNEL_ID)}` +
      `&part=id&order=date&maxResults=${encodeURIComponent(maxResults)}&type=video`;

    // Pedimos la URL y obtenemos texto crudo
    const r = await fetch(url);
    const text = await r.text();

    // Intentamos parsear JSON (YouTube devuelve JSON en condiciones normales)
    let data;
    try {
      data = JSON.parse(text);
    } catch (parseErr) {
      // Si Instagram o YouTube devuelve HTML u otro texto, retornamos info para debug
      res.status(500).json({
        error: 'Invalid JSON from YouTube API',
        status: r.status,
        bodyPreview: text.slice(0, 2000)
      });
      return;
    }

    const ids = (data.items || []).map(i => i && i.id && i.id.videoId).filter(Boolean);
    res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600');
    res.status(200).json({ videoIds: ids });
  } catch (err) {
    // Capturamos cualquier error inesperado y devolvemos un mensaje controlado
    console.error('[api/videos] unexpected error:', err && err.stack ? err.stack : err);
    res.status(500).json({ error: 'Server error', message: String(err && err.message ? err.message : err) });
  }
};
