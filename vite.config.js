import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import vueDevTools from 'vite-plugin-vue-devtools'
import Sitemap from 'vite-plugin-sitemap'
import { games } from './src/data/games'

// Generate dynamic routes from game data
const dynamicRoutes = Object.values(games)
  .map(game => game.addressBar ? `/${game.addressBar.toLowerCase()}` : null)
  .filter(Boolean);

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueJsx(),
    vueDevTools(),
    Sitemap({
      hostname: 'https://example.com',
      dynamicRoutes: dynamicRoutes,
    })
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
})
