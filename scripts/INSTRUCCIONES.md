# Instrucciones para Descarga Masiva R2

## 🎯 Solución Única: Script Node.js

Esta es la opción más sencilla y segura para descargar todos los archivos de tu bucket R2.

## 📋 Paso a Paso

### Paso 1: Crear el Bucket R2 (Si no existe)

1. Ve a [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Selecciona tu cuenta
3. Ve a **R2 Object Storage**
4. Si no hay buckets, crea uno:
   - Haz clic en **Create bucket**
   - **Bucket name:** `bucket-wedding`
   - **Region:** EU (Europe)
   - Haz clic en **Create bucket**

### Paso 2: Obtener Credenciales R2

1. Ve a **Manage R2 API tokens**
2. Crea un nuevo token con estos permisos:
   - **Permissions:** Object Read + Bucket Read
   - **Resources:** All buckets (o el bucket específico)
3. Copia el **Account ID**, **Access Key ID** y **Secret Access Key**

### Paso 3: Configurar Variables de Entorno

1. Ve al directorio `scripts/`:
   ```bash
   cd scripts
   ```

2. Edita el archivo `.env`:
   ```bash
   nano .env
   ```

3. Agrega tus credenciales:
   ```bash
   CLOUDFLARE_ACCOUNT_ID=tu_account_id_aqui
   CLOUDFLARE_ACCESS_KEY_ID=tu_access_key_id_aqui
   CLOUDFLARE_SECRET_ACCESS_KEY=tu_secret_access_key_aqui
   ```

4. Guarda el archivo (Ctrl+X, luego Y, luego Enter)

### Paso 4: Instalar Dependencias

```bash
npm install
```

### Paso 5: Ejecutar Descarga

```bash
npm run download
```

## 📊 Qué Esperar

### Durante la Descarga:
```
🚀 Iniciando descarga masiva de archivos...
📁 Directorio de salida: /path/to/downloads/2024-01-15_14-30-25
📋 Listando archivos en el bucket...
📊 Total de archivos encontrados: 150
📥 Progreso: 5/150 (3%)
✅ Descargado: foto1.jpg (2048576 bytes)
✅ Descargado: video1.mp4 (15728640 bytes)
...
```

### Al Finalizar:
```
🎉 Descarga completada!
✅ Archivos exitosos: 148
❌ Archivos con error: 2
📄 Log guardado en: /path/to/downloads/2024-01-15_14-30-25/download-log.txt
📁 Archivos descargados en: /path/to/downloads/2024-01-15_14-30-25
```

## 📁 Estructura de Salida

```
downloads/
└── 2024-01-15_14-30-25/
    ├── archivo1.jpg
    ├── archivo2.mp4
    ├── subcarpeta/
    │   └── archivo3.png
    └── download-log.txt
```

## 🔒 Seguridad

- ✅ Las credenciales están en `.env` (no se suben a Git)
- ✅ Solo permisos de lectura
- ✅ Token específico para este bucket
- ✅ Script local (no público)

## 🚨 Si Hay Problemas

### Error: "NoSuchBucket"
- Verifica que el bucket `bucket-wedding` existe en tu cuenta R2
- Crea el bucket si no existe

### Error: "Access Denied"
- Verifica que las credenciales sean correctas
- Confirma que el token tenga permisos de lectura
- Revisa que el Account ID sea correcto

### Error: "Network Timeout"
- Verifica tu conexión a internet
- El script reintentará automáticamente

## 📞 Comandos Útiles

```bash
# Ver progreso en tiempo real
tail -f downloads/2024-01-15_14-30-25/download-log.txt

# Contar archivos descargados
find downloads/2024-01-15_14-30-25 -type f | wc -l

# Ver tamaño total
du -sh downloads/2024-01-15_14-30-25
```

## 🎯 Resumen Rápido

1. **Crear bucket** `bucket-wedding` en Cloudflare R2 (si no existe)
2. **Obtener credenciales** del dashboard de Cloudflare R2
3. **Crear archivo `.env`** con las credenciales
4. **Ejecutar:** `npm run download`
5. **Esperar** a que termine
6. **Encontrar archivos** en la carpeta `downloads/`

¡Eso es todo! El script es completamente privado y solo tú puedes ejecutarlo. 