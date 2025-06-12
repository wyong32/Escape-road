<template>
  <section class="new-games-section" v-if="newGames.length > 0" aria-label="New Games Collection">
    <div class="new-games-wrapper">
      <div class="new-games-container">
        <h2 class="new-games-title">
          <i class="fas fa-star"></i>
          New Games
          <span class="new-badge">NEW</span>
        </h2>
        
        <div class="new-games-grid">
          <article 
            class="new-game-item" 
            v-for="game in newGames" 
            :key="game.id"
            role="article"
          >
            <router-link
              :to="'/' + game.addressBar"
              :aria-label="`Play ${game.title} - New game`"
              :title="`Play ${game.title} online for free - New Release`"
              class="new-game-link"
            >
              <div class="new-game-image-container">
                <SimpleImage
                  :src="game.image"
                  :title="`${game.title} - New game thumbnail`"
                  :alt="`${game.title} - New online game`"
                  :priority="getImagePriority(game)"
                  width="100%"
                  height="100%"
                />
                <div class="new-indicator">NEW</div>
              </div>
              <div class="new-game-info">
                <h3 class="new-game-title">{{ game.logoText }}</h3>
              </div>
            </router-link>
          </article>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed } from 'vue'
import { games } from '../data/games'
import SimpleImage from './SimpleImage.vue'

// 获取标记为新游戏的游戏列表
const newGames = computed(() => {
  return Object.values(games)
    .filter(game => game.showNew === true)
    .map(game => ({
      id: game.id,
      title: game.title,
      logoText: game.logoText,
      addressBar: game.addressBar,
      image: game.image,
      description: game.description
    }))
    .slice(0, 10)
})

// 获取图片加载优先级
const getImagePriority = (game) => {
  const gameIndex = newGames.value.findIndex(g => g.id === game.id)
  if (gameIndex < 3) {
    return 'high'
  }
  return 'normal'
}

// 截断描述文本
const truncateDescription = (description) => {
  if (!description) return ''
  const maxLength = 80
  if (description.length <= maxLength) return description
  return description.substring(0, maxLength).trim() + '...'
}
</script>

<style scoped>
/* 新游戏模块主容器 */
.new-games-section {
  width: 100%;
  margin: 40px 0 0 0;
  padding: 0;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-radius: 20px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  position: relative;
  overflow: hidden;
}

.new-games-section::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #ff6b6b, #4ecdc4, #45b7d1, #96ceb4, #feca57);
  background-size: 300% 100%;
  animation: gradientShift 3s ease-in-out infinite;
}

@keyframes gradientShift {
  0%, 100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
}

/* 新增的包装器，用于控制最大宽度 */
.new-games-wrapper {
  max-width: 1620px;
  margin: 0 auto;
  padding: 0 20px;
}

.new-games-container {
  /* max-width: 1120px; */
  margin: 0 auto;
  padding: 30px 0;
}

/* 标题样式 */
.new-games-title {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  font-size: 28px;
  font-weight: 700;
  color: #2c3e50;
  margin-bottom: 30px;
  text-align: center;
  position: relative;
}

.new-games-title i {
  color: #ffd700;
  font-size: 32px;
  animation: starPulse 2s ease-in-out infinite;
}

@keyframes starPulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.2); }
}

.new-badge {
  background: linear-gradient(45deg, #ff6b6b, #ee5a24);
  color: white;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 1px;
  box-shadow: 0 4px 15px rgba(255, 107, 107, 0.4);
  animation: newBadgePulse 2s ease-in-out infinite;
}

@keyframes newBadgePulse {
  0%, 100% { transform: scale(1); box-shadow: 0 4px 15px rgba(255, 107, 107, 0.4); }
  50% { transform: scale(1.05); box-shadow: 0 6px 20px rgba(255, 107, 107, 0.6); }
}

/* 网格布局 */
.new-games-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 20px;
  padding: 0 10px;
}

.new-game-item {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  position: relative;
  aspect-ratio: 1;
  display: flex;
  flex-direction: column;
}

.new-game-item:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.new-game-link {
  display: flex;
  flex-direction: column;
  text-decoration: none;
  color: inherit;
  height: 100%;
}

.new-game-image-container {
  position: relative;
  width: 100%;
  flex: 1;
  overflow: hidden;
  border-radius: 8px 8px 0 0;
}

.new-indicator {
  position: absolute;
  top: 8px;
  right: 8px;
  background: linear-gradient(45deg, #ff6b6b, #ee5a24);
  color: white;
  padding: 2px 6px;
  border-radius: 8px;
  font-size: 9px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.new-game-info {
  padding: 12px;
  flex-shrink: 0;
  text-align: center;
}

.new-game-title {
  font-size: 12px;
  font-weight: 600;
  color: #2c3e50;
  margin: 0;
  line-height: 1.2;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .new-games-grid {
    grid-template-columns: repeat(3, 1fr);
    gap: 16px;
  }
}

@media (max-width: 992px) {
  .new-games-grid {
    grid-template-columns: repeat(3, 1fr);
    gap: 15px;
  }
}

@media (max-width: 768px) {
  .new-games-section {
    margin: 20px 0 0 0;
    border-radius: 15px;
  }

  .new-games-wrapper {
    padding: 0 15px;
  }

  .new-games-container {
    padding: 20px 0;
  }

  .new-games-title {
    font-size: 24px;
    margin-bottom: 20px;
  }

  .new-games-title i {
    font-size: 28px;
  }

  .new-games-grid {
    grid-template-columns: repeat(3, 1fr);
    gap: 12px;
  }
}

@media (max-width: 480px) {
  .new-games-section {
    margin: 15px 0 0 0;
  }

  .new-games-wrapper {
    padding: 0 10px;
  }

  .new-games-title {
    font-size: 20px;
    flex-direction: column;
    gap: 8px;
  }

  .new-games-grid {
    grid-template-columns: repeat(3, 1fr);
    gap: 10px;
  }
}
</style>
