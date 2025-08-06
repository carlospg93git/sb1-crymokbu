// Cargar variables de entorno desde .env
require('dotenv').config();

const { S3Client, ListObjectsV2Command } = require('@aws-sdk/client-s3');

console.log('🔍 Verificación Rápida R2');
console.log('==========================');
console.log('');

// Verificar configuración
const config = {
  accountId: process.env.CLOUDFLARE_ACCOUNT_ID,
  accessKeyId: process.env.CLOUDFLARE_ACCESS_KEY_ID,
  secretAccessKey: process.env.CLOUDFLARE_SECRET_ACCESS_KEY,
  bucketName: 'bucket-wedding'
};

if (!config.accountId || !config.accessKeyId || !config.secretAccessKey) {
  console.log('❌ Faltan credenciales en .env');
  console.log('💡 Edita el archivo .env con tus credenciales R2');
  process.exit(1);
}

// Crear cliente S3
const s3Client = new S3Client({
  region: 'auto',
  endpoint: `https://${config.accountId}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: config.accessKeyId,
    secretAccessKey: config.secretAccessKey,
  },
});

async function verificar() {
  try {
    console.log('🔗 Probando conexión...');
    
    const command = new ListObjectsV2Command({
      Bucket: config.bucketName,
      MaxKeys: 10
    });
    
    const response = await s3Client.send(command);
    
    console.log('✅ Conexión exitosa!');
    console.log(`📦 Bucket: ${config.bucketName}`);
    console.log(`📊 Archivos encontrados: ${response.KeyCount || 0}`);
    
    if (response.Contents && response.Contents.length > 0) {
      console.log('');
      console.log('📋 Archivos disponibles:');
      response.Contents.forEach((obj, index) => {
        const size = (obj.Size / 1024 / 1024).toFixed(2);
        console.log(`  ${index + 1}. ${obj.Key} (${size} MB)`);
      });
      
      console.log('');
      console.log('🎉 ¡Listo para descargar!');
      console.log('💡 Ejecuta: npm run download');
    } else {
      console.log('');
      console.log('ℹ️ El bucket está vacío');
      console.log('💡 Sube algunos archivos antes de descargar');
    }
    
  } catch (error) {
    console.log('❌ Error:', error.message);
    
    if (error.Code === 'NoSuchBucket') {
      console.log('');
      console.log('💡 Solución:');
      console.log('1. Ve a Cloudflare Dashboard → R2 Object Storage');
      console.log('2. Crea un bucket llamado "bucket-wedding"');
    } else if (error.Code === 'AccessDenied') {
      console.log('');
      console.log('💡 Solución:');
      console.log('1. Verifica las credenciales en .env');
      console.log('2. Crea un token con permisos Object Read + Bucket Read');
    }
  }
}

verificar(); 