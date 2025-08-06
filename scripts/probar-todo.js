// Cargar variables de entorno desde .env
require('dotenv').config();

const { S3Client, ListBucketsCommand, ListObjectsV2Command } = require('@aws-sdk/client-s3');

console.log('🔍 Prueba Completa de Configuración R2');
console.log('======================================');
console.log('');

// Configuración
const config = {
  accountId: process.env.CLOUDFLARE_ACCOUNT_ID,
  accessKeyId: process.env.CLOUDFLARE_ACCESS_KEY_ID,
  secretAccessKey: process.env.CLOUDFLARE_SECRET_ACCESS_KEY
};

console.log('📋 Credenciales:');
console.log(`Account ID: ${config.accountId}`);
console.log(`Access Key ID: ${config.accessKeyId}`);
console.log(`Secret Access Key: ${config.secretAccessKey ? '***configurado***' : '❌ NO CONFIGURADO'}`);
console.log('');

// Diferentes configuraciones a probar
const configs = [
  {
    name: 'Configuración 1: Endpoint estándar',
    endpoint: `https://${config.accountId}.r2.cloudflarestorage.com`,
    region: 'auto'
  },
  {
    name: 'Configuración 2: Endpoint con región EU',
    endpoint: `https://${config.accountId}.r2.eu.cloudflarestorage.com`,
    region: 'eu'
  },
  {
    name: 'Configuración 3: Endpoint con región US',
    endpoint: `https://${config.accountId}.r2.us.cloudflarestorage.com`,
    region: 'us'
  },
  {
    name: 'Configuración 4: Endpoint con región APAC',
    endpoint: `https://${config.accountId}.r2.ap.cloudflarestorage.com`,
    region: 'ap'
  }
];

// Nombres de bucket a probar
const bucketNames = [
  'bucket-wedding',
  'bucket-boda',
  'wedding-bucket',
  'boda-bucket',
  'wedding-uploads',
  'uploads',
  'files',
  'media',
  'photos',
  'videos',
  'gallery',
  'wedding-gallery',
  'boda-gallery'
];

async function probarConfiguracion(configInfo) {
  console.log(`\n🔧 ${configInfo.name}`);
  console.log(`Endpoint: ${configInfo.endpoint}`);
  console.log(`Region: ${configInfo.region}`);
  
  const s3Client = new S3Client({
    region: configInfo.region,
    endpoint: configInfo.endpoint,
    credentials: {
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey,
    },
  });

  try {
    // Probar listar buckets
    const listBucketsCommand = new ListBucketsCommand({});
    const bucketsResponse = await s3Client.send(listBucketsCommand);
    
    console.log(`✅ Conexión exitosa`);
    console.log(`📦 Buckets encontrados: ${bucketsResponse.Buckets ? bucketsResponse.Buckets.length : 0}`);
    
    if (bucketsResponse.Buckets && bucketsResponse.Buckets.length > 0) {
      console.log('📋 Buckets disponibles:');
      bucketsResponse.Buckets.forEach((bucket, index) => {
        console.log(`  ${index + 1}. ${bucket.Name} (${bucket.CreationDate})`);
      });
      
      // Probar cada bucket encontrado
      for (const bucket of bucketsResponse.Buckets) {
        try {
          const listObjectsCommand = new ListObjectsV2Command({
            Bucket: bucket.Name,
            MaxKeys: 3
          });
          
          const objectsResponse = await s3Client.send(listObjectsCommand);
          console.log(`  📊 ${bucket.Name}: ${objectsResponse.KeyCount || 0} archivos`);
          
          if (objectsResponse.Contents && objectsResponse.Contents.length > 0) {
            console.log('    📋 Primeros archivos:');
            objectsResponse.Contents.forEach((obj, index) => {
              const size = (obj.Size / 1024 / 1024).toFixed(2);
              console.log(`      ${index + 1}. ${obj.Key} (${size} MB)`);
            });
          }
        } catch (bucketError) {
          console.log(`  ❌ Error con bucket ${bucket.Name}: ${bucketError.message}`);
        }
      }
      
      return true; // Encontramos buckets
    } else {
      console.log('ℹ️ No hay buckets en esta configuración');
    }
    
  } catch (error) {
    console.log(`❌ Error: ${error.message}`);
  }
  
  return false;
}

async function probarBucketsEspecificos() {
  console.log('\n🎯 Probando buckets específicos...');
  
  // Usar la primera configuración que funcionó
  const s3Client = new S3Client({
    region: 'auto',
    endpoint: `https://${config.accountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey,
    },
  });

  for (const bucketName of bucketNames) {
    try {
      const listObjectsCommand = new ListObjectsV2Command({
        Bucket: bucketName,
        MaxKeys: 1
      });
      
      const response = await s3Client.send(listObjectsCommand);
      console.log(`✅ Bucket "${bucketName}" encontrado (${response.KeyCount || 0} archivos)`);
      
      if (response.Contents && response.Contents.length > 0) {
        const obj = response.Contents[0];
        const size = (obj.Size / 1024 / 1024).toFixed(2);
        console.log(`   📄 Ejemplo: ${obj.Key} (${size} MB)`);
      }
      
    } catch (error) {
      // No mostrar errores para buckets que no existen
    }
  }
}

async function main() {
  let configuracionExitosa = false;
  
  // Probar todas las configuraciones
  for (const configInfo of configs) {
    const resultado = await probarConfiguracion(configInfo);
    if (resultado) {
      configuracionExitosa = true;
      break;
    }
  }
  
  if (!configuracionExitosa) {
    console.log('\n❌ No se encontró ninguna configuración que funcione');
    console.log('\n💡 Posibles soluciones:');
    console.log('1. Verifica que las credenciales son correctas');
    console.log('2. Verifica que el Account ID es correcto');
    console.log('3. Crea un token con permisos "All buckets"');
    console.log('4. Verifica que tienes buckets en tu cuenta R2');
  } else {
    // Probar buckets específicos
    await probarBucketsEspecificos();
  }
  
  console.log('\n🎯 Resumen:');
  console.log('Si encontraste buckets, actualiza el script con la configuración correcta');
  console.log('Si no encontraste nada, verifica las credenciales y permisos');
}

main(); 