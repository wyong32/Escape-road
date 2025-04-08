<template>
    <div class="recommend below-content">
        <h2 class="below-title">Recommend For You</h2>
        <ul class="recommend-list">
            <li class="recommend-item" v-for="game in games" :key="game.id">
                <router-link :to="'/' + game.title.toLowerCase().replace(/\s+/g, '-')">
                    <img :src="'/src/assets/images/' + game.image" :alt="game.title" />
                </router-link>
            </li>
        </ul>
    </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { games } from '../data/games'

const recommendGames = computed(() => {
    return games.slice(0, 6)
})

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
const allGames = computed(() => {
  return Object.values(games)
})

console.log(games)


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
}

.recommend-item {
    display: block;
    width: 130px;
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
</style>
