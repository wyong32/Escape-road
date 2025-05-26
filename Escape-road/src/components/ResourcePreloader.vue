<template>
  <!-- 这个组件不渲染任何内容，只负责预加载资源 -->
</template>

<script setup>
import { onMounted } from 'vue'
import { games } from '../data/games'

// 预加载关键图片资源
const preloadCriticalImages = () => {
  // 预加载首页显示的游戏图片（前6个游戏）
  const criticalGames = Object.values(games).slice(0, 6)
  
  criticalGames.forEach(game => {
    if (game.image) {
      const link = document.createElement('link')
      link.rel = 'preload'
      link.as = 'image'
      try {
        link.href = new URL(`../assets/images/${game.image}`, import.meta.url).href
        document.head.appendChild(link)
      } catch (error) {
        console.warn(`Failed to preload image: ${game.image}`, error)
      }
    }
  })
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
      preloadFonts()
      preconnectExternalDomains()
    })
  } else {
    // 降级方案：使用 setTimeout
    setTimeout(() => {
      preloadCriticalImages()
      preloadFonts()
      preconnectExternalDomains()
    }, 100)
  }
})
</script>
