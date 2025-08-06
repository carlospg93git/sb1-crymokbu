// Cargar variables de entorno desde .env
require('dotenv').config();

const { S3Client, ListBucketsCommand, ListObjectsV2Command, HeadBucketCommand } = require('@aws-sdk/client-s3');

console.log('🔍 Diagnóstico Detallado R2');
console.log('============================');
console.log('');

// Verificar configuración
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
console.log(`Endpoint: https://${config.accountId}.r2.cloudflarestorage.com`);
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

async function diagnostico() {
  try {
    console.log('🔗 Paso 1: Probando conexión básica...');
    
    // Intentar listar buckets
    const listBucketsCommand = new ListBucketsCommand({});
    const bucketsResponse = await s3Client.send(listBucketsCommand);
    
    console.log('✅ Conexión básica exitosa');
    console.log(`📦 Buckets encontrados: ${bucketsResponse.Buckets ? bucketsResponse.Buckets.length : 0}`);
    
    if (bucketsResponse.Buckets && bucketsResponse.Buckets.length > 0) {
      console.log('📋 Lista de buckets:');
      bucketsResponse.Buckets.forEach((bucket, index) => {
        console.log(`  ${index + 1}. ${bucket.Name} (${bucket.CreationDate})`);
      });
    }
    console.log('');
    
  } catch (error) {
    console.log('❌ Error en conexión básica:', error.message);
    console.log('💡 El token no tiene permisos para listar buckets');
    console.log('');
  }
  
  try {
    console.log('🔍 Paso 2: Verificando si el bucket existe...');
    
    // Intentar hacer HEAD del bucket
    const headBucketCommand = new HeadBucketCommand({
      Bucket: config.bucketName
    });
    
    await s3Client.send(headBucketCommand);
    console.log(`✅ Bucket "${config.bucketName}" existe`);
    console.log('');
    
  } catch (error) {
    console.log(`❌ Error verificando bucket "${config.bucketName}":`, error.message);
    
    if (error.Code === 'NoSuchBucket') {
      console.log('💡 El bucket no existe o no es accesible');
    } else if (error.Code === 'AccessDenied') {
      console.log('💡 No tienes permisos para acceder a este bucket');
    }
    console.log('');
  }
  
  try {
    console.log('📋 Paso 3: Intentando listar objetos del bucket...');
    
    const listObjectsCommand = new ListObjectsV2Command({
      Bucket: config.bucketName,
      MaxKeys: 5
    });
    
    const objectsResponse = await s3Client.send(listObjectsCommand);
    
    console.log(`✅ Acceso al bucket exitoso`);
    console.log(`📊 Objetos encontrados: ${objectsResponse.KeyCount || 0}`);
    
    if (objectsResponse.Contents && objectsResponse.Contents.length > 0) {
      console.log('📋 Primeros objetos:');
      objectsResponse.Contents.forEach((obj, index) => {
        const size = (obj.Size / 1024 / 1024).toFixed(2);
        console.log(`  ${index + 1}. ${obj.Key} (${size} MB)`);
      });
    }
    console.log('');
    
  } catch (error) {
    console.log(`❌ Error listando objetos:`, error.message);
    console.log('');
  }
  
  console.log('🎯 Resumen del diagnóstico:');
  console.log('==========================');
  console.log('');
  console.log('💡 Posibles problemas y soluciones:');
  console.log('');
  console.log('1. Si no hay buckets listados:');
  console.log('   - El token no tiene permisos "Bucket Read"');
  console.log('   - Crea un token con permisos más amplios');
  console.log('');
  console.log('2. Si el bucket no existe:');
  console.log('   - Verifica el nombre exacto del bucket');
  console.log('   - El bucket debe estar en la misma cuenta');
  console.log('');
  console.log('3. Si hay Access Denied:');
  console.log('   - El token no tiene permisos para este bucket específico');
  console.log('   - Verifica que el token incluya "Object Read"');
  console.log('');
  console.log('4. Si todo funciona:');
  console.log('   - Ejecuta: npm run download');
}

diagnostico(); 