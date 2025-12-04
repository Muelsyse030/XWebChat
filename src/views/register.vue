<template>
  <div class="login-container">
    <div class="login-card">
      <h2 class="title">注册您的账号</h2>
      <p class="subtitle"></p>
      
      <form @submit.prevent="handleRegister" class="login-form">
        <div class="form-group">
          <label>邮箱</label>
          <input type="text" v-model="form.email" placeholder="在这里填写邮箱" required />
        </div>

        <div class="form-group">
          <label>昵称</label>
          <input type="text" v-model="form.nickname" placeholder="在这里填写昵称" required />
        </div>

        <div class="form-group">
          <label>密码</label>
          <input type="password" v-model="form.password" placeholder="在这里填写密码" required />
        </div>

        <div class="form-group">
          <label>确认密码</label>
          <input type="password" v-model="confirmPassword" placeholder="在这里再次输入密码" required />
          <p v-if="passwordMismatch" class="error-text">两次输入的密码不一致</p>
        </div>

        <button type="submit" :disabled="loading || passwordMismatch" class="btn-primary">
          {{ loading ? '注册中...' : '立即注册' }}
        </button>

        <div class="footer-links">
          <span class="text-gray">已有账号？</span>
          <a @click.prevent="goToLogin" class="link">去登录</a>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref, computed } from 'vue';
import { useRouter } from 'vue-router';
// import { registerUser } from '@/api/chat'; // 预留接口引入

const router = useRouter();
const loading = ref(false);
const confirmPassword = ref('');

const form = reactive({
  username: '',
  nickname: '',
  password: ''
});

// 计算属性：检查密码是否一致
const passwordMismatch = computed(() => {
  return form.password && confirmPassword.value && form.password !== confirmPassword.value;
});

const handleRegister = async () => {
  if (passwordMismatch.value) return;
  
  loading.value = true;
  try {
    // 模拟注册请求
    // await registerUser(form);
    
    console.log('注册信息提交:', form);
    
    // 模拟延迟
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    alert('注册成功！请登录');
    router.push('/login');
    
  } catch (error) {
    alert('注册失败: ' + (error.message || '请稍后重试'));
  } finally {
    loading.value = false;
  }
};

const goToLogin = () => {
  router.push('/login');
};
</script>

<style scoped>
/* 复用 Login.vue 的大部分样式，保持风格统一 */
.login-container {
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #f5f7fa;
}

.login-card {
  width: 100%;
  max-width: 400px;
  background: white;
  padding: 40px;
  border-radius: 16px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.05);
  text-align: center;
}

.title { margin-bottom: 8px; color: #333; font-weight: 600; }
.subtitle { color: #999; margin-bottom: 30px; font-size: 14px; }

.form-group { margin-bottom: 20px; text-align: left; }
.form-group label { display: block; font-size: 14px; color: #666; margin-bottom: 8px; }

input {
  width: 100%;
  padding: 12px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  outline: none;
  transition: border-color 0.3s;
  box-sizing: border-box;
}

input:focus { border-color: #4a90e2; }

.error-text {
  color: #ff4d4f;
  font-size: 12px;
  margin-top: 5px;
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
  margin-top: 10px;
}

.btn-primary:hover { background-color: #357abd; }
.btn-primary:disabled { background-color: #a0cfff; cursor: not-allowed; }

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