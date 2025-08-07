// Cargar variables de entorno desde .env
require('dotenv').config();

const { S3Client, ListObjectsV2Command, ListBucketsCommand } = require('@aws-sdk/client-s3');

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

console.log('📋 Configuración actual:');
console.log(`   Account ID: ${config.accountId ? '✅ Configurado' : '❌ Faltante'}`);
console.log(`   Access Key ID: ${config.accessKeyId ? '✅ Configurado' : '❌ Faltante'}`);
console.log(`   Secret Access Key: ${config.secretAccessKey ? '✅ Configurado' : '❌ Faltante'}`);
console.log(`   Bucket Name: ${config.bucketName}`);
console.log('');

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

async function diagnosticoDetallado() {
  try {
    console.log('🔗 Paso 1: Probando conexión básica...');
    
    // Primero intentar listar buckets para verificar permisos básicos
    try {
      const listBucketsCommand = new ListBucketsCommand({});
      const bucketsResponse = await s3Client.send(listBucketsCommand);
      
      console.log('✅ Conexión básica exitosa!');
      console.log(`📦 Buckets disponibles: ${bucketsResponse.Buckets ? bucketsResponse.Buckets.length : 0}`);
      
      if (bucketsResponse.Buckets && bucketsResponse.Buckets.length > 0) {
        console.log('📋 Lista de buckets:');
        bucketsResponse.Buckets.forEach((bucket, index) => {
          console.log(`   ${index + 1}. ${bucket.Name} (creado: ${bucket.CreationDate})`);
        });
      }
      
    } catch (bucketsError) {
      console.log('⚠️ No se pueden listar buckets (esto es normal si el token solo tiene acceso a buckets específicos)');
      console.log(`   Error: ${bucketsError.message}`);
    }
    
    console.log('');
    console.log('🔗 Paso 2: Probando acceso al bucket específico...');
    
    // Intentar acceder al bucket específico
    const command = new ListObjectsV2Command({
      Bucket: config.bucketName,
      MaxKeys: 5
    });
    
    const response = await s3Client.send(command);
    
    console.log('✅ Acceso al bucket exitoso!');
    console.log(`📦 Bucket: ${config.bucketName}`);
    console.log(`📊 Archivos encontrados: ${response.KeyCount || 0}`);
    
    if (response.Contents && response.Contents.length > 0) {
      console.log('');
      console.log('📋 Primeros archivos:');
      response.Contents.forEach((obj, index) => {
        const size = (obj.Size / 1024 / 1024).toFixed(2);
        console.log(`   ${index + 1}. ${obj.Key} (${size} MB)`);
      });
      
      console.log('');
      console.log('🎉 ¡Todo está funcionando correctamente!');
      console.log('💡 Ejecuta: npm run download');
      
    } else {
      console.log('');
      console.log('ℹ️ El bucket está vacío');
      console.log('💡 Sube algunos archivos antes de descargar');
    }
    
  } catch (error) {
    console.log('❌ Error específico:', error.message);
    console.log(`   Código: ${error.Code || 'N/A'}`);
    console.log(`   Status Code: ${error.$metadata?.httpStatusCode || 'N/A'}`);
    
    console.log('');
    console.log('🔧 Análisis del error:');
    
    if (error.Code === 'NoSuchBucket') {
      console.log('💡 El bucket "bucket-wedding" no existe');
      console.log('   Solución:');
      console.log('   1. Ve a Cloudflare Dashboard → R2 Object Storage');
      console.log('   2. Crea un bucket llamado "bucket-wedding"');
      console.log('   3. Asegúrate de que esté en la región correcta');
      
    } else if (error.Code === 'AccessDenied') {
      console.log('💡 Acceso denegado - problema de permisos');
      console.log('   Posibles causas:');
      console.log('   1. Las credenciales son incorrectas');
      console.log('   2. El token no tiene permisos suficientes');
      console.log('   3. El Account ID es incorrecto');
      console.log('   Solución:');
      console.log('   1. Ve a Cloudflare Dashboard → R2 Object Storage');
      console.log('   2. Ve a "Manage R2 API tokens"');
      console.log('   3. Crea un nuevo token con estos permisos:');
      console.log('      - Object Read');
      console.log('      - Bucket Read');
      console.log('   4. Actualiza el archivo .env con las nuevas credenciales');
      
    } else if (error.Code === 'InvalidAccessKeyId') {
      console.log('💡 Access Key ID inválido');
      console.log('   Solución: Verifica que el Access Key ID sea correcto');
      
    } else if (error.Code === 'SignatureDoesNotMatch') {
      console.log('💡 Error de firma - Secret Access Key incorrecto');
      console.log('   Solución: Verifica que el Secret Access Key sea correcto');
      
    } else {
      console.log('💡 Error desconocido');
      console.log('   Solución:');
      console.log('   1. Verifica tu conexión a internet');
      console.log('   2. Revisa que las credenciales sean correctas');
      console.log('   3. Intenta crear un nuevo token R2');
    }
    
    console.log('');
    console.log('🔗 URL del endpoint:');
    console.log(`   https://${config.accountId}.r2.cloudflarestorage.com`);
  }
}

diagnosticoDetallado(); 