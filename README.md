# sb1-crymokbu

## Descripción del proyecto
Web para la boda de Carlos y María. Permite a los invitados consultar información, ver fotos, subir archivos y acceder a detalles logísticos del evento. El sistema utiliza React, Vite, TailwindCSS y Cloudflare Workers + R2 para almacenamiento seguro de archivos. El contenido principal de la Home se gestiona dinámicamente desde Prismic CMS.

---

## NUEVO: Gestión unificada de eventos con Worker y D1

### Arquitectura
- **Base de datos única D1:** `orsoie` con dos tablas principales: `mesas` y `rsvp`.
- **Worker único:** `worker-orsoie-d1.ts` gestiona todas las operaciones de lectura y escritura para ambas tablas.
- **Identificación de evento:** Todas las operaciones requieren el campo `event_code`, que se obtiene desde Prismic y se pasa en cada request.

### Endpoints REST del Worker

- `GET /api/mesas?event_code=...`
  - Devuelve todos los invitados y mesas del evento indicado.
- `POST /api/rsvp`
  - Guarda la confirmación de asistencia. Requiere `event_code` en el body. El resto de campos se almacenan como JSON flexible.
- `GET /api/rsvp?event_code=...`
  - (Opcional, para administración) Devuelve todas las confirmaciones de asistencia de ese evento.

### Ejemplo de uso desde el frontend

```ts
// Obtener invitados y mesas
fetch(`/api/mesas?event_code=${event_code}`)
  .then(res => res.json())
  .then(data => console.log(data));

// Enviar confirmación de asistencia
fetch('/api/rsvp', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ ...valoresFormulario, event_code }),
});
```

### Pasos para modificar y desplegar el Worker

1. **Editar el Worker:**
   - El archivo principal es `worker-orsoie-d1.ts`.
   - Asegúrate de que el binding de la base de datos D1 en `wrangler.toml` apunte a la base de datos `orsoie`.

2. **Desplegar el Worker:**
   - Instala Wrangler si no lo tienes:
     ```bash
     npm install -g wrangler
     ```
   - Despliega el Worker:
     ```bash
     wrangler deploy worker-orsoie-d1.ts
     ```
   - Anota la URL del Worker desplegado (ejemplo: `https://worker-orsoie-d1.tu-subdominio.workers.dev`).

3. **Configurar el frontend:**
   - El frontend ya está preparado para usar el campo `event_code` y consumir los nuevos endpoints.
   - Asegúrate de que Prismic tiene el campo `event_code` en la página de configuración.

4. **Probar la integración:**
   - Accede a la sección de mesas y confirma que solo ves los invitados del evento actual.
   - Envía una confirmación de asistencia y verifica que se almacena correctamente en la tabla `rsvp`.

### Buenas prácticas de seguridad
- Todas las operaciones filtran por `event_code`.
- No se exponen detalles internos de errores.
- No se almacenan ni exponen secretos en el frontend.
- El Worker está preparado para Cloudflare D1 y Pages.

---

## Estructura recomendada para múltiples Workers (Cloudflare)

Si tienes más de un Worker (por ejemplo, uno para fotos y otro para eventos), **cada uno debe estar en su propio directorio** con su propio `wrangler.toml` y scripts de build/deploy independientes. Así evitarás sobrescribir Workers y tendrás un flujo limpio y seguro.

### Ejemplo de estructura:

```
/workers/
  ├── worker-orsoie-d1/
  │     ├── worker-orsoie-d1.ts
  │     ├── dist/
  │     ├── wrangler.toml
  │     ├── tsconfig.worker.json
  │     └── package.json (opcional)
  └── wedding-uploads/
        ├── worker.js
        ├── wrangler.toml
        └── ...
```

### Pasos para desplegar un Worker:
1. Ve al directorio del Worker:
   ```bash
   cd workers/worker-orsoie-d1
   ```
2. Compila y despliega:
   ```bash
   npm run deploy:worker
   # o
   wrangler deploy --config wrangler.toml
   ```

**Nunca despliegues desde la raíz si tienes varios Workers.**

---

## Tabla de contenidos
- [Características principales](#características-principales)
- [Instalación y configuración](#instalación-y-configuración)
- [Estructura del proyecto](#estructura-del-proyecto)
- [Despliegue en Cloudflare](#despliegue-en-cloudflare)
- [Gestión de contenido con Prismic](#gestión-de-contenido-con-prismic)
- [Buenas prácticas de seguridad](#buenas-prácticas-de-seguridad)
- [Contacto](#contacto)

---

## Características principales
- Consulta de información de la boda (horarios, localización, menú, mesas, transporte, etc.)
- Subida de fotos y vídeos a almacenamiento seguro (Cloudflare R2)
- Home dinámica gestionada desde Prismic CMS
- Navegación rápida y diseño responsive
- Accesibilidad básica y experiencia de usuario optimizada
- Despliegue serverless y almacenamiento escalable

---

## Instalación y configuración

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
4. **Despliega el Worker de Cloudflare:**
   - Sigue las instrucciones en `CLOUDFLARE_SETUP.md`.
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
├── worker.js          # Lógica backend (Cloudflare Worker)
├── public/            # Archivos estáticos
├── package.json       # Dependencias y scripts
├── tailwind.config.js # Configuración de TailwindCSS
└── ...
```

---

## Despliegue en Cloudflare

1. **Configura y despliega el Worker:**
   - Ver `CLOUDFLARE_SETUP.md` para pasos detallados.
2. **Despliega la web:**
   - Puedes usar Cloudflare Pages o cualquier hosting estático compatible.
   - Sube el contenido de `dist/` tras `npm run build`.

---

## Gestión de contenido con Prismic

- El contenido de la pantalla principal (Home) se gestiona desde el repositorio Prismic: [orsoie-cms.prismic.io](https://orsoie-cms.prismic.io/)
- Los campos gestionados dinámicamente son:
  - **imagen**: Imagen principal de la Home
  - **nombre_uno**: Primer nombre (ej. María)
  - **nombre_dos**: Segundo nombre (ej. Carlos)
  - **fecha**: Fecha del evento
- Para editar el contenido, accede a Prismic, busca el documento "Home" y actualiza los campos.
- El frontend obtiene estos datos automáticamente al cargar la página principal.

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

## Gestión de múltiples Workers (eventos y fotos)

Este proyecto utiliza **dos Workers de Cloudflare independientes**:

- **worker-orsoie-d1**: gestiona la base de datos D1 para eventos, mesas y confirmaciones de asistencia.
- **wedding-uploads**: gestiona la subida de fotos y vídeos a Cloudflare R2 desde la sección de fotos.

### Estructura recomendada

```
/workers/
  ├── worker-orsoie-d1/
  │     ├── worker-orsoie-d1.ts
  │     ├── dist/
  │     ├── wrangler.toml
  │     ├── tsconfig.worker.json
  │     └── package.json
  └── wedding-uploads/
        ├── worker.js
        ├── wrangler.toml
        └── ...
```

### Despliegue de cada Worker

- **Para eventos:**
  ```bash
  cd workers/worker-orsoie-d1
  npm run deploy:worker
  ```
- **Para fotos:**
  ```bash
  cd worker-invitados  # o la carpeta donde esté wedding-uploads
  wrangler deploy
  ```

**Nunca despliegues desde la raíz si tienes varios Workers.**

### Configuración del frontend

- La subida de fotos usa la variable de entorno:
  ```env
  VITE_CLOUDFLARE_WORKER_URL=https://wedding-uploads.tu-subdominio.workers.dev
  ```
- El frontend usará esta URL para subir fotos/vídeos, y la URL del Worker de eventos para las operaciones de mesas y confirmaciones.

### Buenas prácticas
- **No sobrescribas los wrangler.toml**: cada Worker debe tener el suyo.
- **Despliega cada uno desde su carpeta**.
- **Actualiza las variables de entorno** si cambias la URL de algún Worker.
- **Puedes añadir más Workers** siguiendo este patrón.
