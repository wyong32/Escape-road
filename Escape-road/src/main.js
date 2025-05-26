import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createHead } from '@vueuse/head'

import App from './App.vue'
import router from './router'

// 导入性能监控和脚本优化
import { performanceMonitor } from './utils/performance.js'
import { scriptOptimizer } from './utils/scriptOptimizer.js'

// 延迟加载 FontAwesome
scriptOptimizer.defer(() => {
  import('@fortawesome/fontawesome-free/css/all.css')
}, 'low')

// 优化应用初始化
const initializeApp = () => {
  const app = createApp(App)
  const head = createHead()

  app.use(createPinia())
  app.use(router)
  app.use(head)

  // 延迟非关键功能的初始化
  scriptOptimizer.defer(() => {
    // 这里可以放置非关键的初始化代码
    if (import.meta.env.DEV) {
      console.log('Non-critical features initialized')
    }
  }, 'low')

  app.mount('#app')
}

// 确保 DOM 准备就绪后再初始化应用
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeApp)
} else {
  initializeApp()
}
