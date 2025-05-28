# sb1-crymokbu

## Descripción del proyecto
Web para la boda de Carlos y María. Permite a los invitados consultar información, ver fotos, subir archivos y acceder a detalles logísticos del evento. El sistema utiliza React, Vite, TailwindCSS y Cloudflare Workers + R2 para almacenamiento seguro de archivos. El contenido principal de la Home se gestiona dinámicamente desde Prismic CMS.

---

## Arquitectura Cloudflare Workers

Este proyecto utiliza **dos Workers de Cloudflare independientes**:

- **worker-orsoie-d1**: gestiona la base de datos D1 para eventos, mesas y confirmaciones de asistencia.
- **wedding-uploads**: gestiona la subida de fotos y vídeos a Cloudflare R2 desde la sección de fotos.

Cada Worker está en su propia carpeta bajo `/workers/` y tiene su propio `wrangler.toml`.

### Estructura recomendada

```
/workers/
  ├── worker-orsoie-d1/
  │     ├── worker-orsoie-d1.js
  │     ├── wrangler.toml
  └── wedding-uploads/
        ├── worker.js
        ├── wrangler.toml
```

---

## Despliegue de Workers

### 1. Desplegar worker-orsoie-d1 (mesas y RSVP)
```bash
cd workers/worker-orsoie-d1
wrangler deploy
```

### 2. Desplegar wedding-uploads (subida de fotos)
```bash
cd workers/wedding-uploads
wrangler deploy
```

> **Importante:** Nunca despliegues desde la raíz del proyecto. Cada Worker debe desplegarse desde su propia carpeta.

---

## Configuración del frontend

- La subida de fotos usa la variable de entorno:
  ```env
  VITE_CLOUDFLARE_WORKER_URL=https://wedding-uploads.tu-subdominio.workers.dev
  ```
- El frontend usará esta URL para subir fotos/vídeos, y la URL del Worker de eventos para las operaciones de mesas y confirmaciones.

---

## Instalación y configuración general

1. **Clona el repositorio:**
   ```bash
   git clone https://github.com/tu-usuario/sb1-crymokbu.git
   cd sb1-crymokbu
   ```
2. **Instala dependencias:**
   ```bash
   npm install
   ```
3. **Configura variables de entorno:**
   - Crea un archivo `.env` en la raíz con:
     ```env
     VITE_CLOUDFLARE_ACCOUNT_ID=tu_account_id
     VITE_CLOUDFLARE_WORKER_URL=https://wedding-uploads.tu-subdominio.workers.dev
     ```
   - **Nunca subas `.env` al repositorio.**
4. **Despliega los Workers de Cloudflare:**
   - Sigue los pasos anteriores para cada Worker.
5. **Ejecuta en desarrollo:**
   ```bash
   npm run dev
   ```
6. **Construye para producción:**
   ```bash
   npm run build
   ```

---

## Estructura del proyecto

```
├── src/
│   ├── components/    # Componentes reutilizables
│   ├── hooks/         # Hooks personalizados
│   ├── pages/         # Páginas principales
│   ├── config/        # Configuración de servicios
│   └── App.tsx        # Composición principal
├── workers/           # Workers de Cloudflare (cada uno en su carpeta)
├── public/            # Archivos estáticos
├── package.json       # Dependencias y scripts
├── tailwind.config.js # Configuración de TailwindCSS
└── ...
```

---

## Buenas prácticas de seguridad
- **Nunca expongas secretos en el frontend.**
- **Restringe CORS a dominios de confianza en producción.**
- **Utiliza autenticación y control de acceso para endpoints sensibles.**
- **Sanitiza mensajes de error y no reveles detalles internos.**
- **Añade `.env` y archivos sensibles a `.gitignore**.
- **Escanea archivos subidos si es posible.**
- **Usa HTTPS siempre en producción.**

---

## Contacto
Para dudas o soporte, contacta a [orsoie.com](https://orsoie.com)
