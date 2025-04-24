import axios from 'axios';

// 从环境变量获取 API 基础 URL，如果没有则使用相对路径（适用于 Vercel 等部署）
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

// 创建一个 axios 实例，可以配置基础 URL 和超时等
const apiClient = axios.create({
  baseURL: `${API_BASE_URL}/api`, // 假设所有博客 API 都在 /api 路径下
  timeout: 10000, // 请求超时时间 10 秒
});

/**
 * 获取博客文章列表
 * @returns {Promise<Array>} 包含博客文章对象的数组 (id 和 slug)
 */
export const getBlogPosts = async () => {
  try {
    const response = await apiClient.get('/blog');
    return response.data;
  } catch (error) {
    console.error('Error fetching blog posts:', error);
    throw error;
  }
};

/**
 * 根据 Slug 获取单篇博客文章
 * @param {string} slug - 文章 Slug
 * @returns {Promise<Object>} 包含博客文章详情的对象
 */
export const getBlogPostBySlug = async (slug) => {
  if (!slug) {
      console.error('getBlogPostBySlug called with empty slug');
      throw new Error('文章 slug 不能为空');
  }
  try {
    console.log(`[blogService] Fetching post by slug: ${slug}`);
    const response = await apiClient.get(`/blog/slug/${slug}`); // Use the new backend route
    console.log(`[blogService] Received post data for slug ${slug}:`, response.data);
    return response.data;
  } catch (error) {
    console.error(`Error fetching blog post with slug ${slug}:`, error);
    throw error;
  }
};

/**
 * 根据 ID 获取单篇博客文章 (保留, 可能内部使用)
 * @param {string} id - 文章 UUID
 * @returns {Promise<Object>} 包含博客文章详情的对象
 */
export const getBlogPostById = async (id) => {
  if (!id) {
      console.error('getBlogPostById called with empty id');
      throw new Error('文章 ID 不能为空');
  }
  try {
    const response = await apiClient.get(`/blog/${id}`); // Keep using the ID route
    return response.data;
  } catch (error) {
    console.error(`Error fetching blog post with id ${id}:`, error);
    throw error;
  }
};

/**
 * 创建新的博客文章
 * @param {object} postData - 包含所有字段的对象 (title, content, slug, summary, meta*, image*, etc.)
 * @returns {Promise<Object>} 创建成功的文章对象
 */
export const createBlogPost = async (postData) => {
  const token = localStorage.getItem('adminToken');
  if (!token) {
    console.error('Admin token not found for creating post.');
    throw new Error('管理员未登录或 Token 已失效。');
  }

  // Basic check for required fields before sending
  if (!postData.title || !postData.content || !postData.slug) {
      console.error('Missing required fields for creating post:', postData);
      throw new Error('缺少必要的文章字段 (标题, 内容, Slug)。');
  }

  try {
    console.log('[blogService] Creating post with data:', postData);
    const response = await apiClient.post('/blog', postData, {
      headers: {
        'Authorization': `Bearer ${token}`,
      }
    });
    console.log('[blogService] Post created successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error creating blog post:', error.response?.data || error.message);
    throw error;
  }
};

/**
 * 删除博客文章
 * @param {string} id - 文章 UUID
 * @returns {Promise<void>}
 */
export const deleteBlogPost = async (id) => {
  const token = localStorage.getItem('adminToken');
  if (!token) {
    console.error('Admin token not found for deleting post.');
    throw new Error('管理员未登录或 Token 已失效。');
  }

  try {
    const response = await apiClient.delete(`/blog/${id}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    if (response.status === 200 || response.status === 204) {
      console.log(`Blog post ${id} deleted successfully.`);
      return;
    } else {
      throw new Error(`Unexpected status code ${response.status} when deleting post ${id}`);
    }
  } catch (error) {
    console.error(`Error deleting blog post ${id}:`, error.response?.data || error.message);
    throw error;
  }
};

/**
 * 更新博客文章
 * @param {string} id - 文章 UUID
 * @param {object} updatedData - 包含要更新字段的对象 (title, content, slug, etc.)
 * @returns {Promise<Object>} 更新后的文章对象
 */
export const updateBlogPost = async (id, updatedData) => {
  const token = localStorage.getItem('adminToken');
  if (!token) {
    console.error('Admin token not found for updating post.');
    throw new Error('管理员未登录或 Token 已失效。');
  }

  // Basic check before sending
  if (!id || !updatedData || Object.keys(updatedData).length === 0) {
      console.error('Invalid arguments for updateBlogPost:', id, updatedData);
       throw new Error('更新文章时缺少 ID 或更新数据。');
  }

  try {
    console.log(`[blogService] Updating post ${id} with data:`, updatedData);
    const response = await apiClient.put(`/blog/${id}`, updatedData, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
     console.log(`[blogService] Post ${id} updated successfully:`, response.data);
    return response.data;
  } catch (error) {
    console.error(`Error updating blog post ${id}:`, error.response?.data || error.message);
    throw error;
  }
};

// 可以根据需要添加其他 API 调用函数，例如创建、更新、删除等 