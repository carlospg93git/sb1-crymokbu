// Cargar variables de entorno desde .env
require('dotenv').config();

const { S3Client, ListObjectsV2Command } = require('@aws-sdk/client-s3');

console.log('🔍 Prueba Directa del Bucket R2');
console.log('================================');
console.log('');

const config = {
  accountId: process.env.CLOUDFLARE_ACCOUNT_ID,
  accessKeyId: process.env.CLOUDFLARE_ACCESS_KEY_ID,
  secretAccessKey: process.env.CLOUDFLARE_SECRET_ACCESS_KEY,
  bucketName: 'bucket-wedding'
};

console.log('📋 Configuración:');
console.log(`   Account ID: ${config.accountId}`);
console.log(`   Access Key ID: ${config.accessKeyId}`);
console.log(`   Bucket Name: ${config.bucketName}`);
console.log('');

// Crear cliente S3 con configuración específica para el bucket
const s3Client = new S3Client({
  region: 'auto',
  endpoint: `https://${config.accountId}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: config.accessKeyId,
    secretAccessKey: config.secretAccessKey,
  },
});

async function probarBucketDirecto() {
  try {
    console.log('🔗 Probando acceso directo al bucket...');
    console.log(`   Endpoint: https://${config.accountId}.r2.cloudflarestorage.com`);
    console.log(`   Bucket: ${config.bucketName}`);
    console.log('');
    
    // Intentar acceder directamente al bucket
    const command = new ListObjectsV2Command({
      Bucket: config.bucketName,
      MaxKeys: 10
    });
    
    const response = await s3Client.send(command);
    
    console.log('✅ ¡ÉXITO! Bucket accesible');
    console.log(`📊 Archivos encontrados: ${response.KeyCount || 0}`);
    console.log(`📦 Total de archivos (aproximado): ${response.IsTruncated ? 'Más de 10' : response.KeyCount || 0}`);
    
    if (response.Contents && response.Contents.length > 0) {
      console.log('');
      console.log('📋 Primeros archivos:');
      response.Contents.forEach((obj, index) => {
        const size = (obj.Size / 1024 / 1024).toFixed(2);
        const fecha = obj.LastModified ? obj.LastModified.toLocaleDateString() : 'N/A';
        console.log(`   ${index + 1}. ${obj.Key} (${size} MB) - ${fecha}`);
      });
    }
    
    console.log('');
    console.log('🎉 ¡CONFIGURACIÓN FUNCIONA!');
    console.log('');
    console.log('💡 Ahora puedes ejecutar la descarga masiva:');
    console.log('   npm run download');
    
    return true;
    
  } catch (error) {
    console.log(`❌ Error: ${error.message}`);
    if (error.Code) {
      console.log(`📝 Código: ${error.Code}`);
    }
    
    console.log('');
    console.log('🔧 Análisis del error:');
    
    if (error.Code === 'NoSuchBucket') {
      console.log('💡 El bucket no existe o no tienes permisos para acceder');
      console.log('   Solución: Verifica que el bucket "bucket-wedding" existe');
    } else if (error.Code === 'AccessDenied') {
      console.log('💡 Acceso denegado - problema de permisos');
      console.log('   Solución: Crea un token con permisos Object Read + Bucket Read');
    } else if (error.Code === 'InvalidAccessKeyId') {
      console.log('💡 Access Key ID inválido');
      console.log('   Solución: Verifica las credenciales');
    } else if (error.Code === 'SignatureDoesNotMatch') {
      console.log('💡 Error de firma - Secret Access Key incorrecto');
      console.log('   Solución: Verifica las credenciales');
    } else {
      console.log('💡 Error desconocido');
      console.log('   Solución: Verifica la configuración');
    }
    
    console.log('');
    console.log('📞 Próximos pasos:');
    console.log('1. Ve a Cloudflare Dashboard → R2 Object Storage');
    console.log('2. Manage R2 API tokens → Create API token');
    console.log('3. Permisos: Object Read + Bucket Read');
    console.log('4. Resources: Specific bucket → bucket-wedding');
    console.log('5. Actualiza el archivo .env con las nuevas credenciales');
    
    return false;
  }
}

probarBucketDirecto(); 