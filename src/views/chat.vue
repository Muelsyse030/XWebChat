<template>
  <div class="chat-background">
    <div class="chat-card">
      
      <aside class="sidebar">
        <div class="user-profile" @click="goToProfile" title="点击修改个人信息">
          <img v-if="userStore.userInfo.avatar" :src="userStore.userInfo.avatar" class="avatar" style="object-fit: cover;" />
          <div v-else class="avatar">
            {{ userStore.userInfo.nickname ? userStore.userInfo.nickname.charAt(0).toUpperCase() : 'Me' }}
          </div>
          <div class="user-info-text">
            <span class="username">{{ userStore.userInfo.nickname || '我的账号' }}</span>
            <span class="status-text">● 在线</span>
          </div>
        </div>
        
        <div class="add-friend-bar">
          <span class="section-title">好友列表</span>
          <button class="btn-add" @click="openAddFriend" title="添加好友">+</button>
        </div>

        <div class="contact-list">
          <div v-if="contacts.length === 0" class="no-contacts">
            暂无好友，点击 "+" 添加
          </div>
          <div 
            v-for="user in contacts" 
            :key="user.id" 
            class="contact-item"
            :class="{ active: currentContact?.id === user.id }"
            @click="selectContact(user)"
          >
            <img v-if="user.avatar" :src="user.avatar" class="avatar-small" style="object-fit: cover;" />
            <div v-else class="avatar-small">
              {{ user.nickname ? user.nickname.charAt(0).toUpperCase() : 'U' }}
            </div>
            <div class="info">
              <div class="name">{{ user.nickname }}</div>
              <div class="status-dot" :class="{ online: user.online }"></div>
            </div>
          </div>
        </div>
      </aside>

      <main class="chat-area">
        <template v-if="currentContact">
          <header class="chat-header">
            <div class="header-name-wrapper">
              <h3>{{ currentContact.nickname }}</h3>
              <span class="status-badge" :class="{ 'is-online': currentContact.online }">
                {{ currentContact.online ? '● 在线' : '● 离线' }}
              </span>
            </div>
          </header>

          <div class="message-list" ref="msgContainer">
            <div v-for="msg in messages" :key="msg.id" class="message-row" :class="{ 'mine': msg.isMine }">
              <div class="bubble">
                <img 
                  v-if="msg.content.startsWith('img:')" 
                  :src="msg.content.substring(4)" 
                  style="max-width: 200px; border-radius: 8px; cursor: pointer;" 
                  @click="window.open(msg.content.substring(4))"
                  />
                  <span v-else>{{ msg.content }}</span>
                </div>
              <span class="msg-time">{{ formatTime(msg.createdAt) }}</span>
            </div>
          </div>

          <div class="input-area">
            <textarea v-model="inputContent" placeholder="输入消息..." @keydown.enter.prevent="sendMessage"></textarea>
            <input type="file" ref="imgInput" style="display:none" accept="image/*" @change="handleSendImage" />
            <button class="btn-icon" @click="$refs.imgInput.click()" title="发送图片">🖼️</button>
            <button @click="sendMessage"><span class="send-icon">➤</span></button>
          </div>
        </template>

        <div v-else class="empty-state">
          <div class="empty-icon">👋</div>
          <p>选择一个好友开始聊天</p>
        </div>
      </main>
      
    </div> 
  </div> 
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '@/stores/user';
import { getContacts, getHistory, addFriend , uploadAvatar } from '@/api/chat'; // 引入 addFriend

const userStore = useUserStore();
const router = useRouter();
let socket = null;

const contacts = ref([]); 
const currentContact = ref(null);
const messages = ref([]);
const inputContent = ref('');
const msgContainer = ref(null);

// 初始化 WebSocket (保持不变)
const initWebSocket = () => {
  const token = userStore.token; 
  if (!token) { router.push('/login'); return; }
  socket = new WebSocket(`ws://localhost:8080/ws/chat?token=${token}`);
  socket.onopen = () => { console.log('WS Connected'); };
  socket.onmessage = (event) => {
    const msg = JSON.parse(event.data);

    const isCurrentChat = currentContact.value && (String(msg.senderId) === String(currentContact.value.id));
    if (isCurrentChat || String(msg.senderId) === String(userStore.userInfo.id)) {
         messages.value.push({
          id: Date.now(),
          content: msg.content,
          isMine: String(msg.senderId) === String(userStore.userInfo.id),
          createdAt: msg.createdAt || new Date() // 【新增】接收时间
        });
        scrollToBottom();
    }
  };
};

// 加载好友列表
const loadContacts = async () => {
    try {
        const res = await getContacts(); // 现在调用的是 /api/friends
        if (res.code === 200) {
            contacts.value = res.data;
        }
    } catch (e) {
        console.error("加载好友失败", e);
    }
}

// 【新增】添加好友逻辑
const openAddFriend = async () => {
  const email = prompt("请输入好友的邮箱地址：");
  if (email) {
    if (email === userStore.userInfo.email) {
      alert("不能添加自己为好友");
      return;
    }
    try {
      const res = await addFriend(email);
      if (res.code === 200) {
        alert("添加成功！");
        loadContacts(); // 刷新列表
      } else {
        alert(res.msg);
      }
    } catch (e) {
      alert("请求失败，请检查邮箱是否正确");
    }
  }
};

const selectContact = async (user) => {
  currentContact.value = user;
  messages.value = [];
  try {
    const res = await getHistory(user.id);
    if (res.code === 200) {
      messages.value = res.data.map(msg => ({
        id: msg.id,
        content: msg.content,
        isMine: String(msg.senderId) === String(userStore.userInfo.id)
      }));
      scrollToBottom();
    }
  } catch (error) { messages.value = []; }
};

const sendMessage = () => {
  if (!inputContent.value.trim() || !socket) return;
  const msgObj = { receiverId: currentContact.value.id, content: inputContent.value };
  socket.send(JSON.stringify(msgObj));
  messages.value.push({ id: Date.now(), content: inputContent.value, isMine: true });
  inputContent.value = '';
  scrollToBottom();
};

const goToProfile = () => { router.push('/profile'); };
const scrollToBottom = () => { nextTick(() => { if (msgContainer.value) msgContainer.value.scrollTop = msgContainer.value.scrollHeight; }); };

onMounted(() => {
    if (!userStore.token) { router.push('/login'); return; }
    loadContacts(); 
    initWebSocket(); 
});

const formatTime = (timeStr) => {
  if (!timeStr) return '';
  const date = new Date(timeStr);
  // 返回简单的 "10:30" 格式
  return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
};

const handleSendImage = async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const formData = new FormData();
  formData.append('file', file);

  try {
    // 1. 先把图片上传到服务器
    const res = await uploadAvatar(formData);
    if (res.code === 200) {
      // 2. 拿到图片URL，拼接特殊前缀 "img:" 发送给 WebSocket
      const imgMsg = `img:${res.url}`;
      
      const msgObj = {
        receiverId: currentContact.value.id,
        content: imgMsg
      };
      socket.send(JSON.stringify(msgObj));

      // 3. 自己界面上也显示出来
      messages.value.push({
        id: Date.now(),
        content: imgMsg,
        isMine: true,
        createdAt: new Date()
      });
      scrollToBottom();
    }
  } catch (error) {
    console.error("发图失败", error);
  }
};

</script>

<style scoped>
/* =========================================
   1. 布局核心：悬浮卡片实现
   ========================================= */

/* 最外层背景：铺满屏幕，灰色背景，Flex居中 */
.chat-background {
  width: 100%;
  height: 100vh;
  background-color: #eef2f5; /* 浅灰色背景 */
  display: flex;
  justify-content: center; /* 水平居中 */
  align-items: center;     /* 垂直居中 */
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
}

/* 中间的大卡片：圆角、阴影、白色背景 */
.chat-card {
  width: 90%;            /* 宽度占屏幕90% */
  max-width: 1800px;     /* 最大宽度限制 */
  height: 90vh;          /* 高度占屏幕85% */
  background: white;
  border-radius: 24px;   /* 大圆角效果 */
  box-shadow: 0 15px 40px rgba(0, 0, 0, 0.08); /* 柔和的悬浮阴影 */
  display: flex;         /* 左右布局 */
  overflow: hidden;      /* 关键：防止内部元素溢出圆角 */
  background: rgba(255, 255, 255, 0.95); 
  backdrop-filter: blur(10px); /* 毛玻璃特效 */
}

/* =========================================
   2. 左侧侧边栏
   ========================================= */
.sidebar {
  width: 250px;
  background: #fdfdfd;
  border-right: 1px solid #f0f0f0;
  display: flex;
  flex-direction: column;
}

/* 个人信息头部 */
.user-profile {
  padding: 25px 20px;
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  transition: background 0.2s;
}

.user-profile:hover {
  background-color: #f7f9fc;
}

.avatar { 
  width: 48px; height: 48px; 
  background: linear-gradient(135deg, #667eea, #764ba2); 
  color: white; 
  border-radius: 50%; 
  display: flex; justify-content: center; align-items: center; 
  font-weight: bold; 
  font-size: 14px;
}

.user-info-text { display: flex; flex-direction: column; }
.username { font-weight: 600; color: #333; font-size: 15px; }
.status-text { font-size: 12px; color: #4caf50; margin-top: 2px; }

/* 联系人列表容器 */
.contact-list {
  flex: 1;
  overflow-y: auto;
  padding: 12px; /* 给列表加内边距，让子项有空间悬浮 */
}

/* === 列表项圆角实现 === */
.contact-item {
  padding: 12px 15px;
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  
  /* 关键：圆角和间距，使其看起来像独立的块 */
  border-radius: 12px; 
  margin-bottom: 6px; 
  transition: all 0.2s;
}

.contact-item:hover {
  background-color: #f2f4f7;
}

.contact-item.active {
  background-color: #e6f0ff; /* 选中后的浅蓝色背景 */
}

.contact-item.active .name {
  color: #007aff;
  font-weight: 600;
}

.avatar-small { 
  width: 40px; height: 40px; 
  background: #007aff; 
  color: white; 
  border-radius: 50%; 
  display: flex; justify-content: center; align-items: center; 
  font-size: 14px; 
}

.info .name { font-weight: 500; color: #333; font-size: 14px; }
.info .last-msg { color: #999; font-size: 12px; margin-top: 4px; }

/* =========================================
   3. 右侧聊天区域
   ========================================= */
.chat-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: #ffffff;
}

.chat-header {
  padding: 20px 30px;
  border-bottom: 1px solid #f5f5f5;
  background: white;
}
.chat-header h3 { margin: 0; font-size: 17px; color: #333; font-weight: 600; }

.message-list {
  flex: 1;
  padding: 30px;
  overflow-y: auto;
  background-color: #ffffff; /* 纯白背景 */
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.message-row { display: flex; justify-content: flex-start; }
.message-row.mine { justify-content: flex-end; }

/* === 气泡样式 === */
.bubble {
  max-width: 70%;
  padding: 12px 18px;
  border-radius: 18px; /* 大圆角 */
  font-size: 14px;
  line-height: 1.6;
  position: relative;
  word-wrap: break-word;
}

.message-row:not(.mine) .bubble {
  background: #f5f7f9; /* 对方消息：浅灰 */
  color: #333;
  border-bottom-left-radius: 4px; /* 小尖角 */
}

.message-row.mine .bubble {
  background: linear-gradient(135deg, #4a90e2, #007aff); /* 我：蓝色渐变 */
  color: white;
  border-bottom-right-radius: 4px; /* 小尖角 */
  box-shadow: 0 4px 10px rgba(0, 122, 255, 0.2);
}

/* === 底部输入框 === */
.input-area {
  padding: 20px 30px;
  display: flex;
  gap: 15px;
  background: white;
  align-items: center;
}

textarea {
  flex: 1;
  border: 1px solid #e6e6e6;
  background-color: #f9f9f9;
  border-radius: 24px; /* 胶囊圆角 */
  padding: 12px 20px;
  resize: none;
  height: 46px;
  outline: none;
  font-family: inherit;
  font-size: 14px;
  transition: all 0.3s;
}

textarea:focus { 
  background-color: white;
  border-color: #007aff;
  box-shadow: 0 0 0 3px rgba(0, 122, 255, 0.1);
}

.input-area button {
  width: 46px; height: 46px;
  border-radius: 50%; /* 圆形按钮 */
  background: #007aff;
  color: white;
  border: none;
  cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  transition: transform 0.2s, background 0.2s;
  box-shadow: 0 4px 12px rgba(0, 122, 255, 0.3);
}

.input-area button:hover { 
  background: #005ecb; 
  transform: scale(1.05); 
}

.empty-state {
  flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; color: #ccc;
}
.empty-icon { font-size: 48px; margin-bottom: 10px; opacity: 0.5; }

.header-name-wrapper {
  display: flex;
  align-items: center;
  gap: 10px; /* 名字和状态之间的间距 */
}

.status-badge {
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 10px;
  background-color: #f0f0f0; /* 默认离线背景：灰色 */
  color: #999;               /* 默认离线文字：深灰 */
  font-weight: 500;
  transition: all 0.3s;
}

.status-badge.is-online {
  background-color: #e6f7ff; /* 在线背景：浅蓝 */
  color: #1890ff;            /* 在线文字：亮蓝 */
  /* 或者用绿色风格：
  background-color: #f6ffed;
  color: #52c41a; 
  */
}
/* 添加好友栏样式 */
.add-friend-bar { padding: 10px 20px; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #f0f0f0; }
.section-title { font-size: 12px; color: #999; font-weight: 600; }
.btn-add { background: #f0f0f0; border: none; width: 24px; height: 24px; border-radius: 50%; color: #666; cursor: pointer; font-size: 16px; line-height: 1; display: flex; justify-content: center; align-items: center; transition: all 0.2s; }
.btn-add:hover { background: #4a90e2; color: white; }

.message-content-wrapper {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}
.message-row.mine .message-content-wrapper {
  align-items: flex-end; /* 自己发的消息靠右对齐 */
}
.msg-time {
  font-size: 10px;
  color: #999;
  margin-top: 4px;
  margin-left: 5px;
}

/* 滚动条 */
::-webkit-scrollbar { width: 6px; }
::-webkit-scrollbar-thumb { background: #e0e0e0; border-radius: 3px; }
</style>