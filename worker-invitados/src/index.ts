export default {
  async fetch(request: Request, env: any) {
    const url = new URL(request.url);

    if (url.pathname === "/api/invitados" && request.method === "GET") {
      const weddingCode = env.WEDDING_CODE;
      const { results } = await env.DB.prepare(
        "SELECT nombre, apellidos, mesa, email, telefono, confirmada_asistencia FROM invitados WHERE wedding_code = ?"
      ).bind(weddingCode).all();

      return new Response(JSON.stringify(results), {
        headers: { "Content-Type": "application/json" }
      });
    }

    return new Response("Not found", { status: 404 });
  }
}; 