# sb1-crymokbu

## Descripción del proyecto
Web para la boda de Carlos y María. Permite a los invitados consultar información, ver fotos, subir archivos y acceder a detalles logísticos del evento. El sistema utiliza React, Vite, TailwindCSS y Cloudflare Workers + R2 para almacenamiento seguro de archivos. El contenido principal de la Home se gestiona dinámicamente desde Prismic CMS.

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
