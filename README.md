# 💬 XWebChat

![Vue.js](https://img.shields.io/badge/Vue.js-3.5-4FC08D?style=flat-square&logo=vue.js)
![Vite](https://img.shields.io/badge/Vite-6.0-646CFF?style=flat-square&logo=vite)
![Element Plus](https://img.shields.io/badge/Element_Plus-2.12-409EFF?style=flat-square&logo=element)
![WebSocket](https://img.shields.io/badge/WebSocket-Realtime-orange?style=flat-square)

> 一个基于 Vue 3 + WebSocket 的现代化实时聊天应用，支持好友管理、即时通讯与图片分享。设计简洁，交互流畅。

[在线演示 Demo](https://your-demo-link.com) · [报告 Bug](https://github.com/yourusername/xwebchat/issues) · [请求新功能](https://github.com/yourusername/xwebchat/issues)

---

## ✨ 核心特性 (Features)

这是一个全栈即时通讯的前端实现，核心功能包括：

- ⚡ **实时通讯**：基于 WebSocket 实现低延迟的双向消息传输，拒绝轮询。
- 👥 **好友系统**：支持添加好友、好友列表展示及在线状态实时同步（在线/离线）。
- 🖼️ **富媒体交互**：不仅支持文字，还支持**图片发送**与预览。
- 🔔 **消息提醒**：精准的未读消息红点计数，不错过任何重要信息。
- 🎨 **现代化 UI**：
    - 响应式侧边栏与沉浸式聊天气泡。
    - 个人资料管理与头像上传（支持实时预览）。
- 🔐 **安全机制**：基于 Token 的路由拦截与鉴权机制，保障页面访问安全。
- 目前缺少的
- 消息撤回
- 聊天记录搜索


## 📸 项目截图 (Screenshots)

| 登录/注册 | 聊天主界面 |
|:---:|:---:|
| ![Login Page](https://via.placeholder.com/400x300?text=Login+Page) | ![Chat Interface](https://via.placeholder.com/400x300?text=Chat+Interface) |
| *简洁的鉴权页面* | *支持图片预览的聊天窗口* |



## 🛠️ 技术栈 (Tech Stack)

本项目采用了目前最流行的 Vue 生态系统：

- **核心框架**: [Vue 3](https://vuejs.org/) (Composition API + Setup Sugar)
- **构建工具**: [Vite](https://vitejs.dev/) (极速冷启动)
- **状态管理**: [Pinia](https://pinia.vuejs.org/) (更轻量的 Vuex 替代方案)
- **UI 组件库**: [Element Plus](https://element-plus.org/)
- **网络请求**: Axios (HTTP) + WebSocket (实时通信)
- **路由管理**: Vue Router 4

## 📂 目录结构 (Structure)

核心代码逻辑清晰，易于维护：

```text
src/
├── api/            # 后端接口封装 (Axios 拦截器、API 定义)
├── stores/         # Pinia 状态管理 (User, Counter)
├── views/          # 页面级组件
│   ├── chat.vue    # 核心聊天界面 (WebSocket 逻辑)
│   ├── login.vue   # 登录页
│   ├── register.vue# 注册页
│   └── Profile.vue # 个人中心
├── router/         # 路由配置与导航守卫
└── main.js         # 入口文件