<template>
  <main class="about-page">
    <Headers />
    <section class="content-wrap">
      <div class="about-container">
        <h1>About Us Escape Road</h1>
        <p>
            Welcome to our gaming platform! We are committed to providing fun and exciting gaming experiences.
        </p>
        <p>
            Our platform brings together various types of games, from casual puzzles to action adventures, there is always one for you. We are constantly working to update and add new games to ensure that you can always find something fresh.
        </p>
        <h2>Our mission</h2>
        <p>
            Our mission is to connect players through high-quality games and create a fun and interactive community. We believe that games are not just entertainment, but also a way to learn, socialize and relax.
        </p>
        <h2>Contact Us</h2>
        <p>
            If you have any questions, suggestions or cooperation intentions, please feel free to contact us through the contact information in the footer. We look forward to hearing from you!
        </p>
        <p>
            You can also reach us directly via email at: maieldilmie223321@gmail.com
        </p>
      </div>
    </section>
    <Foot />
  </main>
</template>

<script setup>
import { onMounted } from 'vue'
import Headers from '../components/Head.vue'
import Foot from '../components/foot.vue'
import { scriptOptimizer } from '../utils/scriptOptimizer'

// 页面加载完成后的优化
onMounted(() => {
  // 延迟执行非关键任务
  scriptOptimizer.defer(() => {
    // 非关键功能初始化
    // 可以在这里添加分析代码或其他非关键功能
  }, 'low')
})

// 设置页面 meta 信息
import { useHead } from '@unhead/vue'

useHead({
  title: 'About Us - Escape Road Online',
  meta: [
    {
      name: 'description',
      content: 'Learn about Escape Road Online gaming platform. We provide exciting car chase games and thrilling adventures for players worldwide.'
    },
    {
      name: 'keywords',
      content: 'about escape road, gaming platform, car chase games, online games, about us'
    },
    {
      property: 'og:title',
      content: 'About Us - Escape Road Online'
    },
    {
      property: 'og:description',
      content: 'Learn about Escape Road Online gaming platform. We provide exciting car chase games and thrilling adventures for players worldwide.'
    },
    {
      property: 'og:type',
      content: 'website'
    }
  ]
})
</script>

<style scoped>
.about-page {
  display: flex;
  flex-direction: column;
  min-height: 100vh; /* 使页面至少占满整个视口高度 */
}

.content-wrap {
  flex-grow: 1; /* 让内容区域填充可用空间，将 footer 推到底部 */
  padding: 40px 20px; /* 上下、左右内边距 */
  background-color: #f4f7f6; /* 轻微的背景色 */
}

.about-container {
  max-width: 900px; /* 内容最大宽度 */
  margin: 0 auto; /* 水平居中 */
  background-color: #fff; /* 内容区域白色背景 */
  padding: 30px 40px; /* 内边距 */
  border-radius: 8px; /* 轻微圆角 */
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); /* 添加阴影 */
  /* 性能优化 */
  will-change: auto;
  transform: translateZ(0); /* 启用硬件加速 */
  contain: layout style paint; /* CSS 包含优化 */
}

.about-container h1 {
  text-align: center;
  color: #2c3e50;
  margin-bottom: 30px;
}

.about-container h2 {
  color: #34495e;
  margin-top: 30px;
  margin-bottom: 15px;
  border-bottom: 2px solid #3498db; /* 标题下划线 */
  padding-bottom: 5px;
}

.about-container p {
  line-height: 1.8; /* 增加行高，提高可读性 */
  color: #555;
  margin-bottom: 15px;
}

/* 添加手机端样式 */
@media (max-width: 768px) {
  .content-wrap {
    padding: 20px 10px; /* 减小手机上的内边距 */
  }
  .about-container {
    padding: 20px; /* 减小内容容器内边距 */
  }
}
</style>