<template>
  <div class="dashboard-container">
    <header class="dashboard-header">
      <h1>管理面板</h1>
      <button @click="handleLogout" class="logout-btn">退出登录</button>
    </header>
    <div class="dashboard-content">
      <h2>评论与评分管理</h2>
      <div v-if="loading" class="loading">正在加载数据...</div>
      <div v-else-if="error" class="error">{{ error }}</div>
      <div v-else>
        <div v-if="Object.keys(gameData).length === 0">
          <p>暂无游戏数据。</p>
        </div>
        <div v-for="(data, pageId) in gameData" :key="pageId" class="game-section">
          <div class="game-header">
            <h3>{{ pageId }}</h3>
            <div>
              <button @click="openEditRatingsModal(pageId, data.ratings)" class="edit-ratings-btn">编辑评分</button>
              <button @click="openAddCommentModal(pageId)" class="add-comment-btn">添加评论</button>
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
                <button @click="handleDeleteComment(pageId, comment.id)" class="delete-btn">删除</button>
              </li>
            </ul>
            <p v-else>此游戏暂无评论。</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 手动添加评论模态框 -->
    <div v-if="isModalVisible" class="modal-overlay" @click.self="closeAddCommentModal">
      <div class="modal-content">
        <h3>为 {{ selectedPageId }} 手动添加评论</h3>
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
          <div class="form-actions">
            <button type="submit" class="submit-btn" :disabled="submitting">{{ submitting ? '提交中...' : '提交评论' }}</button>
            <button type="button" class="cancel-btn" @click="closeAddCommentModal" :disabled="submitting">取消</button>
          </div>
          <p v-if="submitError" class="error">{{ submitError }}</p>
        </form>
      </div>
    </div>

    <!-- 编辑评分模态框 -->
    <div v-if="isEditRatingsModalVisible" class="modal-overlay" @click.self="closeEditRatingsModal">
      <div class="modal-content">
        <h3>编辑 {{ selectedPageId }} 的评分</h3>
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
          <p v-if="ratingsSubmitError" class="error">{{ ratingsSubmitError }}</p>
        </form>
      </div>
    </div>

  </div>
</template>

<script>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'

export default {
  name: 'AdminDashboard',
  setup() {
    const router = useRouter()
    const gameData = ref({})
    const loading = ref(true)
    const error = ref('')
    const isModalVisible = ref(false)
    const selectedPageId = ref('')
    const newCommentData = ref({ name: '', email: '', text: '' })
    const submitting = ref(false)
    const submitError = ref('')
    const isEditRatingsModalVisible = ref(false)
    const editRatingsFormData = ref({ '1': 0, '2': 0, '3': 0, '4': 0, '5': 0 })
    const ratingsSubmitting = ref(false)
    const ratingsSubmitError = ref('')

    const fetchGameData = async () => {
      loading.value = true;
      error.value = null;
      const token = localStorage.getItem('adminToken');
      const baseUrl = import.meta.env.VITE_API_BASE_URL || '';
      if (!token) {
        error.value = '用户未认证';
        loading.value = false;
        return;
      }
      try {
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
            const errorData = await response.json();
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

    const handleDeleteComment = async (pageId, commentId) => {
      console.log(`[删除请求] Page ID: ${pageId}, Comment ID: ${commentId}`);
      if (!confirm('确定要删除这条评论吗?')) return;
      const token = localStorage.getItem('adminToken');
      const baseUrl = import.meta.env.VITE_API_BASE_URL || '';
      if (!token) {
        error.value = '用户未认证';
        return;
      }
      try {
        const response = await fetch(`${baseUrl}/admin/comments/${pageId}/${commentId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (!response.ok) {
          const errorData = await response.json();
           if (response.status === 401 || response.status === 403) {
            localStorage.removeItem('adminToken');
            router.push('/admin/login');
          } else {
            throw new Error(errorData.message || 'Failed to delete comment');
          }
          return;
        }
        fetchGameData();
      } catch (err) {
        console.error('删除评论时出错:', err)
        alert(err.message || '删除评论时出错')
      }
    }

    const handleLogout = () => {
      localStorage.removeItem('adminToken');
      router.push('/admin/login');
    }

    const openAddCommentModal = (pageId) => {
      selectedPageId.value = pageId;
      newCommentData.value = { name: '', email: '', text: '' };
      submitError.value = '';
      isModalVisible.value = true;
    }

    const closeAddCommentModal = () => {
      isModalVisible.value = false;
    }

    const handleAddCommentSubmit = async () => {
      submitting.value = true;
      submitError.value = '';
      const token = localStorage.getItem('adminToken');
      const baseUrl = import.meta.env.VITE_API_BASE_URL || '';
      if (!token) {
        error.value = '用户未认证，请重新登录。';
        submitError.value = '用户未认证，请重新登录。';
        submitting.value = false;
        return;
      }
      if (!newCommentData.value.name || !newCommentData.value.text) {
          submitError.value = '姓名和评论内容不能为空。';
          submitting.value = false;
          return;
      }

      try {
        const response = await fetch(`${baseUrl}/admin/comments/manual`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            pageId: selectedPageId.value, 
            name: newCommentData.value.name,
            text: newCommentData.value.text,
            email: newCommentData.value.email || undefined
          })
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
        await fetchGameData();
        alert('评论添加成功！'); 

      } catch (err) {
        console.error('添加评论时出错:', err);
        submitError.value = err.message || '添加评论时发生未知错误。';
      } finally {
        submitting.value = false;
      }
    };

    const openEditRatingsModal = (pageId, currentRatings) => {
      selectedPageId.value = pageId;
      const initialFormData = {};
      for (let i = 1; i <= 5; i++) {
          const key = String(i);
          initialFormData[key] = parseInt(currentRatings?.[key] || 0, 10);
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

    const handleEditRatingsSubmit = async () => {
      ratingsSubmitting.value = true;
      ratingsSubmitError.value = '';
      const token = localStorage.getItem('adminToken');
      const baseUrl = import.meta.env.VITE_API_BASE_URL || '';
      
      if (!token) {
        ratingsSubmitError.value = '用户未认证，请重新登录。';
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
        await fetchGameData();
        alert('评分更新成功！'); 

      } catch (err) {
        console.error('更新评分时出错:', err);
        ratingsSubmitError.value = err.message || '更新评分时发生未知错误。';
      } finally {
        ratingsSubmitting.value = false;
      }
    };

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

    onMounted(() => {
      fetchGameData();
    });

    return {
      gameData,
      loading,
      error,
      handleLogout,
      handleDeleteComment,
      isModalVisible,
      selectedPageId,
      newCommentData,
      submitting,
      submitError,
      openAddCommentModal,
      closeAddCommentModal,
      handleAddCommentSubmit,
      isEditRatingsModalVisible,
      editRatingsFormData,
      ratingsSubmitting,
      ratingsSubmitError,
      openEditRatingsModal,
      closeEditRatingsModal,
      handleEditRatingsSubmit,
      calculateAverage,
      calculateTotalVotes
    }
  }
}
</script>

<style scoped>
.dashboard-container {
  padding: 2rem;
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #eee;
}

.logout-btn {
  padding: 0.5rem 1rem;
  background-color: #dc3545;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.logout-btn:hover {
  background-color: #c82333;
}

.dashboard-content {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.loading, .error {
  text-align: center;
  padding: 2rem;
}

.error {
  color: red;
}

.game-section {
  margin-bottom: 2.5rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid #ddd;
}

.game-section:last-child {
  border-bottom: none;
  margin-bottom: 0;
}

.game-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.game-header h3 {
    margin: 0;
}

.game-header div {
    display: flex;
    gap: 0.8rem;
}

.edit-ratings-btn {
    padding: 0.4rem 0.8rem;
    background-color: #ffc107;
    color: #212529;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 0.9em;
    transition: background-color 0.2s;
}
.edit-ratings-btn:hover {
    background-color: #e0a800;
}

.ratings-display, .comments-display {
    margin-bottom: 1rem;
    padding-left: 1rem;
    border-left: 2px solid #eee;
}

.ratings-display h4, .comments-display h4 {
    margin-top: 0;
    margin-bottom: 0.8rem;
    font-size: 1.1em;
    color: #444;
}

.rating-counts {
    list-style: none;
    padding: 0;
    margin: 0 0 0.5rem 0;
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
}
.rating-counts li {
    font-size: 0.95em;
}
.rating-counts li span {
    font-weight: bold;
    color: #007bff;
    margin-left: 0.3em;
}

.ratings-display p {
    font-size: 0.9em;
    color: #555;
    margin-top: 0.5rem;
}

.admin-tag {
    font-weight: bold;
    color: #dc3545;
    font-size: 0.9em;
    margin-left: 0.5em;
}

.rating-input-group {
    display: flex;
    align-items: center;
    gap: 0.8rem;
    margin-bottom: 0.8rem;
}
.rating-input-group label {
    flex-basis: 80px;
    text-align: right;
    margin-bottom: 0;
}
.rating-input-group input[type="number"] {
    flex-grow: 1;
    width: auto;
}

.add-comment-btn {
  padding: 0.4rem 0.8rem;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9em;
  transition: background-color 0.2s;
}

.add-comment-btn:hover {
  background-color: #0056b3;
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
}

.modal-content h3 {
  margin-top: 0;
  margin-bottom: 1.5rem;
  border-bottom: 1px solid #eee;
  padding-bottom: 0.8rem;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: bold;
}

.form-group input[type="text"],
.form-group input[type="email"],
.form-group textarea {
  width: 100%;
  padding: 0.7rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  box-sizing: border-box;
}

.form-group textarea {
  min-height: 100px;
  resize: vertical;
}

.form-actions {
  margin-top: 1.5rem;
  display: flex;
  justify-content: flex-end;
  gap: 0.8rem;
}

.submit-btn,
.cancel-btn {
  padding: 0.6rem 1.2rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.submit-btn {
  background-color: #28a745;
  color: white;
}
.submit-btn:hover:not(:disabled) {
  background-color: #218838;
}
.submit-btn:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

.cancel-btn {
  background-color: #6c757d;
  color: white;
}
.cancel-btn:hover:not(:disabled) {
  background-color: #5a6268;
}
.cancel-btn:disabled {
    background-color: #cccccc;
    cursor: not-allowed;
}

.modal-content .error {
  color: red;
  margin-top: 1rem;
  text-align: center;
}
</style> 