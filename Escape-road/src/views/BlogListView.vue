<template>
  <div>
    <Headers />
    <main class="blog-page-container">
      <div class="blog-list-view">
        <h1>Blog Articles</h1>

        <!-- 加载状态 -->
        <div v-if="isLoading" class="loading-message">
          <p>Loading articles...</p>
        </div>

        <!-- 错误状态 -->
        <div v-else-if="error" class="error-message">
          <p>{{ error }}</p>
        </div>

        <!-- 数据加载成功 -->
        <div v-else-if="blogPosts.length > 0" class="blog-list">
          <!-- 确保迭代 blogPosts ref -->
          <div v-for="post in blogPosts" :key="post.id" class="blog-post-card">
            <img :src="post.image || 'https://via.placeholder.com/300x200/cccccc/FFFFFF?text=No+Image'" 
                 :alt="post.imageAlt || post.title" 
                 class="post-image">
            <div class="post-content">
              <h2>
                <router-link :to="`/blog/${post.slug}`">{{ post.title }}</router-link>
              </h2>
              <!-- 使用 post.publishedAt 并指定英文格式 -->
              <p class="post-meta">Published on: {{ post.publishedAt ? new Date(post.publishedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'Unknown Date' }}</p>
              <!-- Conditionally render summary paragraph -->
              <p class="post-summary" v-if="post.summary?.trim()">{{ post.summary }}</p>
              <router-link :to="`/blog/${post.slug}`" class="read-more">Read More</router-link>
            </div>
          </div>
        </div>

        <!-- 没有文章的情况 -->
        <div v-else class="no-posts-message">
          <p>No blog articles posted yet.</p>
        </div>

      </div>
    </main>
    <Foot />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
// 导入头部和底部组件
import Headers from '../components/Head.vue';
import Foot from '../components/foot.vue';
// 导入 API 服务
import { getBlogPosts } from '../services/blogService';

// --- 定义状态 ref ---
const blogPosts = ref([]); // 用于存储从 API 获取的文章
const isLoading = ref(true); // 加载状态
const error = ref(null);     // 错误状态

// 组件挂载后执行数据获取
onMounted(async () => {
  console.log('[BlogListView] Component mounted. Fetching posts...');
  try {
    isLoading.value = true;
    error.value = null;
    const fetchedPosts = await getBlogPosts();
    console.log('[BlogListView] Received posts from API:', fetchedPosts);
    blogPosts.value = fetchedPosts;
    console.log('[BlogListView] Assigned posts to ref:', blogPosts.value);
  } catch (err) {
    console.error("[BlogListView] Failed to load blog posts:", err);
    error.value = 'Failed to load blog articles. Please try again later.';
  } finally {
    isLoading.value = false;
    console.log('[BlogListView] Fetching finished.');
  }
});

/*
// 注释掉的模拟数据保持不变
const blogPosts_mock = ref([
  // ... mock data ...
]);
*/

</script>

<style scoped>
/* 整体页面容器，类似首页的背景和边距 */
.blog-page-container {
  /* background-color: #f4f7f9; */ /* 移除背景色，使用默认或全局背景 */
  padding: 40px 20px; /* 上下边距 */
  min-height: calc(100vh - 70px - 100px); /* 减去头部和底部大致高度 */
}

/* 博客列表内容区域居中 */
.blog-list-view {
  max-width: 1200px; /* 适当增加最大宽度以容纳四列 */
  margin: 0 auto;
}

.blog-list-view h1 {
  text-align: center;
  margin-bottom: 40px; /* 增加标题下边距 */
  color: #333; /* 标题颜色 */
  font-size: 2.5em; /* 增大标题字号 */
}

/* 博客文章列表网格 */
.blog-list {
  display: grid;
  gap: 25px; /* 调整卡片间距 */
  grid-template-columns: repeat(4, 1fr); /* 一行四列 */
}

/* 单个博客文章卡片 */
.blog-post-card {
  display: flex;
  flex-direction: column; /* 上下布局 */
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08); /* 更柔和的阴影 */
  overflow: hidden;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.blog-post-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.12);
}

/* 文章图片 */
.post-image {
  width: 100%; /* 图片宽度占满卡片 */
  height: 180px; /* 固定图片高度，或使用 aspect-ratio */
  object-fit: cover; /* 保持比例裁剪 */
  border-bottom: 1px solid #eee; /* 图片和内容间的分隔线 */
  /* 移除之前的 flex 相关样式和右边框 */
}

/* 文章内容区域 */
.post-content {
  padding: 15px 20px; /* 调整内边距 */
  display: flex;
  flex-direction: column;
  flex-grow: 1; /* 占据剩余空间 */
  /* 确保内容从上到下排列 */
}

.post-content h2 {
  margin: 0 0 8px 0;
  font-size: 1.2em; /* 调整标题大小以适应卡片 */
  line-height: 1.4;
}

.post-content h2 a {
  text-decoration: none;
  color: #3a7c8a; /* 使用主题色 */
  transition: color 0.2s ease;
  font-size: 0.9em;
  line-height: 25px;
  height: 100px;
  display: block;
  overflow: hidden;
}

.post-content h2 a:hover {
  color: #5aa8b5; /* 主题悬停色 */
}

/* 文章元数据（日期） */
.post-meta {
  font-size: 0.8em; /* 调整元信息大小 */
  color: #888; /* 稍深的灰色 */
  margin-bottom: 10px; /* 调整元数据下边距 */
}

/* 文章摘要 */
.post-summary {
  flex-grow: 1;
  margin-bottom: 15px; /* 调整摘要下边距 */
  color: #555;
  line-height: 1.5;
  font-size: 0.9em; /* 调整摘要字体大小 */
  /* 可以考虑限制行数 */
  display: -webkit-box;
  -webkit-line-clamp: 3; /* 限制最多显示 3 行 */
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* 阅读全文链接 */
.read-more {
  align-self: flex-start;
  text-decoration: none;
  color: #3a7c8a; /* 主题色 */
  font-weight: bold;
  transition: color 0.2s ease;
  padding: 5px 0;
  font-size: 0.9em; /* 调整链接大小 */
  margin-top: auto; /* 将"阅读全文"推到底部 */
}

.read-more:hover {
  color: #5aa8b5; /* 主题悬停色 */
  text-decoration: underline;
}

/* 响应式调整 */
@media (max-width: 1024px) {
  .blog-list {
    grid-template-columns: repeat(3, 1fr); /* 中等屏幕：一行三列 */
  }
}

@media (max-width: 768px) {
  .blog-list {
    grid-template-columns: repeat(2, 1fr); /* 平板：一行两列 */
  }
   .blog-list-view {
    max-width: 90%; /* 减小最大宽度 */
  }
}

@media (max-width: 600px) {
  .blog-list {
    grid-template-columns: 1fr; /* 移动端：一行一列 */
  }
  .post-image {
    height: 200px;
  }
}

/* 添加加载和错误消息样式 */
.loading-message,
.error-message,
.no-posts-message {
  text-align: center;
  padding: 50px 20px;
  color: #888;
  font-size: 1.1em;
}

.error-message {
  color: #e74c3c; /* 红色表示错误 */
}

/* 确保图片加载失败时占位符显示正常 */
.post-image {
  background-color: #eee; /* 图片背景色 */
}
</style> 