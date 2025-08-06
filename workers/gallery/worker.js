export default {
  async fetch(request, env) {
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    if (request.method !== 'GET') {
      return new Response('Método no permitido', {
        status: 405,
        headers: corsHeaders
      });
    }

    try {
      const url = new URL(request.url);
      const pathname = url.pathname;
      const event_code = url.searchParams.get('event_code');
      console.log('[GALLERY] event_code recibido:', event_code);
      if (!event_code) {
        return new Response('Falta event_code', { status: 400, headers: corsHeaders });
      }

      // --- /api/gallery ---
      if (pathname.endsWith('/api/gallery')) {
        // Cache simple en memoria (solo para el worker en caliente)
        if (!env.__GALLERY_CACHE) env.__GALLERY_CACHE = {};
        const cacheKey = `gallery-${event_code}`;
        const cacheTtl = 60; // segundos
        const now = Date.now();
        const cached = env.__GALLERY_CACHE[cacheKey];
        if (cached && (now - cached.ts < cacheTtl * 1000)) {
          console.log('[GALLERY] Respondiendo desde cache:', cacheKey, 'n archivos:', cached.data.length);
          return new Response(JSON.stringify(cached.data), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

        // Listar archivos de la carpeta event_code/
        const list = await env.BUCKET.list({ prefix: `${event_code}/` });
        console.log('[GALLERY] Archivos encontrados:', list.objects.length);
        if (list.objects.length > 0) {
          console.log('[GALLERY] Nombres:', list.objects.map(obj => obj.key).join(', '));
        }
        const files = list.objects.filter(obj => {
          const ext = obj.key.split('.').pop().toLowerCase();
          return [
            'jpg', 'jpeg', 'png', 'gif', 'webp', 'mp4', 'mov', 'avi', 'mkv', 'webm', 'heic', 'heif'
          ].includes(ext);
        });
        console.log('[GALLERY] Archivos filtrados (imágenes/vídeos):', files.length);

        // Extraer metadatos (fecha EXIF/META si es posible, si no, fecha de subida)
        const result = await Promise.all(files.map(async obj => {
          let fecha = obj.uploaded || obj.uploadedAt || obj.customMetadata?.uploadedAt || obj.uploaded || obj.lastModified || null;
          // Si hay customMetadata.uploadedAt, úsala
          if (obj.customMetadata && obj.customMetadata.uploadedAt) {
            fecha = obj.customMetadata.uploadedAt;
          } else if (obj.uploaded) {
            fecha = obj.uploaded;
          } else if (obj.lastModified) {
            fecha = new Date(obj.lastModified).toISOString();
          }
          // Construir URL pública (el Worker servirá como proxy)
          const url = `/api/gallery/file?event_code=${event_code}&key=${encodeURIComponent(obj.key)}`;
          return {
            key: obj.key,
            name: obj.key.split('/').pop(),
            size: obj.size,
            type: obj.httpMetadata?.contentType || '',
            fecha,
            url,
          };
        }));
        // Ordenar por fecha ascendente
        result.sort((a, b) => new Date(a.fecha) - new Date(b.fecha));
        // Cachear
        env.__GALLERY_CACHE[cacheKey] = { ts: now, data: result };
        return new Response(JSON.stringify(result), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // --- /api/gallery/file (proxy para servir archivos individuales) ---
      if (pathname.endsWith('/api/gallery/file')) {
        const key = url.searchParams.get('key');
        if (!key || !key.startsWith(`${event_code}/`)) {
          return new Response('Acceso denegado', { status: 403, headers: corsHeaders });
        }
        const obj = await env.BUCKET.get(key);
        if (!obj) {
          return new Response('Archivo no encontrado', { status: 404, headers: corsHeaders });
        }
        return new Response(obj.body, {
          headers: {
            ...corsHeaders,
            'Content-Type': obj.httpMetadata?.contentType || 'application/octet-stream',
            'Content-Disposition': `inline; filename="${key.split('/').pop()}"`,
          }
        });
      }

      // --- /api/download-zip ---
      if (pathname.endsWith('/api/download-zip')) {
        const files = url.searchParams.getAll('files');
        if (!files.length) {
          return new Response('No se han especificado archivos', { status: 400, headers: corsHeaders });
        }
        // Filtrar solo los archivos de la carpeta event_code
        const validFiles = files.filter(f => f.startsWith(`${event_code}/`));
        if (!validFiles.length) {
          return new Response('No hay archivos válidos', { status: 400, headers: corsHeaders });
        }
        // Generar ZIP al vuelo
        const boundary = '----galleryzipboundary';
        const parts = await Promise.all(validFiles.map(async key => {
          const obj = await env.BUCKET.get(key);
          if (!obj) return null;
          return `--${boundary}\r\nContent-Type: ${obj.httpMetadata?.contentType || 'application/octet-stream'}\r\nContent-Disposition: attachment; filename=\"${key.split('/').pop()}\"\r\n\r\n`;
        }));
        // Leer los cuerpos y concatenar
        const bodies = await Promise.all(validFiles.map(async key => {
          const obj = await env.BUCKET.get(key);
          if (!obj) return new Uint8Array();
          return new Uint8Array(await obj.body.arrayBuffer());
        }));
        // Construir el cuerpo multipart
        let body = '';
        for (let i = 0; i < parts.length; i++) {
          if (parts[i]) {
            body += parts[i];
            body += Buffer.from(bodies[i]).toString('binary');
            body += '\r\n';
          }
        }
        body += `--${boundary}--`;
        return new Response(body, {
          headers: {
            ...corsHeaders,
            'Content-Type': `multipart/mixed; boundary=${boundary}`,
            'Content-Disposition': 'attachment; filename="galeria.zip"',
          }
        });
      }

      return new Response('Not found', { status: 404, headers: corsHeaders });
    } catch (error) {
      console.error('Error en Worker:', error);
      return new Response('Error interno del servidor', {
        status: 500,
        headers: corsHeaders
      });
    }
  }
}; 