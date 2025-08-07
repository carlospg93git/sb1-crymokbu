// Cargar variables de entorno desde .env
require('dotenv').config();

const { S3Client, ListObjectsV2Command, ListBucketsCommand } = require('@aws-sdk/client-s3');

console.log('🔍 Prueba de Endpoints R2');
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

// Probar diferentes configuraciones de endpoint
const endpoints = [
  {
    name: 'Endpoint por defecto (auto)',
    region: 'auto',
    endpoint: `https://${config.accountId}.r2.cloudflarestorage.com`
  },
  {
    name: 'Endpoint EU específico',
    region: 'eu',
    endpoint: `https://${config.accountId}.r2.eu.cloudflarestorage.com`
  },
  {
    name: 'Endpoint US específico',
    region: 'us',
    endpoint: `https://${config.accountId}.r2.us.cloudflarestorage.com`
  },
  {
    name: 'Endpoint APAC específico',
    region: 'apac',
    endpoint: `https://${config.accountId}.r2.ap.cloudflarestorage.com`
  }
];

async function probarEndpoint(endpointConfig) {
  console.log(`🔗 Probando: ${endpointConfig.name}`);
  console.log(`   Endpoint: ${endpointConfig.endpoint}`);
  
  const s3Client = new S3Client({
    region: endpointConfig.region,
    endpoint: endpointConfig.endpoint,
    credentials: {
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey,
    },
  });

  try {
    // Probar listar buckets primero
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
    
    // Probar acceder al bucket específico
    const command = new ListObjectsV2Command({
      Bucket: config.bucketName,
      MaxKeys: 5
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
    
    console.log(`   🎉 ¡ESTE ENDPOINT FUNCIONA!`);
    return true;
    
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
    if (error.Code) {
      console.log(`   📝 Código: ${error.Code}`);
    }
    return false;
  }
  
  console.log('');
}

async function probarTodosLosEndpoints() {
  console.log('🚀 Iniciando pruebas de endpoints...\n');
  
  let endpointFuncional = null;
  
  for (const endpointConfig of endpoints) {
    const resultado = await probarEndpoint(endpointConfig);
    if (resultado) {
      endpointFuncional = endpointConfig;
      break;
    }
    console.log('');
  }
  
  console.log('📊 RESUMEN:');
  if (endpointFuncional) {
    console.log(`✅ Endpoint funcional encontrado: ${endpointFuncional.name}`);
    console.log(`🔗 URL: ${endpointFuncional.endpoint}`);
    console.log(`🌍 Región: ${endpointFuncional.region}`);
    console.log('');
    console.log('💡 Para usar este endpoint, actualiza el script download-r2-files.js con:');
    console.log(`   region: '${endpointFuncional.region}',`);
    console.log(`   endpoint: '${endpointFuncional.endpoint}',`);
  } else {
    console.log('❌ Ningún endpoint funcionó');
    console.log('💡 Verifica:');
    console.log('   1. Que las credenciales sean correctas');
    console.log('   2. Que el bucket "bucket-wedding" exista');
    console.log('   3. Que el token tenga permisos adecuados');
  }
}

probarTodosLosEndpoints(); 