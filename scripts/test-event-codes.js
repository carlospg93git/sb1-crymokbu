// Script para probar diferentes event_codes y encontrar el correcto
const https = require('https');
const http = require('http');

console.log('🔍 Probando Event Codes');
console.log('=======================');
console.log('');

// Configuración
const config = {
  workerUrl: 'https://gallery.carlospg93.workers.dev'
};

// Event codes comunes a probar
const eventCodes = [
  'wedding',
  'boda',
  'carlos',
  'carlospg93',
  'sb1',
  'crymokbu',
  'event',
  'default',
  'test'
];

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
    req.setTimeout(10000, () => {
      req.destroy();
      reject(new Error('Timeout'));
    });
  });
}

// Función para probar un event_code
async function testEventCode(eventCode) {
  try {
    const response = await makeRequest(`${config.workerUrl}/api/gallery?event_code=${eventCode}`);
    const data = JSON.parse(response.data.toString());
    
    console.log(`✅ ${eventCode}: ${data.length} archivos encontrados`);
    
    if (data.length > 0) {
      console.log(`   📋 Primeros archivos:`);
      data.slice(0, 3).forEach((file, index) => {
        const size = (file.size / 1024 / 1024).toFixed(2);
        console.log(`      ${index + 1}. ${file.name} (${size} MB)`);
      });
    }
    
    return { eventCode, success: true, count: data.length, files: data };
    
  } catch (error) {
    console.log(`❌ ${eventCode}: Error - ${error.message}`);
    return { eventCode, success: false, error: error.message };
  }
}

// Función principal
async function testAllEventCodes() {
  console.log('🚀 Probando todos los event codes...\n');
  
  const results = [];
  
  for (const eventCode of eventCodes) {
    const result = await testEventCode(eventCode);
    results.push(result);
    console.log('');
  }
  
  console.log('📊 RESUMEN:');
  
  const successfulCodes = results.filter(r => r.success && r.count > 0);
  
  if (successfulCodes.length > 0) {
    console.log('✅ Event codes que funcionan:');
    successfulCodes.forEach(result => {
      console.log(`   - ${result.eventCode}: ${result.count} archivos`);
    });
    
    console.log('');
    console.log('🎯 RECOMENDACIÓN:');
    const bestCode = successfulCodes.reduce((best, current) => 
      current.count > best.count ? current : best
    );
    console.log(`   Usa el event_code: "${bestCode.eventCode}" (${bestCode.count} archivos)`);
    
  } else {
    console.log('❌ Ningún event_code funcionó');
    console.log('');
    console.log('💡 Posibles soluciones:');
    console.log('1. Verifica que el Worker esté funcionando');
    console.log('2. Verifica que haya archivos en el bucket R2');
    console.log('3. Intenta con un event_code diferente');
  }
  
  console.log('');
  console.log('📋 Todos los resultados:');
  results.forEach(result => {
    if (result.success) {
      console.log(`   ${result.eventCode}: ${result.count} archivos`);
    } else {
      console.log(`   ${result.eventCode}: Error`);
    }
  });
}

// Ejecutar
testAllEventCodes(); 