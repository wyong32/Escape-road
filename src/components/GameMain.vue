<template>
    <div class="game">
        <div class="game-main">
            <div v-if="!iframeSrc" class="iframe-overlay">
                <img :src="'/src/assets/images/' + gameData.image" :alt="gameData.title" class="overlay-image">
                <div class="blur-layer"></div>
                <button @click="loadGame" class="load-button">Start Game</button>
            </div>
            <iframe v-if="iframeSrc" class="iframehtml1" :src="iframeSrc" frameborder="0"></iframe>
        </div>
        <h2 class="game-title">{{ gameData.title }}</h2>
    </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { games } from '../data/games'

// 组件属性定义
const props = defineProps({
  gameId: {
    type: String,
    required: true,
    validator: (value) => {
      return Object.keys(games).includes(value)
    }
  }
})

// 获取当前游戏数据
const gameData = computed(() => {
  return games[props.gameId] || games.game1
})

// iframe源地址
const iframeSrc = ref(null)

/**
 * 加载游戏
 * 设置iframe源地址为当前游戏的URL
 */
const loadGame = () => {
  iframeSrc.value = gameData.value.iframeUrl
}
</script>

<style lang="css" scoped>
.game-main{
    position: relative;
    width: 100%;
    height: 100%;
    border-radius: 10px;
    overflow: hidden;
}

.game-main{
    height: 720px;
}

.iframehtml1 {
  display: block;
  width: 100%;
  height: 100%;
}

.game-title {
  color: #48b8c9;
  line-height: 2;
  text-transform: uppercase;
  font-size: 24px;
  font-weight: normal;
  text-align: center;
}

.iframe-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 10;
    border-radius: inherit;
}

/* 图片样式 */
.overlay-image {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    z-index: 1;
}

/* 毛玻璃效果层 */
.blur-layer {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.3);
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    z-index: 2;
}

/* 确保按钮在最上层 */
.load-button {
    position: relative;
    z-index: 3;
    padding: 15px 30px;
    font-size: 18px;
    font-weight: bold;
    color: #fff;
    background: linear-gradient(135deg, #56cfe1, #72efdd);
    border: none;
    border-radius: 30px;
    cursor: pointer;
    transition: all 0.3s ease;
}

.load-button:hover {
    transform: scale(1.05);
    box-shadow: 0 5px 15px rgba(86, 207, 225, 0.4);
}
</style>