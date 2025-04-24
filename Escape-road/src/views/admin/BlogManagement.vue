<template>
  <div class="blog-management">
    <h2>博客文章管理</h2>

    <!-- 添加新文章按钮 -->
    <div class="actions-bar">
        <button @click="openCreateModal" class="add-new-btn">+ 创建新文章</button>
    </div>

    <!-- 弹框表单 -->
    <div v-if="isModalOpen" class="modal-overlay" @click.self="closeModal"> 
      <div class="modal-content">
        <button @click="closeModal" class="modal-close-btn">&times;</button>
        <!-- 表单区域 (移动到弹框内部) -->
        <div class="create-post-form" ref="formRef"> 
          <h3>{{ isEditing ? '编辑文章' : '创建新文章' }}</h3> 
          <form @submit.prevent="handleSubmit">
            <!-- Form Group: Title -->
            <div class="form-group">
              <label for="title">标题</label>
              <input type="text" id="title" v-model="postForm.title" required>
            </div>
             <!-- Form Group: Slug (URL) -->
            <div class="form-group">
              <label for="slug">文章 URL (Slug)</label>
              <input type="text" id="slug" v-model="postForm.slug" required>
              <small>用于文章链接，只能包含小写字母、数字和连字符 (e.g., my-awesome-post)。系统会自动清理格式。</small>
            </div>
            <!-- Form Group: Summary -->
            <div class="form-group">
              <label for="summary">摘要 (可选)</label>
              <textarea id="summary" v-model="postForm.summary"></textarea>
              <small>简短的描述，会显示在列表页。</small>
            </div>
            <!-- Form Group: Content -->
            <div class="form-group">
              <label for="content">内容（请帮我生成html格式内容，不要包含样式和class，只需要保留原有标签：）</label>
              <textarea id="content" v-model="postForm.content" required></textarea>
            </div>
             <!-- Form Group: Image URL -->
            <div class="form-group">
              <label for="image">图片 URL (可选)</label>
              <input type="text" id="image" v-model="postForm.image">
              <small>文章主图的链接地址。</small>
            </div>
             <!-- Form Group: Image Alt -->
            <div class="form-group">
              <label for="imageAlt">图片 Alt 文本 (可选)</label>
              <input type="text" id="imageAlt" v-model="postForm.imageAlt">
              <small>描述图片内容，用于 SEO 和可访问性。</small>
            </div>
             <!-- Form Group: Published At -->
             <div class="form-group">
                <label for="publishedAt">发布时间 (可选)</label>
                <input type="datetime-local" id="publishedAt" v-model="postForm.publishedAt">
                <small>设置文章的发布日期和时间。如果留空，则默认为当前时间。</small>
             </div>
             <!-- SEO Meta Fields -->
             <h4>SEO Meta 标签 (可选)</h4>
              <div class="form-group">
                <label for="metaTitle">Meta 标题</label>
                <input type="text" id="metaTitle" v-model="postForm.metaTitle">
                 <small>搜索引擎结果页显示的标题 (如果留空，通常使用文章标题)。</small>
              </div>
               <div class="form-group">
                <label for="metaDescription">Meta 描述</label>
                <textarea id="metaDescription" v-model="postForm.metaDescription"></textarea>
                 <small>搜索引擎结果页显示的描述 (如果留空，可能使用文章摘要)。</small>
              </div>
               <div class="form-group">
                <label for="metaKeywords">Meta 关键词</label>
                <input type="text" id="metaKeywords" v-model="postForm.metaKeywords">
                <small>用逗号分隔的关键词 (e.g., tech, javascript, webdev)。</small>
              </div>

            <!-- Form Actions -->
            <div class="form-actions">
              <button type="submit" class="submit-btn" :disabled="isSubmitting">
                {{ isSubmitting ? '提交中...' : (isEditing ? '更新文章' : '发布文章') }} 
              </button>
              <button type="button" v-if="isEditing" @click="cancelEdit" class="cancel-btn" :disabled="isSubmitting">
                取消编辑
              </button> 
               <button type="button" v-else @click="closeModal" class="cancel-btn" :disabled="isSubmitting">
                取消创建
              </button>
            </div>
            <!-- Feedback Messages -->
            <p v-if="submitError" class="error">{{ submitError }}</p>
            <p v-if="submitSuccess" class="success">{{ successMessage }}</p> 
          </form>
        </div>
      </div>
    </div>

    <hr class="section-divider">

    <!-- 文章列表区域 -->
    <h3>已发布文章</h3>
    <div v-if="listLoading" class="loading">加载中...</div>
    <div v-else-if="listError" class="error">{{ listError }}</div>
    <ul v-else-if="adminBlogPosts.length > 0" class="post-list">
      <li v-for="post in adminBlogPosts" :key="post.id" class="post-list-item">
        <div class="post-info">
          <span class="post-title">{{ post.title }}</span>
          <span class="post-date">发布于: {{ post.publishedAt ? new Date(post.publishedAt).toLocaleString() : '未指定' }}</span>
          <span class="post-slug" v-if="post.slug">Slug: /blog/{{ post.slug }}</span>
        </div>
        <div class="post-actions">
          <button @click="handleEditPost(post.id)" class="action-btn edit-btn">编辑</button>
          <button @click="handleDeletePost(post.id, post.title)" class="action-btn delete-btn">删除</button>
        </div>
      </li>
    </ul>
    <p v-else>还没有发布任何文章。</p>

  </div>
</template>

<script setup>
import { ref, onMounted, reactive } from 'vue'; // Import reactive
import { useRouter } from 'vue-router';
import { createBlogPost, getBlogPosts, deleteBlogPost as deleteBlogPostService, getBlogPostById, updateBlogPost } from '../../services/blogService';

const router = useRouter();

// Use reactive for the form object to better handle nested properties if needed in future
// Initialize with all fields
const postForm = reactive({
  id: null,
  title: '',
  content: '',
  slug: '',
  summary: '',
  metaTitle: '',
  metaDescription: '',
  metaKeywords: '',
  image: '', // Changed from imageUrl to image
  imageAlt: '',
  publishedAt: '' // Add publishedAt field
});

const isSubmitting = ref(false);
const submitError = ref(null);
const submitSuccess = ref(false);
const successMessage = ref('');

const adminBlogPosts = ref([]);
const listLoading = ref(true);
const listError = ref(null);

const isEditing = ref(false);
const isModalOpen = ref(false); // State for modal visibility
const formRef = ref(null); // Ref for the form element (might not be needed if not scrolling)

// Function to reset the form state
const resetForm = () => {
    Object.assign(postForm, {
        id: null, title: '', content: '', slug: '', summary: '',
        metaTitle: '', metaDescription: '', metaKeywords: '',
        image: '', imageAlt: '',
        publishedAt: '' // Reset publishedAt
    });
    isEditing.value = false;
    submitError.value = null;
    submitSuccess.value = false;
    successMessage.value = '';
};

// Function to open the modal for creating a new post
const openCreateModal = () => {
    resetForm();
    isModalOpen.value = true;
};

// Function to close the modal
const closeModal = () => {
    isModalOpen.value = false;
    // Optionally reset form when closing, or rely on cancel/create logic
    // resetForm(); 
};

const fetchAdminBlogPosts = async () => {
  listLoading.value = true;
  listError.value = null;
  console.log('[AdminBlog] Fetching posts...');
  try {
    const posts = await getBlogPosts();
    adminBlogPosts.value = posts.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
    console.log('[AdminBlog] Fetched and sorted posts:', adminBlogPosts.value);
  } catch (error) {
    console.error('[AdminBlog] Error fetching posts:', error);
    listError.value = '加载文章列表失败。' + (error.message ? ` (${error.message})` : '');
    if (error.message?.includes('管理员未登录') || error.response?.status === 401 || error.response?.status === 403) {
      listError.value += ' 请重新登录。'
    }
  } finally {
    listLoading.value = false;
  }
};

const handleEditPost = async (id) => {
  console.log(`[AdminBlog] Editing post: ${id}`);
  resetForm(); // Reset form before loading new data
  isEditing.value = true;

  try {
    const postToEdit = await getBlogPostById(id); // Fetch by ID
    Object.assign(postForm, postToEdit); // Assign fetched data to reactive form
    isModalOpen.value = true; // Open modal after data is loaded
    // formRef.value?.scrollIntoView({ behavior: 'smooth' }); // Scrolling might not be needed in modal
  } catch (error) {
    console.error(`[AdminBlog] Error fetching post ${id} for edit:`, error);
    submitError.value = '加载文章数据失败，无法编辑。';
    isEditing.value = false; // Reset editing state on error
  }
};

// Handle canceling the edit (now just closes modal as form is reset on open/close)
const cancelEdit = () => {
  closeModal();
};

// Unified submit handler for Create and Update
const handleSubmit = async () => {
  isSubmitting.value = true;
  submitError.value = null;
  submitSuccess.value = false;

  // Basic validation (slug is also required now)
  if (!postForm.title?.trim() || !postForm.content?.trim() || !postForm.slug?.trim()) {
    submitError.value = '标题、内容和文章 URL (Slug) 不能为空。';
    isSubmitting.value = false;
    return;
  }

  // Prepare data payload, remove null id if creating
  const payload = { ...postForm };
  if (!isEditing.value) {
      delete payload.id;
  }

  console.log('[AdminBlog] Payload being sent:', JSON.stringify(payload, null, 2));

  try {
    let resultPost;
    if (isEditing.value && payload.id) {
      // --- Update existing post ---
      console.log('准备更新数据:', payload.id, payload);
      const { id, createdAt, updatedAt, author, ...updateData } = payload; // Exclude non-updatable fields if needed
      resultPost = await updateBlogPost(payload.id, updateData);
      console.log('文章更新成功:', resultPost);
      successMessage.value = '文章更新成功！';
    } else {
      // --- Create new post ---
      console.log('准备提交新数据:', payload);
      resultPost = await createBlogPost(payload);
      console.log('文章创建成功:', resultPost);
      successMessage.value = '文章创建成功！';
    }

    submitSuccess.value = true;
    setTimeout(() => {
      closeModal(); // Close modal on success after a short delay
      resetForm(); // Ensure form is fully reset
    }, 1500); // Shorter delay for success message

    await fetchAdminBlogPosts(); // Refresh the list

  } catch (error) {
    console.error(`处理文章${isEditing.value ? '更新' : '创建'}失败:`, error);
    submitError.value = error.response?.data?.message || error.message || `处理文章时发生未知错误。`;
    if (error.response?.status === 401 || error.response?.status === 403 || error.message?.includes('管理员未登录')) {
      submitError.value += ' 请检查是否已登录或联系管理员。';
    }
    // Keep modal open on error for correction, except for auth errors
    if (error.response?.status === 401 || error.response?.status === 403) {
      closeModal(); // Close modal on auth error
    }
  } finally {
    isSubmitting.value = false;
  }
};

const handleDeletePost = async (id, title) => {
  if (!confirm(`确定要删除文章 "${title}" 吗？此操作不可恢复。`)) {
    return;
  }
  console.log(`[AdminBlog] Attempting to delete post: ${id}`);
  try {
    await deleteBlogPostService(id);
    // Check if the deleted post was being edited in the modal and close it
    if (isEditing.value && postForm.id === id) {
      closeModal();
    }
    alert('文章删除成功！');
    await fetchAdminBlogPosts(); // Refresh list after delete
  } catch (error) {
    console.error(`[AdminBlog] Error deleting post ${id}:`, error);
    alert(error.response?.data?.message || error.message || '删除文章失败。');
  }
};

onMounted(() => {
  fetchAdminBlogPosts();
});
</script>

<style scoped>
.blog-management h2 {
    margin-top: 0;
    margin-bottom: 1.5rem;
    border-bottom: 1px solid #ccc;
    padding-bottom: 0.5rem;
}

/* Actions Bar Styles */
.actions-bar {
    margin-bottom: 2rem;
}
.add-new-btn {
    padding: 0.8rem 1.5rem;
    background-color: #3498db;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 1em;
    font-weight: 600;
    transition: background-color 0.2s;
}
.add-new-btn:hover {
    background-color: #2980b9;
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.6); /* Darker overlay */
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background-color: #fff;
  padding: 2rem 2.5rem; /* More padding */
  border-radius: 8px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
  position: relative;
  width: 90%;
  max-width: 700px; /* Limit max width */
  max-height: 90vh; /* Limit max height */
  overflow-y: auto; /* Allow scrolling for long forms */
}

.modal-close-btn {
  position: absolute;
  top: 1rem;
  right: 1.5rem;
  background: none;
  border: none;
  font-size: 1.8rem; /* Larger close button */
  color: #aaa;
  cursor: pointer;
  line-height: 1;
  padding: 0;
   transition: color 0.2s;
}
.modal-close-btn:hover {
    color: #333;
}

/* Form Styles (mostly unchanged, but ensure they work in modal) */
.create-post-form h3 {
  margin-top: 0; /* Remove top margin inside modal */
  margin-bottom: 1.5rem;
  color: #34495e;
}

.create-post-form h4 {
    margin-top: 2rem;
    margin-bottom: 1rem;
    padding-bottom: 0.3rem;
    border-bottom: 1px solid #eee;
    color: #555;
    font-size: 1.1em;
}

.form-group {
  margin-bottom: 1.2rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: #555;
  font-size: 0.95em;
}

.form-group input[type="text"],
.form-group input[type="url"],
.form-group textarea {
  width: 100%;
  padding: 0.7rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  box-sizing: border-box;
  font-size: 1em;
}

.form-group textarea {
  min-height: 80px;
  resize: vertical;
}
#content {
  min-height: 150px; /* Adjust height for modal */
}
#metaDescription {
    min-height: 60px;
}

.form-group small {
  font-size: 0.8em;
  color: #777;
  margin-top: 0.3em;
  display: block;
}

.form-actions {
  margin-top: 1.5rem;
  padding-top: 1.5rem; /* Add padding above actions */
  border-top: 1px solid #eee; /* Separator line */
  display: flex;
  justify-content: flex-end; /* Align buttons to the right */
  align-items: center;
}

.submit-btn {
  padding: 0.8rem 1.5rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 600;
  transition: background-color 0.2s, opacity 0.2s;
  background-color: #2ecc71;
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
  padding: 0.8rem 1.5rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 600;
  transition: background-color 0.2s, color 0.2s;
  background-color: #fff;
  color: #555;
  margin-left: 1rem;
}
.cancel-btn:hover:not(:disabled) {
  background-color: #f0f0f0;
}
.cancel-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.error {
  color: #e74c3c;
  margin-top: 1rem;
  font-weight: bold;
}

.success {
  color: #2ecc71;
  margin-top: 1rem;
  font-weight: bold;
}

/* Section Divider */
.section-divider {
    border: 0;
    height: 1px;
    background-color: #e0e0e0;
    margin: 2rem 0;
}

/* Post List Styles (mostly unchanged) */
.post-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.post-list-item {
  background-color: #fff;
  border: 1px solid #eee;
  border-radius: 4px;
  margin-bottom: 1rem;
  padding: 1rem 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: box-shadow 0.2s ease-in-out;
}
.post-list-item:hover {
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.post-info {
  flex-grow: 1;
  margin-right: 1rem;
  display: flex; /* Use flexbox for info layout */
  flex-direction: column; /* Stack title, date, slug vertically */
}

.post-title {
  font-weight: 600;
  font-size: 1.1em;
  color: #34495e;
  margin-bottom: 0.2em; /* Space between title and date/slug */
}

.post-date {
  font-size: 0.85em;
  color: #7f8c8d;
  margin-bottom: 0.2em; /* Space between date and slug */
}

.post-slug {
    font-size: 0.8em;
    color: #95a5a6; /* Lighter color for slug */
    font-family: monospace;
}

.post-actions button {
  margin-left: 0.5rem;
  padding: 0.4rem 0.8rem;
  font-size: 0.9em;
  border-radius: 3px;
  cursor: pointer;
  border: 1px solid transparent;
  transition: background-color 0.2s, border-color 0.2s, color 0.2s;
}

.action-btn.edit-btn {
  background-color: #3498db;
  color: white;
  border-color: #3498db;
}
.action-btn.edit-btn:hover {
  background-color: #2980b9;
  border-color: #2980b9;
}

.action-btn.delete-btn {
  background-color: #e74c3c;
  color: white;
  border-color: #e74c3c;
}
.action-btn.delete-btn:hover {
  background-color: #c0392b;
  border-color: #c0392b;
}

.loading,
.no-posts {
  text-align: center;
  color: #7f8c8d;
  padding: 1rem;
}

</style> 