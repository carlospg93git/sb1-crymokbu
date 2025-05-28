// Worker Cloudflare para orsoie (JavaScript)
// Gestiona las tablas 'mesas' y 'rsvp' en la base de datos D1
// Endpoints: GET /api/mesas, POST /api/rsvp, GET /api/rsvp

// --- CORS robusto ---
function getCorsHeaders(origin) {
  // Siempre permitir el origen si coincide con el patrón
  const isAllowed = 
    origin === "https://carlosymaria.es" ||
    origin === "http://localhost:5173" ||
    /^https:\/\/[a-z0-9-]+\.carlosymaria\.pages\.dev$/.test(origin);

  return {
    "Access-Control-Allow-Origin": isAllowed ? origin : "https://carlosymaria.es",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Max-Age": "86400",
    "Vary": "Origin"
  };
}

function corsify(response, origin) {
  const corsHeaders = getCorsHeaders(origin);
  const newHeaders = new Headers(response.headers);
  // Añadir todos los headers CORS
  Object.entries(corsHeaders).forEach(([key, value]) => {
    newHeaders.set(key, value);
  });
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: newHeaders
  });
}

function jsonResponse(data, status = 200, origin = "") {
  const response = new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
    },
  });
  return corsify(response, origin);
}

function errorResponse(message, status = 400, origin = "") {
  return jsonResponse({ error: message }, status, origin);
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    let { pathname, searchParams } = url;
    const origin = request.headers.get("Origin") || "";

    // Normalizar path para evitar problemas de barra final
    const cleanPath = pathname.replace(/\/+$/, "");

    // LOG AVANZADO: método, tipo, path y headers
    // console.log("Método recibido:", request.method, "(tipo:", typeof request.method, ") Path:", pathname, "CleanPath:", cleanPath);
    // const headersObj = {};
    // for (const [k, v] of request.headers.entries()) headersObj[k] = v;
    // console.log("Headers recibidos:", JSON.stringify(headersObj));

    // Manejar preflight OPTIONS para cualquier path
    if (request.method === "OPTIONS") {
      // console.log("Entrando en bloque OPTIONS para:", pathname);
      return new Response(null, {
        status: 204,
        headers: getCorsHeaders(origin)
      });
    }

    try {
      // --- GET /api/mesas?event_code=... ---
      if (request.method === 'GET' && cleanPath === '/api/mesas') {
        const event_code = searchParams.get('event_code');
        if (!event_code) return errorResponse('Falta event_code', 400, origin);
        const { results } = await env.DB.prepare(
          'SELECT * FROM mesas WHERE event_code = ?'
        ).bind(event_code).all();
        return jsonResponse(results, 200, origin);
      }

      // --- POST /api/rsvp ---
      if (request.method === 'POST' && cleanPath === '/api/rsvp') {
        const rawBody = await request.clone().text();
        // console.log("Body recibido:", rawBody);
        let body;
        try {
          body = JSON.parse(rawBody);
        } catch (e) {
          // console.log("Error al parsear JSON:", e);
          return errorResponse('JSON inválido', 400, origin);
        }
        const { event_code, ...rest } = body;
        if (!event_code) return errorResponse('Falta event_code', 400, origin);
        const respuestas_json = JSON.stringify(rest);
        await env.DB.prepare(
          'INSERT INTO rsvp (event_code, respuestas_json) VALUES (?, ?)'
        ).bind(event_code, respuestas_json).run();
        return jsonResponse({ ok: true }, 200, origin);
      }

      // --- GET /api/rsvp?event_code=... ---
      if (request.method === 'GET' && cleanPath === '/api/rsvp') {
        const event_code = searchParams.get('event_code');
        if (!event_code) return errorResponse('Falta event_code', 400, origin);
        const { results } = await env.DB.prepare(
          'SELECT id, event_code, respuestas_json, created_at FROM rsvp WHERE event_code = ? ORDER BY created_at DESC'
        ).bind(event_code).all();
        const data = results.map((row) => ({
          ...row,
          respuestas: JSON.parse(row.respuestas_json || '{}'),
        }));
        return jsonResponse(data, 200, origin);
      }

      return errorResponse('Not found', 404, origin);
    } catch (err) {
      // console.error("Error interno:", err);
      return errorResponse('Error interno del servidor', 500, origin);
    }
  },
};

// Seguridad:
// - Siempre filtra por event_code
// - No expone detalles internos de errores
// - No almacena ni expone secretos en el frontend
// - Preparado para Cloudflare D1 y Pages 