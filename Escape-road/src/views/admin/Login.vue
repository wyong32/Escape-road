<template>
  <div class="login-container">
    <div class="login-box">
      <h2>管理员登录</h2>
      <form @submit.prevent="handleLogin">
        <div class="form-group">
          <label for="username">用户名</label>
          <input
            type="text"
            id="username"
            v-model="username"
            required
            placeholder="请输入用户名"
          />
        </div>
        <div class="form-group">
          <label for="password">密码</label>
          <input
            type="password"
            id="password"
            v-model="password"
            required
            placeholder="请输入密码"
          />
        </div>
        <button type="submit" :disabled="loading">
          {{ loading ? '登录中...' : '登录' }}
        </button>
        <p v-if="error" class="error">{{ error }}</p>
      </form>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

export default {
  name: 'AdminLogin',
  setup() {
    const router = useRouter()
    const username = ref('')
    const password = ref('')
    const loading = ref(false)
    const error = ref('')

    const handleLogin = async () => {
      console.log("handleLogin started. Token:", localStorage.getItem('adminToken'));
      try {
        loading.value = true;
        error.value = null;
        const baseUrl = import.meta.env.VITE_API_BASE_URL || '';
        console.log('Attempting login with:', { username: username.value });
        console.log('[DEBUG] VITE_API_BASE_URL is:', baseUrl); // Log the base URL
        const loginUrl = `${baseUrl}/admin/login`;
        console.log('[DEBUG] Full login URL is:', loginUrl); // Log the full URL

        // --- TEMPORARY FETCH TEST ---
        /* try {
          console.log('[DEBUG] Testing fetch to jsonplaceholder...');
          const testResponse = await fetch('https://jsonplaceholder.typicode.com/todos/1');
          console.log('[DEBUG] Test fetch response status:', testResponse.status);
          const testData = await testResponse.json();
          console.log('[DEBUG] Test fetch data:', testData);
        } catch (testErr) {
          console.error('[DEBUG] Test fetch failed:', testErr);
        } */
        // --- END TEMPORARY FETCH TEST ---

        console.log("Sending actual fetch request to:", loginUrl);
        const response = await fetch(loginUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            username: username.value.trim(),
            password: password.value
          }),
        });
        console.log("Fetch response received. Status:", response.status);

        if (!response.ok) {
          const errorData = await response.json();
          console.error("Login API Error Data:", errorData);
          throw new Error(errorData.message || 'Login failed');
        }

        const data = await response.json();
        console.log("Login successful. Data:", data);
        localStorage.setItem('adminToken', data.token);
        router.push('/admin/dashboard');
      } catch (err) {
        console.error('Login error caught in catch block:', err);
        error.value = err.message || '登录失败，请重试';
      } finally {
        loading.value = false;
        console.log("handleLogin finished.");
      }
    }

    return {
      username,
      password,
      loading,
      error,
      handleLogin,
    }
  },
}
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f5f5f5;
}

.login-box {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
}

h2 {
  text-align: center;
  margin-bottom: 2rem;
  color: #333;
}

.form-group {
  margin-bottom: 1.5rem;
}

label {
  display: block;
  margin-bottom: 0.5rem;
  color: #666;
}

input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
}

input:focus {
  outline: none;
  border-color: #4a90e2;
}

button {
  width: 100%;
  padding: 0.75rem;
  background-color: #4a90e2;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.2s;
}

button:hover {
  background-color: #357abd;
}

button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.error {
  color: #dc3545;
  margin-top: 1rem;
  text-align: center;
}
</style> 