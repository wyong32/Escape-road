<template>
    <div class="recommend below-content">
        <h2 class="recommend-title">Recommend For You</h2>
        <ul class="recommend-list">
            <li class="recommend-item" v-for="game in allGames" :key="game.id">
                <a :href="'/' + game.addressBar" @click="scrollToTop" class="recommend-link">
                    <div class="recommend-image-container">
                        <SmartImage
                          :src="game.image"
                          :alt="game.title"
                          :priority="getImagePriority(game)"
                          :lazy="true"
                          width="100%"
                          height="100%"
                        />
                    </div>
                    <div class="recommend-game-name">{{ game.logoText || game.title }}</div>
                </a>
            </li>
        </ul>

        <!-- 在这里添加评论组件 -->
        <Comments :page-id="props.gameId" :key="'comments-' + props.gameId" />

    </div>
</template>

<script setup>
import { computed } from 'vue'
import { games } from '../data/games'
import Comments from './Comments.vue' // 2. 导入 Comments 组件
import SmartImage from './SmartImage.vue'

// 1. 定义 props 来接收 gameId
const props = defineProps({
  gameId: {
    type: String,
    required: true
  }
})

// 获取所有游戏列表，确保包含 addressBar 和 logoText
const allGames = computed(() => {
  return Object.values(games).map(game => ({
    id: game.id,
    title: game.title,
    logoText: game.logoText,
    addressBar: game.addressBar, // 确保包含 addressBar
    image: game.image
  }))
})

// 新增：滚动到页面顶部的方法
const scrollToTop = () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

// 获取图片加载优先级
const getImagePriority = (game) => {
  // 推荐区域的图片设为低优先级，因为不在首屏
  const largeImages = ['game18.png', 'game19.jpg', 'game20.png']
  if (largeImages.includes(game.image)) {
    return 'low'
  }
  return 'low' // 推荐区域默认低优先级
}

</script>

<style scoped>
.recommend {
    width: 48%; /* 保持宽度 */
    background-color: #ffffff; /* 清爽的白色背景 */
    border-radius: 20px; /* 更柔和的圆角 */
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.07); /* 添加更自然的阴影 */
    padding: 25px 30px; /* 调整内边距 */
    overflow: hidden;
    border: 5px solid #00d9ff;
}

/* 标题样式 */
.recommend-title { /* 重命名类名以区分 */
    text-align: center;
    margin-top: 0; /* 移除默认上边距 */
    margin-bottom: 25px; /* 增加与列表的间距 */
    font-size: 1.5rem; /* 稍大字体 */
    font-weight: 600; /* 加粗 */
    color: #333;
}

/* 推荐列表样式 */
.recommend-list {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr)); /* 稍微调整最小宽度 */
    gap: 15px; /* 增加间隙 */
    list-style: none;
    padding: 0;
    margin: 0 0 30px 0; /* 添加下边距，与评论区分隔 */
    justify-content: center;
}

.recommend-item {
    display: flex;
    flex-direction: column;
    transition: transform 0.3s ease, box-shadow 0.3s ease; /* 平滑过渡 */
}

.recommend-link {
    display: flex;
    flex-direction: column;
    text-decoration: none;
    color: inherit;
    height: 100%;
}

.recommend-image-container {
    aspect-ratio: 1 / 1; /* 保持 1:1 的宽高比 */
    overflow: hidden; /* 确保图片圆角生效 */
    border-radius: 10px; /* 图片容器圆角 */
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); /* 更细微的阴影 */
    transition: transform 0.3s ease, box-shadow 0.3s ease;
    margin-bottom: 8px;
}

.recommend-image-container img {
    display: block; /* 消除图片底部空隙 */
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.3s ease; /* 只给图片添加缩放过渡 */
    /* 防止图片加载时的布局偏移 */
    aspect-ratio: 1 / 1;
    background-color: #f0f0f0;
}

.recommend-game-name {
    font-size: 12px;
    font-weight: 500;
    color: #333;
    text-align: center;
    line-height: 1.3;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    padding: 0 4px;
}

.recommend-item:hover .recommend-image-container {
    transform: translateY(-4px); /* 轻微上移效果 */
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15); /* 悬停时阴影加深 */
}

.recommend-item:hover .recommend-image-container img {
    transform: scale(1.05); /* 图片放大效果 */
}

.recommend-item:hover .recommend-game-name {
    color: #007bff; /* 悬停时名称变色 */
}

/* 评论区样式 */
.recommend > :deep(.comments-section) {
    margin-top: 2rem;
    width: 100%;
    box-sizing: border-box;
    padding-top: 1.5rem; /* 在评论区顶部添加内边距 */
    border-top: 1px solid #a0aec0; /* 在评论区顶部添加分隔线 */
    /* 移除评论区自身的背景、边框和阴影，使其融入父容器 */
    background-color: transparent;
    box-shadow: none;
    border-radius: 0; /* 移除圆角 */
}

/* 手机端样式 */
@media (max-width: 768px) {
  .recommend {
    width: 100%;
    max-width: 100%; /* 占满全部可用宽度 */
    padding: 20px 15px; /* 调整内边距 */
  }
  .recommend-title {
      font-size: 1.3rem; /* 缩小标题 */
      margin-bottom: 20px;
  }
  .recommend-list {
      grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
      gap: 10px;
      margin-bottom: 25px;
  }
  .recommend-game-name {
      font-size: 11px;
      padding: 0 2px;
  }
  .recommend-image-container {
      margin-bottom: 6px;
  }
   .recommend > :deep(.comments-section) {
        margin-top: 1.5rem;
        padding-top: 1rem;
    }
}
</style>
