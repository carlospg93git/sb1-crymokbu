# Configuración de Cloudflare para la subida de archivos

Este documento detalla los pasos necesarios para configurar Cloudflare R2 y Workers para la subida de archivos en la aplicación.

## Paso 1: Configurar el Worker

1. Instala Wrangler CLI globalmente:
   ```bash
   npm install -g wrangler
   ```

2. Inicia sesión en tu cuenta de Cloudflare:
   ```bash
   wrangler login
   ```

3. Despliega el Worker:
   ```bash
   npm run deploy:worker
   ```

4. Anota la URL del Worker que se muestra en la consola después del despliegue. Será algo como:
   ```
   https://wedding-uploads.tu-subdominio.workers.dev
   ```

## Paso 2: Configurar las variables de entorno

1. Crea un archivo `.env` en la raíz del proyecto con el siguiente contenido:
   ```
   VITE_CLOUDFLARE_ACCOUNT_ID=tu_account_id
   VITE_CLOUDFLARE_WORKER_URL=https://wedding-uploads.tu-subdominio.workers.dev
   ```

   Reemplaza:
   - `tu_account_id` con tu ID de cuenta de Cloudflare (puedes encontrarlo en la URL cuando estás en el dashboard de Cloudflare)
   - `https://wedding-uploads.tu-subdominio.workers.dev` con la URL del Worker que obtuviste en el paso anterior

## Paso 3: Configurar CORS en el bucket de R2

1. Ve a la consola de Cloudflare
2. Navega a R2 > bucket-boda
3. Ve a la pestaña "Settings"
4. En la sección "CORS", configura las siguientes reglas:
   ```
   [
     {
       "AllowedOrigins": ["*"],
       "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
       "AllowedHeaders": ["*"],
       "MaxAgeSeconds": 3000
     }
   ]
   ```

## Paso 4: Desplegar la aplicación

1. Construye la aplicación:
   ```bash
   npm run build
   ```

2. Despliega la aplicación en tu proveedor de hosting preferido.

## Solución de problemas

Si encuentras problemas con CORS, asegúrate de que:
1. El Worker está configurado correctamente
2. Las reglas CORS del bucket están configuradas correctamente
3. Las variables de entorno están configuradas correctamente

Si tienes problemas con la subida de archivos, verifica:
1. Los logs del Worker en la consola de Cloudflare
2. La consola del navegador para ver si hay errores
3. Que el tamaño y tipo de archivo cumplan con las restricciones 