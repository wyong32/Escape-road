<template>
  <div class="comment-rating-management">
    <h2>评论与评分管理</h2>
    <div v-if="loading" class="loading">正在加载数据...</div>
    <div v-else-if="error" class="error">{{ error }}</div>
    <div v-else>
      <div v-if="Object.keys(gameData).length === 0">
        <p>暂无游戏数据。</p>
      </div>
      <div v-for="(data, pageId) in gameData" :key="pageId" class="game-section">
        <div class="game-header">
          <h3>{{ getGameTitle(pageId) }}</h3> <!-- 显示游戏标题 -->
          <div>
            <button @click="openEditRatingsModal(pageId, data.ratings)" class="action-btn edit-ratings-btn">编辑评分</button>
            <button @click="openAddCommentModal(pageId)" class="action-btn add-comment-btn">添加评论</button>
          </div>
        </div>
        <div class="ratings-display">
          <h4>当前评分:</h4>
          <ul class="rating-counts">
            <li v-for="i in 5" :key="i">
              {{ i }}星: <span>{{ data.ratings?.[String(i)] || 0 }}</span>
            </li>
          </ul>
          <p>平均分: {{ calculateAverage(data.ratings) }} ({{ calculateTotalVotes(data.ratings) }} 票)</p>
        </div>
        <div class="comments-display">
          <h4>评论列表:</h4>
          <ul v-if="data.comments && data.comments.length > 0" class="comment-list">
            <li v-for="comment in data.comments" :key="comment.id" class="comment-item">
              <div class="comment-info">
                <div class="comment-meta">
                  <strong>{{ comment.name }}</strong>
                  <span class="timestamp">({{ new Date(comment.timestamp).toLocaleString() }})</span>
                  <span v-if="comment.email" class="email"> - {{ comment.email }}</span>
                  <span v-if="comment.addedByAdmin" class="admin-tag"> [Admin]</span>
                </div>
                <p class="comment-text">{{ comment.text }}</p>
              </div>
              <button @click="handleDeleteComment(pageId, comment.id)" class="action-btn delete-btn">删除</button>
            </li>
          </ul>
          <p v-else>此游戏暂无评论。</p>
        </div>
      </div>
    </div>

    <!-- 手动添加评论模态框 -->
    <div v-if="isModalVisible" class="modal-overlay" @click.self="closeAddCommentModal">
      <div class="modal-content">
        <h3>为 {{ getGameTitle(selectedPageId) }} 手动添加评论</h3>
        <form @submit.prevent="handleAddCommentSubmit">
          <div class="form-group">
            <label for="name">姓名:</label>
            <input type="text" id="name" v-model="newCommentData.name" required>
          </div>
          <div class="form-group">
            <label for="email">邮箱 (可选):</label>
            <input type="email" id="email" v-model="newCommentData.email">
          </div>
          <div class="form-group">
            <label for="text">评论内容:</label>
            <textarea id="text" v-model="newCommentData.text" required></textarea>
          </div>
          <div class="form-group">
            <label for="timestamp">时间 (可选, 默认当前时间):</label>
            <input type="datetime-local" id="timestamp" v-model="newCommentData.timestamp">
            <small>格式: YYYY-MM-DD HH:mm</small>
          </div>
          <div class="form-actions">
            <button type="submit" class="submit-btn" :disabled="submitting">{{ submitting ? '提交中...' : '提交评论' }}</button>
            <button type="button" class="cancel-btn" @click="closeAddCommentModal" :disabled="submitting">取消</button>
          </div>
          <p v-if="submitError" class="error modal-error">{{ submitError }}</p>
        </form>
      </div>
    </div>

    <!-- 编辑评分模态框 -->
    <div v-if="isEditRatingsModalVisible" class="modal-overlay" @click.self="closeEditRatingsModal">
      <div class="modal-content">
        <h3>编辑 {{ getGameTitle(selectedPageId) }} 的评分</h3>
        <form @submit.prevent="handleEditRatingsSubmit">
          <div v-for="i in 5" :key="`rating-${i}`" class="form-group rating-input-group">
            <label :for="`rating-count-${i}`">{{ i }} 星数量:</label>
            <input
              type="number"
              :id="`rating-count-${i}`"
              v-model.number="editRatingsFormData[String(i)]"
              min="0"
              step="1"
              required
            >
          </div>
          <div class="form-actions">
            <button type="submit" class="submit-btn" :disabled="ratingsSubmitting">{{ ratingsSubmitting ? '更新中...' : '更新评分' }}</button>
            <button type="button" class="cancel-btn" @click="closeEditRatingsModal" :disabled="ratingsSubmitting">取消</button>
          </div>
          <p v-if="ratingsSubmitError" class="error modal-error">{{ ratingsSubmitError }}</p>
        </form>
      </div>
    </div>

  </div>
</template>

<script setup>
// 使用 setup 语法糖
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { games } from '../../data/games' // 导入游戏数据以获取标题

const router = useRouter()
const gameData = ref({})
const loading = ref(true)
const error = ref('')
const isModalVisible = ref(false)
const selectedPageId = ref('')
const newCommentData = ref({ name: '', email: '', text: '', timestamp: '' })
const submitting = ref(false)
const submitError = ref('')
const isEditRatingsModalVisible = ref(false)
const editRatingsFormData = ref({ '1': 0, '2': 0, '3': 0, '4': 0, '5': 0 })
const ratingsSubmitting = ref(false)
const ratingsSubmitError = ref('')

// --- 获取游戏标题 ---
const getGameTitle = (pageId) => {
  // 假设 pageId 对应 games 数据中的 key (game1, game2...)
  return games[pageId]?.title || pageId; // 如果找不到，显示 pageId
}

// --- 数据获取逻辑 ---
const fetchGameData = async () => {
  loading.value = true;
  error.value = null;
  const token = localStorage.getItem('adminToken');
  const baseUrl = import.meta.env.VITE_API_BASE_URL || '';
  if (!token) {
    error.value = '用户未认证';
    loading.value = false;
    // 考虑重定向到登录页
     router.push('/admin/login');
    return;
  }
  try {
    // 注意: API 端点是 /admin/comments (根据原 Dashboard 代码推断)
    const response = await fetch(`${baseUrl}/admin/comments`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        localStorage.removeItem('adminToken');
        router.push('/admin/login');
      } else {
        const errorData = await response.json().catch(() => ({ message: `HTTP Error ${response.status}` }));
        throw new Error(errorData.message || 'Failed to fetch game data');
      }
      return;
    }
    const data = await response.json();
    gameData.value = data;
  } catch (err) {
    console.error('Error fetching game data:', err);
    error.value = err.message || '获取游戏数据失败';
  } finally {
    loading.value = false;
  }
}

// --- 删除评论逻辑 ---
const handleDeleteComment = async (pageId, commentId) => {
  console.log(`[删除请求] Page ID: ${pageId}, Comment ID: ${commentId}`);
  if (!confirm('确定要删除这条评论吗?')) return;
  const token = localStorage.getItem('adminToken');
  const baseUrl = import.meta.env.VITE_API_BASE_URL || '';
  if (!token) {
    error.value = '用户未认证';
     router.push('/admin/login');
    return;
  }
  try {
    // 注意: API 端点是 /admin/comments/:pageId/:commentId
    const response = await fetch(`${baseUrl}/admin/comments/${pageId}/${commentId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: `HTTP Error ${response.status}` }));
       if (response.status === 401 || response.status === 403) {
        localStorage.removeItem('adminToken');
        router.push('/admin/login');
      } else {
        throw new Error(errorData.message || 'Failed to delete comment');
      }
      return;
    }
    await fetchGameData(); // 删除成功后刷新数据
  } catch (err) {
    console.error('删除评论时出错:', err)
    alert(err.message || '删除评论时出错') // 简单的错误提示
  }
}

// --- 添加评论模态框逻辑 ---
const openAddCommentModal = (pageId) => {
  selectedPageId.value = pageId;
  // 重置表单
  newCommentData.value = { name: '', email: '', text: '', timestamp: '' };
  submitError.value = '';
  isModalVisible.value = true;
}

const closeAddCommentModal = () => {
  isModalVisible.value = false;
}

// --- 手动添加评论提交逻辑 ---
const handleAddCommentSubmit = async () => {
  submitting.value = true;
  submitError.value = '';
  const token = localStorage.getItem('adminToken');
  const baseUrl = import.meta.env.VITE_API_BASE_URL || '';
  if (!token) {
    submitError.value = '用户未认证，请重新登录。';
     router.push('/admin/login');
    submitting.value = false;
    return;
  }
  if (!newCommentData.value.name || !newCommentData.value.text) {
      submitError.value = '姓名和评论内容不能为空。';
      submitting.value = false;
      return;
  }

  const dataToSend = {
      pageId: selectedPageId.value,
      name: newCommentData.value.name,
      text: newCommentData.value.text,
      email: newCommentData.value.email || undefined,
      // 时间戳处理
      timestamp: newCommentData.value.timestamp
                   ? new Date(newCommentData.value.timestamp).toISOString()
                   : undefined // 如果为空则不发送，让后端处理
  };

   // 简单的时间戳校验
   if (newCommentData.value.timestamp && isNaN(new Date(newCommentData.value.timestamp).getTime())) {
       submitError.value = '提供的时间格式无效，请使用 YYYY-MM-DD HH:mm 格式或留空。';
       submitting.value = false;
       return;
   }


  try {
    // 注意: API 端点是 /admin/comments/manual
    const response = await fetch(`${baseUrl}/admin/comments/manual`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(dataToSend)
    });

    if (!response.ok) {
       const errorData = await response.json().catch(() => ({ message: `HTTP Error ${response.status}` }));
       if (response.status === 401 || response.status === 403) {
        localStorage.removeItem('adminToken');
        router.push('/admin/login');
        throw new Error('认证失败或权限不足，请重新登录。');
      } else {
        throw new Error(errorData.message || '添加评论失败');
      }
    }

    closeAddCommentModal();
    await fetchGameData(); // 添加成功后刷新
    alert('评论添加成功！');

  } catch (err) {
    console.error('添加评论时出错:', err);
    submitError.value = err.message || '添加评论时发生未知错误。';
  } finally {
    submitting.value = false;
  }
};

// --- 编辑评分模态框逻辑 ---
const openEditRatingsModal = (pageId, currentRatings) => {
  selectedPageId.value = pageId;
  const initialFormData = {};
  for (let i = 1; i <= 5; i++) {
      const key = String(i);
      initialFormData[key] = parseInt(currentRatings?.[key] || 0, 10);
      // 确保是有效数字且非负
      if (isNaN(initialFormData[key]) || initialFormData[key] < 0) {
          initialFormData[key] = 0;
      }
  }
  editRatingsFormData.value = initialFormData;
  ratingsSubmitError.value = '';
  isEditRatingsModalVisible.value = true;
}

const closeEditRatingsModal = () => {
  isEditRatingsModalVisible.value = false;
}

// --- 编辑评分提交逻辑 ---
const handleEditRatingsSubmit = async () => {
  ratingsSubmitting.value = true;
  ratingsSubmitError.value = '';
  const token = localStorage.getItem('adminToken');
  const baseUrl = import.meta.env.VITE_API_BASE_URL || '';

  if (!token) {
    ratingsSubmitError.value = '用户未认证，请重新登录。';
    router.push('/admin/login');
    ratingsSubmitting.value = false;
    return;
  }

  let validationError = null;
  const countsToSend = {};
  for (let i = 1; i <= 5; i++) {
      const key = String(i);
      const count = editRatingsFormData.value[key];
       if (count === undefined || count === null || typeof count !== 'number' || !Number.isInteger(count) || count < 0) {
           validationError = `评分数量 '${key}' 必须是非负整数。`;
           break;
       }
       countsToSend[key] = count;
  }

  if (validationError) {
      ratingsSubmitError.value = validationError;
      ratingsSubmitting.value = false;
      return;
  }

  try {
    // 注意: API 端点是 /admin/ratings/:pageId
    const response = await fetch(`${baseUrl}/admin/ratings/${selectedPageId.value}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(countsToSend)
    });

    if (!response.ok) {
       const errorData = await response.json().catch(() => ({ message: `HTTP Error ${response.status}` }));
       if (response.status === 401 || response.status === 403) {
        localStorage.removeItem('adminToken');
        router.push('/admin/login');
        throw new Error('认证失败或权限不足，请重新登录。');
      } else {
        throw new Error(errorData.message || '更新评分失败');
      }
    }

    closeEditRatingsModal();
    await fetchGameData(); // 更新成功后刷新
    alert('评分更新成功！');

  } catch (err) {
    console.error('更新评分时出错:', err);
    ratingsSubmitError.value = err.message || '更新评分时发生未知错误。';
  } finally {
    ratingsSubmitting.value = false;
  }
};

// --- 计算函数 ---
const calculateAverage = (ratings) => {
  if (!ratings || typeof ratings !== 'object') return 'N/A';
  let totalScore = 0;
  let count = 0;
  for (let i = 1; i <= 5; i++) {
      const key = String(i);
      const numRatings = parseInt(ratings[key] || 0, 10);
      if (!isNaN(numRatings) && numRatings > 0) {
          totalScore += numRatings * i;
          count += numRatings;
      }
  }
  const average = count > 0 ? totalScore / count : 0;
  return average.toFixed(1);
};

const calculateTotalVotes = (ratings) => {
  if (!ratings || typeof ratings !== 'object') return 0;
  let count = 0;
  for (let i = 1; i <= 5; i++) {
      const key = String(i);
      const numRatings = parseInt(ratings[key] || 0, 10);
      if (!isNaN(numRatings) && numRatings > 0) {
           count += numRatings;
      }
  }
  return count;
};

// --- 组件挂载时获取数据 ---
onMounted(() => {
  fetchGameData();
});

</script>

<style scoped>
/* 这里包含所有评论评分管理相关的样式 */

.loading, .error {
  text-align: center;
  padding: 2rem;
  color: #666;
}

.error {
  color: #e74c3c;
}

.game-section {
  margin-bottom: 2.5rem;
  padding: 1.5rem;
  border-radius: 6px;
  background-color: #fff; /* 白色背景 */
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.game-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #eee;
}

.game-header h3 {
    margin: 0;
    color: #34495e;
}

.game-header div {
    display: flex;
    gap: 0.8rem;
}

.action-btn {
    padding: 0.4rem 0.8rem;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 0.9em;
    transition: background-color 0.2s, box-shadow 0.2s;
    box-shadow: 0 1px 2px rgba(0,0,0,0.1);
}
.action-btn:hover {
    box-shadow: 0 2px 4px rgba(0,0,0,0.15);
}

.edit-ratings-btn {
    background-color: #f1c40f; /* 黄色 */
    color: #333;
}
.edit-ratings-btn:hover {
    background-color: #f39c12;
}

.add-comment-btn {
  background-color: #3498db; /* 蓝色 */
  color: white;
}
.add-comment-btn:hover {
  background-color: #2980b9;
}

.delete-btn {
    background-color: #e74c3c; /* 红色 */
    color: white;
    margin-left: auto; /* 推到右侧 */
}
.delete-btn:hover {
    background-color: #c0392b;
}


.ratings-display, .comments-display {
    margin-bottom: 1.5rem;
}
.ratings-display:last-child, .comments-display:last-child {
    margin-bottom: 0;
}


.ratings-display h4, .comments-display h4 {
    margin-top: 0;
    margin-bottom: 0.8rem;
    font-size: 1.1em;
    color: #555;
}

.rating-counts {
    list-style: none;
    padding: 0;
    margin: 0 0 0.8rem 0;
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
}
.rating-counts li {
    font-size: 0.95em;
    background-color: #ecf0f1;
    padding: 3px 8px;
    border-radius: 3px;
}
.rating-counts li span {
    font-weight: bold;
    color: #2c3e50;
    margin-left: 0.3em;
}

.ratings-display p {
    font-size: 0.9em;
    color: #555;
    margin-top: 0.5rem;
}

.comment-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.comment-item {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 1rem 0;
  border-bottom: 1px solid #eee;
}
.comment-item:last-child {
  border-bottom: none;
}

.comment-info {
  flex-grow: 1;
  margin-right: 1rem;
}

.comment-meta {
  font-size: 0.9em;
  color: #777;
  margin-bottom: 0.3rem;
}
.comment-meta strong {
  color: #333;
  margin-right: 0.5em;
}
.comment-meta .timestamp {
  margin-right: 0.5em;
}
.comment-meta .email {
  color: #555;
}
.admin-tag {
    font-weight: bold;
    color: #e67e22; /* 橙色 */
    font-size: 0.9em;
    margin-left: 0.5em;
}


.comment-text {
  margin: 0;
  line-height: 1.5;
  color: #333;
}


/* 模态框样式 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
  width: 90%;
  max-width: 500px;
  max-height: 90vh; /* 限制最大高度 */
  overflow-y: auto; /* 内容过多时允许滚动 */
}

.modal-content h3 {
  margin-top: 0;
  margin-bottom: 1.5rem;
  border-bottom: 1px solid #eee;
  padding-bottom: 0.8rem;
  color: #34495e;
}

.form-group {
  margin-bottom: 1.2rem; /* 稍微增加间距 */
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600; /* 标签加粗 */
  color: #555;
  font-size: 0.95em;
}

.form-group input[type="text"],
.form-group input[type="email"],
.form-group input[type="number"],
.form-group input[type="datetime-local"],
.form-group textarea {
  width: 100%;
  padding: 0.7rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  box-sizing: border-box;
  font-size: 1em;
}
.form-group input:focus,
.form-group textarea:focus {
    border-color: #3498db;
    outline: none;
    box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.2);
}


.form-group textarea {
  min-height: 100px;
  resize: vertical;
}
.form-group small {
    font-size: 0.8em;
    color: #777;
    margin-top: 0.3em;
    display: block;
}

.rating-input-group {
    display: flex;
    align-items: center;
    gap: 0.8rem;
    margin-bottom: 0.8rem;
}
.rating-input-group label {
    flex-basis: 90px; /* 调整宽度 */
    flex-shrink: 0;
    text-align: right;
    margin-bottom: 0;
    font-weight: normal; /* 不加粗 */
}
.rating-input-group input[type="number"] {
    flex-grow: 1;
    width: auto;
}


.form-actions {
  margin-top: 1.5rem;
  display: flex;
  justify-content: flex-end;
  gap: 0.8rem;
}

.submit-btn,
.cancel-btn {
  padding: 0.7rem 1.3rem; /* 稍大按钮 */
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 600;
  transition: background-color 0.2s, opacity 0.2s;
}

.submit-btn {
  background-color: #2ecc71; /* 绿色 */
  color: white;
}
.submit-btn:hover:not(:disabled) {
  background-color: #27ae60;
}
.submit-btn:disabled {
  background-color: #bdc3c7;
  opacity: 0.7;
  cursor: not-allowed;
}

.cancel-btn {
  background-color: #95a5a6; /* 灰色 */
  color: white;
}
.cancel-btn:hover:not(:disabled) {
  background-color: #7f8c8d;
}
.cancel-btn:disabled {
    background-color: #bdc3c7;
    opacity: 0.7;
    cursor: not-allowed;
}

.modal-error { /* 模态框内的错误消息 */
  color: #e74c3c;
  margin-top: 1rem;
  text-align: center;
  font-size: 0.9em;
}

</style> 