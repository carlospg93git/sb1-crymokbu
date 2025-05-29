# sb1-crymokbu

## Descripción del proyecto
Web para eventos (ejemplo: boda de Carlos y María). Permite a los invitados consultar información, ver fotos, subir archivos y acceder a detalles logísticos del evento. El sistema utiliza React, Vite, TailwindCSS y Cloudflare Workers + R2 para almacenamiento seguro de archivos. El contenido principal y la configuración de secciones se gestiona dinámicamente desde Prismic CMS.

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

## Despliegue de Workers y adaptación a nuevos eventos

### 1. Clonar y adaptar el proyecto para otro evento

1. **Clona el repositorio:**
   ```bash
   git clone https://github.com/tu-usuario/sb1-crymokbu.git
   cd sb1-crymokbu
   ```
2. **Instala dependencias:**
   ```bash
   npm install
   ```
3. **Crea un nuevo repositorio en GitHub** (opcional, para tu propio evento) y sube el código.
4. **Configura las variables de entorno:**
   - Crea un archivo `.env` en la raíz con:
     ```env
     VITE_CLOUDFLARE_ACCOUNT_ID=tu_account_id
     VITE_CLOUDFLARE_WORKER_URL=https://wedding-uploads.tu-subdominio.workers.dev
     VITE_PRISMIC_API_URL=https://tu-repo-prismic.cdn.prismic.io/api/v2
     VITE_EVENT_CODE=tu_event_code
     ```
   - **Nunca subas `.env` al repositorio.**
5. **Crea un nuevo repositorio en Prismic** (o duplica el existente) y configura los documentos de secciones, branding y contenido.
6. **Adapta el branding y las secciones desde Prismic** (ver más abajo).
7. **Despliega los Workers de Cloudflare:**
   - Sigue los pasos siguientes para cada Worker.

### 2. Desplegar worker-orsoie-d1 (mesas y RSVP)
```bash
cd workers/worker-orsoie-d1
wrangler deploy
```

### 3. Desplegar wedding-uploads (subida de fotos)
```bash
cd workers/wedding-uploads
wrangler deploy
```

> **Importante:** Nunca despliegues desde la raíz del proyecto. Cada Worker debe desplegarse desde su propia carpeta.

---

## Gestión dinámica de secciones y rutas desde Prismic

### ¿Cómo funciona?
- El menú y las rutas de la web se generan automáticamente a partir de la configuración almacenada en Prismic.
- Puedes activar/desactivar secciones, cambiar el orden, el nombre o el slug desde el panel de Prismic, sin tocar código.
- Cada sección activa en Prismic aparecerá como una ruta y un ítem de menú en la web.

### ¿Cómo añadir nuevas secciones?
1. **Entra en Prismic** y edita el documento de configuración (`config`).
2. **Añade una nueva sección** en el slice correspondiente, indicando:
   - Nombre de la sección
   - Slug interno (ej: "galeria", "agenda", etc.)
   - Activo: true/false
3. **Crea el documento de contenido** para esa sección (puede ser un tipo estándar o personalizado).
4. **(Opcional) Crea el componente de React** si la sección requiere lógica o diseño especial. Si es una sección estándar, se renderizará automáticamente.
5. **Guarda y publica los cambios en Prismic.**
6. **La web detectará la nueva sección** y la mostrará en el menú y como ruta accesible.

### Ejemplo de estructura de secciones en Prismic
```
[
  { nombre_seccion: "Información", url_interna: "info", activo: true },
  { nombre_seccion: "Ceremonia", url_interna: "ceremonia", activo: true },
  { nombre_seccion: "Galería", url_interna: "galeria", activo: true },
  ...
]
```

---

## Configuración del frontend

- La subida de fotos usa la variable de entorno:
  ```env
  VITE_CLOUDFLARE_WORKER_URL=https://wedding-uploads.tu-subdominio.workers.dev
  ```
- El frontend usará esta URL para subir fotos/vídeos, y la URL del Worker de eventos para las operaciones de mesas y confirmaciones.
- El contenido y las secciones se gestionan desde Prismic.

---

## Estructura del proyecto

```
├── src/
│   ├── components/    # Componentes reutilizables
│   ├── hooks/         # Hooks personalizados
│   ├── pages/         # Páginas principales (pueden ser genéricas para secciones dinámicas)
│   ├── config/        # Configuración de servicios
│   └── App.tsx        # Composición principal y gestión de rutas dinámicas
├── workers/           # Workers de Cloudflare (cada uno en su carpeta)
├── public/            # Archivos estáticos
├── package.json       # Dependencias y scripts
├── tailwind.config.js # Configuración de TailwindCSS
└── ...
```

---

## Buenas prácticas y recomendaciones

- **No expongas secretos en el frontend.**
- **Restringe CORS a dominios de confianza en producción (en los Workers).**
- **Sanitiza mensajes de error y no reveles detalles internos.**
- **Añade `.env` y archivos sensibles a `.gitignore`.**
- **Escanea archivos subidos si es posible.**
- **Usa HTTPS siempre en producción.**
- **Para escalar o replicar el proyecto:**
  - Cambia el branding y las secciones en Prismic.
  - Cambia las variables de entorno para apuntar a los nuevos endpoints y workers.
  - Despliega los Workers en el nuevo dominio/subdominio.

---

## Contacto
Para dudas o soporte, contacta a [orsoie.com](https://orsoie.com)
