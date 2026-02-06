import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Configuración profesional para Boutique & Market
export default defineConfig({
    plugins: [react()],
    server: {
        port: 4200,      // Puerto personalizado
        strictPort: true, // Si el 4200 está ocupado, no abrirá otro (evita confusiones)
        open: true       // Abre el navegador automáticamente al arrancar
    }
})