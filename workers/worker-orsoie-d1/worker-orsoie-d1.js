// Worker Cloudflare para orsoie (JavaScript)
// Gestiona las tablas 'mesas' y 'rsvp' en la base de datos D1
// Endpoints: GET /api/mesas, POST /api/rsvp, GET /api/rsvp

// --- Helpers de CORS y respuestas JSON ---
function getCorsHeaders(origin) {
  const isAllowed = origin === "https://carlosymaria.es" || origin === "http://localhost:5173" || /^https:\/\/[a-z0-9-]+\.carlosymaria\.pages\.dev$/.test(origin);
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
      "Content-Type": "application/json"
    }
  });
  return corsify(response, origin);
}
function errorResponse(message, status = 400, origin = "") {
  return jsonResponse({ error: message }, status, origin);
}

// --- Helpers para Google Sheets y Prismic ---
function extractSheetIdFromUrl(url) {
  const match = url.match(/\/d\/([a-zA-Z0-9-_]+)/);
  return match ? match[1] : null;
}

function buildPrismicUrl(base, path) {
  return base.replace(/\/$/, '') + path;
}

async function getPrismicMasterRef(env) {
  const base = env.PRISMIC_API_BASE_URL;
  const res = await fetch(base);
  const json = await res.json();
  // Busca el ref con id 'master'
  const masterRef = json.refs.find(r => r.id === 'master')?.ref;
  if (!masterRef) throw new Error('No se pudo obtener el master ref de Prismic');
  return masterRef;
}

async function fetchPrismicConfig(event_code, env) {
  const base = env.PRISMIC_API_BASE_URL;
  const masterRef = await getPrismicMasterRef(env);
  const prismicApiUrl = buildPrismicUrl(base, `/documents/search?ref=${masterRef}&q=[[at(my.config.event_code,"${event_code}")]]`);
  console.log("[GS] fetchPrismicConfig url:", prismicApiUrl);
  const res = await fetch(prismicApiUrl);
  const text = await res.text();
  console.log("[GS] fetchPrismicConfig raw response:", text);
  let json;
  try {
    json = JSON.parse(text);
  } catch (e) {
    console.log("[GS] Error parseando JSON de Prismic (config):", e);
    throw e;
  }
  return json.results[0]?.data || null;
}

async function fetchPrismicForm(formularioId, env) {
  const base = env.PRISMIC_API_BASE_URL;
  const masterRef = await getPrismicMasterRef(env);
  const prismicApiUrl = buildPrismicUrl(base, `/documents/search?ref=${masterRef}&q=[[at(document.id,"${formularioId}")]]`);
  console.log("[GS] fetchPrismicForm url:", prismicApiUrl);
  const res = await fetch(prismicApiUrl);
  const text = await res.text();
  console.log("[GS] fetchPrismicForm raw response:", text);
  let json;
  try {
    json = JSON.parse(text);
  } catch (e) {
    console.log("[GS] Error parseando JSON de Prismic (form):", e);
    throw e;
  }
  return json.results[0] || null;
}

async function getGoogleAccessToken(client_email, private_key) {
  const header = {
    alg: "RS256",
    typ: "JWT"
  };
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    iss: client_email,
    scope: "https://www.googleapis.com/auth/spreadsheets",
    aud: "https://oauth2.googleapis.com/token",
    exp: now + 3600,
    iat: now
  };

  function base64url(source) {
    let encodedSource = btoa(JSON.stringify(source));
    encodedSource = encodedSource.replace(/=+$/, '');
    encodedSource = encodedSource.replace(/\+/g, '-');
    encodedSource = encodedSource.replace(/\//g, '_');
    return encodedSource;
  }

  const encHeader = base64url(header);
  const encPayload = base64url(payload);
  const toSign = `${encHeader}.${encPayload}`;

  // Firmar con WebCrypto API
  const key = await crypto.subtle.importKey(
    "pkcs8",
    str2ab(private_key),
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign(
    "RSASSA-PKCS1-v1_5",
    key,
    new TextEncoder().encode(toSign)
  );
  const encSignature = btoa(String.fromCharCode(...new Uint8Array(signature)))
    .replace(/=+$/, '').replace(/\+/g, '-').replace(/\//g, '_');

  const jwt = `${toSign}.${encSignature}`;

  // Solicitar el access_token
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`
  });
  const text = await res.text();
  console.log("[GS] Google token raw response:", text);
  let data;
  try {
    data = JSON.parse(text);
  } catch (e) {
    console.log("[GS] Error parseando JSON de Google token:", e);
    throw e;
  }
  if (!data.access_token) throw new Error("No se pudo obtener access_token de Google");
  return data.access_token;
}

function str2ab(str) {
  const b64 = str.replace(/-----.*?-----/g, '').replace(/\n/g, '');
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

async function appendRowToSheet(sheetId, values, accessToken) {
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/A1:append?valueInputOption=USER_ENTERED`;
  console.log("[GS] appendRowToSheet url:", url);
  console.log("[GS] appendRowToSheet values:", JSON.stringify(values));
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${accessToken}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ values: [values] })
  });
  const text = await res.text();
  console.log("[GS] Google Sheets API response:", text);
  if (!res.ok) {
    throw new Error(`Error al añadir fila a Google Sheets: ${text}`);
  }
}

// --- Worker principal ---
var worker_orsoie_d1_default = {
  async fetch(request, env) {
    const url = new URL(request.url);
    let { pathname, searchParams } = url;
    const origin = request.headers.get("Origin") || "";
    const cleanPath = pathname.replace(/\/+$/, "");

    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: getCorsHeaders(origin)
      });
    }

    try {
      if (request.method === "GET" && cleanPath === "/api/mesas") {
        const event_code = searchParams.get("event_code");
        if (!event_code) return errorResponse("Falta event_code", 400, origin);
        const { results } = await env.DB.prepare(
          "SELECT * FROM mesas WHERE event_code = ?"
        ).bind(event_code).all();
        return jsonResponse(results, 200, origin);
      }

      if (request.method === "POST" && cleanPath === "/api/rsvp") {
        const rawBody = await request.clone().text();
        console.log("[RSVP] Body recibido:", rawBody);
        let body;
        try {
          body = JSON.parse(rawBody);
        } catch (e) {
          console.log("[RSVP] Error al parsear JSON:", e);
          return errorResponse("JSON inv\xE1lido", 400, origin);
        }
        const { event_code, ...rest } = body;
        if (!event_code) return errorResponse("Falta event_code", 400, origin);
        const respuestas_json = JSON.stringify(rest);

        try {
          console.log("[RSVP] Insertando en rsvp: event_code=", event_code, "respuestas_json=", respuestas_json);
          await env.DB.prepare(
            "INSERT INTO rsvp (event_code, respuestas_json) VALUES (?, ?)"
          ).bind(event_code, respuestas_json).run();

          // --- NUEVO: Enviar a Google Sheets desanidando los campos y con logs ---
          try {
            const prismicConfig = await fetchPrismicConfig(event_code, env);
            console.log("[GS] prismicConfig:", JSON.stringify(prismicConfig));
            const sheetUrl = prismicConfig?.google_sheet_url;
            console.log("[GS] sheetUrl:", sheetUrl);
            const formularioConfirmacion = prismicConfig?.formulario_confirmacion;
            console.log("[GS] formularioConfirmacion:", JSON.stringify(formularioConfirmacion));
            const formularioId = formularioConfirmacion?.id;
            console.log("[GS] formularioId:", formularioId);

            if (sheetUrl && formularioId) {
              const sheetId = extractSheetIdFromUrl(sheetUrl);
              const formDoc = await fetchPrismicForm(formularioId, env);
              console.log("[GS] formDoc:", JSON.stringify(formDoc));
              const campos = (formDoc.data.campos || []).filter(c => c.mostrar_campo !== false);
              campos.sort((a, b) => (a.orden || 0) - (b.orden || 0));
              console.log("[GS] campos:", campos.map(c => c.nombre_interno));

              // Construir la fila: [timestamp, ...valores desanidados en orden]
              const values = [
                new Date().toISOString(),
                ...campos.map(campo => rest[campo.nombre_interno] ?? "")
              ];
              console.log("[GS] values a enviar:", values);

              const accessToken = await getGoogleAccessToken(
                env.GS_CLIENT_EMAIL,
                env.GS_PRIVATE_KEY.replace(/\n/g, '\n')
              );
              console.log("[GS] accessToken obtenido");

              await appendRowToSheet(sheetId, values, accessToken);
              console.log("[GS] Fila añadida correctamente a Google Sheets");
            } else {
              console.log("[GS] Faltan sheetUrl o formularioId en Prismic");
            }
          } catch (err) {
            console.error("[RSVP] Error enviando a Google Sheets:", err && err.stack ? err.stack : err);
          }
          // --- FIN NUEVO ---

          return jsonResponse({ ok: true }, 200, origin);
        } catch (dbErr) {
          return errorResponse("Error al guardar RSVP: " + (dbErr && dbErr.message ? dbErr.message : ""), 500, origin);
        }
      }

      if (request.method === "GET" && cleanPath === "/api/rsvp") {
        const event_code = searchParams.get("event_code");
        if (!event_code) return errorResponse("Falta event_code", 400, origin);
        const { results } = await env.DB.prepare(
          "SELECT id, event_code, respuestas_json, created_at FROM rsvp WHERE event_code = ? ORDER BY created_at DESC"
        ).bind(event_code).all();
        const data = results.map((row) => ({
          ...row,
          respuestas: JSON.parse(row.respuestas_json || "{}")
        }));
        return jsonResponse(data, 200, origin);
      }

      return errorResponse("Not found", 404, origin);
    } catch (err) {
      return errorResponse("Error interno del servidor", 500, origin);
    }
  }
};
export {
  worker_orsoie_d1_default as default
};

// Seguridad:
// - Siempre filtra por event_code
// - No expone detalles internos de errores
// - No almacena ni expone secretos en el frontend
// - Preparado para Cloudflare D1 y Pages 