const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Desplegando worker optimizado de galería...\n');

// Configuración del worker
const workerConfig = {
  name: 'gallery-optimized',
  script: '../workers/gallery/worker-optimized.js',
  wranglerConfig: {
    name: 'gallery-optimized',
    main: 'worker-optimized.js',
    compatibility_date: '2024-01-01',
    compatibility_flags: ['nodejs_compat'],
    env: {
      BUCKET: {
        binding: 'BUCKET',
        bucket_name: 'bucket-wedding' // <-- Cambiado aquí
      }
    }
  }
};

// Crear directorio temporal para el worker
const tempDir = path.join(__dirname, 'temp-gallery-worker');
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true });
}

// Copiar el worker optimizado
const workerPath = path.join(__dirname, workerConfig.script);
const tempWorkerPath = path.join(tempDir, 'worker-optimized.js');

if (fs.existsSync(workerPath)) {
  fs.copyFileSync(workerPath, tempWorkerPath);
  console.log('✅ Worker optimizado copiado');
} else {
  console.error('❌ No se encontró el archivo del worker:', workerPath);
  process.exit(1);
}

// Crear wrangler.toml
const wranglerConfig = `name = "${workerConfig.wranglerConfig.name}"
main = "${workerConfig.wranglerConfig.main}"
compatibility_date = "${workerConfig.wranglerConfig.compatibility_date}"
compatibility_flags = ${JSON.stringify(workerConfig.wranglerConfig.compatibility_flags)}

[[r2_buckets]]
binding = "${workerConfig.wranglerConfig.env.BUCKET.binding}"
bucket_name = "${workerConfig.wranglerConfig.env.BUCKET.bucket_name}"
jurisdiction = "eu"
`;

fs.writeFileSync(path.join(tempDir, 'wrangler.toml'), wranglerConfig);
console.log('✅ Configuración wrangler.toml creada');

// Desplegar el worker
try {
  console.log('\n📦 Desplegando worker...');
  execSync('npx wrangler deploy', { 
    cwd: tempDir, 
    stdio: 'inherit' 
  });
  console.log('\n✅ Worker optimizado desplegado exitosamente!');
  
  // Mostrar información del despliegue
  console.log('\n📋 Información del despliegue:');
  console.log(`   Nombre: ${workerConfig.wranglerConfig.name}`);
  console.log(`   URL: https://${workerConfig.wranglerConfig.name}.carlospg93.workers.dev`);
  console.log(`   Bucket: ${workerConfig.wranglerConfig.env.BUCKET.bucket_name}`);
  
  console.log('\n🔧 Características del worker optimizado:');
  console.log('   • Thumbnails automáticos para imágenes');
  console.log('   • Cache agresivo para reducir tráfico');
  console.log('   • URLs separadas para preview y descarga');
  console.log('   • Optimización de archivos grandes');
  console.log('   • Soporte para múltiples formatos');
  
} catch (error) {
  console.error('\n❌ Error durante el despliegue:', error.message);
  process.exit(1);
} finally {
  // Limpiar archivos temporales
  if (fs.existsSync(tempDir)) {
    fs.rmSync(tempDir, { recursive: true, force: true });
    console.log('\n🧹 Archivos temporales limpiados');
  }
}

console.log('\n🎉 ¡Despliegue completado!');
console.log('\n📝 Próximos pasos:');
console.log('   1. Actualiza la URL del worker en Gallery.tsx si es necesario');
console.log('   2. Prueba la carga de imágenes en la galería');
console.log('   3. Verifica que los thumbnails se cargan correctamente');
console.log('   4. Comprueba que las descargas usan archivos originales');
