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
// import { loginUser } from '@/api/chat'; // 实际使用时解开注释

const router = useRouter();
const loading = ref(false);
const form = reactive({ username: '', password: '' });
const goToRegister = () => {
  router.push('/register');
};

const handleLogin = async () => {
  loading.value = true;
  try {
    // 模拟登录请求
    // const res = await loginUser(form);
    // localStorage.setItem('token', res.data.token);
    console.log('登录成功', form);
    setTimeout(() => {
      router.push('/chat'); // 跳转到聊天页
    }, 1000);
  } catch (error) {
    alert('登录失败');
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