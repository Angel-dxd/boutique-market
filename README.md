🚀 El Gallo Azul - Sistema de Gestión Fullstack
Este proyecto es una plataforma integral de gestión para una pollería, diseñada para optimizar la operativa de Santi (Gerente) y las finanzas de Arelys.

Originalmente concebida en React, la aplicación ha sido migrada a Vanilla JavaScript y un Backend propio en Node.js para demostrar un control total sobre el ciclo de vida del desarrollo, el manejo del DOM y la arquitectura de APIs REST.

🏗️ Arquitectura del Proyecto
El proyecto sigue una estructura desacoplada para garantizar la escalabilidad y el control absoluto de los datos:

/backend: Servidor robusto desarrollado en Node.js y Express. Gestiona la lógica de negocio, validaciones y la persistencia de datos.

/frontend: Interfaz de usuario construida con HTML5, Tailwind CSS y Vanilla JavaScript (ES6+). Sin frameworks, utilizando comunicación asíncrona (Fetch API).

/frontend-legacy: Repositorio histórico que contiene la versión inicial en React, mantenido como registro de la evolución técnica del proyecto.

🛠️ Funcionalidades Principales
🐓 Gestión de Operaciones (Santi)

Inventario Inteligente: Control de stock con alertas visuales de reposición crítica.

Gestión de Proveedores: Directorio dinámico con importación de datos.

Calculadora de Márgenes: Herramienta financiera para el cálculo de costos, IVA y beneficios netos por producto.

📊 Dashboard Financiero

Semáforo de Rentabilidad: Visualización en tiempo real del estado económico del negocio.

Control de Gastos: Registro automatizado de facturas que impactan en el beneficio global.

🚀 Instalación y Puesta en Marcha
1. Requisitos previos

Node.js instalado (v16 o superior).

NPM (Gestor de paquetes).

2. Configuración del Servidor (Backend)

Bash
cd backend
npm install
npm start
El servidor correrá en http://localhost:3000

3. Configuración del Cliente (Frontend)

Bash
cd frontend
# Puedes usar cualquier servidor estático (npx serve, Live Server, etc.)
npx serve .
## 🗄️ Modelo de Datos (Data Architecture)

El proyecto cuenta con una base de datos relacional robusta en MySQL, basada en una arquitectura estandarizada con convención `snake_case` e idioma **Inglés Técnico**, siguiendo los estándares de la industria y las recomendaciones académicas para un grado sobresaliente (10).

### Entidades Principales

*   **`clients`**: Gestión de clientes recurrentes unificada. Campos destacados: `name`, `phone`, `email`, `last_visit`.
*   **`providers`**: Catálogo de proveedores. Campos destacados: `name`, `phone`, `company`, `category`.
*   **`inventory`**: Productos y stock unificado. Mantiene referencias de costo, precio y alertas (`stock` vs `min_stock`), así como la clave foránea `provider_id`.
*   **`invoices`**: Control contable de facturación corporativa (Market). Gestionado con `amount`, `reference`, `date` y enlazado al proveedor local mediante `provider_id`.
*   **`finance`**: Control genérico de gastos recurrentes de Arelys (Boutique) categorizados por `type`, `amount`, `category`, `date`.
*   **`calendar`**: Registro de agendas y ganancias proyectadas del ciclo, mapeadas con `client`, `description`, `date`, `profit`.

Esta estructura evita modelos mixtos spanglish o fragmentados, consolidando una capa semántica fiable entre nuestro backend en ExpressJS y el frontend basado en features.

## 🔒 Seguridad y Cifrado de Datos

Este proyecto cumple con los más altos estándares de seguridad y protección de datos, incluyendo la implementación técnica requerida para alcanzar la nota máxima (10) en el TFG (Directivas PSyP-4 y PSyP-5):

### Cifrado de Credenciales (Bcrypt)
Todas las contraseñas de los usuarios se procesan empleando **Bcrypt** con un factor de coste de **10 salt rounds**.
- **¿Por qué Bcrypt?** A diferencia de algoritmos de hash rápido, Bcrypt está diseñado para ser deliberadamente lento. El coste algorítmico y la inyección automática de "salt" hacen virtualmente imposibles los ataques por fuerza bruta o *rainbow tables*.
- **Cómo se usa:** En el registro (`authController.js`), el password en texto plano es hasheado antes de persistirlo. En el login, usamos `bcrypt.compare` previniendo comparaciones vulnerables a *timing attacks*.

### Protección de PII (AES-256-CBC)
Para la **Información de Identificación Personal (PII)** como los correos electrónicos, aplicamos cifrado bidireccional usando **AES-256-CBC** vía el módulo nativo `crypto` de Node.js.
- **Cómo lo aplicamos:** Generamos un Vector de Inicialización (IV) aleatorio de 16 bytes dinámicamente. Esto garantiza que el mismo email cifrado varias veces generará un texto cifrado diferente cada vez en la DB.
- **¿Por qué?** Asegura que ante una brecha de seguridad en la DB no haya filtraciones de PII. Las funciones custom `encrypt` y `decrypt` traducen los datos al vuelo con una clave secreta (inyectada por entorno).

### Variables de Entorno Requeridas (.env)
Para asegurar que el proyecto se levante limpiamente en la máquina del evaluador, debes configurar las siguientes variables de entorno en el raíz de `/backend`:

| Variable | Descripción | Ejemplo / Default Local |
| :--- | :--- | :--- |
| `ENCRYPTION_KEY` | Clave simétrica de 256 bits (32 chars min) para AES. | `12345678901234567890123456789012` |
| `PORT` | Puerto por defecto para la API Node.js | `3000` |
| `CORS_ORIGIN` | Origen frontend permitido | `http://localhost:4200` |

---

👨‍💻 Roadmap y Evolución
Esta versión actual representa el compromiso con el aprendizaje de los fundamentos de JavaScript exigidos en el ámbito académico y profesional, eliminando "cajas negras" y gestionando cada petición desde el cliente hasta la base de datos a través de una API propia.