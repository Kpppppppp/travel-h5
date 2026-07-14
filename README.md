# 智能旅游助手 H5 应用

基于 AI 的智能景点介绍与行程规划系统，使用 Vue 3 + Vite + Vant 构建的移动端 Web 应用。

## 功能特性

- **首页**：城市选择、预算规划、快速访问聊天和历史记录
- **智能聊天**：基于 AI 的旅游助手，支持对话式交互
- **聊天历史**：查看和管理历史对话记录
- **景点详情**：查看景点详细信息、门票价格、开放时间等
- **用户系统**：登录、注册功能

## 技术栈

- **前端框架**：Vue 3
- **构建工具**：Vite
- **移动端 UI**：Vant 4
- **HTTP 客户端**：Axios
- **路由管理**：Vue Router 4
- **Markdown 渲染**：marked
- **代码高亮**：highlight.js

## 项目结构

```
travel-h5/
├── src/
│   ├── components/     # 公共组件
│   ├── router/         # 路由配置
│   ├── styles/         # 全局样式
│   ├── utils/          # 工具函数
│   ├── views/          # 页面组件
│   ├── App.vue         # 根组件
│   └── main.js         # 入口文件
├── public/             # 静态资源
├── dist/               # 构建输出目录
└── .env                # 环境变量（本地使用，不上传）
```

## 快速开始

### 环境要求

- Node.js >= 16
- pnpm 或 npm 或 yarn

### 安装依赖

```bash
# 使用 pnpm（推荐）
pnpm install

# 或使用 npm
npm install

# 或使用 yarn
yarn install
```

### 开发模式

```bash
pnpm dev
```

访问 `http://localhost:5173` 查看应用。

### 构建生产版本

```bash
pnpm build
```

构建产物将输出到 `dist` 目录。

### 预览生产版本

```bash
pnpm preview
```

## 环境变量配置

项目根目录下的 `.env` 文件用于配置 API 地址：

```env
# 开发环境
VITE_API_BASE_URL=http://127.0.0.1:3300

# 或使用局域网 IP（手机调试时）
VITE_API_BASE_URL=http://192.168.x.x:3300
```

> 注意：`.env` 文件包含敏感信息，请勿将其提交到版本控制系统。参考 `.env.example` 文件进行配置。

## 移动端调试

1. 确保手机和电脑在同一局域网
2. 修改 `.env` 中的 `VITE_API_BASE_URL` 为电脑的局域网 IP
3. 运行 `pnpm dev`
4. 在手机上访问 `http://电脑IP:5173`

## 许可证

MIT License
