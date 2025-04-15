import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import vueDevTools from 'vite-plugin-vue-devtools'
import sitemap from 'vite-plugin-sitemap'
import { games } from './src/data/games' // Import your game data

// Extract dynamic routes from game data
const dynamicRoutes = Object.values(games)
  .map(game => game.addressBar ? `/${game.addressBar}` : null)
  .filter(path => path !== null); // Filter out games without addressBar

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueJsx(),
    vueDevTools(),
    sitemap({
      hostname: 'https://escape-road-eta.vercel.app', // Your website base URL
      dynamicRoutes: dynamicRoutes, // Add dynamic game routes
      robots: [
        { userAgent: '*', allow: '/' } // Optional: Configure robots directly here
      ],
      // Optional: Exclude routes if needed
      // exclude: ['/admin/**'], 
      // Optional: Change output file name/location
      // outDir: 'dist', 
      // filename: 'sitemap.xml',
    })
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      }
    }
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    sourcemap: false
  }
})