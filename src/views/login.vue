<template>
  <div class="login-container">
    <div class="login-card">
      <h2 class="title">Welcome Back</h2>
      <p class="subtitle">登录即时通讯系统</p>
      
      <form @submit.prevent="handleLogin" class="login-form">
        <div class="form-group">
          <label>邮箱</label>
          <input type="text" v-model="form.email" placeholder="请输入邮箱" required />
        </div>
        
        <div class="form-group">
          <label>密码</label>
          <input type="password" v-model="form.password" placeholder="请输入密码" required />
        </div>

        <button type="submit" :disabled="loading" class="btn-primary">
          {{ loading ? '登录中...' : '登 录' }}
        </button>
        <div class="footer-links">
          <span class="text-gray">还没有账号？</span>
          <a @click.prevent="goToRegister" class="link">立即注册</a>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import { loginUser } from '@/api/chat'; // 引入 API
import { useUserStore } from '@/stores/user'; // 引入 Pinia

const router = useRouter();
const userStore = useUserStore(); // 使用 store
const loading = ref(false);

const form = reactive({ 
    email: '', // 后端是 findByEmail，所以这里要是 email
    password: '' 
});

const goToRegister = () => {
  router.push('/register');
};

const handleLogin = async () => {
  loading.value = true;
  try {
    // 1. 调用真实接口
    const res = await loginUser(form);
    
    if (res.code === 200) {
        // 2. 保存 Token 和用户信息到 Pinia/LocalStorage
        userStore.setToken(res.token);
        userStore.setUser(res.userInfo);
        
        console.log('登录成功', res.userInfo);
        router.push('/chat'); 
    } else {
        alert(res.msg || '登录失败');
    }
  } catch (error) {
    console.error(error);
    alert('登录请求失败');
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.login-container {
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #f5f7fa; /* 浅灰色背景 */
}

.login-card {
  width: 100%;
  max-width: 400px;
  background: white;
  padding: 40px;
  border-radius: 16px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.05); /* 柔和阴影 */
  text-align: center;
}

.title {
  margin-bottom: 8px;
  color: #333;
  font-weight: 600;
}

.subtitle {
  color: #999;
  margin-bottom: 30px;
  font-size: 14px;
}

.form-group {
  margin-bottom: 20px;
  text-align: left;
}

.form-group label {
  display: block;
  font-size: 14px;
  color: #666;
  margin-bottom: 8px;
}

input {
  width: 100%;
  padding: 12px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  outline: none;
  transition: border-color 0.3s;
  box-sizing: border-box;
}

input:focus {
  border-color: #4a90e2;
}

.btn-primary {
  width: 100%;
  padding: 12px;
  background-color: #4a90e2;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  cursor: pointer;
  transition: background 0.3s;
}

.btn-primary:hover {
  background-color: #357abd;
}

.btn-primary:disabled {
  background-color: #a0cfff;
  cursor: not-allowed;
}
/* 新增样式 */
.footer-links {
  margin-top: 20px;
  font-size: 14px;
}

.text-gray { color: #999; }

.link {
  color: #4a90e2;
  cursor: pointer;
  margin-left: 5px;
  font-weight: 500;
}

.link:hover { text-decoration: underline; }
</style>