<template>
    <div class="recommend below-content">
        <h2 class="below-title">Recommend For You</h2>
        <ul class="recommend-list">
            <li class="recommend-item" v-for="game in allGames" :key="game.id">
                <router-link :to="'/' + game.addressBar">
                     <img :src="getImageUrl(game.image)" :alt="game.title" />
                </router-link>
            </li>
        </ul>
    </div>
</template>

<script setup>
import { computed } from 'vue'
import { games } from '../data/games'

// 获取所有游戏列表，确保包含 addressBar
const allGames = computed(() => {
  return Object.values(games).map(game => ({
    id: game.id,
    title: game.title,
    addressBar: game.addressBar, // 确保包含 addressBar
    image: game.image
  }))
})

  const getImageUrl = (imageName) => {
  if (!imageName) return ''
  // Relative path from Recommend.vue (in src/components) to src/assets/images
  try {
    return new URL(`../assets/images/${imageName}`, import.meta.url).href
  } catch (error) {
    console.error(`Error creating URL for image in Recommend.vue: ${imageName}`, error);
    return ''; // Return empty or a default placeholder
  }
}

</script>

<style scoped>
.recommend {
    width: 47%;
    border: 4px solid #00d9ff;
    border-radius: 20px;
    background-color: #fff;
    padding: 20px;
    overflow: hidden;
}

.recommend .below-title {
    text-align: center;
    margin-bottom: 15px;
}

.recommend-list {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(130px, 130px));
    gap: 10px;
    /* 行列间隙均为10px */
    list-style: none;
    padding: 0;
    justify-content: center; /* 在网格布局中使项目居中 */
}

.recommend-item {
    display: block;
    width: 130px;
    height: 130px;
}

.recommend-item img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 10px;
    box-shadow: 0 6px 12px 0 rgb(0 0 0 / 24%);
    transition: transform 0.3s ease;
}

.recommend-item:hover img {
    transform: scale(1.05);
    box-shadow: 0 6px 12px 0 #00000080;
}

/* 添加手机端样式 */
@media (max-width: 768px) {
  .recommend {
    width: 100%; /* 在小屏幕上占满宽度 */
    max-width: 500px; /* 可以设置一个最大宽度 */
  }
  .recommend-list {
      /* 可以调整列宽或列数以适应小屏幕 */
      grid-template-columns: repeat(auto-fill, minmax(100px, 1fr)); 
  }
}
</style>
