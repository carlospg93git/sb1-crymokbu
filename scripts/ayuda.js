// Cargar variables de entorno desde .env
require('dotenv').config();

console.log('🎯 Scripts de Descarga Masiva R2');
console.log('=================================');
console.log('');

// Verificar configuración
const config = {
  accountId: process.env.CLOUDFLARE_ACCOUNT_ID,
  accessKeyId: process.env.CLOUDFLARE_ACCESS_KEY_ID,
  secretAccessKey: process.env.CLOUDFLARE_SECRET_ACCESS_KEY,
  bucketName: 'bucket-wedding'
};

console.log('📋 Estado Actual:');
console.log(`   Account ID: ${config.accountId ? '✅ Configurado' : '❌ Faltante'}`);
console.log(`   Access Key ID: ${config.accessKeyId ? '✅ Configurado' : '❌ Faltante'}`);
console.log(`   Secret Access Key: ${config.secretAccessKey ? '✅ Configurado' : '❌ Faltante'}`);
console.log(`   Bucket Name: ${config.bucketName}`);
console.log('');

console.log('📞 Comandos Disponibles:');
console.log('');

console.log('🔍 DIAGNÓSTICO:');
console.log('   npm run verificar          - Verificación rápida de conexión');
console.log('   npm run diagnostico        - Diagnóstico completo con análisis de errores');
console.log('   npm run solucion           - Solución completa con instrucciones paso a paso');
console.log('   node ayuda.js              - Este menú de ayuda');
console.log('');

console.log('📥 DESCARGA:');
console.log('   npm run download           - Descarga masiva de todos los archivos');
console.log('');

console.log('📚 DOCUMENTACIÓN:');
console.log('   cat crear-nuevo-token.md   - Instrucciones para crear nuevo token R2');
console.log('   cat INSTRUCCIONES.md       - Instrucciones generales del proyecto');
console.log('');

if (!config.accountId || !config.accessKeyId || !config.secretAccessKey) {
  console.log('🚨 PROBLEMA DETECTADO: Faltan credenciales');
  console.log('');
  console.log('💡 PRÓXIMOS PASOS:');
  console.log('1. Lee: cat crear-nuevo-token.md');
  console.log('2. Crea un nuevo token R2 en Cloudflare Dashboard');
  console.log('3. Actualiza el archivo .env con las nuevas credenciales');
  console.log('4. Ejecuta: npm run verificar');
  console.log('');
} else {
  console.log('✅ Credenciales configuradas');
  console.log('');
  console.log('💡 PRÓXIMOS PASOS:');
  console.log('1. Ejecuta: npm run verificar');
  console.log('2. Si hay errores, ejecuta: npm run diagnostico');
  console.log('3. Si todo está bien, ejecuta: npm run download');
  console.log('');
}

console.log('🔗 Enlaces Útiles:');
console.log('   Dashboard Cloudflare: https://dash.cloudflare.com');
console.log('   R2 Object Storage: https://dash.cloudflare.com/r2');
console.log('   Manage API Tokens: https://dash.cloudflare.com/r2/api-tokens');
console.log('');

console.log('📁 Estructura del Proyecto:');
console.log('   scripts/');
console.log('   ├── .env                    - Credenciales (no subir a Git)');
console.log('   ├── download-r2-files.js    - Script principal de descarga');
console.log('   ├── verificar.js            - Verificación rápida');
console.log('   ├── diagnostico-detallado.js - Diagnóstico completo');
console.log('   ├── solucion-completa.js    - Solución con instrucciones');
console.log('   ├── ayuda.js                - Este archivo');
console.log('   ├── crear-nuevo-token.md    - Instrucciones para token');
console.log('   ├── INSTRUCCIONES.md        - Documentación general');
console.log('   └── downloads/              - Archivos descargados');
console.log('');

console.log('🎯 Flujo Recomendado:');
console.log('1. npm run verificar          ← Verificar conexión');
console.log('2. npm run diagnostico        ← Si hay errores');
console.log('3. npm run download           ← Descargar archivos');
console.log('');

console.log('¡Listo para usar! 🚀'); 