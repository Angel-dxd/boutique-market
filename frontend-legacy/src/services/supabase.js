import { createClient } from '@supabase/supabase-js';

// Forzado de llaves para Boutique Oh-Nails
const supabaseUrl = 'https://fxqtjimglvwtrjajgrvb.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ4cXRqaW1nbHZ3dHJqYWpncnZiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAwNzAyNjMsImV4cCI6MjA4NTY0NjI2M30.0I8fYZtxsF-mpnvYt6G0LfzhwikDBfv4QLUXKUP-LJw';

// Log de éxito para confirmar en tu consola
console.log('--- 🚀 CONEXIÓN FORZADA ACTIVA ---');
console.log('Conectado a:', supabaseUrl);

export const supabase = createClient(supabaseUrl, supabaseKey);