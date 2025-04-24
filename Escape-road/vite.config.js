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

  // Define necessary static routes manually
  const staticRoutes = [
    '/',
    '/blog',
    '/about',
    '/dmca',
    '/privacy-policy',
    '/terms-of-service'
  ];
  console.log('[Sitemap] Manually defined static routes:', staticRoutes);

  // Extract dynamic game routes
  const dynamicGameRoutes = Object.values(games)
    .map(game => game.addressBar ? `/${game.addressBar}` : null)
    .filter(path => path !== null);

  // Fetch dynamic blog routes
  const dynamicBlogRoutes = await getBlogSlugs();

  // Combine ALL routes: static (manual), dynamic games, dynamic blogs
  const allRoutes = [
      ...staticRoutes, 
      ...dynamicGameRoutes,
      ...dynamicBlogRoutes
  ];
  // Remove duplicates just in case
  const uniqueRoutes = [...new Set(allRoutes)];
  console.log('[Sitemap] Total unique routes for sitemap:', uniqueRoutes.length);

  return {
    plugins: [
      vue(),
      vueJsx(),
      vueDevTools(),
      sitemap({
        hostname: 'https://escape-road-online.com', 
        // Provide the final combined list of unique routes
        dynamicRoutes: uniqueRoutes, 
        robots: [
          { userAgent: '*' }
        ],
        // Keep exclusion for admin paths
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