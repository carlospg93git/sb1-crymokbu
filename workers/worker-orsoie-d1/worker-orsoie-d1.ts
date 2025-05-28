// Worker Cloudflare para orsoie (TypeScript)
// Gestiona las tablas 'mesas' y 'rsvp' en la base de datos D1
// Endpoints: GET /api/mesas, POST /api/rsvp, GET /api/rsvp

// Tipado mínimo para D1Database (Cloudflare D1)
declare class D1Database {
  prepare(query: string): {
    bind(...args: any[]): {
      all(): Promise<{ results: any[] }>,
      run(): Promise<any>,
    }
  };
}

export interface Env {
  DB: D1Database;
}

function jsonResponse(data: any, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

function errorResponse(message: string, status = 400) {
  // No exponer detalles internos
  return jsonResponse({ error: message }, status);
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const { pathname, searchParams } = url;
    try {
      // --- GET /api/mesas?event_code=... ---
      if (request.method === 'GET' && pathname === '/api/mesas') {
        const event_code = searchParams.get('event_code');
        if (!event_code) return errorResponse('Falta event_code', 400);
        const { results } = await env.DB.prepare(
          'SELECT * FROM mesas WHERE event_code = ?'
        ).bind(event_code).all();
        return jsonResponse(results);
      }

      // --- POST /api/rsvp ---
      if (request.method === 'POST' && pathname === '/api/rsvp') {
        const body = await request.json();
        const { event_code, ...rest } = body;
        if (!event_code) return errorResponse('Falta event_code', 400);
        // Guardar el resto de campos como JSON
        const respuestas_json = JSON.stringify(rest);
        await env.DB.prepare(
          'INSERT INTO rsvp (event_code, respuestas_json) VALUES (?, ?)'
        ).bind(event_code, respuestas_json).run();
        return jsonResponse({ ok: true });
      }

      // --- GET /api/rsvp?event_code=... ---
      if (request.method === 'GET' && pathname === '/api/rsvp') {
        const event_code = searchParams.get('event_code');
        if (!event_code) return errorResponse('Falta event_code', 400);
        const { results } = await env.DB.prepare(
          'SELECT id, event_code, respuestas_json, created_at FROM rsvp WHERE event_code = ? ORDER BY created_at DESC'
        ).bind(event_code).all();
        // Parsear respuestas_json
        const data = results.map((row: any) => ({
          ...row,
          respuestas: JSON.parse(row.respuestas_json || '{}'),
        }));
        return jsonResponse(data);
      }

      // --- 404 ---
      return errorResponse('Not found', 404);
    } catch (err: any) {
      // No exponer detalles internos
      return errorResponse('Error interno del servidor', 500);
    }
  },
};

// Seguridad:
// - Siempre filtra por event_code
// - No expone detalles internos de errores
// - No almacena ni expone secretos en el frontend
// - Preparado para Cloudflare D1 y Pages 