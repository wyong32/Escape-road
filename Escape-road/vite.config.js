import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import vueDevTools from 'vite-plugin-vue-devtools'
import sitemap from 'vite-plugin-sitemap'
import { games } from './src/data/games' // Import your game data
import axios from 'axios' // Import axios

// Function to fetch blog slugs
const getBlogSlugs = async () => {
  try {
    // Use the same base URL logic as your app, assuming build runs where backend is accessible
    // If backend runs on a different port during build, adjust URL
    const apiBaseUrl = process.env.VITE_API_BASE_URL || 'http://localhost:3000'; 
    console.log(`[Sitemap] Fetching blog slugs from ${apiBaseUrl}/api/blog`);
    const response = await axios.get(`${apiBaseUrl}/api/blog`);
    const posts = response.data || [];
    const slugs = posts.map(post => post.slug).filter(slug => slug);
    console.log(`[Sitemap] Found ${slugs.length} blog slugs.`);
    return slugs.map(slug => `/blog/${slug}`); // Format as routes
  } catch (error) {
    console.error('[Sitemap] Error fetching blog slugs:', error.message);
    return []; // Return empty array on error
  }
};

// https://vite.dev/config/
// Make defineConfig async to await slug fetching
export default defineConfig(async () => {

  // Extract dynamic game routes
  const dynamicGameRoutes = Object.values(games)
    .map(game => game.addressBar ? `/${game.addressBar}` : null)
    .filter(path => path !== null);

  // Fetch dynamic blog routes
  const dynamicBlogRoutes = await getBlogSlugs();

  // Combine all dynamic routes
  const allDynamicRoutes = [...dynamicGameRoutes, ...dynamicBlogRoutes];
  console.log('[Sitemap] Total dynamic routes for sitemap:', allDynamicRoutes.length);

  return {
    plugins: [
      vue(),
      vueJsx(),
      vueDevTools(),
      sitemap({
        hostname: 'https://escape-road-online.com', 
        dynamicRoutes: allDynamicRoutes, // Use combined list
        robots: [
          { userAgent: '*' }
        ],
        // Ensure admin routes are excluded if necessary
        exclude: ['/admin/**', '/admin/login'], 
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
          // Ensure this points to your running backend API during dev
          target: process.env.VITE_API_BASE_URL || 'http://localhost:3000', 
          changeOrigin: true,
        }
      }
    },
    build: {
      outDir: 'dist',
      emptyOutDir: true,
      sourcemap: false
    }
  }
});