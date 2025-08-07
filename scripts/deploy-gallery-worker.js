// Script para desplegar el worker de galería actualizado
const { execSync } = require('child_process');
const path = require('path');

console.log('🚀 Desplegando Worker de Galería Actualizado');
console.log('============================================');
console.log('');

// Configuración
const config = {
  workerDir: path.join(__dirname, '..', 'workers', 'gallery'),
  workerName: 'gallery'
};

// Función para ejecutar comandos
function runCommand(command, cwd = process.cwd()) {
  try {
    console.log(`🔧 Ejecutando: ${command}`);
    const output = execSync(command, { 
      cwd, 
      encoding: 'utf8',
      stdio: 'pipe'
    });
    console.log(`✅ Comando ejecutado exitosamente`);
    return output;
  } catch (error) {
    console.error(`❌ Error ejecutando comando: ${error.message}`);
    if (error.stdout) console.log('STDOUT:', error.stdout);
    if (error.stderr) console.log('STDERR:', error.stderr);
    throw error;
  }
}

// Función principal
async function deployWorker() {
  try {
    console.log('📁 Verificando directorio del worker...');
    console.log(`📍 Directorio: ${config.workerDir}`);
    
    // Verificar que existe el directorio
    const fs = require('fs');
    if (!fs.existsSync(config.workerDir)) {
      throw new Error(`El directorio del worker no existe: ${config.workerDir}`);
    }
    
    // Verificar que existe el archivo worker.js
    const workerFile = path.join(config.workerDir, 'worker.js');
    if (!fs.existsSync(workerFile)) {
      throw new Error(`El archivo worker.js no existe: ${workerFile}`);
    }
    
    console.log('✅ Archivos del worker encontrados');
    console.log('');
    
    // Cambiar al directorio del worker
    console.log('📂 Cambiando al directorio del worker...');
    process.chdir(config.workerDir);
    console.log(`📍 Directorio actual: ${process.cwd()}`);
    console.log('');
    
    // Verificar que wrangler está instalado
    console.log('🔍 Verificando instalación de Wrangler...');
    try {
      runCommand('wrangler --version');
    } catch (error) {
      console.log('⚠️ Wrangler no está instalado globalmente. Intentando instalar...');
      runCommand('npm install -g wrangler');
    }
    console.log('');
    
    // Desplegar el worker
    console.log('🚀 Desplegando worker...');
    runCommand('wrangler deploy');
    console.log('');
    
    console.log('🎉 ¡Worker desplegado exitosamente!');
    console.log('');
    console.log('📋 Próximos pasos:');
    console.log('1. Probar la funcionalidad con: npm run test-zip');
    console.log('2. Verificar en el navegador que la descarga ZIP funciona');
    console.log('3. Revisar los logs del worker en Cloudflare Dashboard');
    
  } catch (error) {
    console.error('❌ Error durante el despliegue:', error.message);
    process.exit(1);
  }
}

// Ejecutar despliegue
deployWorker();
