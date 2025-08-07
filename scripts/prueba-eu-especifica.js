// Cargar variables de entorno desde .env
require('dotenv').config();

const { S3Client, ListObjectsV2Command, ListBucketsCommand } = require('@aws-sdk/client-s3');

console.log('🔍 Prueba Específica EU R2');
console.log('==========================');
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

// Probar con el endpoint EU específico
const s3Client = new S3Client({
  region: 'eu-west-1', // Región específica para EU
  endpoint: `https://${config.accountId}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: config.accessKeyId,
    secretAccessKey: config.secretAccessKey,
  },
});

async function probarEU() {
  try {
    console.log('🔗 Probando conexión con región EU...');
    console.log(`   Endpoint: https://${config.accountId}.r2.cloudflarestorage.com`);
    console.log(`   Región: eu-west-1`);
    console.log('');
    
    // Probar listar buckets
    console.log('📦 Paso 1: Listando buckets...');
    const listBucketsCommand = new ListBucketsCommand({});
    const bucketsResponse = await s3Client.send(listBucketsCommand);
    
    console.log(`   ✅ Conexión exitosa`);
    console.log(`   📦 Buckets encontrados: ${bucketsResponse.Buckets ? bucketsResponse.Buckets.length : 0}`);
    
    if (bucketsResponse.Buckets && bucketsResponse.Buckets.length > 0) {
      console.log(`   📋 Buckets:`);
      bucketsResponse.Buckets.forEach((bucket, index) => {
        console.log(`      ${index + 1}. ${bucket.Name}`);
      });
    }
    
    console.log('');
    
    // Probar acceder al bucket específico
    console.log('🔍 Paso 2: Accediendo al bucket específico...');
    const command = new ListObjectsV2Command({
      Bucket: config.bucketName,
      MaxKeys: 10
    });
    
    const response = await s3Client.send(command);
    
    console.log(`   ✅ Bucket "${config.bucketName}" accesible`);
    console.log(`   📊 Archivos encontrados: ${response.KeyCount || 0}`);
    
    if (response.Contents && response.Contents.length > 0) {
      console.log(`   📋 Primeros archivos:`);
      response.Contents.forEach((obj, index) => {
        const size = (obj.Size / 1024 / 1024).toFixed(2);
        console.log(`      ${index + 1}. ${obj.Key} (${size} MB)`);
      });
    }
    
    console.log('');
    console.log('🎉 ¡CONFIGURACIÓN EU FUNCIONA!');
    console.log('');
    console.log('💡 Actualiza el script download-r2-files.js con:');
    console.log('   region: "eu-west-1",');
    console.log('   endpoint: `https://${config.accountId}.r2.cloudflarestorage.com`,');
    
  } catch (error) {
    console.log(`❌ Error: ${error.message}`);
    if (error.Code) {
      console.log(`📝 Código: ${error.Code}`);
    }
    console.log('');
    console.log('🔧 Intentando con región "auto"...');
    
    // Probar con región auto
    const s3ClientAuto = new S3Client({
      region: 'auto',
      endpoint: `https://${config.accountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey,
      },
    });
    
    try {
      const commandAuto = new ListObjectsV2Command({
        Bucket: config.bucketName,
        MaxKeys: 5
      });
      
      const responseAuto = await s3ClientAuto.send(commandAuto);
      
      console.log(`✅ Bucket "${config.bucketName}" accesible con región "auto"`);
      console.log(`📊 Archivos encontrados: ${responseAuto.KeyCount || 0}`);
      
      if (responseAuto.Contents && responseAuto.Contents.length > 0) {
        console.log(`📋 Primeros archivos:`);
        responseAuto.Contents.forEach((obj, index) => {
          const size = (obj.Size / 1024 / 1024).toFixed(2);
          console.log(`   ${index + 1}. ${obj.Key} (${size} MB)`);
        });
      }
      
      console.log('');
      console.log('🎉 ¡CONFIGURACIÓN "auto" FUNCIONA!');
      
    } catch (errorAuto) {
      console.log(`❌ Error con región "auto": ${errorAuto.message}`);
      console.log('');
      console.log('💡 Posibles soluciones:');
      console.log('1. Verifica que el bucket "bucket-wedding" existe en tu cuenta R2');
      console.log('2. Verifica que las credenciales tengan permisos para este bucket');
      console.log('3. Intenta crear el bucket desde el dashboard de Cloudflare');
    }
  }
}

probarEU(); 