<template>
  <div>
    <Headers />
    <main class="blog-page-container">
      <div class="blog-detail-view">
        <!-- 加载状态 -->
        <div v-if="isLoading" class="loading-message">
          <p>Loading article details...</p>
        </div>

        <!-- 错误状态 -->
        <div v-else-if="error" class="error-message">
          <p>{{ error }}</p>
        </div>

        <!-- 数据加载成功 -->
        <div v-else-if="post" class="post-card">
          <h2>{{ post.title }}</h2>
          <p class="post-meta">Published on: {{ post.publishedAt ? new Date(post.publishedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric', hour12: true }) : 'Unknown Date' }}</p>
          <hr>
          <div class="post-content" v-html="sanitizedContent"></div>
        </div>

        <!-- 如果 post 为 null 且没有错误 -->
        <div v-else class="error-message">
             <p>Could not display article content.</p>
        </div>

        <router-link to="/blog" class="back-link">Back to Blog List</router-link>
      </div>
    </main>
    <Foot />
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watchEffect } from 'vue';
import { useRoute } from 'vue-router';
import { useHead } from '@vueuse/head';
import DOMPurify from 'dompurify';
import { getBlogPostBySlug } from '../services/blogService';
import Headers from '../components/Head.vue';
import Foot from '../components/foot.vue';
import { scriptOptimizer } from '../utils/scriptOptimizer';

const route = useRoute();
const post = ref(null);
const isLoading = ref(true);
const error = ref(null);

// Get slug from route params
const postSlug = computed(() => {
  return route.params?.slug || null;
});

// 清理 HTML 的计算属性
const sanitizedContent = computed(() => {
  if (post.value && post.value.content) {
    return DOMPurify.sanitize(post.value.content);
  }
  return '';
});

// Use watchEffect to update head tags when post data is available
watchEffect(() => {
  if (post.value) {
    const siteUrl = 'https://escape-road-online.com'; // Your base URL
    const postUrl = `${siteUrl}/blog/${post.value.slug}`;
    const postImage = post.value.image ? (post.value.image.startsWith('http') ? post.value.image : `${siteUrl}${post.value.image}`) : `${siteUrl}/images/og-default.png`;
    const pageTitle = post.value.metaTitle || post.value.title || 'Blog Article';
    const pageDescription = post.value.metaDescription || post.value.summary || 'Read the blog article details.';
    const pageKeywords = post.value.metaKeywords || '';

    useHead({
      title: pageTitle, // Set page title directly from variable
      link: [
        { rel: 'canonical', href: postUrl } // Set canonical URL
      ],
      meta: [
        // Basic meta tags
        { name: 'description', content: pageDescription },
        { name: 'keywords', content: pageKeywords },
        // Open Graph (Facebook, etc.)
        { property: 'og:title', content: pageTitle },
        { property: 'og:description', content: pageDescription },
        { property: 'og:type', content: 'article' },
        { property: 'og:url', content: postUrl },
        { property: 'og:image', content: postImage },
        // Twitter Card
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:title', content: pageTitle },
        { name: 'twitter:description', content: pageDescription },
        { name: 'twitter:image', content: postImage },
      ],
    });
  } else {
      // Optionally set default head tags when post is null or loading
      // useHead({ title: 'Loading Blog Article... - Escape Road Blog' });
  }
});

// 组件挂载后获取数据
onMounted(async () => {
  if (postSlug.value) {
    try {
      isLoading.value = true;
      error.value = null;
      post.value = await getBlogPostBySlug(postSlug.value);

      if (!post.value && !error.value) {
        error.value = 'Could not load article data.';
      }

      // 延迟执行非关键任务
      scriptOptimizer.defer(() => {
        // 非关键功能初始化
      }, 'low');

    } catch (err) {
      if (err.response && err.response.status === 404) {
        error.value = 'The requested blog article was not found (slug might be invalid).';
      } else {
        error.value = 'Failed to load blog article. Please try again later.';
      }
      post.value = null;
    } finally {
      isLoading.value = false;
    }
  } else {
    error.value = 'Invalid article slug.';
    isLoading.value = false;
  }
});

/*
// 移除或注释掉模拟数据
const blogPosts = ref([
    // ... mock data ...
]);
*/

</script>

<style scoped>
/* 页面容器样式 (与 BlogListView 保持一致) */
.blog-page-container {
  /* background-color: #f4f7f9; */ /* 移除背景色，使用默认或全局背景 */
  padding: 40px 20px;
  min-height: calc(100vh - 70px - 100px); /* 减去头部和底部大致高度 */
}

/* 博客详情内容区域居中 */
.blog-detail-view {
  max-width: 1200px;
  margin: 0 auto;
}

/* 文章卡片样式 */
.post-card {
  background-color: #fff;
  padding: 30px 40px; /* 增加内边距 */
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  margin-bottom: 30px; /* 与返回链接的间距 */
}

.post-card h1 {
  font-size: 2.2em; /* 调整标题大小 */
  color: #333;
  margin-bottom: 10px; /* 标题和元信息间距 */
  line-height: 1.3;
}

/* 文章元数据 */
.post-meta {
  color: #888;
  font-size: 0.95em; /* 稍大一点的元信息字体 */
  margin-bottom: 25px; /* 元信息和分隔线间距 */
}

/* 分隔线 */
hr {
  border: 0;
  height: 1px;
  background-color: #e0e0e0; /* 稍明显的分隔线 */
  margin: 25px 0; /* 分隔线上下边距 */
}

/* 文章内容区域 */
.post-content {
  line-height: 1.7; /* 调整行高 */
  color: #444; /* 内容颜色 */
}

/* v-html 内容的深度样式 */
.post-content :deep(h2) {
  font-size: 1.8em;
  margin-top: 1.8em;
  margin-bottom: 0.8em;
  padding-bottom: 0.4em;
  border-bottom: 1px solid #eee;
  color: #3a7c8a; /* 标题使用主题色 */
}

.post-content :deep(h3) {
  font-size: 1.5em;
  margin-top: 1.5em;
  margin-bottom: 0.6em;
  color: #3a7c8a;
}

.post-content :deep(p) {
  margin-bottom: 1.2em; /* 段落间距 */
}

.post-content :deep(ul),
.post-content :deep(ol) {
  margin-left: 1.5em; /* 列表缩进 */
  margin-bottom: 1.2em;
  padding-left: 1.5em; /* 增加内边距 */
}

.post-content :deep(li) {
  margin-bottom: 0.6em;
}

.post-content :deep(strong) {
  font-weight: 600; /* 调整粗体 */
}

.post-content :deep(em) {
  font-style: italic;
  color: #555;
}

.post-content :deep(a) {
  color: #3a7c8a; /* 链接使用主题色 */
  text-decoration: underline;
  transition: color 0.2s ease;
}
.post-content :deep(a:hover) {
  color: #5aa8b5;
}

.post-content :deep(img) {
  max-width: 100%;
  height: auto;
  display: block;
  margin: 1.5em auto; /* 图片居中 */
  border-radius: 6px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1); /* 图片阴影 */
  /* 性能优化 */
  background-color: #f0f0f0; /* 加载占位 */
  image-rendering: auto;
}

.post-content :deep(blockquote) {
  border-left: 4px solid #5aa8b5; /* 引用块使用主题色 */
  margin: 1.5em 0;
  padding: 0.5em 1.5em;
  background-color: #f9f9f9;
  color: #666;
  font-style: italic;
}

/* 加载信息 */
.loading-message,
.error-message { /* 确保这些样式存在 */
  text-align: center;
  padding: 50px 20px;
  color: #888;
  font-size: 1.1em;
}

.error-message {
  color: #e74c3c;
}

/* 返回链接 */
.back-link {
  display: inline-block;
  margin-top: 20px; /* 与上方元素的间距 */
  text-decoration: none;
  color: #3a7c8a; /* 主题色 */
  font-weight: bold;
  transition: color 0.2s ease;
}

.back-link:hover {
  color: #5aa8b5; /* 主题悬停色 */
  text-decoration: underline;
}

/* 响应式调整 */
@media (max-width: 600px) {
  .post-card {
    padding: 20px; /* 移动端减小内边距 */
  }
  .post-card h1 {
    font-size: 1.8em;
  }
  .post-content :deep(h2) {
    font-size: 1.5em;
  }
  .post-content :deep(h3) {
    font-size: 1.3em;
  }
}

/* Add style for the main post image */
.post-main-image {
    max-width: 100%;
    height: auto;
    margin-bottom: 25px; /* Space below image */
    border-radius: 6px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}
</style>