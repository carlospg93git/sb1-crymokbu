export default {
  async fetch(request, env) {
    // Configurar CORS
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    // Solo permitir POST
    if (request.method !== 'POST') {
      return new Response('Método no permitido', { 
        status: 405,
        headers: corsHeaders
      });
    }

    try {
      // Obtener el archivo y la key del FormData
      const formData = await request.formData();
      const file = formData.get('file');
      const key = formData.get('key');

      if (!file || !key) {
        return new Response('Archivo y key son requeridos', { 
          status: 400,
          headers: corsHeaders
        });
      }

      // Validar el tipo de archivo
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'video/mp4', 'video/quicktime'];
      if (!allowedTypes.includes(file.type)) {
        return new Response('Tipo de archivo no permitido', { 
          status: 400,
          headers: corsHeaders
        });
      }

      // Validar el tamaño del archivo (100MB)
      const maxSize = 100 * 1024 * 1024;
      if (file.size > maxSize) {
        return new Response('Archivo demasiado grande', { 
          status: 400,
          headers: corsHeaders
        });
      }

      // Subir el archivo a R2
      try {
        await env.BUCKET.put(key, file, {
          httpMetadata: {
            contentType: file.type,
          },
          customMetadata: {
            uploadedFrom: request.headers.get('origin') || 'unknown',
            uploadedAt: new Date().toISOString()
          }
        });

        return new Response('Archivo subido exitosamente', {
          status: 200,
          headers: corsHeaders
        });
      } catch (uploadError) {
        console.error('Error al subir a R2:', uploadError);
        return new Response('Error al subir el archivo', { 
          status: 500,
          headers: corsHeaders
        });
      }
    } catch (error) {
      console.error('Error:', error);
      return new Response('Error interno del servidor', {
        status: 500,
        headers: corsHeaders
      });
    }
  },
}; 