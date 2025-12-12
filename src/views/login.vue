<template>
  <div class="login-container">
    <div class="login-card">
      <div class="header">
        <h2 class="title">XChat</h2>
        <p class="subtitle">{{ isFnMode ? '登录您的账号' : '选择一个账号登录' }}</p>
      </div>

      <div v-if="!isFnMode && historyUsers.length > 0" class="account-list-container">
        <div class="account-grid">
          <div 
            v-for="user in historyUsers" 
            :key="user.id" 
            class="account-item"
            @click="selectUser(user)"
          >
            <div class="account-avatar-wrapper">
               <img v-if="user.avatar" :src="user.avatar" class="account-avatar" />
               <div v-else class="account-avatar placeholder">{{ user.nickname.charAt(0) }}</div>
               <div class="delete-btn" @click.stop="removeHistory(user)">×</div>
            </div>
            <span class="account-name">{{ user.nickname }}</span>
            <span class="account-email">{{ user.email }}</span>
          </div>

          <div class="account-item add-account" @click="switchToForm(null)">
            <div class="add-icon">+</div>
            <span class="account-name">添加账号</span>
          </div>
        </div>
      </div>

      <form v-else @submit.prevent="handleLogin" class="login-form">
        
        <div v-if="targetUser" class="selected-user-display">
          <img v-if="targetUser.avatar" :src="targetUser.avatar" class="big-avatar" />
          <div v-else class="big-avatar placeholder">{{ targetUser.nickname.charAt(0) }}</div>
          <h3 class="user-greeting">Hi, {{ targetUser.nickname }}</h3>
        </div>

        <div class="form-group">
          <label>邮箱</label>
          <input 
            type="text" 
            v-model="form.email" 
            placeholder="请输入邮箱" 
            required 
            :disabled="!!targetUser" 
            :class="{ 'input-readonly': !!targetUser }"
          />
        </div>
        
        <div class="form-group">
          <label>密码</label>
          <input 
            type="password" 
            v-model="form.password" 
            placeholder="请输入密码" 
            required 
            ref="passwordInput"
          />
        </div>

        <button type="submit" :disabled="loading" class="btn-primary">
          {{ loading ? '登录中...' : '登 录' }}
        </button>

        <div class="footer-actions">
           <a v-if="targetUser || historyUsers.length > 0" @click="backToList" class="link secondary">
             {{ targetUser ? '← 切换账号' : '← 返回列表' }}
           </a>
           
           <div class="right-links">
             <span class="text-gray">没有账号？</span>
             <a @click.prevent="goToRegister" class="link">立即注册</a>
           </div>
        </div>
      </form>

    </div>
  </div>
</template>

<script setup>
import { reactive, ref, onMounted, nextTick } from 'vue';
import { useRouter } from 'vue-router';
import { loginUser } from '@/api/chat';
import { useUserStore } from '@/stores/user';
import { ElMessage } from 'element-plus';

const router = useRouter();
const userStore = useUserStore();
const loading = ref(false);
const passwordInput = ref(null);

// 历史记录 Key
const HISTORY_KEY = 'xchat_user_history';

// 状态
const historyUsers = ref([]);
const targetUser = ref(null); // 当前选中的历史用户对象
const isFnMode = ref(true); // 是否显示表单模式

const form = reactive({ 
    email: '', 
    password: '' 
});

onMounted(() => {
  loadHistory();
  // 如果有历史记录，默认显示列表模式
  if (historyUsers.value.length > 0) {
    isFnMode.value = false;
  }
});

// 加载历史记录
const loadHistory = () => {
  try {
    const json = localStorage.getItem(HISTORY_KEY);
    if (json) {
      historyUsers.value = JSON.parse(json);
    }
  } catch (e) {
    console.error("读取历史记录失败", e);
    localStorage.removeItem(HISTORY_KEY);
  }
};

// 选择某个历史用户登录
const selectUser = (user) => {
  targetUser.value = user;
  form.email = user.email;
  form.password = ''; // 清空密码
  isFnMode.value = true;
  
  // 自动聚焦密码框
  nextTick(() => {
    if (passwordInput.value) passwordInput.value.focus();
  });
};

// 切换到普通表单（新账号）
const switchToForm = () => {
  targetUser.value = null;
  form.email = '';
  form.password = '';
  isFnMode.value = true;
};

// 返回列表
const backToList = () => {
  if (historyUsers.value.length > 0) {
    isFnMode.value = false;
    targetUser.value = null;
  } else {
    // 如果没有列表，就只是清空选中状态
    targetUser.value = null;
    form.email = '';
  }
};

// 删除历史记录
const removeHistory = (user) => {
  historyUsers.value = historyUsers.value.filter(u => u.id !== user.id);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(historyUsers.value));
  if (historyUsers.value.length === 0) {
    switchToForm();
  }
};

// 保存登录成功的一条记录
const saveToHistory = (userInfo) => {
  // 1. 先过滤掉已存在的同名账号（避免重复，且更新最新头像/昵称）
  let list = historyUsers.value.filter(u => u.email !== userInfo.email);
  // 2. 插入到最前面
  list.unshift({
    id: userInfo.id,
    nickname: userInfo.nickname,
    email: userInfo.email,
    avatar: userInfo.avatar
  });
  // 3. 限制只存最近5个
  if (list.length > 5) list = list.slice(0, 5);
  
  localStorage.setItem(HISTORY_KEY, JSON.stringify(list));
};

const goToRegister = () => {
  router.push('/register');
};

const handleLogin = async () => {
  loading.value = true;
  try {
    // 修复点：正确声明变量 const res
    const res = await loginUser(form);
    
    if (res.code === 200) {
        userStore.setToken(res.token);
        userStore.setUser(res.userInfo);
        
        // 记录到历史
        saveToHistory(res.userInfo);

        ElMessage.success('登录成功');
        router.push('/chat'); 
    } else {
        ElMessage.error(res.msg || '登录失败');
    }
  } catch (error) {
    console.error(error);
    ElMessage.error('登录请求失败，请检查网络');
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
}

.login-card {
  width: 100%;
  max-width: 420px;
  background: white;
  padding: 40px;
  border-radius: 20px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  text-align: center;
  transition: all 0.3s ease;
}

.header { margin-bottom: 30px; }
.title { margin: 0; color: #333; font-weight: 700; font-size: 28px; letter-spacing: 1px; }
.subtitle { color: #888; margin-top: 8px; font-size: 14px; }

/* === 账号列表样式 === */
.account-list-container {
  display: flex;
  justify-content: center;
}

.account-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
  width: 100%;
}

.account-item {
  background: #f8f9fa;
  border: 1px solid #eee;
  border-radius: 12px;
  padding: 20px 10px;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  transition: all 0.2s;
  position: relative;
}

.account-item:hover {
  background: #fff;
  border-color: #4a90e2;
  transform: translateY(-3px);
  box-shadow: 0 5px 15px rgba(74, 144, 226, 0.15);
}

.account-avatar-wrapper { position: relative; margin-bottom: 10px; }
.account-avatar {
  width: 60px; height: 60px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #fff;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}
.account-avatar.placeholder {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  display: flex; align-items: center; justify-content: center;
  font-size: 24px; font-weight: bold;
}

.delete-btn {
  position: absolute;
  top: -5px; right: -5px;
  width: 20px; height: 20px;
  background: #ff4d4f;
  color: white;
  border-radius: 50%;
  font-size: 14px; line-height: 18px;
  display: none;
  justify-content: center; align-items: center;
}
.account-item:hover .delete-btn { display: flex; }

.account-name { font-size: 14px; font-weight: 600; color: #333; margin-bottom: 4px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 100%; }
.account-email { font-size: 12px; color: #999; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 100%; }

.add-account {
  border: 1px dashed #ccc;
  justify-content: center;
}
.add-account .add-icon {
  width: 50px; height: 50px;
  border-radius: 50%;
  background: #f0f0f0;
  color: #999;
  font-size: 30px;
  display: flex; align-items: center; justify-content: center;
  margin-bottom: 10px;
}
.add-account:hover .add-icon {
  background: #4a90e2; color: white;
}

/* === 选中用户展示 === */
.selected-user-display {
  margin-bottom: 25px;
  animation: fadeIn 0.4s ease;
}
.big-avatar {
  width: 80px; height: 80px;
  border-radius: 50%;
  margin: 0 auto 10px;
  display: block;
  border: 3px solid white;
  box-shadow: 0 5px 15px rgba(0,0,0,0.1);
  object-fit: cover;
}
.big-avatar.placeholder {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  display: flex; align-items: center; justify-content: center;
  font-size: 32px; font-weight: bold;
}
.user-greeting { margin: 0; color: #444; font-size: 18px; }

/* === 表单样式 === */
.form-group { margin-bottom: 20px; text-align: left; }
.form-group label { display: block; font-size: 13px; color: #666; margin-bottom: 8px; font-weight: 500; }

input {
  width: 100%;
  padding: 12px 15px;
  border: 1px solid #e0e0e0;
  border-radius: 10px;
  outline: none;
  transition: all 0.3s;
  box-sizing: border-box;
  background: #f9f9f9;
}
input:focus { border-color: #4a90e2; background: white; box-shadow: 0 0 0 3px rgba(74, 144, 226, 0.1); }
.input-readonly { background-color: #f2f2f2; color: #888; cursor: not-allowed; }

.btn-primary {
  width: 100%;
  padding: 14px;
  background: linear-gradient(to right, #4a90e2, #357abd);
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  margin-top: 10px;
}
.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(74, 144, 226, 0.3);
}
.btn-primary:disabled { background: #a0cfff; cursor: not-allowed; transform: none; }

.footer-actions {
  margin-top: 25px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 14px;
}

.text-gray { color: #999; }
.link { color: #4a90e2; cursor: pointer; font-weight: 500; text-decoration: none; }
.link:hover { text-decoration: underline; }
.link.secondary { color: #888; }
.link.secondary:hover { color: #555; }

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>