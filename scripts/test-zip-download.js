// Script para probar la descarga ZIP del worker
const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

console.log('🧪 Probando Descarga ZIP del Worker');
console.log('==================================');
console.log('');

// Configuración
const config = {
  workerUrl: 'https://gallery.carlospg93.workers.dev',
  eventCode: '20250712_mariaycarlos' // Cambiar por tu event_code
};

// Función para hacer peticiones HTTP/HTTPS
function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    
    const req = client.get(url, options, (res) => {
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

// Función para hacer peticiones POST
function makePostRequest(url, data) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    const urlObj = new URL(url);
    
    const postData = JSON.stringify(data);
    
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port || (urlObj.protocol === 'https:' ? 443 : 80),
      path: urlObj.pathname + urlObj.search,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };
    
    const req = client.request(options, (res) => {
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
    
    req.write(postData);
    req.end();
  });
}

// Función para obtener la lista de archivos
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

// Función para probar descarga ZIP con GET
async function testZipDownloadGET(files) {
  console.log('📦 Probando descarga ZIP con GET...');
  
  try {
    const selectedFiles = files.slice(0, 3); // Solo 3 archivos para la prueba
    const url = `${config.workerUrl}/api/download-zip?event_code=${config.eventCode}&${selectedFiles.map(file => `files=${encodeURIComponent(file.key)}`).join('&')}`;
    
    console.log(`🔗 URL: ${url.substring(0, 100)}...`);
    
    const response = await makeRequest(url);
    
    console.log(`✅ Descarga GET exitosa: ${response.data.length} bytes`);
    console.log(`📄 Content-Type: ${response.headers['content-type']}`);
    
    // Guardar archivo de prueba
    const testFile = path.join(__dirname, 'test-download-get.zip');
    fs.writeFileSync(testFile, response.data);
    console.log(`💾 Archivo guardado: ${testFile}`);
    
    return true;
  } catch (error) {
    console.error('❌ Error en descarga GET:', error.message);
    return false;
  }
}

// Función para probar descarga ZIP con POST
async function testZipDownloadPOST(files) {
  console.log('📦 Probando descarga ZIP con POST...');
  
  try {
    const selectedFiles = files.slice(0, 3); // Solo 3 archivos para la prueba
    const postData = {
      event_code: config.eventCode,
      files: selectedFiles.map(file => file.key)
    };
    
    console.log(`📤 Datos POST: ${JSON.stringify(postData, null, 2)}`);
    
    const response = await makePostRequest(`${config.workerUrl}/api/download-zip`, postData);
    
    console.log(`✅ Descarga POST exitosa: ${response.data.length} bytes`);
    console.log(`📄 Content-Type: ${response.headers['content-type']}`);
    
    // Guardar archivo de prueba
    const testFile = path.join(__dirname, 'test-download-post.zip');
    fs.writeFileSync(testFile, response.data);
    console.log(`💾 Archivo guardado: ${testFile}`);
    
    return true;
  } catch (error) {
    console.error('❌ Error en descarga POST:', error.message);
    return false;
  }
}

// Función principal
async function runTests() {
  console.log('🚀 Iniciando pruebas de descarga ZIP...\n');
  
  try {
    // Obtener lista de archivos
    const files = await getFileList();
    
    if (files.length === 0) {
      console.log('❌ No hay archivos disponibles para probar');
      return;
    }
    
    console.log(`📋 Archivos disponibles: ${files.length}`);
    console.log('📋 Primeros archivos:');
    files.slice(0, 5).forEach((file, index) => {
      const size = (file.size / 1024 / 1024).toFixed(2);
      console.log(`   ${index + 1}. ${file.name} (${size} MB)`);
    });
    console.log('');
    
    // Probar descarga GET
    const getSuccess = await testZipDownloadGET(files);
    console.log('');
    
    // Probar descarga POST
    const postSuccess = await testZipDownloadPOST(files);
    console.log('');
    
    // Resumen
    console.log('📊 RESUMEN DE PRUEBAS:');
    console.log(`✅ Descarga GET: ${getSuccess ? 'EXITOSA' : 'FALLIDA'}`);
    console.log(`✅ Descarga POST: ${postSuccess ? 'EXITOSA' : 'FALLIDA'}`);
    
    if (getSuccess && postSuccess) {
      console.log('\n🎉 ¡Todas las pruebas pasaron! El worker está funcionando correctamente.');
    } else {
      console.log('\n⚠️ Algunas pruebas fallaron. Revisa los logs para más detalles.');
    }
    
  } catch (error) {
    console.error('❌ Error en las pruebas:', error.message);
  }
}

// Ejecutar pruebas
runTests();
