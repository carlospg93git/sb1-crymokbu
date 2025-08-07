// Cargar variables de entorno desde .env
require('dotenv').config();

const { S3Client, ListObjectsV2Command, HeadBucketCommand } = require('@aws-sdk/client-s3');

console.log('🔍 Diagnóstico Específico para bucket-wedding');
console.log('============================================');
console.log('');

// Configuración
const config = {
  accountId: process.env.CLOUDFLARE_ACCOUNT_ID,
  accessKeyId: process.env.CLOUDFLARE_ACCESS_KEY_ID,
  secretAccessKey: process.env.CLOUDFLARE_SECRET_ACCESS_KEY,
  bucketName: 'bucket-wedding'
};

console.log('📋 Configuración actual:');
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

async function diagnosticoEspecifico() {
  try {
    console.log('🔗 Paso 1: Verificando si el bucket existe...');
    
    const headBucketCommand = new HeadBucketCommand({
      Bucket: config.bucketName
    });
    
    await s3Client.send(headBucketCommand);
    console.log('✅ El bucket existe y es accesible');
    
    console.log('');
    console.log('📋 Paso 2: Intentando listar objetos...');
    
    const listObjectsCommand = new ListObjectsV2Command({
      Bucket: config.bucketName,
      MaxKeys: 5
    });
    
    const response = await s3Client.send(listObjectsCommand);
    
    console.log('✅ ¡Acceso exitoso al bucket!');
    console.log(`📊 Total de archivos: ${response.KeyCount || 0}`);
    
    if (response.Contents && response.Contents.length > 0) {
      console.log('');
      console.log('📋 Primeros archivos encontrados:');
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
      console.log('💡 El bucket no existe');
      console.log('Verifica:');
      console.log('1. El nombre del bucket es exactamente "bucket-wedding"');
      console.log('2. El bucket está en la cuenta correcta');
      console.log('3. El Account ID es correcto');
    } else if (error.Code === 'AccessDenied') {
      console.log('');
      console.log('💡 No tienes permisos para acceder al bucket');
      console.log('Verifica que el token tenga:');
      console.log('1. Permisos "Object Read" para el bucket bucket-wedding');
      console.log('2. Permisos "Bucket Read" para el bucket bucket-wedding');
      console.log('3. El token esté configurado para "Specific bucket" → bucket-wedding');
    } else if (error.Code === 'Unauthorized') {
      console.log('');
      console.log('💡 Credenciales incorrectas');
      console.log('Verifica:');
      console.log('1. El Access Key ID es correcto');
      console.log('2. El Secret Access Key es correcto');
      console.log('3. El Account ID es correcto');
    } else {
      console.log('');
      console.log('💡 Error desconocido');
      console.log('Verifica la configuración del token en Cloudflare');
    }
  }
}

diagnosticoEspecifico(); 