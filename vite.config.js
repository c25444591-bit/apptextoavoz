import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react()],

    server: {
      port: 3000,
      host: true,
      open: true
    },

    build: {
      outDir: 'dist',
      sourcemap: false,
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom'],
            pdf: ['pdfjs-dist'],
            utils: ['lucide-react']
          }
        }
      },
      minify: 'esbuild',
      target: ['es2015', 'chrome61', 'firefox60', 'safari12'],
      assetsInlineLimit: 4096
    },

    css: {
      devSourcemap: true
    },

    define: {
      'import.meta.env.VITE_API_KEY': JSON.stringify(env.VITE_API_KEY || ''),
      'import.meta.env.VITE_HUGGINGFACE_API_KEY': JSON.stringify(env.VITE_HUGGINGFACE_API_KEY || ''),
      'import.meta.env.VITE_ELEVENLABS_API_KEY': JSON.stringify(env.VITE_ELEVENLABS_API_KEY || ''),
      'import.meta.env.VITE_FAL_KEY': JSON.stringify(env.VITE_FAL_KEY || '')
    },

    resolve: {
      alias: {
        '@': '/src'
      }
    },

    preview: {
      port: 4173,
      host: true
    }
  };
});
