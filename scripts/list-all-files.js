// Script para listar todos los archivos del bucket sin filtro de event_code
const https = require('https');
const http = require('http');

console.log('🔍 Listando Todos los Archivos del Bucket');
console.log('========================================');
console.log('');

// Configuración
const config = {
  workerUrl: 'https://gallery.carlospg93.workers.dev'
};

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

// Función para probar diferentes prefijos
async function testPrefix(prefix) {
  try {
    const response = await makeRequest(`${config.workerUrl}/api/gallery?event_code=${prefix}`);
    const data = JSON.parse(response.data.toString());
    
    if (data.length > 0) {
      console.log(`✅ Prefijo "${prefix}": ${data.length} archivos encontrados`);
      console.log(`   📋 Primeros archivos:`);
      data.slice(0, 5).forEach((file, index) => {
        const size = (file.size / 1024 / 1024).toFixed(2);
        console.log(`      ${index + 1}. ${file.key} (${size} MB)`);
      });
      return { prefix, success: true, count: data.length, files: data };
    } else {
      console.log(`ℹ️ Prefijo "${prefix}": 0 archivos`);
      return { prefix, success: true, count: 0, files: [] };
    }
    
  } catch (error) {
    console.log(`❌ Prefijo "${prefix}": Error - ${error.message}`);
    return { prefix, success: false, error: error.message };
  }
}

// Función para probar sin prefijo (archivos en raíz)
async function testRootFiles() {
  try {
    // Intentar con un event_code vacío o especial
    const response = await makeRequest(`${config.workerUrl}/api/gallery?event_code=`);
    const data = JSON.parse(response.data.toString());
    
    console.log(`✅ Archivos en raíz: ${data.length} archivos encontrados`);
    
    if (data.length > 0) {
      console.log(`   📋 Primeros archivos:`);
      data.slice(0, 10).forEach((file, index) => {
        const size = (file.size / 1024 / 1024).toFixed(2);
        console.log(`      ${index + 1}. ${file.key} (${size} MB)`);
      });
      
      // Analizar la estructura de los archivos
      console.log(`   🔍 Análisis de estructura:`);
      const prefixes = new Set();
      data.forEach(file => {
        const parts = file.key.split('/');
        if (parts.length > 1) {
          prefixes.add(parts[0]);
        }
      });
      
      if (prefixes.size > 0) {
        console.log(`   📁 Prefijos encontrados: ${Array.from(prefixes).join(', ')}`);
      } else {
        console.log(`   📁 Archivos en raíz (sin prefijo)`);
      }
    }
    
    return { prefix: 'root', success: true, count: data.length, files: data };
    
  } catch (error) {
    console.log(`❌ Error accediendo a archivos en raíz: ${error.message}`);
    return { prefix: 'root', success: false, error: error.message };
  }
}

// Función principal
async function listAllFiles() {
  console.log('🚀 Analizando estructura del bucket...\n');
  
  // Probar archivos en raíz
  console.log('📁 Probando archivos en raíz...');
  const rootResult = await testRootFiles();
  console.log('');
  
  // Probar prefijos comunes
  console.log('📁 Probando prefijos comunes...');
  const prefixes = ['', 'root', 'files', 'uploads', 'images', 'photos', 'videos', 'media'];
  
  for (const prefix of prefixes) {
    const result = await testPrefix(prefix);
    if (result.success && result.count > 0) {
      console.log('');
    }
  }
  
  console.log('');
  console.log('📊 RESUMEN:');
  
  if (rootResult.success && rootResult.count > 0) {
    console.log(`✅ Se encontraron ${rootResult.count} archivos en el bucket`);
    console.log('');
    console.log('💡 RECOMENDACIÓN:');
    console.log('   Los archivos están en la raíz del bucket o con un prefijo no estándar');
    console.log('   Usa el script de descarga con event_code vacío o el prefijo correcto');
  } else {
    console.log('❌ No se encontraron archivos');
    console.log('');
    console.log('💡 Posibles problemas:');
    console.log('1. El Worker no está configurado correctamente');
    console.log('2. El bucket está vacío');
    console.log('3. Los archivos tienen un prefijo muy específico');
  }
}

// Ejecutar
listAllFiles(); 