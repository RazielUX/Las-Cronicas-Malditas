/**
 * Analytics API Endpoint
 *
 * Registra eventos de analytics en un archivo JSON simple.
 * En producción, considera usar una base de datos real (MongoDB, PostgreSQL, etc.)
 */

import { promises as fs } from 'fs';
import path from 'path';

const ANALYTICS_FILE = path.join(process.cwd(), 'analytics-data.json');

// Inicializar archivo si no existe
async function initAnalyticsFile() {
  try {
    await fs.access(ANALYTICS_FILE);
  } catch {
    // El archivo no existe, crearlo
    await fs.writeFile(
      ANALYTICS_FILE,
      JSON.stringify({ events: [], summary: {} }, null, 2)
    );
  }
}

// Leer datos de analytics
async function readAnalytics() {
  try {
    const data = await fs.readFile(ANALYTICS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Error leyendo analytics:', err);
    return { events: [], summary: {} };
  }
}

// Escribir datos de analytics
async function writeAnalytics(data) {
  try {
    await fs.writeFile(ANALYTICS_FILE, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('Error escribiendo analytics:', err);
  }
}

// Calcular resumen de eventos
function calculateSummary(events) {
  const summary = {
    total_page_views: 0,
    total_cta_clicks: 0,
    total_video_plays: 0,
    total_another_video_clicks: 0,
    total_back_to_start_clicks: 0,
    conversion_rate: 0, // (CTA clicks / Page views) * 100
    unique_visitors: new Set(),
    last_updated: new Date().toISOString()
  };

  events.forEach(event => {
    // Contar por tipo de evento
    switch (event.event) {
      case 'page_view':
        summary.total_page_views++;
        break;
      case 'cta_click':
        summary.total_cta_clicks++;
        break;
      case 'video_play':
        summary.total_video_plays++;
        break;
      case 'another_video_click':
        summary.total_another_video_clicks++;
        break;
      case 'back_to_start_click':
        summary.total_back_to_start_clicks++;
        break;
    }

    // Intentar identificar usuarios únicos (muy básico)
    if (event.userAgent) {
      summary.unique_visitors.add(event.userAgent);
    }
  });

  // Calcular tasa de conversión
  if (summary.total_page_views > 0) {
    summary.conversion_rate = (
      (summary.total_cta_clicks / summary.total_page_views) * 100
    ).toFixed(2);
  }

  // Convertir Set a número
  summary.unique_visitors = summary.unique_visitors.size;

  return summary;
}

export default async function handler(req, res) {
  // Solo permitir POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Inicializar archivo
    await initAnalyticsFile();

    // Obtener datos actuales
    const analytics = await readAnalytics();

    // Agregar nuevo evento
    const newEvent = {
      ...req.body,
      id: Date.now() + Math.random().toString(36).substr(2, 9),
      ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown',
      timestamp: new Date().toISOString()
    };

    analytics.events.push(newEvent);

    // Recalcular resumen
    analytics.summary = calculateSummary(analytics.events);

    // Guardar
    await writeAnalytics(analytics);

    // Responder
    res.status(200).json({
      success: true,
      message: 'Evento registrado',
      summary: analytics.summary
    });

  } catch (err) {
    console.error('Error en analytics endpoint:', err);
    res.status(500).json({
      error: 'Error interno del servidor',
      message: err.message
    });
  }
}
