<template>
  <div class="profile-container">
    <div class="profile-card">
      <div class="card-header">
        <button class="btn-back" @click="goBack">← 返回</button>
        <h2>个人信息</h2>
      </div>

      <div class="card-body">
        <div class="avatar-section">
          <div class="avatar-wrapper" @click="triggerFileUpload">
            <img v-if="form.avatar" :src="form.avatar" alt="Avatar" class="avatar-img" />
            <div v-else class="avatar-placeholder">{{ form.nickname?.charAt(0) || 'U' }}</div>
            
            <div class="avatar-overlay">
              <span>更换</span>
            </div>
          </div>
          <p class="tip">点击头像更换图片</p>
          <input type="file" ref="fileInput" style="display: none" @change="handleFileChange" accept="image/*" />
        </div>

        <form @submit.prevent="handleSave">
          <div class="form-group" style="display:none">
             <input type="text" v-model="form.id" />
          </div>

          <div class="form-group">
            <label>邮箱 (账号)</label>
            <input type="email" v-model="form.email" disabled class="input-disabled" />
          </div>

          <div class="form-group">
            <label>昵称</label>
            <input type="text" v-model="form.nickname" placeholder="大家都怎么称呼你？" required />
          </div>

          <div class="form-group">
            <label>个性签名</label>
            <textarea v-model="form.bio" placeholder="介绍一下自己..." rows="3"></textarea>
          </div>

          <div class="btn-group">
            <button type="button" class="btn-cancel" @click="goBack">取消</button>
            <button type="submit" class="btn-save" :disabled="loading">
              {{ loading ? '保存中...' : '保存修改' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '@/stores/user';
import { updateUserInfo, uploadAvatar } from '@/api/chat'; // 引入API

const router = useRouter();
const userStore = useUserStore();
const loading = ref(false);
const fileInput = ref(null);

const form = reactive({
  id: null,
  nickname: '',
  bio: '',
  email: '',
  avatar: ''
});

// 初始化：从 Store 中加载数据到表单
onMounted(() => {
  const currentUser = userStore.userInfo;
  if (currentUser) {
    form.id = currentUser.id;
    form.nickname = currentUser.nickname || '';
    form.bio = currentUser.bio || '';
    form.email = currentUser.email || '';
    form.avatar = currentUser.avatar || '';
  }
});

const goBack = () => {
  router.push('/chat');
};

const triggerFileUpload = () => {
  fileInput.value.click();
};

// 处理文件选择并上传
const handleFileChange = async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const formData = new FormData();
  formData.append('file', file);

  try {
    // 1. 上传文件
    const res = await uploadAvatar(formData);
    if (res.code === 200) {
      // 2. 上传成功，回显图片 URL
      form.avatar = res.url;
    } else {
      alert('图片上传失败: ' + res.msg);
    }
  } catch (error) {
    console.error(error);
    alert('上传出错');
  }
};

// 保存所有信息
const handleSave = async () => {
  loading.value = true;
  try {
    // 1. 调用更新接口
    const res = await updateUserInfo(form);
    
    if (res.code === 200) {
      alert('保存成功！');
      
      // 2. 关键步骤：更新 Pinia Store 和 LocalStorage
      // 这样 Chat 页面不需要刷新就能看到新头像和昵称
      userStore.setUser(res.userInfo);
      
      goBack();
    } else {
      alert('保存失败: ' + res.msg);
    }
  } catch (error) {
    console.error(error);
    alert('保存请求异常');
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.profile-container {
  min-height: 100vh;
  background-color: #f5f7fa;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding-top: 50px;
}

.profile-card {
  width: 100%;
  max-width: 500px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  overflow: hidden;
}

.card-header {
  padding: 20px;
  border-bottom: 1px solid #eee;
  display: flex;
  align-items: center;
  position: relative;
}

.card-header h2 {
  flex: 1;
  text-align: center;
  margin: 0;
  font-size: 18px;
  color: #333;
}

.btn-back {
  background: none;
  border: none;
  color: #666;
  font-size: 14px;
  cursor: pointer;
  position: absolute;
  left: 20px;
}
.btn-back:hover { color: #4a90e2; }

.card-body {
  padding: 30px;
}

/* 头像样式 */
.avatar-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 30px;
}

.avatar-wrapper {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  overflow: hidden;
  position: relative;
  cursor: pointer;
  border: 2px solid #e0e0e0;
}

.avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-placeholder {
  width: 100%;
  height: 100%;
  background: #4a90e2;
  color: white;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 32px;
}

.avatar-overlay {
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  opacity: 0;
  transition: opacity 0.2s;
}

.avatar-overlay span {
  color: white;
  font-size: 12px;
}

.avatar-wrapper:hover .avatar-overlay {
  opacity: 1;
}

.tip {
  font-size: 12px;
  color: #999;
  margin-top: 8px;
}

/* 表单样式 */
.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  font-size: 14px;
  color: #666;
  margin-bottom: 8px;
}

input, textarea {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 14px;
  outline: none;
  transition: border-color 0.2s;
  box-sizing: border-box; /* 关键：防止padding撑大 */
  font-family: inherit;
}

input:focus, textarea:focus {
  border-color: #4a90e2;
}

textarea {
  resize: vertical;
}

.input-disabled {
  background-color: #f9f9f9;
  color: #999;
  cursor: not-allowed;
}

/* 按钮组 */
.btn-group {
  display: flex;
  gap: 15px;
  margin-top: 30px;
}

button {
  flex: 1;
  padding: 12px;
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
  border: none;
  transition: opacity 0.2s;
}

.btn-cancel {
  background: #f0f0f0;
  color: #666;
}

.btn-save {
  background: #4a90e2;
  color: white;
}

.btn-save:disabled {
  background: #a0cfff;
  cursor: not-allowed;
}

button:hover:not(:disabled) {
  opacity: 0.9;
}
</style>