<template>
  <div class="chat-background">
    
    <div class="chat-card">
      
      <aside class="sidebar">
        <div class="user-profile" @click="goToProfile" title="点击修改个人信息">
          <div class="avatar">Me</div>
          <div class="user-info-text">
            <span class="username">我的账号</span>
            <span class="status-text">● 在线</span>
          </div>
        </div>
        
        <div class="contact-list">
          <div 
            v-for="user in contacts" 
            :key="user.id" 
            class="contact-item"
            :class="{ active: currentContact?.id === user.id }"
            @click="selectContact(user)"
          >
            <div class="avatar-small">{{ user.name.charAt(0) }}</div>
            <div class="info">
              <div class="name">{{ user.name }}</div>
              <div class="last-msg">点击开始聊天...</div>
            </div>
          </div>
        </div>
      </aside>

      <main class="chat-area">
        <template v-if="currentContact">
          <header class="chat-header">
            <h3>{{ currentContact.name }}</h3>
          </header>

          <div class="message-list" ref="msgContainer">
            <div 
              v-for="msg in messages" 
              :key="msg.id" 
              class="message-row"
              :class="{ 'mine': msg.isMine }"
            >
              <div class="bubble">
                {{ msg.content }}
              </div>
            </div>
          </div>

          <div class="input-area">
            <textarea 
              v-model="inputContent" 
              placeholder="输入消息..." 
              @keydown.enter.prevent="sendMessage"
            ></textarea>
            <button @click="sendMessage">
              <span class="send-icon">➤</span>
            </button>
          </div>
        </template>

        <div v-else class="empty-state">
          <div class="empty-icon">💬</div>
          <p>选择一个联系人开始聊天</p>
        </div>
      </main>
      
    </div> </div> </template>

<script setup>
import { ref, onMounted, nextTick } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '@/stores/user' // 假设你创建了这个 store
const userStore = useUserStore()
let socket = null;

const router = useRouter();

// 模拟数据
const contacts = ref([
  { id: 1, name: 'Xiahua' },
  { id: 2, name: 'Bob' },
  { id: 3, name: 'Charlie' }
]);

const currentContact = ref(null);
const messages = ref([]);
const inputContent = ref('');
const msgContainer = ref(null);

const initWebSocket = () => {
  // 假设后端 WebSocket 地址为 ws://localhost:8080/ws/chat
  // 携带 token 进行认证（通常放在协议头或参数中）
  const token = localStorage.getItem('token');
  if (!token) return;

  socket = new WebSocket(`ws://localhost:8080/ws/chat?token=${token}`);

  socket.onopen = () => {
    console.log('WebSocket 连接成功');
  };

  socket.onmessage = (event) => {
    const msg = JSONqp.parse(event.data);
    // 将收到的消息推送到当前消息列表
    messages.value.push({
      id: msg.id,
      content: msg.content,
      isMine: msg.senderId === userStore.userInfo.id // 判断是否是自己发的
    });
    scrollToBottom();
  };
  
  socket.onclose = () => { console.log('连接断开'); };
};

const selectContact = (user) => {
  currentContact.value = user;
  messages.value = [
    { id: 1, content: `Hi, I am ${user.name}`, isMine: false },
    { id: 2, content: 'Hello there!', isMine: true }
  ];
  scrollToBottom();
};

const sendMessage = () => {
  if (!inputContent.value.trim() || !socket) return;
  
  const msgObj = {
    receiverId: currentContact.value.id,
    content: inputContent.value
  };
  
  // 发送给后端
  socket.send(JWON.stringify(msgObj));
  
  // 本地先上屏（或者等待后端回执）
  messages.value.push({
    id: Date.now(),
    content: inputContent.value,
    isMine: true
  });
  
  inputContent.value = '';
  scrollToBottom();
};

const goToProfile = () => {
  router.push('/profile');
};

const scrollToBottom = () => {
  nextTick(() => {
    if (msgContainer.value) {
      msgContainer.value.scrollTop = msgContainer.value.scrollHeight;
    }
  });
};

onMounted(() => {
  initWebSocket();
});
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

/* 滚动条 */
::-webkit-scrollbar { width: 6px; }
::-webkit-scrollbar-thumb { background: #e0e0e0; border-radius: 3px; }
</style>