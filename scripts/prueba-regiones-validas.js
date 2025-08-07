// Cargar variables de entorno desde .env
require('dotenv').config();

const { S3Client, ListObjectsV2Command } = require('@aws-sdk/client-s3');

console.log('🔍 Prueba de Regiones Válidas R2');
console.log('=================================');
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

// Regiones válidas de Cloudflare R2
const regiones = [
  { codigo: 'auto', nombre: 'Auto-detect' },
  { codigo: 'wnam', nombre: 'Western North America' },
  { codigo: 'enam', nombre: 'Eastern North America' },
  { codigo: 'weur', nombre: 'Western Europe' },
  { codigo: 'eeur', nombre: 'Eastern Europe' },
  { codigo: 'apac', nombre: 'Asia Pacific' },
  { codigo: 'oc', nombre: 'Oceania' }
];

async function probarRegion(region) {
  console.log(`🔗 Probando región: ${region.nombre} (${region.codigo})`);
  
  const s3Client = new S3Client({
    region: region.codigo,
    endpoint: `https://${config.accountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey,
    },
  });

  try {
    const command = new ListObjectsV2Command({
      Bucket: config.bucketName,
      MaxKeys: 5
    });
    
    const response = await s3Client.send(command);
    
    console.log(`   ✅ ¡FUNCIONA! Bucket "${config.bucketName}" accesible`);
    console.log(`   📊 Archivos encontrados: ${response.KeyCount || 0}`);
    
    if (response.Contents && response.Contents.length > 0) {
      console.log(`   📋 Primeros archivos:`);
      response.Contents.forEach((obj, index) => {
        const size = (obj.Size / 1024 / 1024).toFixed(2);
        console.log(`      ${index + 1}. ${obj.Key} (${size} MB)`);
      });
    }
    
    console.log('');
    console.log('🎉 ¡REGION ENCONTRADA!');
    console.log(`💡 Usa esta configuración en download-r2-files.js:`);
    console.log(`   region: '${region.codigo}',`);
    console.log(`   endpoint: 'https://${config.accountId}.r2.cloudflarestorage.com',`);
    
    return true;
    
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
    if (error.Code) {
      console.log(`   📝 Código: ${error.Code}`);
    }
    return false;
  }
}

async function probarTodasLasRegiones() {
  console.log('🚀 Probando todas las regiones válidas...\n');
  
  let regionFuncional = null;
  
  for (const region of regiones) {
    const resultado = await probarRegion(region);
    if (resultado) {
      regionFuncional = region;
      break;
    }
    console.log('');
  }
  
  console.log('📊 RESUMEN:');
  if (regionFuncional) {
    console.log(`✅ Región funcional encontrada: ${regionFuncional.nombre} (${regionFuncional.codigo})`);
    console.log('');
    console.log('🔧 Actualiza el script download-r2-files.js con:');
    console.log(`   region: '${regionFuncional.codigo}',`);
    console.log(`   endpoint: 'https://${config.accountId}.r2.cloudflarestorage.com',`);
  } else {
    console.log('❌ Ninguna región funcionó');
    console.log('');
    console.log('💡 Posibles problemas:');
    console.log('1. El bucket "bucket-wedding" no existe en tu cuenta R2');
    console.log('2. Las credenciales no tienen permisos para este bucket');
    console.log('3. El bucket está en una cuenta diferente');
    console.log('');
    console.log('🔧 Soluciones:');
    console.log('1. Verifica que el bucket existe en el dashboard de Cloudflare');
    console.log('2. Crea el bucket si no existe');
    console.log('3. Verifica que las credenciales tengan permisos adecuados');
  }
}

probarTodasLasRegiones(); 