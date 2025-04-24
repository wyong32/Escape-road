<template>
  <div class="dashboard-container">
    <header class="dashboard-header">
      <h1>管理面板</h1>
      <button @click="handleLogout" class="logout-btn">退出登录</button>
    </header>
    <div class="dashboard-body">
      <!-- 添加侧边栏 -->
      <aside class="sidebar">
        <nav>
          <ul>
            <li>
              <!-- 链接到评论评分管理子路由 -->
              <router-link to="/admin/dashboard/comments">评论评分管理</router-link>
            </li>
            <li>
              <!-- 链接到博客管理子路由 -->
              <router-link to="/admin/dashboard/blog">博客管理</router-link>
            </li>
            <!-- 可以添加更多管理项 -->
          </ul>
        </nav>
      </aside>

      <!-- 主内容区域，使用 RouterView 显示子路由组件 -->
      <main class="main-content">
        <RouterView />
        <!-- 原来的评论评分管理内容将被移到子路由组件中 -->
      </main>
    </div>
  </div>
</template>

<script>
import { useRouter } from 'vue-router'

export default {
  name: 'AdminDashboard',
  setup() {
    const router = useRouter()

    const handleLogout = () => {
      localStorage.removeItem('adminToken')
      router.push('/admin/login')
    }

    // 其他数据获取、模态框、提交等逻辑需要移到子组件
    // 例如 CommentRatingManagement.vue

    return {
      handleLogout
    }
  }
}
</script>

<style scoped>
.dashboard-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 30px;
  background-color: #2c3e50; /* 深色背景 */
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.dashboard-header h1 {
  margin: 0;
  color: #ecf0f1; /* 浅色文字 */
  font-size: 1.8em;
}

.logout-btn {
  padding: 8px 15px;
  background-color: #e74c3c; /* 红色 */
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.logout-btn:hover {
  background-color: #c0392b;
}

.dashboard-body {
  display: flex;
  flex-grow: 1; /* 占据剩余高度 */
}

.sidebar {
  width: 220px; /* 侧边栏宽度 */
  background-color: #34495e; /* 侧边栏背景色 */
  padding: 20px 0;
  color: #ecf0f1;
  flex-shrink: 0; /* 防止侧边栏被压缩 */
}

.sidebar nav ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.sidebar nav li {
  margin: 0;
}

.sidebar nav a {
  display: block;
  padding: 12px 20px;
  color: #ecf0f1;
  text-decoration: none;
  transition: background-color 0.2s ease, color 0.2s ease;
  border-left: 3px solid transparent; /* 用于激活状态指示 */
}

.sidebar nav a:hover {
  background-color: #4a637c;
}

/* 使用 vue-router 的激活类 */
.sidebar nav a.router-link-exact-active {
  background-color: #2c3e50;
  color: #fff;
  font-weight: bold;
  border-left-color: #3498db; /* 激活状态指示颜色 */
}

.main-content {
  flex-grow: 1; /* 占据剩余宽度 */
  padding: 30px;
  background-color: #ecf0f1; /* 主内容区背景色 */
  overflow-y: auto; /* 如果内容过多，允许滚动 */
}

/* 移除原有的 dashboard-content 样式，因为它现在由 main-content 控制 */
/* .dashboard-content { ... } */
/* ...其他原有的 game-section, modal 等样式也应移到子组件... */

</style> 