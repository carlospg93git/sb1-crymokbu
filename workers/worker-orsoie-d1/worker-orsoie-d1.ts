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

// --- CORS robusto ---
function getCorsHeaders(origin: string) {
  // Permite cualquier subdominio de carlosymaria.pages.dev, el dominio custom y localhost
  const isAllowed = (
    origin === "https://carlosymaria.es" ||
    origin === "http://localhost:5173" ||
    /^https:\/\/[a-z0-9-]+\.carlosymaria\.pages\.dev$/.test(origin)
  );
  return {
    "Access-Control-Allow-Origin": isAllowed ? origin : "https://carlosymaria.es",
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization"
  };
}

function jsonResponse(data: any, status = 200, origin = "") {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      ...getCorsHeaders(origin)
    },
  });
}

function errorResponse(message: string, status = 400, origin = "") {
  // No exponer detalles internos
  return jsonResponse({ error: message }, status, origin);
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const { pathname, searchParams } = url;
    const origin = request.headers.get("Origin") || "";

    // --- Maneja preflight OPTIONS ANTES de cualquier try/catch o lógica ---
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: getCorsHeaders(origin) });
    }

    try {
      // --- GET /api/mesas?event_code=... ---
      if (request.method === 'GET' && pathname === '/api/mesas') {
        const event_code = searchParams.get('event_code');
        if (!event_code) return errorResponse('Falta event_code', 400, origin);
        const { results } = await env.DB.prepare(
          'SELECT * FROM mesas WHERE event_code = ?'
        ).bind(event_code).all();
        return jsonResponse(results, 200, origin);
      }

      // --- POST /api/rsvp ---
      if (request.method === 'POST' && pathname === '/api/rsvp') {
        // LOG: body recibido
        const rawBody = await request.clone().text();
        console.log("Body recibido:", rawBody);
        let body;
        try {
          body = JSON.parse(rawBody);
        } catch (e) {
          console.log("Error al parsear JSON:", e);
          return errorResponse('JSON inválido', 400, origin);
        }
        const { event_code, ...rest } = body;
        if (!event_code) return errorResponse('Falta event_code', 400, origin);
        // Guardar el resto de campos como JSON
        const respuestas_json = JSON.stringify(rest);
        await env.DB.prepare(
          'INSERT INTO rsvp (event_code, respuestas_json) VALUES (?, ?)'
        ).bind(event_code, respuestas_json).run();
        return jsonResponse({ ok: true }, 200, origin);
      }

      // --- GET /api/rsvp?event_code=... ---
      if (request.method === 'GET' && pathname === '/api/rsvp') {
        const event_code = searchParams.get('event_code');
        if (!event_code) return errorResponse('Falta event_code', 400, origin);
        const { results } = await env.DB.prepare(
          'SELECT id, event_code, respuestas_json, created_at FROM rsvp WHERE event_code = ? ORDER BY created_at DESC'
        ).bind(event_code).all();
        // Parsear respuestas_json
        const data = results.map((row: any) => ({
          ...row,
          respuestas: JSON.parse(row.respuestas_json || '{}'),
        }));
        return jsonResponse(data, 200, origin);
      }

      // --- 404 ---
      return errorResponse('Not found', 404, origin);
    } catch (err: any) {
      // No exponer detalles internos
      return errorResponse('Error interno del servidor', 500, origin);
    }
  },
};

// Seguridad:
// - Siempre filtra por event_code
// - No expone detalles internos de errores
// - No almacena ni expone secretos en el frontend
// - Preparado para Cloudflare D1 y Pages 