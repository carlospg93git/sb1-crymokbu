# Worker Cloudflare + D1 + Google Sheets (Desanidado por campos)

A continuación tienes el código completo del worker, listo para copiar y pegar. Incluye la integración con Google Sheets para que cada RSVP se guarde también en una hoja de cálculo, además de en la base de datos D1. Ahora, cada campo del formulario se desanida y se escribe en su propia columna, precedido por un timestamp.

---

## Estructura recomendada de la hoja de Google Sheets

- **Primera fila (encabezado):**
  - `Time stamp envío`, seguido de los nombres internos de cada campo del formulario (en el orden definido en Prismic).
  - Ejemplo:
    | Time stamp envío | nombre | apellidos | email | asistencia | ... |

---

## Estructura recomendada en Prismic

- El documento de configuración del evento debe tener:
  - `google_sheet_url`: URL de la hoja de Google Sheets.
  - `formulario_confirmacion`: objeto con el campo `id` del documento de formulario.
- El documento de formulario debe tener un array de campos (por ejemplo, `campos`), cada uno con:
  - `nombre_interno` (string, único)
  - `orden` (número, para el orden de columnas)
  - `mostrar_campo` (boolean, para filtrar los campos activos)

---

```js
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

async function fetchPrismicConfig(event_code) {
  // AJUSTA esta URL a tu repo y modelo real de Prismic
  // Este ejemplo asume que tienes un documento tipo "config" con un campo "event_code"
  const prismicApiUrl = `https://tu-repo-prismic.cdn.prismic.io/api/v2/documents/search?ref=master&q=[[at(my.config.event_code,"${event_code}")]]`;
  const res = await fetch(prismicApiUrl);
  const json = await res.json();
  return json.results[0]?.data || null;
}

async function fetchPrismicForm(formularioId) {
  // AJUSTA esta URL a tu repo real
  const prismicApiUrl = `https://tu-repo-prismic.cdn.prismic.io/api/v2/documents/search?ref=master&q=[[at(document.id,"${formularioId}")]]`;
  const res = await fetch(prismicApiUrl);
  const json = await res.json();
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
  const data = await res.json();
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
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${accessToken}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ values: [values] })
  });
  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Error al añadir fila a Google Sheets: ${error}`);
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
          await env.DB.prepare(
            "INSERT INTO rsvp (event_code, respuestas_json) VALUES (?, ?)"
          ).bind(event_code, respuestas_json).run();

          // --- NUEVO: Enviar a Google Sheets desanidando los campos ---
          try {
            const prismicConfig = await fetchPrismicConfig(event_code);
            const sheetUrl = prismicConfig?.google_sheet_url;
            const formularioId = prismicConfig?.formulario_confirmacion?.id; // Ajusta si el campo es diferente

            if (sheetUrl && formularioId) {
              const sheetId = extractSheetIdFromUrl(sheetUrl);
              const formDoc = await fetchPrismicForm(formularioId);
              const campos = (formDoc.data.campos || []).filter(c => c.mostrar_campo !== false);
              campos.sort((a, b) => (a.orden || 0) - (b.orden || 0));

              // Construir la fila: [timestamp, ...valores desanidados en orden]
              const values = [
                new Date().toISOString(),
                ...campos.map(campo => rest[campo.nombre_interno] ?? "")
              ];

              const accessToken = await getGoogleAccessToken(
                env.GS_CLIENT_EMAIL,
                env.GS_PRIVATE_KEY.replace(/\\n/g, '\n')
              );
              await appendRowToSheet(sheetId, values, accessToken);
            }
          } catch (err) {
            console.error("[RSVP] Error enviando a Google Sheets:", err);
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
```

---

## Instrucciones de ajuste

- **Ajusta la URL de Prismic** en las funciones `fetchPrismicConfig` y `fetchPrismicForm` para que apunten a tu repositorio y modelo real.
- **Asegúrate de que los campos de RSVP** y el orden de columnas en la hoja de Google Sheets coincidan con el array `values` generado.
- Si tienes campos anidados en el RSVP, aplánalos antes de enviarlos a Sheets.
- Si tienes dudas sobre cómo adaptar la consulta a Prismic o el mapeo de campos, ¡pídelo y te ayudo! 