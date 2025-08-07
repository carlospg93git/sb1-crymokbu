// Script para descargar archivos usando el Worker de la galería como proxy
const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

console.log('🚀 Descarga Masiva via Worker Gallery');
console.log('=====================================');
console.log('');

// Configuración
const config = {
  workerUrl: 'https://gallery.carlospg93.workers.dev',
  eventCode: 'wedding', // Cambia esto por tu event_code
  outputDir: path.join(process.cwd(), 'downloads', new Date().toISOString().split('T')[0]),
  concurrencyLimit: 3, // Descargar 3 archivos simultáneamente
  retryAttempts: 3
};

console.log('📋 Configuración:');
console.log(`   Worker URL: ${config.workerUrl}`);
console.log(`   Event Code: ${config.eventCode}`);
console.log(`   Directorio de salida: ${config.outputDir}`);
console.log('');

// Función para hacer peticiones HTTP/HTTPS
function makeRequest(url) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    
    const req = client.get(url, (res) => {
      if (res.statusCode !== 200) {
        reject(new Error(`HTTP ${res.statusCode}: ${res.statusMessage}`));
        return;
      }
      
      const chunks = [];
      res.on('data', (chunk) => chunks.push(chunk));
      res.on('end', () => {
        const buffer = Buffer.concat(chunks);
        resolve({ data: buffer, headers: res.headers });
      });
    });
    
    req.on('error', reject);
    req.setTimeout(30000, () => {
      req.destroy();
      reject(new Error('Timeout'));
    });
  });
}

// Función para obtener la lista de archivos desde el Worker
async function getFileList() {
  console.log('📋 Obteniendo lista de archivos...');
  
  try {
    const response = await makeRequest(`${config.workerUrl}/api/gallery?event_code=${config.eventCode}`);
    const data = JSON.parse(response.data.toString());
    
    console.log(`✅ Lista obtenida: ${data.length} archivos encontrados`);
    return data;
  } catch (error) {
    console.error('❌ Error obteniendo lista de archivos:', error.message);
    throw error;
  }
}

// Función para descargar un archivo individual
async function downloadFile(file, retryCount = 0) {
  const fileName = file.name || file.key.split('/').pop();
  const filePath = path.join(config.outputDir, fileName);
  
  try {
    console.log(`📥 Descargando: ${fileName} (${(file.size / 1024 / 1024).toFixed(2)} MB)`);
    
    const downloadUrl = `${config.workerUrl}${file.url}`;
    const response = await makeRequest(downloadUrl);
    
    // Crear directorio si no existe
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    // Guardar archivo
    fs.writeFileSync(filePath, response.data);
    
    console.log(`✅ Descargado: ${fileName}`);
    return { success: true, fileName, size: file.size };
    
  } catch (error) {
    console.error(`❌ Error descargando ${fileName}:`, error.message);
    
    if (retryCount < config.retryAttempts) {
      console.log(`🔄 Reintentando ${fileName} (intento ${retryCount + 1}/${config.retryAttempts})`);
      await new Promise(resolve => setTimeout(resolve, 2000)); // Esperar 2 segundos
      return downloadFile(file, retryCount + 1);
    }
    
    return { success: false, fileName, error: error.message };
  }
}

// Función para descargar archivos en lotes
async function downloadBatch(files, startIndex) {
  const batch = files.slice(startIndex, startIndex + config.concurrencyLimit);
  const promises = batch.map(file => downloadFile(file));
  return await Promise.all(promises);
}

// Función principal
async function downloadAllFiles() {
  try {
    console.log('🚀 Iniciando descarga masiva...');
    
    // Crear directorio de salida
    if (!fs.existsSync(config.outputDir)) {
      fs.mkdirSync(config.outputDir, { recursive: true });
    }
    
    // Obtener lista de archivos
    const files = await getFileList();
    
    if (files.length === 0) {
      console.log('ℹ️ No se encontraron archivos para descargar');
      return;
    }
    
    console.log('');
    console.log('📊 Información de archivos:');
    files.forEach((file, index) => {
      const size = (file.size / 1024 / 1024).toFixed(2);
      console.log(`   ${index + 1}. ${file.name} (${size} MB) - ${file.type}`);
    });
    
    console.log('');
    console.log('📥 Iniciando descargas...');
    
    // Crear archivo de registro
    const logFile = path.join(config.outputDir, 'download-log.txt');
    const logStream = fs.createWriteStream(logFile);
    
    logStream.write(`Descarga iniciada: ${new Date().toISOString()}\n`);
    logStream.write(`Event Code: ${config.eventCode}\n`);
    logStream.write(`Total de archivos: ${files.length}\n\n`);
    
    let successCount = 0;
    let errorCount = 0;
    let totalSize = 0;
    
    // Descargar archivos en lotes
    for (let i = 0; i < files.length; i += config.concurrencyLimit) {
      const batchResults = await downloadBatch(files, i);
      
      // Procesar resultados del lote
      batchResults.forEach(result => {
        if (result.success) {
          successCount++;
          totalSize += result.size;
          logStream.write(`✅ ${result.fileName} (${(result.size / 1024 / 1024).toFixed(2)} MB)\n`);
        } else {
          errorCount++;
          logStream.write(`❌ ${result.fileName} - Error: ${result.error}\n`);
        }
      });
      
      // Mostrar progreso
      const progress = Math.min(i + config.concurrencyLimit, files.length);
      const percentage = Math.round((progress / files.length) * 100);
      console.log(`📊 Progreso: ${progress}/${files.length} (${percentage}%)`);
    }
    
    // Cerrar archivo de registro
    logStream.write(`\nDescarga completada: ${new Date().toISOString()}\n`);
    logStream.write(`Archivos exitosos: ${successCount}\n`);
    logStream.write(`Archivos con error: ${errorCount}\n`);
    logStream.write(`Tamaño total descargado: ${(totalSize / 1024 / 1024).toFixed(2)} MB\n`);
    logStream.end();
    
    console.log('');
    console.log('🎉 Descarga completada!');
    console.log(`✅ Archivos exitosos: ${successCount}`);
    console.log(`❌ Archivos con error: ${errorCount}`);
    console.log(`📦 Tamaño total: ${(totalSize / 1024 / 1024).toFixed(2)} MB`);
    console.log(`📄 Log guardado en: ${logFile}`);
    console.log(`📁 Archivos descargados en: ${config.outputDir}`);
    
  } catch (error) {
    console.error('💥 Error durante la descarga:', error);
    process.exit(1);
  }
}

// Función para verificar la conexión al Worker
async function testConnection() {
  console.log('🔗 Probando conexión al Worker...');
  
  try {
    const response = await makeRequest(`${config.workerUrl}/api/gallery?event_code=${config.eventCode}`);
    const data = JSON.parse(response.data.toString());
    
    console.log('✅ Conexión exitosa al Worker');
    console.log(`📊 Archivos disponibles: ${data.length}`);
    
    if (data.length > 0) {
      console.log('📋 Primeros archivos:');
      data.slice(0, 5).forEach((file, index) => {
        const size = (file.size / 1024 / 1024).toFixed(2);
        console.log(`   ${index + 1}. ${file.name} (${size} MB)`);
      });
    }
    
    return true;
  } catch (error) {
    console.error('❌ Error de conexión:', error.message);
    return false;
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.includes('--test')) {
    testConnection();
  } else if (args.includes('--help')) {
    console.log('Uso: node download-via-worker.js [opciones]');
    console.log('');
    console.log('Opciones:');
    console.log('  --test     Probar conexión al Worker');
    console.log('  --help     Mostrar esta ayuda');
    console.log('');
    console.log('Para cambiar el event_code, edita la variable config.eventCode en el script');
  } else {
    downloadAllFiles();
  }
}

module.exports = { downloadAllFiles, testConnection, getFileList }; 