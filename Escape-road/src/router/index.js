import { createRouter, createWebHistory } from 'vue-router'
import Index from '../views/Index.vue'
import AboutView from '../views/AboutView.vue'
import DmcaView from '../views/DmcaView.vue'
import PrivacyPolicyView from '../views/PrivacyPolicyView.vue'
import TermsOfServiceView from '../views/TermsOfServiceView.vue'
// import AdminPanel from '../views/AdminPanel.vue'
import { games } from '../data/games'

/**
 * 根据 addressBar 查找游戏ID
 * @param {string} addressBarParam - URL中的 addressBar 参数
 * @returns {string} 游戏ID，找不到则返回 'game1'
 */
const findGameIdByAddressBar = (addressBarParam) => {
  // 确保比较时忽略大小写，并处理 undefined 的情况
  const lowerAddressBarParam = addressBarParam?.toLowerCase();
  if (!lowerAddressBarParam) return 'game1';

  return Object.keys(games).find(id => 
    games[id].addressBar?.toLowerCase() === lowerAddressBarParam
  ) || 'game1' // 如果找不到匹配项，默认返回 game1
}

// Helper function to update meta tags
const updateMetaTag = (selector, attribute, content) => {
  let element = document.querySelector(selector);
  if (element) {
    element.setAttribute(attribute, content);
  } else {
    // Optional: Create the tag if it doesn't exist (less likely for meta tags added in index.html)
    console.warn(`Meta tag for selector '${selector}' not found.`);
    // Example creation (adapt as needed):
    // element = document.createElement('meta');
    // if (selector.startsWith('meta[name=')) element.setAttribute('name', selector.match(/name="([^\"]+)"/)[1]);
    // if (selector.startsWith('meta[property=')) element.setAttribute('property', selector.match(/property="([^\"]+)"/)[1]);
    // element.setAttribute(attribute, content);
    // document.head.appendChild(element);
  }
};

// 创建路由实例
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: Index,
      props: { id: 'game1' }, // 首页默认显示 game1
      meta: { 
        title: games.game1.title, 
        description: games.game1.description, // Add description from game data
        image: games.game1.image // Add image from game data
      }
    },
    {
      // 路径参数现在是 :addressBar
      path: '/:addressBar',
      name: 'game',
      component: Index,
      // props 函数根据 addressBar 参数查找并传递 gameId
      props: (route) => ({
        id: findGameIdByAddressBar(route.params.addressBar)
      }),
      // meta.title 函数也根据 addressBar 查找对应的游戏标题
      meta: { 
        title: (route) => {
          const gameId = findGameIdByAddressBar(route.params.addressBar)
          return games[gameId]?.title || games.game1.title
        },
        description: (route) => { // Add description function
          const gameId = findGameIdByAddressBar(route.params.addressBar)
          return games[gameId]?.description || 'Play exciting car chase adventure games! Dodge obstacles and escape the police.' // Default description
        },
        image: (route) => { // Add image function
          const gameId = findGameIdByAddressBar(route.params.addressBar)
          return games[gameId]?.image || 'og-default.png' // Default image path (relative to /public)
        }
      }
    },
    {
      path: '/about',
      name: 'about',
      component: AboutView,
      meta: { 
        title: '关于我们', 
        description: 'Learn more about Escape Road and the team.', // Default description
        image: 'og-default.png' // Default image path
      }
    },
    {
      path: '/dmca',
      name: 'dmca',
      component: DmcaView,
      meta: { 
        title: 'DMCA Policy',
        description: 'Read our DMCA policy.', 
        image: 'og-default.png' 
      }
    },
    {
      path: '/privacy-policy',
      name: 'privacy-policy',
      component: PrivacyPolicyView,
      meta: { 
        title: 'Privacy Policy',
        description: 'Read our Privacy Policy.',
        image: 'og-default.png' 
      }
    },
    {
      path: '/terms-of-service',
      name: 'terms-of-service',
      component: TermsOfServiceView,
      meta: { 
        title: 'Terms of Service',
        description: 'Read our Terms of Service.',
        image: 'og-default.png' 
      }
    },
    {
      path: '/admin/login',
      name: 'AdminLogin',
      component: () => import('../views/admin/Login.vue')
    },
    {
      path: '/admin/dashboard',
      name: 'AdminDashboard',
      component: () => import('../views/admin/Dashboard.vue'),
      meta: { requiresAuth: true }
    },
    // {
    //   path: '/admin-panel',
    //   name: 'AdminPanel',
    //   component: AdminPanel
    // },
  ]
})

// 全局前置守卫，用于设置页面标题和路由保护
router.beforeEach((to, from, next) => {
  const baseUrl = 'https://escape-road-online.com'; // Updated base URL
  const defaultTitle = 'Escape Road';
  const defaultDescription = 'Play exciting car chase adventure games like Escape Road, Escape Road 2, and more! Dodge obstacles and escape the police.';
  const defaultImagePath = '/images/og-default.png'; // Path relative to /public

  // --- Determine Meta Content --- 
  let pageTitle = defaultTitle;
  let pageDescription = defaultDescription;
  let pageImage = defaultImagePath;

  if (to.meta.title) {
    pageTitle = typeof to.meta.title === 'function' ? to.meta.title(to) : to.meta.title;
  }
  if (to.meta.description) {
    pageDescription = typeof to.meta.description === 'function' ? to.meta.description(to) : to.meta.description;
  }
  if (to.meta.image) {
    const imagePath = typeof to.meta.image === 'function' ? to.meta.image(to) : to.meta.image;
    // Assume image path from meta is relative to /public/images unless it's already a full URL
    pageImage = imagePath.startsWith('http') ? imagePath : `/images/${imagePath.replace(/^\/+/, '')}`;
  }

  const canonicalUrl = baseUrl + (to.path === '/' ? '/' : to.path);
  const fullImageUrl = baseUrl + pageImage;

  // --- Set Document Title ---
  document.title = pageTitle;

  // --- Set Canonical URL ---
  updateMetaTag('link[rel="canonical"]' , 'href', canonicalUrl);

  // --- Set Open Graph Meta Tags ---
  updateMetaTag('meta[property="og:url"]'     , 'content', canonicalUrl);
  updateMetaTag('meta[property="og:title"]'    , 'content', pageTitle);
  updateMetaTag('meta[property="og:description"]' , 'content', pageDescription);
  updateMetaTag('meta[property="og:image"]'     , 'content', fullImageUrl);
  
  // --- Set Twitter Card Meta Tags ---
  updateMetaTag('meta[name="twitter:url"]'        , 'content', canonicalUrl);
  updateMetaTag('meta[name="twitter:title"]'       , 'content', pageTitle);
  updateMetaTag('meta[name="twitter:description"]'  , 'content', pageDescription);
  updateMetaTag('meta[name="twitter:image"]'        , 'content', fullImageUrl);

  // --- Authentication Check --- (Keep this part)
  if (to.meta.requiresAuth) {
    const token = localStorage.getItem('adminToken'); // Check for 'adminToken'
    if (!token) {
      // No token found, redirect to login page
      console.log('Auth required, no token found, redirecting to login.');
      next({ name: 'AdminLogin' }); // Redirect to login route by name
      return;
    } else {
      // Token found, allow access
      console.log('Auth required, token found, proceeding.');
      // In a real app, you might want to verify the token with the backend here
      next(); 
    }
  } else {
    // This route does not require authentication
    next();
  }
});

export default router
