# /backend/Dockerfile
FROM node:18-alpine

# Directorio de trabajo en el contenedor
WORKDIR /usr/src/app

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar dependencias de producción
RUN npm ci --only=production

# Copiar el resto del código del backend
COPY . .

# Exponer el puerto de la API
EXPOSE 3000

# Comando para iniciar el servidor
CMD ["node", "server.js"]