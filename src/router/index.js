import { createRouter, createWebHistory } from 'vue-router'
import Index from '../views/index.vue'
import { games } from '../data/games'

/**
 * 格式化游戏标题为URL友好的格式
 * @param {string} title - 游戏标题
 * @returns {string} 格式化后的标题
 */
const formatTitleForUrl = (title) => {
  return title.toLowerCase().replace(/\s+/g, '-')
}

/**
 * 根据URL标题查找游戏ID
 * @param {string} urlTitle - URL中的标题
 * @returns {string} 游戏ID
 */
const findGameIdByTitle = (urlTitle) => {
  return Object.keys(games).find(id => 
    formatTitleForUrl(games[id].title) === urlTitle.toLowerCase()
  ) || 'game1'
}

// 创建路由实例
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: Index,
      props: { id: 'game1' },
      meta: { title: games.game1.title }
    },
    {
      path: '/:title',
      name: 'game',
      component: Index,
      props: (route) => ({
        id: findGameIdByTitle(route.params.title)
      }),
      meta: { 
        title: (route) => {
          const gameId = findGameIdByTitle(route.params.title)
          return games[gameId]?.title || games.game1.title
        }
      }
    }
  ]
})

// 全局前置守卫，用于设置页面标题
router.beforeEach((to, from, next) => {
  if (to.meta.title) {
    document.title = typeof to.meta.title === 'function' 
      ? to.meta.title(to) 
      : to.meta.title
  }
  next()
})

export default router
