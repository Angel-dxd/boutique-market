# Mapa exacto de inserción de imágenes — TFG Boutique & Market

> **Tu estructura es correcta y respeta 100% la plantilla modelo (Carratalá).** No se elimina ningún apartado. Solo se añaden imágenes en sitios concretos y se corrigen 4 detalles de texto.

---

## 1. Tabla maestra: dónde va cada imagen

| # | Imagen | Sección destino (tu PDF) | Página actual | Caption (título) que debe llevar | Texto puente que debes añadir antes |
|---|---|---|---|---|---|
| 1 | `07_dafo.png` | **2.3. Identificación de los aspectos que facilitan o dificultan el desarrollo de la posible intervención** | p. 9-10 | **Figura 1. Análisis DAFO del proyecto Boutique & Market** | "Para sintetizar los factores internos y externos del proyecto se ha elaborado el siguiente análisis DAFO (ver Figura 1)." |
| 2 | `01_arquitectura.png` | **3.1. Definición o adaptación de la intervención** | p. 12 | **Figura 2. Arquitectura cloud Boutique & Market (Vercel + Render + Supabase)** | "La solución propuesta sigue una arquitectura cloud-native de tres capas, representada en la Figura 2, en la que cada componente reside en un servicio gestionado distinto." |
| 3 | `02_er.png` | **3.1.1. Información relativa a los aspectos que van a ser tratados en el proyecto** | p. 12-13 | **Figura 3. Modelo Entidad-Relación (esquema replicado en cada inquilino)** | "El modelo de datos consta de nueve entidades cuyas relaciones se muestran en la Figura 3. Este esquema se replica idéntico en cada base de datos PostgreSQL (una por inquilino)." |
| 4 | `05_capas_backend.png` | **3.2.1. Estudio de viabilidad técnica del proyecto** | p. 13-15 | **Figura 4. Arquitectura por capas del backend (Node.js + Express)** | "El backend está organizado en capas con responsabilidades bien delimitadas, tal y como ilustra la Figura 4." |
| 5 | `08_gantt.png` | **3.3.1. Fases del proyecto especificando su contenido y plazos de ejecución** | p. 17 | **Figura 5. Cronograma del proyecto (diagrama de Gantt)** | "La Figura 5 representa la planificación temporal del proyecto en formato Gantt. La memoria se redactó en paralelo a la implementación para evitar acumular trabajo de redacción al final." |
| 6 | `04_cicd.png` | **4.2. Programación** | p. 24-25 | **Figura 6. Pipeline CI/CD: GitHub → Vercel + Render** | "La automatización del despliegue se logra mediante webhooks de GitHub (Figura 6). Cada git push a main dispara un build atómico en Vercel (frontend) y otro en Render (backend)." |
| 7 | `03_auth_flow.png` | **4.3.1. Riesgos inherentes a la ejecución del proyecto** *(subapartado Seguridad)* | p. 25-26 | **Figura 7. Flujo de petición autenticada (login + selección de inquilino)** | "La mitigación del riesgo de fuga cruzada de datos entre inquilinos se basa en el flujo de la Figura 7: el JWT incorpora un claim tenant que, junto con la cabecera x-tenant-id, selecciona el pool PostgreSQL correcto mediante AsyncLocalStorage." |
| 8 | `06_aes.png` | **4.3.1. Riesgos inherentes a la ejecución del proyecto** *(subapartado Seguridad, justo después de la Figura 7)* | p. 26 | **Figura 8. Cifrado AES-256-CBC de datos sensibles (PII de clientes)** | "Los datos personales sensibles (teléfono y email de clientes) se cifran simétricamente antes de su persistencia siguiendo el flujo de la Figura 8." |

---

## 2. Capturas reales que debes hacer tú (no las puedo generar yo)

| # | Captura | Sección destino | Caption sugerido |
|---|---|---|---|
| 9 | Historial de commits de GitHub | 4.2. Programación (al final) | **Figura 9. Historial de commits del repositorio Boutique & Market** |
| 10 | Panel de Render con servicio activo | 4.4.1. Asignación de recursos | **Figura 10. Servicio Render activo en la región Frankfurt** |
| 11 | Panel de Vercel con deploy verde | 4.4.1. Asignación de recursos | **Figura 11. Despliegue exitoso en Vercel** |
| 12 | Panel Supabase con 2 proyectos | 4.4.1. Asignación de recursos | **Figura 12. Dos proyectos PostgreSQL aislados en Supabase** |
| 13 | Pantalla de login de tu app | 4.6.1. Procedimiento de evaluación | **Figura 13. Pantalla de inicio de sesión de Boutique & Market** |
| 14 | Dashboard Oh-Nails | 4.6.1. Procedimiento de evaluación | **Figura 14. Dashboard del inquilino Oh-Nails (módulo Boutique)** |
| 15 | Dashboard El Gallo Azul | 4.6.1. Procedimiento de evaluación | **Figura 15. Dashboard del inquilino El Gallo Azul (módulo Market)** |
| 16 | Una factura PDF real generada | 4.6.2. Indicadores de calidad | **Figura 16. Factura emitida por la plataforma** |

---

## 3. Correcciones de texto (mínimas, sin borrar apartados)

| # | Sección | Problema actual | Acción |
|---|---|---|---|
| A | TOC + título de subapartado en **3.2.1** | Aparece "Lógica de Automatización (Triggers)" — pero ya no usas triggers (la lógica vive en backend) | **Renombrar** a: *"Lógica de negocio en el backend (servicios)"* en el TOC y en el título del apartado dentro del documento. **No borrar el apartado**, simplemente sustituye el texto del párrafo: "Al sustituir SQLite por PostgreSQL gestionado, los siete triggers de la versión inicial fueron reescritos como funciones explícitas en la capa de servicios. Esto aporta tres ventajas: la lógica reside en el repositorio (auditable y versionada), no se ejecuta en el motor de la base de datos (mejor portabilidad) y permite testeo unitario." |
| B | **8. Bibliografía** | Aún cita: MDN Progressive Web Apps · Google Developers PWA · SQLite Consortium · GitHub Desktop Documentation | **Sustituir el bloque entero** por la bibliografía actualizada del punto 4 de este documento |
| C | **2.3** y todo el doc | Las menciones a "Docker Compose / SQLite local" en el resumen e introducción ya están corregidas, pero verifica que no queden frases tipo "se aloja en un contenedor Docker en local" en ningún subapartado | Buscar (Ctrl+F) "Docker", "SQLite", "PWA" — si aparece en presente/operativo, sustituir por la versión cloud |
| D | Justo después del TOC | No existe **Índice de figuras** | Añadir página nueva tras la Tabla de contenidos con el listado de las 16 figuras (no es obligatorio en el modelo, pero sube mucho la nota) |

---

## 4. Bibliografía nueva (reemplaza el bloque del apartado 8)

```
Vercel Inc. (2025). Vercel Documentation — Deployments. https://vercel.com/docs/deployments
Render Services Inc. (2025). Render Blueprint Specification (render.yaml). https://render.com/docs/blueprint-spec
Render Services Inc. (2025). Web Services Documentation. https://render.com/docs/web-services
Supabase Inc. (2025). Supabase Documentation — PostgreSQL Database. https://supabase.com/docs/guides/database
Supabase Inc. (2025). Connection Pooling. https://supabase.com/docs/guides/database/connecting-to-postgres
OpenJS Foundation (2025). Express.js — Fast, unopinionated, minimalist web framework for Node.js. https://expressjs.com/
Brian Carlson et al. (2025). node-postgres (pg) — Non-blocking PostgreSQL client for Node.js. https://node-postgres.com/
IETF (2015). RFC 7519 — JSON Web Token (JWT). https://datatracker.ietf.org/doc/html/rfc7519
Auth0 (2025). jsonwebtoken — JSON Web Token implementation for Node.js. https://github.com/auth0/node-jsonwebtoken
Provos, N. & Mazières, D. (1999). A Future-Adaptable Password Scheme — bcrypt. USENIX ATC.
Daniel Wood (2025). bcryptjs — Optimized bcrypt for plain JavaScript. https://github.com/dcodeIO/bcrypt.js
Helmet contributors (2025). Helmet — Help secure Express apps with various HTTP headers. https://helmetjs.github.io/
Colin McDonnell (2025). Zod — TypeScript-first schema validation. https://zod.dev/
Adam Wathan (2025). Tailwind CSS — A utility-first CSS framework. https://tailwindcss.com/docs
Fengyuan Chen (2025). Cropper.js — JavaScript image cropper. https://fengyuanchen.github.io/cropperjs/
Lucide contributors (2025). Lucide Icons. https://lucide.dev/
PostgreSQL Global Development Group (2025). PostgreSQL 15 Documentation. https://www.postgresql.org/docs/15/
OpenJS Foundation (2025). Node.js v20 — AsyncLocalStorage API. https://nodejs.org/api/async_context.html
NIST (2001). FIPS PUB 197 — Advanced Encryption Standard (AES). https://csrc.nist.gov/publications/detail/fips/197/final
OpenJS Foundation (2025). Node.js Crypto Module — AES-256-CBC. https://nodejs.org/api/crypto.html
OWASP Foundation (2024). OWASP Top 10 Web Application Security Risks. https://owasp.org/www-project-top-ten/
GitHub Inc. (2025). GitHub Webhooks Documentation. https://docs.github.com/en/webhooks
```

---

## 5. Cómo insertar las imágenes en Word/Google Docs

| Paso | Acción |
|---|---|
| 1 | Localizar la sección exacta (Ctrl+F con el título del apartado) |
| 2 | Posicionar el cursor en la línea donde acaba el último párrafo de texto puente |
| 3 | Pulsar Enter para crear una línea nueva |
| 4 | **Insertar → Imagen → Desde archivo** y seleccionar el `.png` correspondiente |
| 5 | Click derecho sobre la imagen → **Ajustar texto → En línea con el texto** |
| 6 | Centrar (Ctrl+E) |
| 7 | Pulsar Enter, escribir el caption: tipografía cursiva tamaño 9, color gris (#595959). Ejemplo: *"Figura 1. Análisis DAFO del proyecto Boutique & Market"* |
| 8 | Pulsar Enter dos veces antes del siguiente párrafo |

---

## 6. Orden cronológico de la operación (recomendado)

| Orden | Acción | Tiempo |
|---|---|---|
| 1 | Renombrar "Lógica de Automatización (Triggers)" → "Lógica de negocio en el backend (servicios)" en TOC y en el cuerpo | 2 min |
| 2 | Insertar las 8 figuras generadas siguiendo el orden 1→8 de la Tabla 1 | 15 min |
| 3 | Hacer las 8 capturas reales (login, dashboards, paneles cloud, factura) e insertarlas en orden 9→16 | 25 min |
| 4 | Sustituir el bloque de bibliografía del apartado 8 | 3 min |
| 5 | (Opcional pero +nota) Añadir Índice de figuras tras el TOC | 5 min |
| 6 | Click derecho sobre el TOC → Actualizar campos → Actualizar toda la tabla | 10 s |
| 7 | Revisar que no queden referencias a Docker/SQLite/PWA fuera de los apartados de "antecedentes" | 3 min |
| 8 | Exportar a PDF: Archivo → Exportar → Crear PDF | 30 s |

**Total: ~55 minutos para alcanzar 9.7-10/10**

---

## 7. Resumen visual de qué pones en cada página

```
Página 9-10  → 2.3 → 📊 Figura 1 (DAFO)
Página 12    → 3.1 → 🏗️ Figura 2 (Arquitectura cloud)
Página 12-13 → 3.1.1 → 🗄️ Figura 3 (Modelo ER)
Página 13-15 → 3.2.1 → 📚 Figura 4 (Capas backend)
Página 17    → 3.3.1 → 📅 Figura 5 (Gantt)
Página 24-25 → 4.2 → 🚀 Figura 6 (CI/CD) + 📷 Figura 9 (commits)
Página 25-26 → 4.3.1 → 🔐 Figura 7 (Auth flow) + 🔒 Figura 8 (AES)
Página 26    → 4.4.1 → 🟢 Figuras 10-12 (Render/Vercel/Supabase)
Página 28    → 4.6.1 → 🖥️ Figuras 13-15 (Login + 2 dashboards)
Página 28    → 4.6.2 → 🧾 Figura 16 (Factura)
```
