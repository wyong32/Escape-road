<template>
  <div class="comments-section">
    <h3>Comments</h3>

    <!-- 发表评论表单 -->
    <form @submit.prevent="submitComment" class="comment-form">
      <div class="form-group name-group">
        <label for="comment-name">Name:</label>
        <input
          type="text"
          id="comment-name"
          v-model="newCommentName"
          placeholder="Your Name"
          required
          :disabled="isSubmitting"
        />
      </div>

      <div class="form-group email-group">
        <label for="comment-email">Email:</label>
        <input
          type="email"
          id="comment-email"
          v-model="newCommentEmail"
          placeholder="Your Email (will not be published)"
          required
          :disabled="isSubmitting"
        />
      </div>

      <div class="form-group text-group full-width">
        <label for="comment-text">Comment:</label>
        <textarea
          id="comment-text"
          v-model="newCommentText"
          placeholder="Leave your comment..."
          rows="4"
          required
          :disabled="isSubmitting"
        ></textarea>
      </div>

      <div class="form-actions full-width">
         <p v-if="submitError" class="error-message">{{ submitError }}</p>
         <button type="submit" :disabled="isSubmitting || !newCommentName.trim() || !newCommentEmail.trim() || !newCommentText.trim()">
           {{ isSubmitting ? 'Submitting...' : 'Post Comment' }}
         </button>
      </div>
    </form>

    <!-- 评论列表 -->
    <div class="comments-list">
      <p v-if="isLoading">Loading comments...</p>
      <p v-else-if="fetchError" class="error-message">{{ fetchError }}</p>
      <p v-else-if="comments.length === 0" class="no-comments">No comments yet. Be the first to comment!</p>
      <div v-else>
        <div v-for="comment in displayedComments" :key="comment.id" class="comment-item">
          <p class="comment-author">{{ comment.name || 'Anonymous' }}:</p>
          <p class="comment-text">{{ comment.text }}</p>
          <p class="comment-meta">{{ formatTimestamp(comment.timestamp) }}</p>
        </div>

        <button 
          v-if="comments.length > initialCommentCount" 
          @click="toggleShowAllComments" 
          class="toggle-button"
        >
          {{ showAllComments ? 'Show Less' : 'Show More' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, computed } from 'vue';
import axios from 'axios'; // 稍后需要安装 axios

// 定义 props，接收来自父组件的页面标识
const props = defineProps({
  pageId: {
    type: String,
    required: true
  }
});

// 响应式状态
const comments = ref([]);
const newCommentName = ref('');
const newCommentEmail = ref('');
const newCommentText = ref('');
const isLoading = ref(false);
const isSubmitting = ref(false);
const fetchError = ref(null);
const submitError = ref(null);

// 添加 Show More/Less 状态
const showAllComments = ref(false); 
const initialCommentCount = 4; // 初始显示的评论数量

// 计算显示的评论
const displayedComments = computed(() => {
  if (showAllComments.value) {
    return comments.value;
  }
  return comments.value.slice(0, initialCommentCount);
});

// 切换显示状态的函数
const toggleShowAllComments = () => {
  showAllComments.value = !showAllComments.value;
};

// 获取评论的函数
const fetchComments = async () => {
  isLoading.value = true;
  fetchError.value = null;
  showAllComments.value = false; // 获取新评论时总是折叠
  const baseUrl = import.meta.env.VITE_API_BASE_URL || '';
  try {
    const response = await axios.get(`${baseUrl}/comments`, {
      params: { pageId: props.pageId }
    });
    comments.value = response.data;
  } catch (err) {
    console.error('Error fetching comments:', err);
    fetchError.value = 'Failed to load comments. Please try again later.';
  } finally {
    isLoading.value = false;
  }
};

// 提交评论的函数
const submitComment = async () => {
  if (newCommentText.value.trim() === '' || newCommentName.value.trim() === '' || newCommentEmail.value.trim() === '') {
    submitError.value = 'Name, email, and comment cannot be empty.';
    return;
  }
  isSubmitting.value = true;
  submitError.value = null;
  const baseUrl = import.meta.env.VITE_API_BASE_URL || ''; // Get base URL
  try {
    const response = await axios.post(`${baseUrl}/comments`, { // Use base URL
      pageId: props.pageId,
      name: newCommentName.value,
      text: newCommentText.value,
      email: newCommentEmail.value
    });
    comments.value.unshift(response.data);
    newCommentText.value = '';
    newCommentName.value = '';
    newCommentEmail.value = '';
  } catch (err) {
    console.error('Error submitting comment:', err);
    // 修改：检查是否为速率限制错误 (429)
    if (err.response && err.response.status === 429) {
        // 优先显示后端返回的速率限制消息
        submitError.value = err.response.data.message || 'Request limit reached. Please try again later.';
    } else {
        // 其他错误，显示通用消息或后端提供的其他错误消息
        submitError.value = err.response?.data?.message || 'Failed to post comment. Please try again later.';
    }
    // 短暂显示错误后清除
    setTimeout(() => { submitError.value = null; }, 5000);
  } finally {
    isSubmitting.value = false;
  }
};

// 格式化时间戳的辅助函数
const formatTimestamp = (isoString) => {
  if (!isoString) return '';
  try {
    // 尝试指定英文 locale 以获得标准英文格式，如果浏览器不支持则回退
    return new Date(isoString).toLocaleString('en-US', {
       year: 'numeric', month: 'short', day: 'numeric',
       hour: 'numeric', minute: '2-digit', hour12: true // 使用 12 小时制
     });
  } catch (e) {
     // 回退到默认 locale
     try {
       return new Date(isoString).toLocaleString(undefined, {
         year: 'numeric', month: 'short', day: 'numeric',
         hour: '2-digit', minute: '2-digit'
        });
     } catch (e2) {
        return 'Invalid date'; // 最终回退
     }
  }
};

// 组件挂载时获取评论
onMounted(fetchComments);

// 监听 pageId 变化，如果页面切换了，重新获取评论
watch(() => props.pageId, (newPageId, oldPageId) => {
  if (newPageId && newPageId !== oldPageId) {
    fetchComments(); // fetchComments 内部会重置 showAllComments
  }
}, { immediate: false }); // 初始加载由 onMounted 处理，不需要立即执行 watch

</script>

<style scoped>
.comments-section {
  /* 移除自身的背景、边框、圆角和阴影，由父组件 Recommend 提供 */
  /* margin-top: 2rem; */ /* 外边距由父组件控制 */
  /* padding: 1rem; */ /* 内边距也可能由父组件控制或在此调整 */
  /* border-top: 1px solid #eee; */ /* 分隔线也由父组件控制 */
  /* background-color: #f9f9f9; */
  /* border-radius: 8px; */
  /* box-shadow: 0 2px 4px rgba(0,0,0,0.05); */
  font-family: sans-serif;
}

.comments-section h3 {
    margin-top: 0;
    margin-bottom: 1.8rem; /* 增加标题和表单间距 */
    color: #444; /* 标题颜色稍深 */
    text-align: center;
    font-weight: 600;
    font-size: 1.3rem;
}

/* === 表单样式修改 === */
.comment-form {
  display: grid;
  grid-template-columns: 1fr 1fr; /* 创建两等列 */
  gap: 1rem 1.5rem; /* 行间距和列间距 */
  margin-bottom: 2.5rem;
}

.form-group {
    /* 每个 group 内部使用 flex 布局，让 label 在 input 上方 */
    display: flex;
    flex-direction: column;
    gap: 0.4rem; /* label 和 input 之间的间距 */
}

/* 指定网格布局 */
.name-group {
    grid-column: 1 / 2;
}
.email-group {
    grid-column: 2 / 3;
}
.text-group {
    grid-column: 1 / -1; /* 跨越两列 */
}
.form-actions {
    grid-column: 1 / -1; /* 跨越两列 */
    display: flex;
    justify-content: flex-end;
    align-items: center;
    gap: 1rem;
    margin-top: 0.5rem;
}

.comment-form label {
    font-size: 0.9rem;
    color: #555;
    font-weight: 500; /* 稍微加粗 */
    /* 移除之前的对齐和内边距 */
    /* text-align: right; */
    /* padding-right: 0.5rem; */
    /* padding-top: 0.6rem; */
}

.comment-form input[type="text"],
.comment-form input[type="email"],
.comment-form textarea {
  padding: 0.7rem 0.9rem;
  border: 1px solid #dcdcdc;
  border-radius: 6px;
  box-sizing: border-box;
  font-size: 0.95rem;
  background-color: #fff;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.comment-form textarea {
  resize: vertical;
  min-height: 110px;
  line-height: 1.5;
}

.comment-form input[type="text"]:focus,
.comment-form input[type="email"]:focus,
.comment-form textarea:focus {
    border-color: #5a9dee;
    outline: none;
    box-shadow: 0 0 0 3px rgba(90, 157, 238, 0.15);
}

.form-actions .error-message {
     margin: 0;
     text-align: right;
     flex-grow: 1;
     color: #e53e3e;
     font-size: 0.85rem;
}

.form-actions button {
    padding: 0.7rem 1.5rem;
    font-size: 0.95rem;
    font-weight: 600;
    background-color: #4a90e2;
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    transition: background-color 0.2s, transform 0.1s;
}

.form-actions button:disabled {
  background-color: #a0aec0;
  cursor: not-allowed;
}

.form-actions button:hover:not(:disabled) {
  background-color: #357abd;
}

.form-actions button:active:not(:disabled) {
    transform: scale(0.97);
}

/* === 评论列表样式 (基本不变) === */
.comments-list {
  margin-top: 2.5rem;
  border-top: 1px solid #eee;
  padding-top: 1.5rem;
}

.comments-list > p { 
    text-align: center;
    color: #888;
    padding: 1.5rem;
    font-style: italic;
}

.comment-item {
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #f0f0f0;
}

.comment-item:last-child {
  border-bottom: none;
  margin-bottom: 0;
}

.comment-author {
  font-weight: bold;
  margin-bottom: 0.3rem;
  color: #555;
}

.comment-text {
  margin-bottom: 0.5rem;
  line-height: 1.6;
  color: #333;
  white-space: pre-wrap; /* 保留换行 */
}

.comment-meta {
  font-size: 0.8rem;
  color: #888;
}

.no-comments {
    text-align: center;
    color: #777;
    margin-top: 1rem;
    font-style: italic;
}

.error-message {
    color: #e74c3c;
    font-size: 0.9rem;
    margin-top: 0.5rem;
    text-align: center; /* 居中显示错误信息 */
}
.comment-form .error-message {
    /* 表单内的错误信息靠左 */
    text-align: left; 
}

/* Show More / Less 按钮样式 (借鉴 About.vue) */
.toggle-button {
    display: block; 
    margin: 20px auto 0; /* 与评论列表保持间距，水平居中 */
    padding: 8px 16px;
    background-color: #3498db;
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    transition: background-color 0.3s ease;
    font-size: 0.9rem;
}

.toggle-button:hover {
    background-color: #2980b9;
}

/* === 响应式布局 === */
@media (max-width: 600px) { /* 在较窄屏幕上调整 */
    .comment-form {
        grid-template-columns: 1fr; /* 强制单列布局 */
        gap: 1rem; /* 只需要行间距 */
    }
    /* 在单列时，不再需要明确指定列 */
    .name-group,
    .email-group,
    .text-group,
    .form-actions {
        grid-column: 1 / -1;
    }
    .comment-form label {
        text-align: left; /* 小屏幕上标签左对齐 */
    }
    .form-actions {
        flex-direction: column-reverse; /* 按钮在错误信息下方 */
        align-items: flex-end; /* 都靠右对齐 */
    }
     .form-actions .error-message {
        width: 100%; /* 错误信息占满宽度 */
        text-align: right;
    }
}

</style>
