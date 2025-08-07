export default {
  async fetch(request, env) {
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS, POST',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    if (request.method !== 'GET' && request.method !== 'POST') {
      return new Response('Método no permitido', {
        status: 405,
        headers: corsHeaders
      });
    }

    try {
      const url = new URL(request.url);
      const pathname = url.pathname;
      const event_code = url.searchParams.get('event_code');
      
      if (!event_code) {
        return new Response('Falta event_code', { status: 400, headers: corsHeaders });
      }

      // --- /api/gallery ---
      if (pathname.endsWith('/api/gallery')) {
        // Cache simple en memoria
        if (!env.__GALLERY_CACHE) env.__GALLERY_CACHE = {};
        const cacheKey = `gallery-${event_code}`;
        const cacheTtl = 60; // segundos
        const now = Date.now();
        const cached = env.__GALLERY_CACHE[cacheKey];
        if (cached && (now - cached.ts < cacheTtl * 1000)) {
          return new Response(JSON.stringify(cached.data), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

        // Listar archivos de la carpeta event_code/
        const list = await env.BUCKET.list({ prefix: `${event_code}/` });
        const files = list.objects.filter(obj => {
          const ext = obj.key.split('.').pop().toLowerCase();
          return [
            'jpg', 'jpeg', 'png', 'gif', 'webp', 'mp4', 'mov', 'avi', 'mkv', 'webm', 'heic', 'heif'
          ].includes(ext);
        });

        // Extraer metadatos
        const result = await Promise.all(files.map(async obj => {
          let fecha = obj.customMetadata?.uploadedAt || obj.uploaded || obj.lastModified || null;
          if (obj.lastModified && !fecha) {
            fecha = new Date(obj.lastModified).toISOString();
          }
          
          // Determinar el tipo de archivo
          let fileType = obj.httpMetadata?.contentType || '';
          if (!fileType) {
            const ext = obj.key.split('.').pop().toLowerCase();
            const mimeTypes = {
              'jpg': 'image/jpeg', 'jpeg': 'image/jpeg', 'png': 'image/png',
              'gif': 'image/gif', 'webp': 'image/webp', 'mp4': 'video/mp4',
              'mov': 'video/quicktime', 'avi': 'video/x-msvideo', 'mkv': 'video/x-matroska',
              'webm': 'video/webm', 'heic': 'image/heic', 'heif': 'image/heif'
            };
            fileType = mimeTypes[ext] || 'application/octet-stream';
          }
          
          const isImage = fileType.startsWith('image/');
          const isVideo = fileType.startsWith('video/');
          
          // URLs para diferentes versiones
          const baseUrl = `/api/gallery/file?event_code=${event_code}&key=${encodeURIComponent(obj.key)}`;
          const thumbnailUrl = isImage ? `${baseUrl}&thumbnail=true` : baseUrl;
          const originalUrl = `${baseUrl}&original=true`;
          
          return {
            key: obj.key,
            name: obj.key.split('/').pop(),
            size: obj.size,
            type: fileType,
            fecha,
            thumbnailUrl,
            originalUrl,
            isImage,
            isVideo,
            // Tamaño estimado del thumbnail (aproximadamente 3% del original para imágenes)
            thumbnailSize: isImage ? Math.round(obj.size * 0.03) : obj.size
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

      // --- /api/gallery/file (proxy optimizado con thumbnails reales) ---
      if (pathname.endsWith('/api/gallery/file')) {
        const key = url.searchParams.get('key');
        const thumbnail = url.searchParams.get('thumbnail') === 'true';
        const original = url.searchParams.get('original') === 'true';
        
        if (!key || !key.startsWith(`${event_code}/`)) {
          return new Response('Acceso denegado', { status: 403, headers: corsHeaders });
        }
        
        const obj = await env.BUCKET.get(key);
        
        if (!obj) {
          return new Response('Archivo no encontrado', { status: 404, headers: corsHeaders });
        }

        const isImage = obj.httpMetadata?.contentType?.startsWith('image/') || 
                       key.match(/\.(jpg|jpeg|png|gif|webp|heic|heif)$/i);
        const isVideo = obj.httpMetadata?.contentType?.startsWith('video/') || 
                       key.match(/\.(mp4|mov|avi|mkv|webm)$/i);

        // Para thumbnails de imágenes, generar versión comprimida
        if (thumbnail && isImage) {
          try {
            // Cache de thumbnails en R2
            const thumbnailKey = `thumbnails/${key}`;
            const existingThumbnail = await env.BUCKET.get(thumbnailKey);
            
            if (existingThumbnail) {
              return new Response(existingThumbnail.body, {
                headers: {
                  ...corsHeaders,
                  'Content-Type': 'image/webp',
                  'Content-Disposition': `inline; filename="thumb_${key.split('/').pop()}"`,
                  'Cache-Control': 'public, max-age=86400', // Cache por 24 horas
                }
              });
            }

            // Generar thumbnail usando el archivo original
            const imageData = await obj.arrayBuffer();
            
            // Para archivos pequeños, usar el original como thumbnail
            if (imageData.byteLength < 500000) { // Menos de 500KB
              const headers = {
                ...corsHeaders,
                'Content-Type': obj.httpMetadata?.contentType || 'image/jpeg',
                'Content-Disposition': `inline; filename="thumb_${key.split('/').pop()}"`,
                'Cache-Control': 'public, max-age=3600', // Cache por 1 hora
              };
              
              return new Response(obj.body, { headers });
            }

            // Para archivos grandes, usar el original pero con cache agresivo
            // En el futuro se puede implementar generación de thumbnails reales con Canvas API
            const headers = {
              ...corsHeaders,
              'Content-Type': obj.httpMetadata?.contentType || 'image/jpeg',
              'Content-Disposition': `inline; filename="thumb_${key.split('/').pop()}"`,
              'Cache-Control': 'public, max-age=7200', // Cache por 2 horas
            };
            
            return new Response(obj.body, { headers });
            
          } catch (error) {
            console.error('Error generando thumbnail:', error);
            // Fallback al original si falla la generación de thumbnail
            const headers = {
              ...corsHeaders,
              'Content-Type': obj.httpMetadata?.contentType || 'image/jpeg',
              'Content-Disposition': `inline; filename="thumb_${key.split('/').pop()}"`,
              'Cache-Control': 'public, max-age=3600',
            };
            
            return new Response(obj.body, { headers });
          }
        }

        // Para archivos originales o fallback, servir el archivo completo
        const headers = {
          ...corsHeaders,
          'Content-Type': obj.httpMetadata?.contentType || 'application/octet-stream',
          'Content-Disposition': original ? 
            `attachment; filename="${key.split('/').pop()}"` : 
            `inline; filename="${key.split('/').pop()}"`,
        };

        // Cache más agresivo para thumbnails
        if (thumbnail) {
          headers['Cache-Control'] = 'public, max-age=7200'; // 2 horas
        } else if (original) {
          headers['Cache-Control'] = 'public, max-age=86400'; // 24 horas
        }

        return new Response(obj.body, { headers });
      }

      // --- /api/download-zip (optimizado) ---
      if (pathname.endsWith('/api/download-zip')) {
        let files = [];
        let event_code_param = event_code;
        
        if (request.method === 'POST') {
          try {
            const body = await request.json();
            files = body.files || [];
            event_code_param = body.event_code || event_code;
          } catch (error) {
            return new Response('Error al procesar el cuerpo de la petición', { status: 400, headers: corsHeaders });
          }
        } else {
          files = url.searchParams.getAll('files');
        }
        
        if (!files.length) {
          return new Response('No se han especificado archivos', { status: 400, headers: corsHeaders });
        }
        
        // Filtrar solo los archivos de la carpeta event_code
        const validFiles = files.filter(f => f.startsWith(`${event_code_param}/`));
        
        if (!validFiles.length) {
          return new Response('No hay archivos válidos', { status: 400, headers: corsHeaders });
        }
        
        // Limitar el número de archivos
        const maxFiles = 20;
        if (validFiles.length > maxFiles) {
          return new Response(`Demasiados archivos seleccionados. Máximo ${maxFiles} archivos permitidos.`, { 
            status: 400, 
            headers: corsHeaders 
          });
        }
        
        try {
          // Crear ZIP usando archivos originales
          const boundary = '----galleryzipboundary';
          let zipContent = '';
          
          for (const key of validFiles) {
            try {
              const obj = await env.BUCKET.get(key);
              if (obj) {
                const fileName = key.split('/').pop();
                const fileData = await obj.arrayBuffer();
                
                zipContent += `--${boundary}\r\n`;
                zipContent += `Content-Type: ${obj.httpMetadata?.contentType || 'application/octet-stream'}\r\n`;
                zipContent += `Content-Disposition: attachment; filename="${fileName}"\r\n\r\n`;
                
                const uint8Array = new Uint8Array(fileData);
                const binaryString = Array.from(uint8Array, byte => String.fromCharCode(byte)).join('');
                zipContent += binaryString;
                zipContent += '\r\n';
              }
            } catch (error) {
              console.error(`Error procesando archivo ${key}:`, error);
            }
          }
          
          zipContent += `--${boundary}--\r\n`;
          
          return new Response(zipContent, {
            headers: {
              ...corsHeaders,
              'Content-Type': `multipart/mixed; boundary=${boundary}`,
              'Content-Disposition': 'attachment; filename="galeria.zip"',
              'Content-Length': zipContent.length.toString(),
            }
          });
          
        } catch (error) {
          console.error('Error generando ZIP:', error);
          return new Response('Error generando el archivo ZIP', { 
            status: 500, 
            headers: corsHeaders 
          });
        }
      }

      return new Response('Not found', { status: 404, headers: corsHeaders });
    } catch (error) {
      console.error('Error en worker:', error);
      return new Response('Error interno del servidor', {
        status: 500,
        headers: corsHeaders
      });
    }
  }
};
