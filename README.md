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
👨‍💻 Roadmap y Evolución
Esta versión actual representa el compromiso con el aprendizaje de los fundamentos de JavaScript exigidos en el ámbito académico y profesional, eliminando "cajas negras" y gestionando cada petición desde el cliente hasta la base de datos a través de una API propia.