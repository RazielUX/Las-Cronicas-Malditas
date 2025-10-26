export default async function handler(req, res) {
  try {
    const YT_KEY =
      process.env.YT_API_KEY ??
      process.env.YOUTUBE_API_KEY ??
      process.env.NEXT_PUBLIC_YT_API_KEY ??
      '';

    const requestedChannel =
      req.query?.channelId ??
      process.env.CHANNEL_ID ??
      process.env.YOUTUBE_CHANNEL_ID ??
      process.env.NEXT_PUBLIC_CHANNEL_ID ??
      process.env.NEXT_PUBLIC_YOUTUBE_CHANNEL_ID ??
      '';

    const maxResults = req.query?.maxResults ?? 50;

    if (!YT_KEY || !requestedChannel) {
      res
        .status(500)
        .json({
          error: 'Missing env variables',
          details: {
            YT_KEY_present: Boolean(YT_KEY),
            CHANNEL_ID_present: Boolean(requestedChannel),
            expectedEnv: ['YT_API_KEY', 'YOUTUBE_API_KEY', 'NEXT_PUBLIC_YT_API_KEY'],
            expectedChannelEnv: [
              'CHANNEL_ID',
              'YOUTUBE_CHANNEL_ID',
              'NEXT_PUBLIC_CHANNEL_ID',
              'NEXT_PUBLIC_YOUTUBE_CHANNEL_ID',
            ],
          },
        });
      return;
    }

    const url =
      `https://www.googleapis.com/youtube/v3/search?` +
      `key=${encodeURIComponent(YT_KEY)}` +
      `&channelId=${encodeURIComponent(requestedChannel)}` +
      `&part=id&order=date&maxResults=${encodeURIComponent(maxResults)}&type=video`;

    const r = await fetch(url);
    if (!r.ok) {
      const bodyPreview = await r.text();
      res
        .status(502)
        .json({
          error: 'Upstream YouTube API error',
          status: r.status,
          bodyPreview: bodyPreview.slice(0, 2000),
        });
      return;
    }
    const data = await r.json();

    const ids = (data.items || []).map(i => i?.id?.videoId).filter(Boolean);
    res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600');
    res.status(200).json({ videoIds: ids });
  } catch (err) {
    console.error('[api/videos] unexpected error:', err);
    res.status(500).json({ error: 'Server error', message: String(err?.message ?? err) });
  }
};