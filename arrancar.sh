#!/bin/bash

echo "========================================="
echo "🚀 Iniciando el proyecto Boutique Market..."
echo "========================================="

# Función para matar procesos en un puerto específico silenciando errores
matar_puerto() {
    local puerto=$1
    local pid=$(lsof -t -i:$puerto 2>/dev/null)
    if [ ! -z "$pid" ]; then
        echo "⚠️  Liberando el puerto $puerto (PID: $pid)..."
        kill -9 $pid 2>/dev/null
    fi
}

# Limpiar puertos 3000 (backend) y 4200 (frontend)
matar_puerto 3000
matar_puerto 4200

echo "✅ Puertos libres y listos."

# Guardar la ruta raíz
ROOT_DIR=$(pwd)

# Iniciar Backend
echo "⚙️  Iniciando Backend..."
cd "$ROOT_DIR/backend" || exit
node server.js &
BACKEND_PID=$!
echo "✅ Backend en ejecución (PID: $BACKEND_PID)"

# Iniciar Frontend
echo "🎨 Iniciando Frontend..."
cd "$ROOT_DIR/frontend" || exit
npm run dev &
FRONTEND_PID=$!
echo "✅ Frontend en ejecución (PID: $FRONTEND_PID)"

# Volver a la raíz
cd "$ROOT_DIR" || exit

# Función para cerrar todo limpiamente al hacer Ctrl+C
limpiar_procesos() {
    echo ""
    echo "🛑 Interrupción detectada. Deteniendo los servicios..."
    
    # Matar el backend si sigue activo
    if kill -0 $BACKEND_PID 2>/dev/null; then
        echo "🔴 Terminando Backend (PID: $BACKEND_PID)..."
        kill -9 $BACKEND_PID 2>/dev/null
    fi
    
    # Matar el frontend si sigue activo
    if kill -0 $FRONTEND_PID 2>/dev/null; then
        echo "🔴 Terminando Frontend (PID: $FRONTEND_PID)..."
        kill -9 $FRONTEND_PID 2>/dev/null
    fi
    
    # Asegurarnos de limpiar cualquier proceso hijo que haya quedado en esos puertos
    matar_puerto 3000
    matar_puerto 4200
    
    echo "👋 ¡Servicios detenidos correctamente!"
    exit 0
}

# Configurar el trap para SIGINT (Ctrl+C) y SIGTERM
trap limpiar_procesos SIGINT SIGTERM

echo "========================================="
echo "🌟 ¡Proyecto levantado con éxito!"
echo "👉 Backend: http://localhost:3000"
echo "👉 Frontend: http://localhost:4200"
echo "⌨️  Presiona Ctrl+C para detener todo de forma segura."
echo "========================================="

# Quedarse a la espera para mantener la terminal abierta y el trap activo
wait $BACKEND_PID $FRONTEND_PID
