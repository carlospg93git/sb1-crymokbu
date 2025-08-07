# 📥 Scripts de Descarga Masiva R2

Scripts para descargar masivamente archivos desde Cloudflare R2 usando el Worker de la galería como proxy.

## 🎯 Scripts Disponibles

### 📋 `download-final.js` (PRINCIPAL)
Script principal que descarga todos los archivos usando el event_code `uploads`.

```bash
npm run download
# o
node download-final.js
```

### 🔧 Scripts de Utilidad

- **`npm run test`** - Probar conexión al Worker
- **`npm run ayuda`** - Mostrar menú de ayuda
- **`npm run verificar`** - Verificación rápida

## 📊 Resultados

- **Archivos descargados:** 352
- **Tamaño total:** ~2.6 GB
- **Ubicación:** `downloads/YYYY-MM-DD/`
- **Log:** `downloads/YYYY-MM-DD/download-log.txt`

## 🚀 Uso Rápido

1. **Instalar dependencias:**
   ```bash
   npm install
   ```

2. **Probar conexión:**
   ```bash
   npm run test
   ```

3. **Descargar archivos:**
   ```bash
   npm run download
   ```

## 📁 Estructura de Archivos

```
scripts/
├── download-final.js          # Script principal
├── download-via-worker.js     # Script alternativo
├── download-with-event-code.js # Script con event_code automático
├── verificar.js               # Verificación rápida
├── ayuda.js                   # Menú de ayuda
├── list-all-files.js          # Listar archivos del bucket
├── test-event-codes.js        # Probar event codes
├── solucion-completa.js       # Diagnóstico completo
├── diagnostico-detallado.js   # Diagnóstico detallado
├── package.json
└── README.md
```

## 🔧 Configuración

El script principal usa estas configuraciones:

- **Worker URL:** `https://gallery.carlospg93.workers.dev`
- **Event Code:** `uploads`
- **Concurrencia:** 3 archivos simultáneos
- **Reintentos:** 3 intentos por archivo

## 📝 Logs

Cada descarga genera:
- **Log detallado:** `download-log.txt`
- **Progreso en tiempo real** en consola
- **Estadísticas finales** de éxito/error

## ✅ Características

- ✅ Descarga masiva de 352 archivos
- ✅ Descarga concurrente (3 archivos simultáneos)
- ✅ Reintentos automáticos
- ✅ Progreso en tiempo real
- ✅ Log detallado
- ✅ Manejo de errores
- ✅ Organización por fecha

## 🎉 ¡Listo!

Los archivos se descargan en la carpeta `downloads/` con la fecha actual. 