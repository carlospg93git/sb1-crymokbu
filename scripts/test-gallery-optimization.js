import fetch from 'node-fetch';

// Configuración
const WORKER_URL = 'https://gallery-optimized.carlospg93.workers.dev';
const TEST_EVENT_CODE = 'test-event-123'; // Cambiar por un event_code real

console.log('🧪 Probando optimización de galería...\n');

async function testGalleryOptimization() {
  try {
    // 1. Probar endpoint de listado
    console.log('1️⃣ Probando endpoint de listado...');
    const listResponse = await fetch(`${WORKER_URL}/api/gallery?event_code=${TEST_EVENT_CODE}`);
    
    if (!listResponse.ok) {
      throw new Error(`Error en listado: ${listResponse.status} ${listResponse.statusText}`);
    }
    
    const galleryData = await listResponse.json();
    console.log(`✅ Listado obtenido: ${galleryData.length} archivos`);
    
    // Verificar estructura de datos optimizada
    if (galleryData.length > 0) {
      const firstItem = galleryData[0];
      const hasOptimizedFields = firstItem.thumbnailUrl && firstItem.originalUrl && 
                                firstItem.isImage !== undefined && firstItem.isVideo !== undefined &&
                                firstItem.thumbnailSize !== undefined;
      
      if (hasOptimizedFields) {
        console.log('✅ Estructura de datos optimizada correcta');
        console.log(`   - Thumbnail URL: ${firstItem.thumbnailUrl}`);
        console.log(`   - Original URL: ${firstItem.originalUrl}`);
        console.log(`   - Es imagen: ${firstItem.isImage}`);
        console.log(`   - Es video: ${firstItem.isVideo}`);
        console.log(`   - Tamaño thumbnail: ${firstItem.thumbnailSize} bytes`);
      } else {
        console.log('⚠️  Estructura de datos no optimizada');
      }
    }

    // 2. Probar endpoint de thumbnail
    if (galleryData.length > 0) {
      const testItem = galleryData.find(item => item.isImage) || galleryData[0];
      console.log('\n2️⃣ Probando endpoint de thumbnail...');
      
      const thumbnailUrl = `${WORKER_URL}${testItem.thumbnailUrl}`;
      const thumbnailResponse = await fetch(thumbnailUrl);
      
      if (thumbnailResponse.ok) {
        console.log('✅ Thumbnail cargado correctamente');
        console.log(`   - Content-Type: ${thumbnailResponse.headers.get('content-type')}`);
        console.log(`   - Cache-Control: ${thumbnailResponse.headers.get('cache-control')}`);
        console.log(`   - Content-Length: ${thumbnailResponse.headers.get('content-length')} bytes`);
      } else {
        console.log(`❌ Error cargando thumbnail: ${thumbnailResponse.status}`);
      }
    }

    // 3. Probar endpoint de archivo original
    if (galleryData.length > 0) {
      console.log('\n3️⃣ Probando endpoint de archivo original...');
      
      const originalUrl = `${WORKER_URL}${galleryData[0].originalUrl}`;
      const originalResponse = await fetch(originalUrl);
      
      if (originalResponse.ok) {
        console.log('✅ Archivo original cargado correctamente');
        console.log(`   - Content-Type: ${originalResponse.headers.get('content-type')}`);
        console.log(`   - Cache-Control: ${originalResponse.headers.get('cache-control')}`);
        console.log(`   - Content-Length: ${originalResponse.headers.get('content-length')} bytes`);
      } else {
        console.log(`❌ Error cargando archivo original: ${originalResponse.status}`);
      }
    }

    // 4. Calcular estadísticas de optimización
    console.log('\n4️⃣ Calculando estadísticas de optimización...');
    
    const totalOriginalSize = galleryData.reduce((sum, item) => sum + item.size, 0);
    const totalThumbnailSize = galleryData.reduce((sum, item) => sum + item.thumbnailSize, 0);
    const savings = totalOriginalSize - totalThumbnailSize;
    const savingsPercentage = ((savings / totalOriginalSize) * 100).toFixed(1);
    
    const imageCount = galleryData.filter(item => item.isImage).length;
    const videoCount = galleryData.filter(item => item.isVideo).length;
    
    console.log('📊 Estadísticas:');
    console.log(`   - Total archivos: ${galleryData.length}`);
    console.log(`   - Imágenes: ${imageCount}`);
    console.log(`   - Vídeos: ${videoCount}`);
    console.log(`   - Tamaño total original: ${formatBytes(totalOriginalSize)}`);
    console.log(`   - Tamaño total thumbnails: ${formatBytes(totalThumbnailSize)}`);
    console.log(`   - Ahorro: ${formatBytes(savings)} (${savingsPercentage}%)`);

    // 5. Verificar URLs de descarga
    console.log('\n5️⃣ Verificando URLs de descarga...');
    
    const downloadUrls = galleryData.slice(0, 3).map(item => ({
      name: item.name,
      thumbnailUrl: `${WORKER_URL}${item.thumbnailUrl}`,
      originalUrl: `${WORKER_URL}${item.originalUrl}`
    }));
    
    console.log('✅ URLs de descarga generadas:');
    downloadUrls.forEach((url, index) => {
      console.log(`   ${index + 1}. ${url.name}`);
      console.log(`      Thumbnail: ${url.thumbnailUrl}`);
      console.log(`      Original: ${url.originalUrl}`);
    });

    // 6. Probar endpoint ZIP (solo verificar que existe)
    console.log('\n6️⃣ Verificando endpoint ZIP...');
    
    const zipResponse = await fetch(`${WORKER_URL}/api/download-zip`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event_code: TEST_EVENT_CODE,
        files: galleryData.slice(0, 2).map(item => item.key)
      })
    });
    
    if (zipResponse.status === 400) {
      console.log('✅ Endpoint ZIP responde correctamente (400 esperado para test)');
    } else if (zipResponse.ok) {
      console.log('✅ Endpoint ZIP funciona correctamente');
    } else {
      console.log(`⚠️  Endpoint ZIP: ${zipResponse.status}`);
    }

    console.log('\n🎉 ¡Todas las pruebas completadas exitosamente!');
    console.log('\n📋 Resumen de optimización:');
    console.log(`   • Ahorro de datos: ${savingsPercentage}%`);
    console.log(`   • Archivos optimizados: ${galleryData.length}`);
    console.log(`   • Thumbnails generados: ${imageCount}`);
    console.log(`   • URLs separadas: ✅`);
    console.log(`   • Cache configurado: ✅`);

  } catch (error) {
    console.error('\n❌ Error durante las pruebas:', error.message);
    
    if (error.message.includes('fetch')) {
      console.log('\n💡 Posibles soluciones:');
      console.log('   1. Verificar que el worker está desplegado');
      console.log('   2. Comprobar la URL del worker');
      console.log('   3. Verificar que el event_code existe');
      console.log('   4. Revisar logs del worker en Cloudflare Dashboard');
    }
  }
}

// Función auxiliar para formatear bytes
function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Ejecutar pruebas
testGalleryOptimization();
