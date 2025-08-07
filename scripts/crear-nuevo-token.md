# 🔧 Solución: Crear Nuevo Token R2

## 🎯 Problema Identificado
El script de descarga masiva no funciona porque las credenciales actuales no tienen los permisos correctos o están expiradas.

## 📋 Pasos para Solucionarlo

### Paso 1: Ir al Dashboard de Cloudflare
1. Abre tu navegador y ve a: https://dash.cloudflare.com
2. Inicia sesión con tu cuenta de Cloudflare
3. Selecciona tu cuenta (la que contiene tu proyecto)

### Paso 2: Acceder a R2 Object Storage
1. En el menú lateral izquierdo, busca **"R2 Object Storage"**
2. Haz clic en él
3. Si no ves esta opción, asegúrate de que tu cuenta tenga R2 habilitado

### Paso 3: Crear el Bucket (si no existe)
1. En la página de R2, busca la sección de buckets
2. Si no ves un bucket llamado `bucket-wedding`, haz clic en **"Create bucket"**
3. Configuración del bucket:
   - **Bucket name:** `bucket-wedding`
   - **Region:** EU (Europe)
   - Haz clic en **"Create bucket"**

### Paso 4: Crear Nuevo Token R2
1. En la página de R2, busca **"Manage R2 API tokens"**
2. Haz clic en **"Create API token"**
3. Configuración del token:
   - **Token name:** `Wedding Upload Token`
   - **Permissions:** Selecciona estos permisos:
     - ✅ **Object Read** (para descargar archivos)
     - ✅ **Bucket Read** (para listar archivos)
     - ✅ **Object Write** (para subir archivos, opcional)
     - ✅ **Bucket Write** (para crear bucket, opcional)
   - **Resources:** 
     - Selecciona **"All buckets"** o **"Specific bucket"** → `bucket-wedding`
   - Haz clic en **"Create API token"**

### Paso 5: Copiar las Credenciales
Después de crear el token, verás:
- **Account ID**
- **Access Key ID** 
- **Secret Access Key**

**⚠️ IMPORTANTE:** Copia estas credenciales inmediatamente, ya que no podrás ver el Secret Access Key de nuevo.

### Paso 6: Actualizar el Archivo .env
1. Ve al directorio `scripts/` de tu proyecto
2. Abre el archivo `.env` con un editor de texto
3. Reemplaza las credenciales actuales con las nuevas:

```bash
CLOUDFLARE_ACCOUNT_ID=tu_nuevo_account_id
CLOUDFLARE_ACCESS_KEY_ID=tu_nuevo_access_key_id
CLOUDFLARE_SECRET_ACCESS_KEY=tu_nuevo_secret_access_key
```

4. Guarda el archivo

### Paso 7: Verificar que Funciona
1. En el directorio `scripts/`, ejecuta:
   ```bash
   node verificar.js
   ```

2. Si todo está bien, verás:
   ```
   ✅ Conexión exitosa!
   📦 Bucket: bucket-wedding
   📊 Archivos encontrados: X
   ```

### Paso 8: Ejecutar la Descarga Masiva
1. Una vez que la verificación sea exitosa, ejecuta:
   ```bash
   npm run download
   ```

## 🚨 Problemas Comunes

### Error: "NoSuchBucket"
- **Solución:** Crea el bucket `bucket-wedding` manualmente desde el dashboard

### Error: "Access Denied"
- **Solución:** Verifica que el token tenga los permisos correctos (Object Read + Bucket Read)

### Error: "InvalidAccessKeyId"
- **Solución:** Verifica que el Access Key ID sea correcto

### Error: "SignatureDoesNotMatch"
- **Solución:** Verifica que el Secret Access Key sea correcto

## 📞 Comandos de Verificación

```bash
# Verificación rápida
node verificar.js

# Diagnóstico completo
node diagnostico-detallado.js

# Solución completa
node solucion-completa.js

# Descarga masiva (cuando funcione)
npm run download
```

## 🔒 Seguridad

- ✅ Las credenciales están en `.env` (no se suben a Git)
- ✅ Solo permisos de lectura para descarga
- ✅ Token específico para este bucket
- ✅ Script local (no público)

## 🎯 Resumen Rápido

1. **Dashboard Cloudflare** → R2 Object Storage
2. **Crear bucket** `bucket-wedding` (si no existe)
3. **Manage R2 API tokens** → Create API token
4. **Permisos:** Object Read + Bucket Read
5. **Copiar credenciales** y actualizar `.env`
6. **Verificar:** `node verificar.js`
7. **Descargar:** `npm run download`

¡Eso es todo! Una vez que sigas estos pasos, el script de descarga masiva funcionará correctamente. 