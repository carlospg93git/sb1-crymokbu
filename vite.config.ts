import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { nodePolyfills } from 'vite-plugin-node-polyfills'

export default defineConfig({
  plugins: [
    react(),
    nodePolyfills({
      protocolImports: true
    })
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
    rollupOptions: {
      output: {
        format: 'es',
        entryFileNames: 'assets/[name].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]'
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