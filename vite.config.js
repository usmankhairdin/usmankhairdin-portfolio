import { existsSync } from 'node:fs'
import { join } from 'node:path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Match Apache directory indexes for the same-origin compiled template demos.
// Vite otherwise sends the portfolio SPA for a public directory URL.
function portableDemoIndexes() {
  const configure = (server) => { server.middlewares.use((req, res, next) => {
    const url = new URL(req.url, 'http://local.test')
    const match = url.pathname.match(/^\/portfolio\/(forme|meridian|nexora|carthevia|forma|avenlo|veyravael|sanaira)(\/.*)?$/)
    if (!match) return next()
    const path = url.pathname.endsWith('/') ? url.pathname + 'index.html' : url.pathname + '/index.html'
    if (existsSync(join(server.config.publicDir, path))) {
      if (!url.pathname.endsWith('/')) {
        res.writeHead(302, { Location: url.pathname + '/' + url.search })
        return res.end()
      }
      req.url = path + url.search
    } else if (url.pathname.startsWith('/portfolio/sanaira/app/') && !/\.[a-z0-9]+$/i.test(url.pathname)) {
      req.url = '/portfolio/sanaira/app/index.html' + url.search
    }
    next()
  }) }
  return { name: 'portable-demo-indexes', configureServer: configure, configurePreviewServer: configure }
}

export default defineConfig({
  plugins: [portableDemoIndexes(), react()],
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
