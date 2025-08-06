// Cargar variables de entorno desde .env
require('dotenv').config();

const { S3Client, ListObjectsV2Command } = require('@aws-sdk/client-s3');

console.log('🎯 Prueba Directa del Bucket');
console.log('============================');
console.log('');

// Configuración
const config = {
  accountId: process.env.CLOUDFLARE_ACCOUNT_ID,
  accessKeyId: process.env.CLOUDFLARE_ACCESS_KEY_ID,
  secretAccessKey: process.env.CLOUDFLARE_SECRET_ACCESS_KEY,
  bucketName: 'bucket-wedding'
};

console.log('📋 Configuración:');
console.log(`Account ID: ${config.accountId}`);
console.log(`Access Key ID: ${config.accessKeyId}`);
console.log(`Secret Access Key: ${config.secretAccessKey ? '***configurado***' : '❌ NO CONFIGURADO'}`);
console.log(`Bucket: ${config.bucketName}`);
console.log('');

if (!config.accountId || !config.accessKeyId || !config.secretAccessKey) {
  console.log('❌ ERROR: Faltan credenciales');
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

async function probarDirecto() {
  try {
    console.log('🔗 Probando acceso directo al bucket...');
    
    const listObjectsCommand = new ListObjectsV2Command({
      Bucket: config.bucketName,
      MaxKeys: 10
    });
    
    const response = await s3Client.send(listObjectsCommand);
    
    console.log('✅ ¡Acceso exitoso al bucket!');
    console.log(`📊 Total de archivos: ${response.KeyCount || 0}`);
    
    if (response.Contents && response.Contents.length > 0) {
      console.log('');
      console.log('📋 Archivos encontrados:');
      response.Contents.forEach((obj, index) => {
        const size = (obj.Size / 1024 / 1024).toFixed(2);
        console.log(`  ${index + 1}. ${obj.Key} (${size} MB)`);
      });
      
      console.log('');
      console.log('🎉 ¡Todo funciona! Puedes ejecutar la descarga:');
      console.log('npm run download');
    } else {
      console.log('');
      console.log('ℹ️ El bucket está vacío');
    }
    
  } catch (error) {
    console.log('❌ Error:', error.message);
    
    if (error.Code === 'NoSuchBucket') {
      console.log('');
      console.log('💡 El bucket no existe o no es accesible');
      console.log('Verifica:');
      console.log('1. El nombre del bucket es correcto');
      console.log('2. El token tiene permisos para este bucket');
      console.log('3. El bucket está en la cuenta correcta');
    } else if (error.Code === 'AccessDenied') {
      console.log('');
      console.log('💡 No tienes permisos para acceder al bucket');
      console.log('Verifica:');
      console.log('1. El token tiene permisos "Object Read"');
      console.log('2. El token está configurado para este bucket específico');
    } else {
      console.log('');
      console.log('💡 Error desconocido');
      console.log('Verifica las credenciales y la configuración');
    }
  }
}

probarDirecto(); 