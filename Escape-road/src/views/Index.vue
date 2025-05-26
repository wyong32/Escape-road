<template>
  <main>
    <Headers :game-id="currentGameId" />
    <section>
      <div class="container" :style="{ background: gameData.background }">
        <div class="game-wrap">
          <!-- 桌面端布局 -->
          <div class="game-list desktop-only">
            <div class="list-left">
              <div class="game-column" v-for="(column, columnIndex) in leftGameColumns" :key="`left-col-${columnIndex}`">
                <div class="cr-item" v-for="game in column" :key="game.id">
                  <router-link :to="'/' + game.addressBar">
                    <img
                      :src="getImageUrl(game.image)"
                      :title="game.title"
                      :alt="game.title"
                      loading="lazy"
                      decoding="async"
                    />
                    <p class="mask">{{ game.logoText }}</p>
                  </router-link>
                </div>
              </div>
            </div>
            <div class="content-center">
              <GameMain :game-id="currentGameId" :key="currentGameId" />
            </div>
            <div class="list-right">
              <div class="game-column" v-for="(column, columnIndex) in rightGameColumns" :key="`right-col-${columnIndex}`">
                <div class="cr-item" v-for="game in column" :key="game.id">
                  <router-link :to="'/' + game.addressBar">
                    <img
                      :src="getImageUrl(game.image)"
                      :title="game.title"
                      :alt="game.title"
                      loading="lazy"
                      decoding="async"
                    />
                    <p class="mask">{{ game.logoText }}</p>
                  </router-link>
                </div>
              </div>
            </div>
          </div>

          <!-- 移动端布局 -->
          <div class="mobile-only">
            <div class="content-center">
              <GameMain :game-id="currentGameId" :key="currentGameId" />
            </div>
            <div class="mobile-game-list">
              <div class="mobile-game-grid">
                <div class="mobile-game-item" v-for="game in gamesForMobileLayout" :key="game.id">
                  <router-link :to="'/' + game.addressBar" @click="scrollToTop">
                    <img
                      :src="getImageUrl(game.image)"
                      :title="game.title"
                      :alt="game.title"
                      loading="lazy"
                      decoding="async"
                    />
                    <p class="mobile-mask">{{ game.logoText }}</p>
                  </router-link>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="below">
          <About :game-id="currentGameId" />
          <Recommend :game-id="currentGameId" />
        </div>
      </div>
    </section>
    <ShareLink />
    <Foot />
  </main>
</template>

<script setup>
import { computed, watchEffect } from 'vue'
import { useRoute } from 'vue-router'
import { games } from '../data/games'
import Headers from '../components/Head.vue'
import About from '../components/About.vue'
import Recommend from '../components/Recommend.vue'
import GameMain from '../components/GameMain.vue'
import Foot from '../components/foot.vue'
import ShareLink from '../components/ShareLink.vue'

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

// 获取图片URL
const getImageUrl = (imageName) => {
  if (!imageName) return ''
  // 使用 new URL() 来让 Vite 处理资源路径
  // 第一个参数是相对于当前文件(Index.vue)的路径 ../assets/images/
  // 第二个参数是当前文件的 URL 基准 import.meta.url
  try {
    return new URL(`../assets/images/${imageName}`, import.meta.url).href
  } catch (error) {
    console.error(`Error creating URL for image: ${imageName}`, error);
    return ''; // 返回空字符串或默认图片路径
  }
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

// 使用 watchEffect 监听 gameData 的变化，并更新 meta 标签
watchEffect(() => {
  const currentDescription = gameData.value.description;
  const currentKeywords = gameData.value.keywords;

  // 更新 description meta 标签
  updateMetaTag('description', currentDescription);
  // 更新 keywords meta 标签
  updateMetaTag('keywords', currentKeywords);

  // (可选) 同时更新页面标题，可以替代 router.js 中的逻辑
  // document.title = gameData.value.title || 'Default Title';
});

console.log('Current game:', gameData.value)
console.log('Other games:', allGames.value)
// console.log('Left Game Columns:', leftGameColumns.value); // Keep this commented or remove
// console.log('Right Game Columns:', rightGameColumns.value); // Keep this commented or remove

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

/* .index-specific-text { font-size: 14px; } */
</style>
