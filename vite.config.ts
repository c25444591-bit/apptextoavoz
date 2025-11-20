import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  
  // Configuración del servidor de desarrollo
  server: {
    port: 3000,
    host: true,
    open: true
  },
  
  // Configuración de build optimizada para móviles y Vercel
  build: {
    outDir: 'dist',
    sourcemap: false, // Desactivar sourcemap para producción en Vercel
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          pdf: ['pdfjs-dist'],
          utils: ['lucide-react']
        }
      }
    },
    // Optimización para producción y móviles
    minify: 'terser',
    target: ['es2015', 'chrome61', 'firefox60', 'safari12'],
    assetsInlineLimit: 4096
  },
  
  // Configuración de CSS
  css: {
    devSourcemap: true
  },
  
  // Variables de entorno
  define: {
    // Definir constantes globales si es necesario
  },
  
  // Configuración de resolución
  resolve: {
    alias: {
      '@': '/src'
    }
  },
  
  // Configuración de preview
  preview: {
    port: 4173,
    host: true
  }
});