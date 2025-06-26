<template>
  <div class="rating-section">
    <div class="current-rating">
      <span class="average-score">{{ averageRating !== null ? averageRating.toFixed(1) : '-' }}</span>
      <span class="stars" :style="{ '--rating': averageRating || 0 }">
        <span v-for="n in 5" :key="'filled-' + n" class="star filled">★</span>
        <span v-for="n in 5" :key="'empty-' + n" class="star empty">☆</span>
      </span>
      <span class="rating-count">({{ ratingCount }} {{ ratingCount === 1 ? 'rating' : 'ratings' }})</span>
    </div>
    <div class="user-rating" v-if="!hasRated">
      <span class="rate-label">Rate this game:</span>
      <span class="interactive-stars">
        <span
          v-for="n in 5"
          :key="'rate-' + n"
          class="star interactive"
          :class="{ 'hover': n <= hoverRating, 'selected': n <= currentSelection }"
          @mouseover="hoverRating = n"
          @mouseleave="hoverRating = 0"
          @click="submitRating(n)"
        >
          {{ n <= (hoverRating || currentSelection) ? '★' : '☆' }}
        </span>
      </span>
      <span v-if="isSubmitting" class="submitting-msg">Submitting...</span>
      <span v-if="submitError" class="error-msg">{{ submitError }}</span>
    </div>
     <div v-else class="rated-message">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="check-icon">
        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
      </svg>
      Thanks for rating!
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import axios from 'axios';

const props = defineProps({
  pageId: {
    type: String,
    required: true
  }
});

const averageRating = ref(null);
const ratingCount = ref(0);
const hoverRating = ref(0); // 用户鼠标悬停的星级
const currentSelection = ref(0); // 用户当前选择或已提交的星级
const hasRated = ref(false); // 用户是否已评分 (简单本地状态)
const isSubmitting = ref(false);
const submitError = ref(null);
const isLoading = ref(false); // 用于初始加载

// 获取当前评分信息
const fetchRating = async () => {
  isLoading.value = true;
  const baseUrl = import.meta.env.VITE_API_BASE_URL || ''; // Get base URL
  try {
    const response = await axios.get(`${baseUrl}/ratings`, { params: { pageId: props.pageId } }); // Use base URL
    averageRating.value = response.data.average;
    ratingCount.value = response.data.count;
    // Remove simulation logic
    // console.warn(`API call fetchRating(${props.pageId}) commented out. Returning default values.`);
    // currentRating.value = 0; // Already removed
    // ratingCount.value = 0; // Already removed
  } catch (err) {
    console.error('Error fetching rating:', err);
    // error.value = 'Failed to load rating.'; // Need error ref
    averageRating.value = 0; // Use averageRating
    ratingCount.value = 0;
  } finally {
    isLoading.value = false;
  }
};

// 提交用户评分
const submitRating = async (ratingValue) => {
  if (isSubmitting.value) return; // Use isSubmitting
  isSubmitting.value = true;     // Use isSubmitting
  // error.value = null; // Need error ref
  submitError.value = null; // Use submitError for submission specific errors
  const baseUrl = import.meta.env.VITE_API_BASE_URL || ''; // Get base URL
  try {
    const response = await axios.post(`${baseUrl}/ratings`, { // Use base URL
      pageId: props.pageId,
      rating: ratingValue
    });
    // Optimistically update the UI based on the expected response structure
    averageRating.value = response.data.average; // Use averageRating
    ratingCount.value = response.data.count;
    hasRated.value = true; // Set hasRated after successful submission
    currentSelection.value = ratingValue; // Update selection to submitted value
    // Remove simulation logic
    // console.warn(`API call submitRating(${props.pageId}, ${ratingValue}) commented out. Simulating submission.`);
    // // Simulate rating submission locally for UI feedback
    // // This is a very basic simulation, real logic might be more complex
    // ratingCount.value += 1;
    // // A more realistic simulation would recalculate average, but we'll just set it for now
    // averageRating.value = ratingValue; // Or recalculate based on a mock total
    // // alert('Rating submitted (simulated)!'); // Already removed

  } catch (err) {
    console.error('Error submitting rating:', err);
    // 修改：检查是否为速率限制错误 (429)
    if (err.response && err.response.status === 429) {
      submitError.value = err.response.data.message || 'Request limit reached. Please try again later.';
    } else {
      submitError.value = err.response?.data?.message || 'Failed to submit rating.';
    }
    currentSelection.value = 0; // 提交失败，清除选择状态
    setTimeout(() => { submitError.value = null; }, 3000);
  } finally {
    isSubmitting.value = false; // Use isSubmitting
  }
};

// 挂载时获取评分
onMounted(fetchRating);

// 监听 pageId 变化，重新获取评分
watch(() => props.pageId, (newPageId, oldPageId) => {
  if (newPageId && newPageId !== oldPageId) {
    // 重置状态
    averageRating.value = null;
    ratingCount.value = 0;
    hoverRating.value = 0;
    currentSelection.value = 0;
    hasRated.value = false; // 重置评分状态
    submitError.value = null;
    fetchRating(); // 获取新页面的评分
  }
}, { immediate: false });

</script>

<style scoped>
.rating-section {
  display: flex;
  flex-direction: column;
  align-items: left;
  padding: 8px 0 12px; /* 减少垂直内边距 */
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  /* border-bottom: 1px solid #f0f0f0; */ /* 边框由父组件控制 */
  /* margin-bottom: 20px; */ /* 外边距由父组件控制 */
}

.current-rating {
  display: flex;
  align-items: baseline;
  gap: 5px; /* 减少平均分区域内部间距 */
}

.average-score {
  font-size: 1.5rem; /* 可以稍微减小一点 */
  font-weight: 700;
  color: #2c3e50;
  line-height: 1;
}

.stars {
  position: relative;
  display: inline-block;
  font-size: 1.6rem; /* 可以稍微减小一点 */
  line-height: 1;
  margin: 0 1px;
}

/* 使用 CSS 变量和 clip-path 显示平均分星星 */
.stars::before {
  content: '★★★★★';
  position: absolute;
  top: 0;
  left: 0;
  color: #ffc107; /* 稍亮的黄色 */
  clip-path: inset(0 calc((5 - var(--rating, 0)) * 20%) 0 0); /* 根据评分裁剪 */
  z-index: 1;
}

.stars .star.empty {
  color: #dcdcdc; /* 更浅的灰色 */
}

/* 隐藏实际的填充和空星星字符，只用伪元素显示 */
.stars .star {
   visibility: hidden;
}

.rating-count {
  font-size: 0.8rem; /* 可以再小一点 */
  color: #888;
  padding-left: 1px;
}

.user-rating {
  display: flex;
  align-items: center;
  gap: 6px; /* 减少用户评分区域内部间距 */
  color: #555;
  font-size: 0.85rem; /* 调整字体大小 */
  min-height: 24px; /* 调整最小高度 */
}

.rate-label {
    font-weight: 500;
    margin-right: 2px;
}

.interactive-stars {
    display: flex;
}

.user-rating .star.interactive {
  font-size: 1.5rem; /* 减小交互星星 */
  cursor: pointer;
  color: #cccccc; /* 默认更浅的灰色 */
  transition: color 0.15s ease-in-out, transform 0.1s ease-in-out;
  padding: 0; /* 移除星星之间的 padding */
}

.user-rating .star.interactive:hover,
.user-rating .star.interactive.hover,
.user-rating .star.interactive.selected {
  color: #ffc107; /* 悬停或选中时黄色 */
}

.user-rating .star.interactive:active {
    transform: scale(0.92);
}

.rated-message {
    display: flex;
    align-items: center;
    gap: 4px;
    color: #2ecc71; /* 更柔和的绿色 */
    font-size: 0.9rem; /* 调整感谢信息大小 */
    font-weight: 500;
    margin-top: 2px; /* 调整位置 */
}

.rated-message .check-icon {
    width: 1em;
    height: 1em;
}

.submitting-msg,
.error-msg {
    font-size: 0.8rem;
    margin-left: 8px;
    font-style: italic;
}

.submitting-msg {
    color: #888;
}

.error-msg {
    color: #e74c3c; /* 错误红色 */
}

/* 响应式调整 */
@media (max-width: 600px) {
    
    .rating-section {
        padding: 0;
        margin-bottom: 0;
    }
    .current-rating {
        gap: 3px 6px;
        margin-bottom: 0;
    }
    .average-score {
        font-size: 1.1rem;
    }
    .stars {
        font-size: 1.4rem;
        display: none;
    }
    .rating-count {
        font-size: 0.75rem;
    }
    .user-rating {
        /* 保持堆叠 */
        gap: 4px;
        font-size: 0.8rem;
        min-height: auto;
        margin-top: 0;
    }
     .user-rating .star.interactive {
        font-size: 1.3rem;
     }
     .rate-label {
         margin-bottom: 0;
     }
     .submitting-msg,
     .error-msg {
         margin-top: 2px;
     }
    .rated-message {
        font-size: 0.85rem;
        margin-top: 0;
    }
}

</style>
