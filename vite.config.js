import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // Keep dependency discovery scoped to the portfolio app. Archived static
  // captures under public/ ship as-is and are not application entry points.
  optimizeDeps: { entries: ['index.html'] },
  // A second preview must not silently fall through to another port.
  server: { port: 3001, strictPort: true },
  build: {
    target: 'es2020',
    // The ink fallback covers the one home-only import; do not preload its 3D graph on standard routes.
    modulePreload: false,
    // Three.js is isolated behind the lazy immersive route; its core module is 719 kB minified.
    chunkSizeWarningLimit: 750,
    rollupOptions: {
      output: {
        manualChunks(id) {
          const normalizedId = id.replaceAll('\\', '/')
          if (normalizedId.includes('vite/preload-helper')) return 'vite-preload'
          if (!normalizedId.includes('/node_modules/')) return undefined
          if (normalizedId.includes('/node_modules/three/')) return 'three-core'
          if (normalizedId.includes('/@react-three/')) return 'immersive-3d'
          if (normalizedId.includes('/gsap/')) return 'immersive-motion'
          if (normalizedId.includes('/react/') || normalizedId.includes('/react-dom/') || normalizedId.includes('/react-router-dom/')) return 'react-vendor'
          return undefined
        },
      },
    },
  },
})
