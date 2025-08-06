// Cargar variables de entorno desde .env
require('dotenv').config();

const { S3Client, ListObjectsV2Command, GetObjectCommand } = require('@aws-sdk/client-s3');
const fs = require('fs');
const path = require('path');
const { pipeline } = require('stream/promises');

// Configuración de Cloudflare R2
const config = {
  accountId: process.env.CLOUDFLARE_ACCOUNT_ID || '',
  accessKeyId: process.env.CLOUDFLARE_ACCESS_KEY_ID || '',
  secretAccessKey: process.env.CLOUDFLARE_SECRET_ACCESS_KEY || '',
  bucketName: 'bucket-wedding',
  region: 'auto' // Cloudflare R2 detecta automáticamente la región
};

// Crear cliente S3 compatible con R2
const s3Client = new S3Client({
  region: config.region,
  endpoint: `https://${config.accountId}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: config.accessKeyId,
    secretAccessKey: config.secretAccessKey,
  },
});

// Función para listar todos los objetos en el bucket
async function listAllObjects() {
  const objects = [];
  let continuationToken = undefined;
  
  do {
    const command = new ListObjectsV2Command({
      Bucket: config.bucketName,
      ContinuationToken: continuationToken,
    });
    
    const response = await s3Client.send(command);
    
    if (response.Contents) {
      objects.push(...response.Contents);
    }
    
    continuationToken = response.NextContinuationToken;
  } while (continuationToken);
  
  return objects;
}

// Función para descargar un archivo individual
async function downloadFile(key, outputDir) {
  try {
    const command = new GetObjectCommand({
      Bucket: config.bucketName,
      Key: key,
    });
    
    const response = await s3Client.send(command);
    
    // Crear directorio si no existe
    const filePath = path.join(outputDir, key);
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    // Descargar el archivo
    const fileStream = fs.createWriteStream(filePath);
    await pipeline(response.Body, fileStream);
    
    console.log(`✅ Descargado: ${key}`);
    return true;
  } catch (error) {
    console.error(`❌ Error descargando ${key}:`, error.message);
    return false;
  }
}

// Función principal para descarga masiva
async function downloadAllFiles() {
  try {
    console.log('🚀 Iniciando descarga masiva de archivos...');
    
    // Crear directorio de salida
    const outputDir = path.join(process.cwd(), 'downloads', new Date().toISOString().split('T')[0]);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    console.log(`📁 Directorio de salida: ${outputDir}`);
    
    // Listar todos los objetos
    console.log('📋 Listando archivos en el bucket...');
    const objects = await listAllObjects();
    
    if (objects.length === 0) {
      console.log('ℹ️ No se encontraron archivos en el bucket');
      return;
    }
    
    console.log(`📊 Total de archivos encontrados: ${objects.length}`);
    
    // Crear archivo de registro
    const logFile = path.join(outputDir, 'download-log.txt');
    const logStream = fs.createWriteStream(logFile);
    
    logStream.write(`Descarga iniciada: ${new Date().toISOString()}\n`);
    logStream.write(`Total de archivos: ${objects.length}\n\n`);
    
    // Descargar archivos con límite de concurrencia
    const concurrencyLimit = 5; // Descargar 5 archivos simultáneamente
    let successCount = 0;
    let errorCount = 0;
    
    for (let i = 0; i < objects.length; i += concurrencyLimit) {
      const batch = objects.slice(i, i + concurrencyLimit);
      
      const promises = batch.map(async (obj) => {
        const success = await downloadFile(obj.Key, outputDir);
        const logEntry = `${success ? '✅' : '❌'} ${obj.Key} (${obj.Size} bytes)\n`;
        logStream.write(logEntry);
        
        if (success) {
          successCount++;
        } else {
          errorCount++;
        }
        
        return success;
      });
      
      await Promise.all(promises);
      
      // Mostrar progreso
      const progress = Math.min(i + concurrencyLimit, objects.length);
      console.log(`📥 Progreso: ${progress}/${objects.length} (${Math.round(progress/objects.length*100)}%)`);
    }
    
    // Cerrar archivo de registro
    logStream.write(`\nDescarga completada: ${new Date().toISOString()}\n`);
    logStream.write(`Archivos exitosos: ${successCount}\n`);
    logStream.write(`Archivos con error: ${errorCount}\n`);
    logStream.end();
    
    console.log('\n🎉 Descarga completada!');
    console.log(`✅ Archivos exitosos: ${successCount}`);
    console.log(`❌ Archivos con error: ${errorCount}`);
    console.log(`📄 Log guardado en: ${logFile}`);
    console.log(`📁 Archivos descargados en: ${outputDir}`);
    
  } catch (error) {
    console.error('💥 Error durante la descarga:', error);
    process.exit(1);
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  // Verificar variables de entorno
  if (!config.accountId || !config.accessKeyId || !config.secretAccessKey) {
    console.error('❌ Error: Faltan variables de entorno requeridas');
    console.log('Por favor, configura las siguientes variables:');
    console.log('- CLOUDFLARE_ACCOUNT_ID');
    console.log('- CLOUDFLARE_ACCESS_KEY_ID');
    console.log('- CLOUDFLARE_SECRET_ACCESS_KEY');
    process.exit(1);
  }
  
  downloadAllFiles();
}

module.exports = { downloadAllFiles, listAllObjects, downloadFile }; 