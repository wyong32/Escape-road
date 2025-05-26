<template>
  <div class="share-links">
    <span>分享到:</span>
    <a :href="twitterShareUrl" target="_blank" rel="noopener noreferrer" title="分享到 X">
      <!-- X 图标 -->
      <i class="fa-brands fa-x-twitter"></i>
    </a>
    <a :href="facebookShareUrl" target="_blank" rel="noopener noreferrer" title="分享到 Facebook">
      <!-- Facebook 图标 -->
      <i class="fab fa-facebook-f"></i>
    </a>
    <a href="https://www.youtube.com/@escape-road-online" target="_blank" rel="noopener noreferrer" title="访问 YouTube">
      <!-- YouTube 图标 -->
      <i class="fab fa-youtube"></i>
    </a>
    <!-- 您可以添加更多社交媒体链接，并使用相应的图标 -->
    <!-- 例如 LinkedIn: -->
    <!-- <a :href="linkedinShareUrl" target="_blank" rel="noopener noreferrer" title="分享到 LinkedIn">
      <i class="fab fa-linkedin"></i>
    </a> -->
  </div>
</template>

<script setup>
import { computed } from 'vue';

// 定义组件接收的 props
const props = defineProps({
  url: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: false,
    default: () => document.title // 默认使用当前页面标题
  }
});

// 计算 Twitter 分享链接
const twitterShareUrl = computed(() => {
  const text = encodeURIComponent(`来看看这个有趣的游戏: ${props.title}`);
  const url = encodeURIComponent(props.url);
  return `https://x.com/monicaNilo83076/status/1912759585502634150`;
});

// 计算 Facebook 分享链接
const facebookShareUrl = computed(() => {
  const url = encodeURIComponent(props.url);
  // 注意：Facebook 的分享 API 推荐使用 Meta SDK，但简单的 URL 分享仍然可用
  // Facebook 可能不再像以前那样支持预填充文本
  return `https://www.facebook.com/profile.php?id=61575085722151`;
});

// 如果您需要添加其他平台，可以在这里添加相应的 computed properties
// 例如 LinkedIn:
// const linkedinShareUrl = computed(() => {
//   const url = encodeURIComponent(props.url);
//   const title = encodeURIComponent(props.title);
//   return `https://www.linkedin.com/shareArticle?mini=true&url=${url}&title=${title}`;
// });

</script>

<style scoped>
.share-links {
  /* 固定定位 */
  position: fixed;
  left: 20px; /* 距离左侧边缘的距离 */
  top: 50%;  /* 定位在垂直中间 */
  transform: translateY(-50%); /* 精确垂直居中 */
  z-index: 1000; /* 确保在其他内容之上 */

  /* 垂直排列图标 */
  display: flex;
  flex-direction: column;
  align-items: center; /* 水平居中图标 */
  gap: 15px; /* 图标之间的垂直间距 */

  /* 外观样式 */
  background-color: rgba(255, 255, 255, 0.8); /* 半透明背景 */
  padding: 15px 10px; /* 内边距 */
  border-radius: 8px; /* 圆角 */
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1); /* 轻微阴影 */
}

/* 移除原来的 span 样式或按需调整 */
/* .share-links span { ... } */

.share-links a {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  text-decoration: none;
  color: #555; /* 统一默认颜色，品牌色在下方设置 */
  transition: color 0.3s ease, transform 0.2s ease;
  font-size: 22px; /* 图标大小 */
  width: 30px; /* 固定宽度 */
  height: 30px; /* 固定高度 */
}

.share-links a:hover {
  transform: scale(1.15); /* 悬停放大效果 */
  /* 可以在悬停时改变颜色，如果需要的话 */
  /* color: #000; */
}

/* 为不同的图标设置品牌颜色（可选） */
/* .fa-twitter { color: #1DA1F2; } */ /* 保留旧的以备参考 */
.fa-x-twitter { color: #000000; } /* X logo 黑色 */
.fa-facebook-f { color: #1877F2; }
.fa-youtube { color: #FF0000; } /* YouTube 红色 */
/* .fa-linkedin { color: #0A66C2; } */

/* 移除之前的 span 和多余的 margin */
.share-links span { display: none; } /* 隐藏"分享到"文字 */

@media (max-width: 768px) {
  .share-links{
    left: 5px;
    padding: 5px 10px;
    display: none;
  }
  .share-links a{
    width: 20px;
    height: 20px;
  }
}
</style>
