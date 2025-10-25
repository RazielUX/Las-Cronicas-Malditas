// URL (ejemplo cuando esté en Vercel): /api/videos
// Vercel serverless function: coloca este archivo en /api/videos.js
// Netlify: crea netlify/functions/videos.js con similar lógica.

export default async function handler(req, res) {
  // Lee la clave y el channel id desde variables de entorno (NO publicarlas)
  const YT_KEY = process.env.YT_API_KEY;
  const CHANNEL_ID = process.env.CHANNEL_ID;
  const maxResults = req.query.maxResults || 50;

  if (!YT_KEY || !CHANNEL_ID) {
    res.status(500).json({ error: 'Missing YT_API_KEY or CHANNEL_ID in environment variables' });
    return;
  }

  try {
    const url = `https://www.googleapis.com/youtube/v3/search?` +
                `key=${encodeURIComponent(YT_KEY)}` +
                `&channelId=${encodeURIComponent(CHANNEL_ID)}` +
                `&part=id&order=date&maxResults=${encodeURIComponent(maxResults)}&type=video`;

    const r = await fetch(url);
    if (!r.ok) {
      const text = await r.text();
      res.status(r.status).json({ error: 'YouTube API error', detail: text });
      return;
    }

    const data = await r.json();
    const ids = (data.items || []).map(i => i?.id?.videoId).filter(Boolean);

    res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600'); // cache 5 min
    res.status(200).json({ videoIds: ids });
  } catch (err) {
    console.error('API error', err);
    res.status(500).json({ error: err.message });
  }
}
