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

// 创建路由实例
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: Index,
      props: { id: 'game1' }, // 首页默认显示 game1
      meta: { title: games.game1.title } // 首页标题使用 game1 的标题
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
          return games[gameId]?.title || games.game1.title // 获取标题，找不到用 game1 标题
        }
      }
    },
    {
      path: '/about',
      name: 'about',
      component: AboutView,
      meta: { title: '关于我们' }
    },
    {
      path: '/dmca',
      name: 'dmca',
      component: DmcaView,
      meta: { title: 'DMCA Policy' }
    },
    {
      path: '/privacy-policy',
      name: 'privacy-policy',
      component: PrivacyPolicyView,
      meta: { title: 'Privacy Policy' }
    },
    {
      path: '/terms-of-service',
      name: 'terms-of-service',
      component: TermsOfServiceView,
      meta: { title: 'Terms of Service' }
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
  // --- Set Document Title ---
  let pageTitle = 'Escape Road'; // Default title
  if (to.meta.title) {
    pageTitle = typeof to.meta.title === 'function' 
      ? to.meta.title(to) 
      : to.meta.title;
  }
  document.title = pageTitle;

  // --- Set Canonical URL ---
  const baseUrl = 'https://escape-road-eta.vercel.app'; // CHANGE THIS if your domain changes
  const canonicalUrl = baseUrl + (to.path === '/' ? '/' : to.path); // Construct full URL

  let link = document.querySelector('link[rel="canonical"]');
  if (link) {
    link.setAttribute('href', canonicalUrl);
  } else {
    // Fallback if the link doesn't exist (e.g., SSR or prerendering might remove it)
    link = document.createElement('link');
    link.setAttribute('rel', 'canonical');
    link.setAttribute('href', canonicalUrl);
    document.head.appendChild(link);
    console.warn('Canonical link tag was missing, created dynamically.');
  }

  // --- RE-ENABLE AUTH CHECK --- 
  // Check for protected routes
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
