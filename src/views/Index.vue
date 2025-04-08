<template>
  <main>
    <Headers :game-id="currentGameId" />
    <section>
      <div class="container" :style="{ background: gameData?.background || '#fff' }">
        <div class="wrap">
          <div class="game-list">
            <div class="list-left">
              <div class="cr-item" v-for="game in leftGames" :key="game.id">
                <router-link :to="'/' + game.title.toLowerCase().replace(/\s+/g, '-')">
                  <img :src="getImageUrl(game.image)" :title="game.title" :alt="game.title" />
                </router-link>
              </div>
            </div>
            <div class="content-center">
              <GameMain :game-id="currentGameId" />
            </div>
            <div class="list-right">
              <div class="cr-item" v-for="game in rightGames" :key="game.id">
                <router-link :to="'/' + game.title.toLowerCase().replace(/\s+/g, '-')">
                  <img :src="getImageUrl(game.image)" :title="game.title" :alt="game.title" />
                </router-link>
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
  </main>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { games } from '../data/games'
import Headers from '../components/Head.vue'
import About from '../components/About.vue'
import Recommend from '../components/Recommend.vue'
import GameMain from '../components/GameMain.vue'

// 获取当前路由实例
const route = useRoute()

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

// 获取当前游戏ID
const currentGameId = computed(() => {
  const urlTitle = route.params.title
  return urlTitle ? findGameIdByTitle(urlTitle) : 'game1'
})

// 获取当前游戏数据
const gameData = computed(() => {
  const game = games[currentGameId.value]
  return {
    id: game.id,
    title: game.title,
    image: game.image,
    iframeUrl: game.iframeUrl,
    description: game.description,
    background: game.background,
    rightContent: game.rightContent
  }
})

// 获取所有游戏列表
const allGames = computed(() => {
  return Object.values(games)
})

// 将游戏列表分成左右两部分
const leftGames = computed(() => {
  const games = allGames.value
  return games.slice(0, Math.ceil(games.length / 2))
})

const rightGames = computed(() => {
  const games = allGames.value
  return games.slice(Math.ceil(games.length / 2))
})

// 获取图片URL
const getImageUrl = (imageName) => {
  if (!imageName) return ''
  return `/src/assets/images/${imageName}`
}

console.log('Current game:', gameData.value)
console.log('Other games:', allGames.value)

</script>

<style scoped>
.container {
  transition: background-color 0.3s ease;
}

.wrap {
  display: flex;
  justify-content: center;
  width: 100%;
  padding-top: 100px;
  margin-bottom: 100px;
}

.game-list {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  width: 100%;
  max-width: 1500px;
  margin: 0 auto;
  padding: 0 20px;
}

.list-left, .list-right {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.content-center {
  width: 1280px;
  box-shadow: 0 6px 12px 0 rgb(0 0 0 / 24%);
  padding: 10px 10px 0 10px;
  background-color: #fff;
  margin: 0 20px;
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
  padding: 0 50px;
}
</style> 