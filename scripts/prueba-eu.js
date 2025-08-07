// Cargar variables de entorno desde .env
require('dotenv').config();

const { S3Client, ListObjectsV2Command } = require('@aws-sdk/client-s3');

console.log('🔍 Prueba Específica EU - bucket-wedding');
console.log('========================================');
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

// Probar diferentes configuraciones para EU
const configuraciones = [
  {
    name: 'Configuración 1: EU con weur',
    region: 'weur',
    endpoint: `https://${config.accountId}.r2.cloudflarestorage.com`
  },
  {
    name: 'Configuración 2: EU con eeur',
    region: 'eeur',
    endpoint: `https://${config.accountId}.r2.cloudflarestorage.com`
  },
  {
    name: 'Configuración 3: EU con auto',
    region: 'auto',
    endpoint: `https://${config.accountId}.r2.cloudflarestorage.com`
  },
  {
    name: 'Configuración 4: Endpoint EU específico',
    region: 'weur',
    endpoint: `https://${config.accountId}.r2.eu.cloudflarestorage.com`
  }
];

async function probarConfiguracion(configuracion) {
  console.log(`🔧 ${configuracion.name}`);
  console.log(`Endpoint: ${configuracion.endpoint}`);
  console.log(`Region: ${configuracion.region}`);
  
  const s3Client = new S3Client({
    region: configuracion.region,
    endpoint: configuracion.endpoint,
    credentials: {
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey,
    },
  });
  
  try {
    const listObjectsCommand = new ListObjectsV2Command({
      Bucket: config.bucketName,
      MaxKeys: 5
    });
    
    const response = await s3Client.send(listObjectsCommand);
    console.log('✅ ¡ÉXITO!');
    console.log(`📊 Archivos encontrados: ${response.KeyCount || 0}`);
    
    if (response.Contents && response.Contents.length > 0) {
      console.log('');
      console.log('📋 Primeros archivos:');
      response.Contents.forEach((obj, index) => {
        const size = (obj.Size / 1024 / 1024).toFixed(2);
        console.log(`  ${index + 1}. ${obj.Key} (${size} MB)`);
      });
    }
    
    return true;
  } catch (error) {
    console.log(`❌ Error: ${error.message}`);
    if (error.Code) {
      console.log(`   Código: ${error.Code}`);
    }
    return false;
  }
}

async function probarTodo() {
  for (const configuracion of configuraciones) {
    console.log('');
    const exito = await probarConfiguracion(configuracion);
    if (exito) {
      console.log('');
      console.log('🎉 ¡Encontramos una configuración que funciona!');
      console.log('Puedes ejecutar la descarga completa con:');
      console.log('npm run download');
      return;
    }
  }
  
  console.log('');
  console.log('❌ Ninguna configuración funcionó');
  console.log('');
  console.log('💡 Posibles problemas:');
  console.log('1. El token necesita tiempo para propagarse');
  console.log('2. El bucket está en una región diferente');
  console.log('3. Las credenciales son incorrectas');
}

probarTodo(); 