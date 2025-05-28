export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const origin = request.headers.get("Origin") || "";

    // LOG para debug
    console.log("Método:", request.method, "Ruta:", url.pathname);

    // Responder a preflight OPTIONS
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: getCorsHeaders(origin) });
    }

    // GET invitados (actualiza si cambió la tabla o columnas)
    if (url.pathname === "/api/invitados" && request.method === "GET") {
      const eventCode = env.EVENT_CODE;
      const { results } = await env.DB.prepare(
        "SELECT nombre, apellidos, mesa, email, telefono, confirmada_asistencia FROM invitados WHERE event_code = ?"
      ).bind(eventCode).all();
      return new Response(JSON.stringify(results), {
        headers: {
          ...getCorsHeaders(origin),
          "Content-Type": "application/json"
        }
      });
    }

    // POST /api/rsvp actualizado
    if (url.pathname === "/api/rsvp" && request.method === "POST") {
      try {
        // LOG: body recibido
        const rawBody = await request.clone().text();
        console.log("Body recibido:", rawBody);
        let body;
        try {
          body = JSON.parse(rawBody);
        } catch (e) {
          console.log("Error al parsear JSON:", e);
          return new Response("JSON inválido", { status: 400, headers: getCorsHeaders(origin) });
        }

        // Validación básica
        if (!body.event_code || typeof body.event_code !== "string") {
          console.log("Falta event_code o no es string");
          return new Response("event_code requerido", { status: 400, headers: getCorsHeaders(origin) });
        }
        // Añade aquí más validaciones según tu nuevo modelo

        // Guardar todo el body como JSON en la columna 'data'
        await env.DB.prepare(
          "INSERT INTO rsvp (event_code, data) VALUES (?, ?)"
        ).bind(body.event_code, JSON.stringify(body)).run();

        return new Response(JSON.stringify({ ok: true }), {
          status: 200,
          headers: {
            ...getCorsHeaders(origin),
            "Content-Type": "application/json"
          }
        });
      } catch (e) {
        console.log("Error en el handler POST /api/rsvp:", e);
        return new Response("Error al procesar el formulario", { status: 400, headers: getCorsHeaders(origin) });
      }
    }

    // 404 con CORS
    return new Response("Not found", { status: 404, headers: getCorsHeaders(origin) });
  }
}; 