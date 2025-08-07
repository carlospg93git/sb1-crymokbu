// Cargar variables de entorno desde .env
require('dotenv').config();

const { S3Client, ListObjectsV2Command, ListBucketsCommand, CreateBucketCommand } = require('@aws-sdk/client-s3');
const fs = require('fs');
const path = require('path');

console.log('🔧 Solución Completa R2');
console.log('=======================');
console.log('');

// Verificar configuración
const config = {
  accountId: process.env.CLOUDFLARE_ACCOUNT_ID,
  accessKeyId: process.env.CLOUDFLARE_ACCESS_KEY_ID,
  secretAccessKey: process.env.CLOUDFLARE_SECRET_ACCESS_KEY,
  bucketName: 'bucket-wedding'
};

console.log('📋 Estado actual:');
console.log(`   Account ID: ${config.accountId ? '✅ Configurado' : '❌ Faltante'}`);
console.log(`   Access Key ID: ${config.accessKeyId ? '✅ Configurado' : '❌ Faltante'}`);
console.log(`   Secret Access Key: ${config.secretAccessKey ? '✅ Configurado' : '❌ Faltante'}`);
console.log(`   Bucket Name: ${config.bucketName}`);
console.log('');

if (!config.accountId || !config.accessKeyId || !config.secretAccessKey) {
  console.log('❌ PROBLEMA: Faltan credenciales en .env');
  console.log('');
  console.log('🔧 SOLUCIÓN:');
  console.log('1. Ve a https://dash.cloudflare.com');
  console.log('2. Selecciona tu cuenta');
  console.log('3. Ve a "R2 Object Storage"');
  console.log('4. Haz clic en "Manage R2 API tokens"');
  console.log('5. Crea un nuevo token con estos permisos:');
  console.log('   - Object Read');
  console.log('   - Bucket Read');
  console.log('   - Bucket Write (opcional, para crear bucket)');
  console.log('6. Copia las credenciales y actualiza el archivo .env');
  console.log('');
  console.log('📝 Ejemplo de .env:');
  console.log('CLOUDFLARE_ACCOUNT_ID=tu_account_id_aqui');
  console.log('CLOUDFLARE_ACCESS_KEY_ID=tu_access_key_id_aqui');
  console.log('CLOUDFLARE_SECRET_ACCESS_KEY=tu_secret_access_key_aqui');
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

async function solucionCompleta() {
  try {
    console.log('🔍 Paso 1: Verificando permisos básicos...');
    
    // Verificar si podemos listar buckets
    try {
      const listBucketsCommand = new ListBucketsCommand({});
      const bucketsResponse = await s3Client.send(listBucketsCommand);
      
      console.log('✅ Permisos básicos OK');
      console.log(`📦 Buckets disponibles: ${bucketsResponse.Buckets ? bucketsResponse.Buckets.length : 0}`);
      
      if (bucketsResponse.Buckets && bucketsResponse.Buckets.length > 0) {
        console.log('📋 Buckets encontrados:');
        bucketsResponse.Buckets.forEach((bucket, index) => {
          console.log(`   ${index + 1}. ${bucket.Name}`);
        });
      }
      
    } catch (bucketsError) {
      console.log('⚠️ No se pueden listar buckets (normal si el token es específico)');
    }
    
    console.log('');
    console.log('🔍 Paso 2: Verificando acceso al bucket...');
    
    // Intentar acceder al bucket específico
    try {
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
        console.log('📋 Archivos disponibles:');
        response.Contents.forEach((obj, index) => {
          const size = (obj.Size / 1024 / 1024).toFixed(2);
          console.log(`   ${index + 1}. ${obj.Key} (${size} MB)`);
        });
        
        console.log('');
        console.log('🎉 ¡Todo está funcionando!');
        console.log('💡 Ejecuta: npm run download');
        
      } else {
        console.log('');
        console.log('ℹ️ El bucket está vacío');
        console.log('💡 Sube algunos archivos antes de descargar');
      }
      
    } catch (bucketError) {
      console.log('❌ Error al acceder al bucket:', bucketError.message);
      
      if (bucketError.Code === 'NoSuchBucket') {
        console.log('');
        console.log('🔧 SOLUCIÓN: El bucket no existe');
        console.log('1. Ve a https://dash.cloudflare.com');
        console.log('2. Selecciona tu cuenta');
        console.log('3. Ve a "R2 Object Storage"');
        console.log('4. Haz clic en "Create bucket"');
        console.log('5. Nombre del bucket: bucket-wedding');
        console.log('6. Región: EU (Europe)');
        console.log('7. Haz clic en "Create bucket"');
        console.log('');
        console.log('💡 Alternativa: Crear bucket via API (si tienes permisos)');
        
        // Intentar crear el bucket si tenemos permisos
        try {
          console.log('🔄 Intentando crear bucket via API...');
          const createCommand = new CreateBucketCommand({
            Bucket: config.bucketName
          });
          
          await s3Client.send(createCommand);
          console.log('✅ Bucket creado exitosamente!');
          console.log('💡 Ahora puedes subir archivos y ejecutar: npm run download');
          
        } catch (createError) {
          console.log('❌ No se pudo crear el bucket via API');
          console.log('   Error:', createError.message);
          console.log('💡 Crea el bucket manualmente desde el dashboard');
        }
        
      } else if (bucketError.Code === 'AccessDenied') {
        console.log('');
        console.log('🔧 SOLUCIÓN: Problema de permisos');
        console.log('1. Ve a https://dash.cloudflare.com');
        console.log('2. Selecciona tu cuenta');
        console.log('3. Ve a "R2 Object Storage"');
        console.log('4. Haz clic en "Manage R2 API tokens"');
        console.log('5. Encuentra tu token actual y haz clic en "Edit"');
        console.log('6. Asegúrate de que tenga estos permisos:');
        console.log('   - Object Read');
        console.log('   - Bucket Read');
        console.log('7. Si no los tiene, crea un nuevo token');
        console.log('8. Actualiza el archivo .env con las nuevas credenciales');
        
      } else {
        console.log('');
        console.log('🔧 SOLUCIÓN: Error desconocido');
        console.log('1. Verifica tu conexión a internet');
        console.log('2. Revisa que las credenciales sean correctas');
        console.log('3. Intenta crear un nuevo token R2');
      }
    }
    
  } catch (error) {
    console.log('💥 Error general:', error.message);
    console.log('');
    console.log('🔧 SOLUCIÓN GENERAL:');
    console.log('1. Verifica que las credenciales en .env sean correctas');
    console.log('2. Crea un nuevo token R2 con permisos adecuados');
    console.log('3. Asegúrate de que el bucket "bucket-wedding" existe');
  }
  
  console.log('');
  console.log('📞 Comandos útiles:');
  console.log('   node verificar.js          - Verificación rápida');
  console.log('   node diagnostico-detallado.js - Diagnóstico completo');
  console.log('   npm run download          - Descarga masiva (cuando funcione)');
}

solucionCompleta(); 