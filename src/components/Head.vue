<template>
  <header class="header">
    <div class="logo">
      <img :src="'/src/assets/images/' + gameData.image" :alt="gameData.title">
      <h1>{{ gameData.title }}</h1>
    </div>
    <nav class="header-nav">
      <ul>
        <li><router-link :to="'/game-1'">Escape Road 2</router-link></li>
        <li><router-link :to="'/game-2'">Escape Road 2</router-link></li>
        <li><router-link :to="'/game-3'">Escape Road 2</router-link></li>
        <li><router-link :to="'/game-4'">Escape Road 2</router-link></li>
        <li><router-link :to="'/game-5'">Escape Road 2</router-link></li>
        <li><router-link :to="'/game-6'">Escape Road 2</router-link></li>
      </ul>
    </nav>
  </header>
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
/* Removed Font Import */

.header {
  padding: 0 50px;
  /* Standard padding */
  height: 70px;
  /* Standard height */
  background: linear-gradient(to right, #3a7c8a, #5aa8b5);
  /* Refined teal gradient */
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15);
  /* Soft shadow */
}

.logo {
  display: flex;
  align-items: center;
}

.logo img {
  width: 50px;
  height: 50px;
  object-fit: cover;
  border-radius: 10px;
}

.logo h1 {
  font-family: sans-serif;
  /* Standard font */
  color: #ffffff;
  font-size: 28px;
  font-weight: 700;
  /* Bolder weight */
  margin: 0;
  padding: 0;
  letter-spacing: 3px;
  /* Increased spacing */
  text-transform: uppercase;
  margin-left: 10px;
  text-shadow: 1px 1px 0px rgba(0, 0, 0, 0.3), 2px 2px 3px rgba(0, 0, 0, 0.2);
  /* Sharper, layered shadow */
}

.header-nav ul {
  display: flex;
  align-items: center;
  list-style: none;
  padding: 0;
  margin: 0;
}

.header-nav ul li {
  margin-left: 18px;
  /* Adjusted spacing */
}

.header-nav ul li:first-child {
  margin-left: 0;
}

.header-nav ul li a {
  font-family: sans-serif;
  /* Standard font */
  font-size: 15px;
  font-weight: 500;
  text-decoration: none;
  color: #ffffff;
  background: linear-gradient(135deg, #56cfe1, #72efdd);
  /* Bright cyan gradient */
  padding: 10px 24px;
  /* Adjusted padding */
  border-radius: 25px;
  /* Rounded corners */
  border: none;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  /* Button shadow */
  display: inline-block;
  transition: background 0.4s ease, box-shadow 0.3s ease, transform 0.3s ease;
  /* Smooth transitions */
  position: relative;
}

.header-nav ul li a:hover {
  background: linear-gradient(135deg, #48b8c9, #62dbc8);
  /* Slightly darker/shifted gradient */
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.25);
  /* Enhanced hover shadow */
  transform: scale(1.05) translateY(-1px);
  /* Scale up and slight lift */
}

.header-nav ul li a:active {
  transform: scale(1.02) translateY(0px);
  /* Slightly smaller scale on active */
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.15);
  /* Reduced shadow on active */
}
</style>
