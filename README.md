# 🚀 Boutique Market — Sistema de Gestión Multitenant

Plataforma integral de gestión para dos negocios familiares, desarrollada como Trabajo de Fin de Grado.

## 🏢 Los dos negocios (Arquitectura Multitenant)

| Tenant | Negocio | Usuario | Módulos |
|---|---|---|---|
| `boutique` | Oh-Nails (manicura) | Arelys | Agenda, Clientes, Finanzas, Galería |
| `market` | El Gallo Azul (pollería) | Santi | Inventario, Proveedores, Pedidos, Estadísticas |

Cada tenant opera sobre su propia base de datos MySQL, completamente aislada. El mismo backend sirve a ambos mediante un middleware de contexto asíncrono (`AsyncLocalStorage`), sin mezcla de datos posible.

---

## 🏗️ Arquitectura

```
/backend      → API REST en Node.js + Express + MySQL
/frontend     → UI en HTML5 + Vanilla JS (ES6+) + Tailwind CSS
```

El proyecto sigue una arquitectura **desacoplada** deliberadamente: el frontend se comunica con el backend exclusivamente a través de la Fetch API, sin frameworks intermedios. Esta decisión demuestra dominio de los fundamentos de JavaScript y del ciclo completo de una petición HTTP.

### Evolución técnica
El proyecto comenzó como un prototipo en React conectado a un BaaS externo. Tras validar los requisitos de negocio, se reescribió desde cero en Vanilla JS con backend propio en Node.js y MySQL, eliminando dependencias externas y ganando control total sobre los datos, la seguridad y la lógica de negocio.

---

## 🛠️ Funcionalidades

### 💅 Boutique Oh-Nails (Arelys)
- **Agenda de citas**: calendario con registro de clientes y ganancias por sesión
- **Gestión de clientes**: historial, notas, última visita y alertas de fidelización
- **Control financiero**: semáforo de rentabilidad, registro de ingresos y gastos
- **Galería de trabajos**: portfolio visual de diseños de uñas

### 🐓 El Gallo Azul (Santi)
- **Inventario inteligente**: control de stock con alertas de reposición crítica
- **Gestión de proveedores**: directorio con importación CSV
- **Calculadora de márgenes**: cálculo de costos, IVA y beneficio neto por producto
- **Estadísticas**: dashboard con indicadores clave del negocio

---

## 🔒 Seguridad

| Capa | Tecnología | Propósito |
|---|---|---|
| Contraseñas | Bcrypt (10 salt rounds) | Hash unidireccional resistente a fuerza bruta |
| PII (emails) | AES-256-CBC + IV aleatorio | Cifrado bidireccional de datos personales |
| Cabeceras HTTP | Helmet.js | Protección contra ataques web comunes |
| Validación | Middlewares propios | Sanitización de inputs antes del controlador |
| Separación de datos | AsyncLocalStorage | Aislamiento total entre tenants |

---

## 🚀 Instalación

### Requisitos
- Node.js v16+
- MySQL 8+

### 1. Configurar variables de entorno

```bash
cp backend/.env.example backend/.env
# Edita backend/.env con tus credenciales de MySQL y tu ENCRYPTION_KEY
```

### 2. Crear las bases de datos

```bash
# Ejecuta el schema para cada tenant
mysql -u root -p boutique_db < backend/schema.sql
mysql -u root -p market_db < backend/schema.sql
```

### 3. Arrancar el backend

```bash
cd backend
npm install
npm start
# API disponible en http://localhost:3000
```

### 4. Arrancar el frontend

```bash
cd frontend
npx serve .
# UI disponible en http://localhost:4200 (o el puerto que indique serve)
```

---

## 🗄️ Modelo de Datos

### Entidades principales

- **`users`** — autenticación por tenant (username + password hasheado + email cifrado)
- **`calendar`** — citas con cliente, fecha, descripción y ganancia proyectada
- **`clients`** — clientes recurrentes con historial de visitas
- **`finance`** — registro de ingresos y gastos de la boutique
- **`inventory`** — productos con stock, precio de coste, precio de venta y mínimo de alerta
- **`providers`** — proveedores con contacto y categoría
- **`invoices`** — facturas de compra vinculadas a proveedor
- **`nails`** — galería de trabajos de manicura

Convención: `snake_case`, idioma inglés técnico, claves foráneas explícitas.

---

## 📁 Estructura del proyecto

```
boutique-market/
├── backend/
│   ├── src/
│   │   ├── config/        → Conexión MySQL y contexto multitenant
│   │   ├── controllers/   → Lógica de negocio por módulo
│   │   ├── middlewares/   → Validación de inputs
│   │   ├── routes/        → Definición de endpoints REST
│   │   ├── services/      → Servicios externos (mensajería WhatsApp)
│   │   └── utils/         → Cifrado AES-256-CBC
│   ├── schema.sql         → Esquema de base de datos
│   └── server.js          → Entrada principal, middlewares globales
└── frontend/
    ├── js/features/
    │   ├── auth/          → Login
    │   ├── boutique/      → Módulos de Oh-Nails
    │   ├── market/        → Módulos de El Gallo Azul
    │   ├── core/          → Router SPA, store, API client
    │   └── shared/        → Componentes compartidos
    └── index.html         → Entrada única (SPA)
```