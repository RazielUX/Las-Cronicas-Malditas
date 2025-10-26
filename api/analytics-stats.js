/**
 * Analytics Stats Endpoint
 *
 * Endpoint para consultar las estadísticas de analytics
 * GET /api/analytics-stats
 */

import { promises as fs } from 'fs';
import path from 'path';

const ANALYTICS_FILE = path.join(process.cwd(), 'analytics-data.json');

export default async function handler(req, res) {
  // Solo permitir GET
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Leer datos
    const data = await fs.readFile(ANALYTICS_FILE, 'utf-8');
    const analytics = JSON.parse(data);

    // Obtener parámetro de query para filtrar por fecha
    const { since } = req.query;
    let events = analytics.events || [];

    if (since) {
      const sinceDate = new Date(since);
      events = events.filter(e => new Date(e.timestamp) >= sinceDate);
    }

    // Calcular estadísticas adicionales
    const stats = {
      summary: analytics.summary || {},
      recent_events: events.slice(-10).reverse(), // Últimos 10 eventos
      events_by_type: {},
      events_by_hour: {},
      events_by_day: {}
    };

    // Agrupar eventos por tipo
    events.forEach(event => {
      const type = event.event;
      stats.events_by_type[type] = (stats.events_by_type[type] || 0) + 1;

      // Agrupar por hora
      const date = new Date(event.timestamp);
      const hour = date.getHours();
      stats.events_by_hour[hour] = (stats.events_by_hour[hour] || 0) + 1;

      // Agrupar por día
      const day = date.toISOString().split('T')[0];
      stats.events_by_day[day] = (stats.events_by_day[day] || 0) + 1;
    });

    res.status(200).json(stats);

  } catch (err) {
    console.error('Error en analytics-stats endpoint:', err);

    // Si el archivo no existe, devolver datos vacíos
    if (err.code === 'ENOENT') {
      return res.status(200).json({
        summary: {
          total_page_views: 0,
          total_cta_clicks: 0,
          total_video_plays: 0,
          conversion_rate: 0
        },
        recent_events: [],
        events_by_type: {},
        events_by_hour: {},
        events_by_day: {}
      });
    }

    res.status(500).json({
      error: 'Error interno del servidor',
      message: err.message
    });
  }
}
