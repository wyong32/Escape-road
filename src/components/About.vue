<template>
    <div class="about">
        <h2 class="below-title">{{ gameData.aboutTitle1 }}</h2>
        <p>{{ gameData.aboutContent1 }}</p>
        <h3>{{ gameData.aboutTitle2 }}</h3>
        <p>{{ gameData.aboutContent2 }}</p>
        <h3>{{ gameData.aboutTitle3 }}</h3>
        <p>{{ gameData.aboutContent3 }}</p>
        <h3>{{ gameData.aboutTitle4 }}</h3>
        <p>{{ gameData.aboutContent4 }}</p>
        <h3>{{ gameData.aboutTitle5 }}</h3>
        <p>{{ gameData.aboutContent5 }}</p>
        <h3>{{ gameData.aboutTitle6 }}</h3>
        <p>{{ gameData.aboutContent6 }}</p>
        <h3>{{ gameData.aboutTitle7 }}</h3>
        <p>{{ gameData.aboutContent7 }}</p>
        <h3>{{ gameData.aboutTitle8 }}</h3>
        <p>{{ gameData.aboutContent8 }}</p>
        <h3>{{ gameData.aboutTitle9 }}</h3>
        <p>{{ gameData.aboutContent9 }}</p>
        <h3>{{ gameData.aboutTitle10 }}</h3>
        <p>{{ gameData.aboutContent10 }}</p>
        <h3>{{ gameData.aboutTitle11 }}</h3>
        <p>{{ gameData.aboutContent11 }}</p>
        <h3>{{ gameData.aboutTitle12 }}</h3>
        <p>{{ gameData.aboutContent12 }}</p>
        <h3>{{ gameData.aboutTitle13 }}</h3>
        <p>{{ gameData.aboutContent13 }}</p>
    </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { games } from '../data/games'

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


</script>

<style scoped>
.about {
    width: 47%;
    border: 4px solid #00d9ff;
    border-radius: 20px;
    background-color: #fff;
    padding: 20px;
    overflow: hidden;
}

.about .below-title {
    text-align: center;
    margin-bottom: 15px;
}

.about h3 {
    margin-bottom: 15px;
}

.about h4 {
    margin-bottom: 15px;
}

.about p {
    margin-bottom: 15px;
    line-height: 1.8;
}

.about ul {
    margin-bottom: 15px;
    line-height: 1.8;
    padding-left: 20px;
}

.about img {
    margin-bottom: 15px;
    max-width: 100%;
}
</style>
