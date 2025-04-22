import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { nodePolyfills } from 'vite-plugin-node-polyfills'

export default defineConfig({
  plugins: [
    react(),
    nodePolyfills()
  ],
  define: {
    'process.env': {}
  },
  base: '/',
  resolve: {
    alias: {
      './runtimeConfig': './runtimeConfig.browser',
    },
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: true,
    modulePreload: {
      polyfill: true
    },
    rollupOptions: {
      output: {
        format: 'es',
        entryFileNames: 'assets/[name].js',
        chunkFileNames: 'assets/[name].js',
        assetFileNames: (assetInfo) => {
          if (assetInfo.name.endsWith('.css')) {
            return 'assets/[name][extname]';
          }
          return 'assets/[name]-[hash][extname]';
        },
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui-vendor': ['framer-motion', 'lucide-react']
        }
      }
    }
  },
  server: {
    host: true,
    port: 4173,
    strictPort: true,
    headers: {
      'Content-Type': 'application/javascript; charset=utf-8'
    }
  },
  preview: {
    host: true,
    port: 4173,
    strictPort: true,
    headers: {
      'Content-Type': 'application/javascript; charset=utf-8'
    }
  }
});