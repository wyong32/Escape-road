<template>
  <div style="display: none;">
    <!-- 这个组件不渲染任何内容，只负责预加载资源 -->
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { games } from '../data/games'

// 预加载关键图片资源
const preloadCriticalImages = () => {
  // 只预加载首屏必需的图片（前3个游戏，排除大文件）
  const criticalGames = Object.values(games).slice(0, 3)

  criticalGames.forEach(game => {
    if (game.image && !isLargeImage(game.image)) {
      // 使用 Image 对象预加载，避免 link preload 警告
      const img = new Image()
      try {
        img.src = new URL(`../assets/images/${game.image}`, import.meta.url).href
        // 不需要添加到 DOM，只是预加载到缓存
      } catch (error) {
        console.warn(`Failed to preload image: ${game.image}`, error)
      }
    }
  })
}

// 检查是否为大文件（需要延迟加载）
const isLargeImage = (imageName) => {
  const largeImages = ['game18.png', 'game19.jpg', 'game20.png'] // 大于1MB的图片
  return largeImages.includes(imageName)
}

// 预加载字体资源
const preloadFonts = () => {
  // 预加载 FontAwesome 字体
  const fontLink = document.createElement('link')
  fontLink.rel = 'preload'
  fontLink.as = 'font'
  fontLink.type = 'font/woff2'
  fontLink.crossOrigin = 'anonymous'
  fontLink.href = '/node_modules/@fortawesome/fontawesome-free/webfonts/fa-solid-900.woff2'
  document.head.appendChild(fontLink)
}

// 预连接到外部域名
const preconnectExternalDomains = () => {
  const domains = [
    'https://1games.io',
    'https://azgames.io',
    'https://sprunki.org',
    'https://turbowarp.org',
    'https://shellshock.io'
  ]

  domains.forEach(domain => {
    const link = document.createElement('link')
    link.rel = 'preconnect'
    link.href = domain
    document.head.appendChild(link)
  })
}

onMounted(() => {
  // 使用 requestIdleCallback 在浏览器空闲时预加载资源
  if ('requestIdleCallback' in window) {
    requestIdleCallback(() => {
      preloadCriticalImages()
    })
    // 进一步延迟非关键资源
    requestIdleCallback(() => {
      preloadFonts()
      preconnectExternalDomains()
    }, { timeout: 2000 })
  } else {
    // 降级方案：分批加载
    setTimeout(preloadCriticalImages, 100)
    setTimeout(preloadFonts, 500)
    setTimeout(preconnectExternalDomains, 1000)
  }
})
</script>
