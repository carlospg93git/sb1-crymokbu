// Cargar variables de entorno desde .env
require('dotenv').config();

const { S3Client, ListBucketsCommand } = require('@aws-sdk/client-s3');

console.log('🔍 Verificación de Cuenta R2');
console.log('============================');
console.log('');

const config = {
  accountId: process.env.CLOUDFLARE_ACCOUNT_ID,
  accessKeyId: process.env.CLOUDFLARE_ACCESS_KEY_ID,
  secretAccessKey: process.env.CLOUDFLARE_SECRET_ACCESS_KEY,
  bucketName: 'bucket-wedding'
};

console.log('📋 Credenciales configuradas:');
console.log(`   Account ID: ${config.accountId}`);
console.log(`   Access Key ID: ${config.accessKeyId}`);
console.log(`   Secret Access Key: ${config.secretAccessKey ? '✅ Configurado' : '❌ Faltante'}`);
console.log('');

// Probar con diferentes Account IDs
const accountIds = [
  config.accountId,
  '44a86a743f5bd56644409f61848979d7', // El que viste en la imagen
  '44a86a743f5bd56644409f61848979d7'  // Duplicado para asegurar
];

async function verificarCuenta(accountId) {
  console.log(`🔗 Probando Account ID: ${accountId}`);
  
  const s3Client = new S3Client({
    region: 'auto',
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey,
    },
  });

  try {
    // Intentar listar buckets para verificar la cuenta
    const listBucketsCommand = new ListBucketsCommand({});
    const bucketsResponse = await s3Client.send(listBucketsCommand);
    
    console.log(`   ✅ Conexión exitosa`);
    console.log(`   📦 Buckets encontrados: ${bucketsResponse.Buckets ? bucketsResponse.Buckets.length : 0}`);
    
    if (bucketsResponse.Buckets && bucketsResponse.Buckets.length > 0) {
      console.log(`   📋 Buckets en esta cuenta:`);
      bucketsResponse.Buckets.forEach((bucket, index) => {
        console.log(`      ${index + 1}. ${bucket.Name}`);
      });
      
      // Verificar si el bucket bucket-wedding está en esta cuenta
      const bucketEncontrado = bucketsResponse.Buckets.find(bucket => bucket.Name === config.bucketName);
      if (bucketEncontrado) {
        console.log(`   🎉 ¡BUCKET ENCONTRADO! "${config.bucketName}" está en esta cuenta`);
        return { accountId, encontrado: true };
      } else {
        console.log(`   ℹ️ El bucket "${config.bucketName}" NO está en esta cuenta`);
      }
    } else {
      console.log(`   ℹ️ Esta cuenta no tiene buckets`);
    }
    
    return { accountId, encontrado: false };
    
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
    if (error.Code) {
      console.log(`   📝 Código: ${error.Code}`);
    }
    return { accountId, encontrado: false, error: error.message };
  }
}

async function verificarTodasLasCuentas() {
  console.log('🚀 Verificando todas las cuentas...\n');
  
  const resultados = [];
  
  for (const accountId of accountIds) {
    const resultado = await verificarCuenta(accountId);
    resultados.push(resultado);
    console.log('');
  }
  
  console.log('📊 RESUMEN:');
  
  const cuentaConBucket = resultados.find(r => r.encontrado);
  
  if (cuentaConBucket) {
    console.log(`✅ Cuenta encontrada: ${cuentaConBucket.accountId}`);
    console.log(`🎉 El bucket "${config.bucketName}" está en esta cuenta`);
    console.log('');
    console.log('💡 Actualiza el archivo .env con:');
    console.log(`   CLOUDFLARE_ACCOUNT_ID=${cuentaConBucket.accountId}`);
  } else {
    console.log('❌ No se encontró el bucket en ninguna cuenta');
    console.log('');
    console.log('💡 Posibles problemas:');
    console.log('1. Las credenciales están asociadas a una cuenta diferente');
    console.log('2. El bucket "bucket-wedding" no existe');
    console.log('3. Las credenciales no tienen permisos para listar buckets');
    console.log('');
    console.log('🔧 Soluciones:');
    console.log('1. Verifica que estés usando las credenciales correctas');
    console.log('2. Verifica que el bucket existe en el dashboard de Cloudflare');
    console.log('3. Crea un nuevo token R2 con permisos adecuados');
  }
  
  console.log('');
  console.log('📋 Resultados detallados:');
  resultados.forEach((resultado, index) => {
    console.log(`   ${index + 1}. Account ID: ${resultado.accountId}`);
    console.log(`      Estado: ${resultado.encontrado ? '✅ Bucket encontrado' : '❌ No encontrado'}`);
    if (resultado.error) {
      console.log(`      Error: ${resultado.error}`);
    }
  });
}

verificarTodasLasCuentas(); 