<template>
  <main>
    <Headers :game-id="currentGameId" />
    <section>
      <div class="container" :style="{ background: gameData.background }">
        <!-- Google AdSense Ad Slot -->
        <div class="ads-container ads-pc">
            <ins class="adsbygoogle"
                 style="display:block"
                 data-ad-client="ca-pub-5437957765171705"
                 data-ad-slot="2049492927"
                 data-ad-format="auto"
                 data-full-width-responsive="true"></ins>
        </div>

        <div class="game-wrap">
          <!-- 广告2 -->
          <div class="ads-container ads-pc ads-left">
            <ins class="adsbygoogle"
                 style="display:block"
                 data-ad-client="ca-pub-5437957765171705"
                 data-ad-slot="9497191380"
                 data-ad-format="auto"
                 data-full-width-responsive="true"></ins>
          </div>


          <!-- 桌面端布局 -->
          <div class="game-list desktop-only" role="main" aria-label="Game collection">
            <aside class="list-left" aria-label="Related car chase games">
              <div class="game-column" v-for="(column, columnIndex) in leftGameColumns" :key="`left-col-${columnIndex}`">
                <article class="cr-item" v-for="game in column" :key="game.id">
                  <router-link
                    :to="'/' + game.addressBar"
                    :aria-label="`Play ${game.title} - Free car chase game`"
                    :title="`Play ${game.title} online for free`"
                  >
                    <SimpleImage
                      :src="game.image"
                      :title="`${game.title} - Car chase game thumbnail`"
                      :alt="`${game.title} - Free online car chase game`"
                      :priority="getImagePriority(game)"
                      width="100%"
                      height="100%"
                    />
                    <p class="mask">{{ game.logoText }}</p>
                  </router-link>
                </article>
              </div>
            </aside>
            <main class="content-center" role="main" aria-label="Main game area">
              <GameMain :game-id="currentGameId" :key="currentGameId" />
            </main>
            <aside class="list-right" aria-label="More car chase games">
              <div class="game-column" v-for="(column, columnIndex) in rightGameColumns" :key="`right-col-${columnIndex}`">
                <article class="cr-item" v-for="game in column" :key="game.id">
                  <router-link
                    :to="'/' + game.addressBar"
                    :aria-label="`Play ${game.title} - Free car chase game`"
                    :title="`Play ${game.title} online for free`"
                  >
                    <SimpleImage
                      :src="game.image"
                      :title="`${game.title} - Car chase game thumbnail`"
                      :alt="`${game.title} - Free online car chase game`"
                      :priority="getImagePriority(game)"
                      width="100%"
                      height="100%"
                    />
                    <p class="mask">{{ game.logoText }}</p>
                  </router-link>
                </article>
              </div>
            </aside>
          </div>

          <!-- 移动端布局 -->
          <div class="mobile-only" role="main" aria-label="Mobile game interface">
            <main class="content-center" aria-label="Main game area">
              <GameMain :game-id="currentGameId" :key="currentGameId" />
            </main>
            <section class="mobile-game-list" aria-label="Related games collection">
              <div class="mobile-game-grid" role="grid" aria-label="Game selection grid">
                <article class="mobile-game-item" v-for="game in gamesForMobileLayout" :key="game.id" role="gridcell">
                  <router-link
                    :to="'/' + game.addressBar"
                    @click="scrollToTop"
                    :aria-label="`Play ${game.title} - Free car chase game`"
                    :title="`Play ${game.title} online for free`"
                  >
                    <SimpleImage
                      :src="game.image"
                      :title="`${game.title} - Car chase game thumbnail`"
                      :alt="`${game.title} - Free online car chase game`"
                      :priority="getImagePriority(game)"
                      width="100%"
                      height="100%"
                    />
                    <p class="mobile-mask">{{ game.logoText }}</p>
                  </router-link>
                </article>
              </div>
            </section>
          </div>

          <!-- 广告3 -->
          <div class="ads-container ads-pc ads-right">
            <ins class="adsbygoogle"
                 style="display:block"
                 data-ad-client="ca-pub-5437957765171705"
                 data-ad-slot="1414982389"
                 data-ad-format="auto"
                 data-full-width-responsive="true"></ins>
          </div>
        </div>
        <footer class="below" role="contentinfo" aria-label="Game information and recommendations">
          <About :game-id="currentGameId" />
          <Recommend :game-id="currentGameId" />
        </footer>
      </div>
    </section>
    <ShareLink :url="currentPageUrl" :title="gameData.title" />
    <Foot />
  </main>
</template>

<script setup>
import { computed, watchEffect, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useHead } from '@unhead/vue'
import { games } from '../data/games'
import { scriptOptimizer } from '../utils/scriptOptimizer.js'
import SimpleImage from '../components/SimpleImage.vue'
import Headers from '../components/Head.vue'
import About from '../components/About.vue'
import Recommend from '../components/Recommend.vue'
import GameMain from '../components/GameMain.vue'
import Foot from '../components/foot.vue'
import ShareLink from '../components/ShareLink.vue'

/**
 * 初始化并加载 Google AdSense 脚本
 */

//  广告1
const loadAdSenseScript = () => {
  try {
    // 插入 Google AdSense 脚本
    const script = document.createElement('script')
    script.async = true
    script.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5437957765171705'
    script.crossOrigin = 'anonymous'
    document.head.appendChild(script)

    // 推送广告请求
    script.onload = () => {
      (window.adsbygoogle = window.adsbygoogle || []).push({})
    }
  } catch (error) {
    console.error('Failed to load AdSense script:', error)
  }
}

// //  广告2
// const loadAdSenseScript2 = () => {
//   try {
//     // 插入 Google AdSense 脚本
//     const script = document.createElement('script')
//     script.async = true
//     script.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5437957765171705'
//     script.crossOrigin = 'anonymous'
//     document.head.appendChild(script)

//     // 推送广告请求
//     script.onload = () => {
//       (window.adsbygoogle = window.adsbygoogle || []).push({})
//     }
//   } catch (error) {
//     console.error('Failed to load AdSense script:', error)
//   }
// }

// //  广告3
// const loadAdSenseScript3 = () => {
//   try {
//     // 插入 Google AdSense 脚本
//     const script = document.createElement('script')
//     script.async = true
//     script.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5437957765171705'
//     script.crossOrigin = 'anonymous'
//     document.head.appendChild(script)

//     // 推送广告请求
//     script.onload = () => {
//       (window.adsbygoogle = window.adsbygoogle || []).push({})
//     }
//   } catch (error) {
//     console.error('Failed to load AdSense script:', error)
//   }
// }

// //  广告4
// const loadAdSenseScript4 = () => {
//   try {
//     // 插入 Google AdSense 脚本
//     const script = document.createElement('script')
//     script.async = true
//     script.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5437957765171705'
//     script.crossOrigin = 'anonymous'
//     document.head.appendChild(script)
//   } catch (error) {
//     console.error('Failed to load AdSense script:', error)
//   }
// }

// 在组件挂载时加载广告脚本
onMounted(() => {
  loadAdSenseScript()
  // loadAdSenseScript1()
  // loadAdSenseScript2()
  // loadAdSenseScript3()
  // loadAdSenseScript4()
})

// 获取当前路由实例
const route = useRoute()

const gamesPerColumn = 7; // 每列最多显示的游戏数量

/**
 * 将游戏数组分块成列
 * @param {Array} gamesArray - 要分块的游戏数组
 * @param {number} chunkSize - 每块的大小 (即每列的游戏数)
 * @returns {Array<Array>} - 分块后的二维数组，每个子数组是一列
 */
const chunkGamesIntoColumns = (gamesArray, chunkSize) => {
  const columns = [];
  if (!gamesArray || gamesArray.length === 0) return columns;
  for (let i = 0; i < gamesArray.length; i += chunkSize) {
    columns.push(gamesArray.slice(i, i + chunkSize));
  }
  return columns;
};

/**
 * 根据 addressBar 查找游戏ID
 * @param {string} addressBarParam - URL中的 addressBar 参数
 * @returns {string} 游戏ID
 */
const findGameIdByAddressBar = (addressBarParam) => {
  const lowerAddressBarParam = addressBarParam?.toLowerCase();
  if (!lowerAddressBarParam) return 'game1';
  return Object.keys(games).find(id =>
    games[id].addressBar?.toLowerCase() === lowerAddressBarParam
  ) || 'game1'
}

// 获取当前游戏ID - 基于路由的 addressBar 参数
const currentGameId = computed(() => {
  const addressBarParam = route.params.addressBar
  return addressBarParam ? findGameIdByAddressBar(addressBarParam) : 'game1'
})

// 获取当前页面URL
const currentPageUrl = computed(() => {
  if (typeof window !== 'undefined') {
    return window.location.href
  }
  return 'https://escape-road-online.com'
})

// 获取当前游戏数据 - 确保包含 addressBar
const gameData = computed(() => {
  const game = games[currentGameId.value]
  return {
    id: game.id,
    title: game.title,
    logoText: game.logoText,
    addressBar: game.addressBar, // 确保获取 addressBar
    image: game.image,
    iframeUrl: game.iframeUrl,
    description: game.description,
    keywords: game.keywords,
    background: game.background,
    rightContent: game.rightContent
  }
})

// 获取所有游戏列表 - 确保包含 location
const allGames = computed(() => {
  return Object.values(games).map(game => ({
    id: game.id,
    title: game.title,
    logoText: game.logoText,
    addressBar: game.addressBar,
    image: game.image,
    location: game.location // 确保包含 location
  }))
})

// 修改：根据 location 筛选左侧游戏，并分列
const leftGameColumns = computed(() => {
  const filteredLeftGames = allGames.value.filter(game => game.location === 'left');
  return chunkGamesIntoColumns(filteredLeftGames, gamesPerColumn);
})

// 修改：根据 location 筛选右侧游戏，并分列
const rightGameColumns = computed(() => {
  const filteredRightGames = allGames.value.filter(game => game.location === 'right');
  return chunkGamesIntoColumns(filteredRightGames, gamesPerColumn);
})

// 新增：为移动端布局筛选游戏，只显示 location 为 'left' 或 'right' 的游戏
const gamesForMobileLayout = computed(() => {
  return allGames.value.filter(game => game.location === 'left' || game.location === 'right');
})

// 新增：滚动到页面顶部的方法
const scrollToTop = () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

// 获取图片加载优先级
const getImagePriority = (game) => {
  // 首屏显示的游戏图片设为高优先级
  const highPriorityGames = ['game1', 'game2', 'game3']
  if (highPriorityGames.includes(game.id)) {
    return 'high'
  }

  // 大文件设为低优先级
  const largeImages = ['game18.png', 'game19.jpg', 'game20.png']
  if (largeImages.includes(game.image)) {
    return 'low'
  }

  return 'normal'
}

/**
 * 更新或创建 Meta 标签
 * @param {string} name - Meta 标签的 name 属性
 * @param {string} content - Meta 标签的 content 属性
 */
const updateMetaTag = (name, content) => {
  let element = document.querySelector(`meta[name="${name}"]`);
  if (!element) {
    element = document.createElement('meta');
    element.setAttribute('name', name);
    document.head.appendChild(element);
  }
  element.setAttribute('content', content || ''); // 如果 content 为空则设置空字符串
}

// 动态 SEO 管理
const seoData = computed(() => {
  const game = gameData.value
  const isHomePage = !route.params.addressBar

  if (isHomePage) {
    return {
      title: 'Escape Road Online - Free Car Chase Games | Play Instantly',
      description: 'Play Escape Road Online for free! Experience thrilling police chase games, high-speed driving adventures, and endless car escape challenges. No download required - play instantly in your browser with 100+ free games.',
      keywords: 'escape road online, car chase games, police chase, driving games, free online games, browser games, racing games, action games, car escape, high speed chase, unblocked games',
      ogTitle: 'Escape Road Online - Ultimate Car Chase Gaming Experience',
      ogDescription: 'Experience the ultimate car chase adventure! Play Escape Road and 100+ free car chase games online. Police pursuits, high-speed driving, and endless excitement await.',
      ogImage: 'https://escape-road-online.com/images/escape-road-og.jpg',
      canonicalUrl: 'https://escape-road-online.com/'
    }
  } else {
    return {
      title: `${game.title} - Play Free Online | Escape Road`,
      description: game.description || `Play ${game.title} online for free. Experience exciting car chase gameplay with police pursuits and high-speed action.`,
      keywords: game.keywords || `${game.title}, car chase, police chase, driving games, online games, free games`,
      ogTitle: `${game.title} - Free Online Game`,
      ogDescription: game.description || `Play ${game.title} online for free. Experience exciting car chase gameplay.`,
      ogImage: `https://escape-road-online.com/images/${game.image}`,
      canonicalUrl: `https://escape-road-online.com/${game.addressBar}`
    }
  }
})

// 使用 useHead 进行 SEO 优化
useHead(() => ({
  title: seoData.value.title,
  meta: [
    // 基础 SEO
    { name: 'description', content: seoData.value.description },
    { name: 'keywords', content: seoData.value.keywords },
    { name: 'author', content: 'Escape Road Online' },
    { name: 'robots', content: 'index, follow' },

    // Open Graph (Facebook, LinkedIn)
    { property: 'og:type', content: 'website' },
    { property: 'og:title', content: seoData.value.ogTitle },
    { property: 'og:description', content: seoData.value.ogDescription },
    { property: 'og:image', content: seoData.value.ogImage },
    { property: 'og:url', content: seoData.value.canonicalUrl },
    { property: 'og:site_name', content: 'Escape Road Online' },
    { property: 'og:locale', content: 'en_US' },

    // Twitter Cards
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:title', content: seoData.value.ogTitle },
    { name: 'twitter:description', content: seoData.value.ogDescription },
    { name: 'twitter:image', content: seoData.value.ogImage },

    // 移动端优化
    { name: 'viewport', content: 'width=device-width, initial-scale=1.0' },
    { name: 'theme-color', content: '#3498db' },
    { name: 'apple-mobile-web-app-capable', content: 'yes' },
    { name: 'apple-mobile-web-app-status-bar-style', content: 'default' },

    // 游戏相关
    { name: 'category', content: 'games' },
    { name: 'classification', content: 'car chase games, driving games' },
    { name: 'rating', content: 'general' }
  ],
  link: [
    // 规范链接
    { rel: 'canonical', href: seoData.value.canonicalUrl },

    // 预连接优化
    { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
    { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },

    // 图标
    { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
    { rel: 'apple-touch-icon', href: '/apple-touch-icon.png' }
  ],
  script: [
    // 结构化数据 - 游戏
    {
      type: 'application/ld+json',
      children: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'VideoGame',
        'name': seoData.value.ogTitle,
        'description': seoData.value.ogDescription,
        'url': seoData.value.canonicalUrl,
        'image': seoData.value.ogImage,
        'genre': ['Action', 'Racing', 'Chase'],
        'gamePlatform': 'Web Browser',
        'operatingSystem': 'Any',
        'applicationCategory': 'Game',
        'offers': {
          '@type': 'Offer',
          'price': '0',
          'priceCurrency': 'USD'
        },
        'publisher': {
          '@type': 'Organization',
          'name': 'Escape Road Online'
        }
      })
    },

    // 结构化数据 - 网站
    {
      type: 'application/ld+json',
      children: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        'name': 'Escape Road Online',
        'url': 'https://escape-road-online.com',
        'description': 'Free online car chase games and driving adventures',
        'potentialAction': {
          '@type': 'SearchAction',
          'target': 'https://escape-road-online.com/search?q={search_term_string}',
          'query-input': 'required name=search_term_string'
        }
      })
    }
  ]
}))

// 保留原有的 meta 标签更新逻辑作为降级方案
watchEffect(() => {
  const currentDescription = gameData.value.description;
  const currentKeywords = gameData.value.keywords;

  // 延迟更新 meta 标签以避免阻塞主线程
  scriptOptimizer.defer(() => {
    updateMetaTag('description', currentDescription);
    updateMetaTag('keywords', currentKeywords);
  }, 'low');
});

// 调试代码已移除

</script>

<style scoped>
.container {
  transition: background-color 0.3s ease;
  background: linear-gradient(135deg, #2c3e50 0%, #3498db 100%);
  /* background: url('../assets/images/game-01.webp') no-repeat center center; */
  background-size: cover;
  padding: 100px 0;
}

.game-wrap {
  display: flex;
  justify-content: center;
  width: 100%;
  margin-bottom: 100px;
  position: relative;
}

.game-list {
  display: flex;
  justify-content: center;
  align-items: flex-start;
  width: 100%;
  max-width: 1620px; /* Adjusted for 1120px center and 2 columns on each side */
  margin: 0 auto;
  padding: 0 20px;
  overflow: hidden;
  /* border: 1px solid green; */ /* Removed */
}

.list-left, .list-right {
  display: flex;
  align-items: flex-start; /* Align columns at the top */
  gap: 15px; /* Gap BETWEEN COLUMNS */
  flex-shrink: 0; /* Prevent sidebars from shrinking */
  /* border: 1px solid blue; */ /* Removed */
  /* flex-basis: auto; */ /* Removed */
}

.list-left {
  flex-direction: row-reverse; /* New columns appear to the left */
}

.list-right {
  flex-direction: row; /* New columns appear to the right (default) */
}

.game-column {
  display: flex;
  flex-direction: column;
  gap: 10px; /* Gap BETWEEN ITEMS in a column */
  width: 100px; /* Explicitly set column width to match cr-item */
}

.content-center {
  width: 1120px; /* Restored to original specified width */
  margin: 0 20px;
  flex-shrink: 0; /* Also prevent center from shrinking below its defined width */
}

.cr-item {
  width: 100px;
  height: 100px;
  border-radius: 10px;
  overflow: hidden;
  transition: all 0.5s cubic-bezier(0.25, 0.8, 0.25, 1);
  position: relative;
  background: #fff;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.cr-item a {
  display: block;
  width: 100%;
  height: 100%;
}

.cr-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: all 0.5s ease;
  /* 防止图片加载时的布局偏移 */
  aspect-ratio: 1 / 1;
  background-color: #f0f0f0;
}

.cr-item .mask{
  position: absolute;
  left: 0;
  bottom: 5px;
  width: 100%;
  text-align: center;
  font-size: 14px;
  color: #fff;
  z-index: 9;
  text-shadow: -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000;
  padding: 0 5px;
}

.cr-item:hover {
  transform: scale(1.05) rotate(3deg);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.3);
  z-index: 10;
}

.cr-item:hover img {
  transform: scale(1.1);
}

.cr-item:hover a::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(45deg, rgba(255, 255, 255, 0.2), rgba(255, 255, 255, 0));
  border-radius: 10px;
}

.cr-item:nth-child(odd):hover {
  transform: scale(1.05) rotate(-3deg);
}

.below {
  display: flex;
  justify-content: space-between;
  padding: 0 100px;
}

/* 平板样式 (例如：宽度 <= 1024px) */
@media (max-width: 1024px) {
  .game-list {
    max-width: 960px; /* 稍微减小最大宽度 */
    padding: 0 15px;
    justify-content: space-around; /* Allow more flexible spacing */
  }
  .content-center {
    /* width: calc(100% - 2 * 100px - 40px); */ /* 根据列表宽度和间距调整 */
    flex-grow: 1;
    width: auto; /* Allow it to take available space */
    min-width: 300px; /* Prevent it from becoming too small */
    margin: 0 10px; /* Reduce margin slightly */
    flex-shrink: 1;
  }
  .list-left,
  .list-right {
    /* Allow sidebars to shrink if necessary, but also take content width */
    flex-grow: 0;
    flex-shrink: 1;
    /* max-width can be used if we want to limit them to e.g. 2 columns */
    /* max-width: calc(2 * 90px + 15px); */
  }
  .game-column {
    width: 90px; /* Match cr-item size for tablet */
  }
  .cr-item {
    width: 90px;  /* Adjusted to match .game-column for tablet */
    height: 90px; /* Adjusted for consistency */
  }
  .below {
     padding: 0 20px;
  }
}

/* 手机样式 (例如：宽度 <= 768px) */
@media (max-width: 768px) {
  .desktop-only {
    display: none;
  }

  .mobile-only {
    display: block;
    width: 100%;
  }

  /* 面包屑导航移动端样式 */
  .breadcrumb-container {
    padding: 0 15px;
  }

  .breadcrumb {
    font-size: 13px;
  }

  /* 页面标题移动端样式 */
  .page-header {
    padding: 30px 15px;
    margin: 0 15px 30px 15px;
  }

  .main-title {
    font-size: 1.8rem;
  }

  .main-description {
    font-size: 1rem;
    margin-bottom: 20px;
  }

  .features {
    gap: 10px;
  }

  .feature {
    font-size: 0.8rem;
    padding: 6px 12px;
  }

  .container {
    padding: 20px 0;
  }

  .game-wrap {
    margin-bottom: 20px;
  }

  .content-center {
    width: 100%;
    margin: 0 0 20px 0;
    height: auto;
    min-height: 400px;
  }

  .mobile-game-list {
    width: 100%;
    padding: 0 10px;
  }

  .mobile-game-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 10px;
    width: 100%;
  }

  .mobile-game-item {
    aspect-ratio: 1;
    border-radius: 10px;
    overflow: hidden;
    background: #fff;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
    transition: transform 0.3s ease;
  }

  .mobile-game-item a {
    display: block;
    width: 100%;
    height: 100%;
    position: relative;
  }

  .mobile-game-item img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    /* 防止移动端图片加载时的布局偏移 */
    aspect-ratio: 1 / 1;
    background-color: #f0f0f0;
  }

  .mobile-mask {
    position: absolute;
    left: 0;
    bottom: 0;
    width: 100%;
    text-align: center;
    font-size: 12px;
    color: #fff;
    background: rgba(0, 0, 0, 0.5);
    padding: 4px;
    margin: 0;
    text-shadow: -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000;
  }

  .mobile-game-item:active {
    transform: scale(0.95);
  }

  .below {
    flex-direction: column;
    align-items: center;
    padding: 0 15px;
    gap: 20px;
  }
}

/* 桌面端样式 */
@media (min-width: 769px) {
  .mobile-only {
    display: none;
  }
}

.ads-container{
  width: 100%;
  text-align: center;
}

.ads-left{
  width: 20%;
  position: fixed;
  top: 50%;
  left: 10px;
  transform: translateY(-50%);
  z-index: 99999999;
}

.ads-right{
  width: 20%;
  position: fixed;
  top: 50%;
  right: 10px;
  transform: translateY(-50%);
  z-index: 99999999;
}

.ads-pc{
  display: block;
}
.ads-ph{
  display: none;
}

@media (max-width: 991px) {
  .ads-pc {
    display: none;
  }
  .ads-ph{
  display: block;
}
}


/* .index-specific-text { font-size: 14px; } */
</style>
