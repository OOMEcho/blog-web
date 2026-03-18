<div align="center">

[![Vue](https://img.shields.io/badge/Vue-2.6.14-brightgreen.svg)](https://v2.cn.vuejs.org/)
[![Vue Router](https://img.shields.io/badge/VueRouter-3.5.1-red.svg)](https://router.vuejs.org/)
[![Vuex](https://img.shields.io/badge/Vuex-3.6.2-purple.svg)](https://vuex.vuejs.org/zh/)
[![Element UI](https://img.shields.io/badge/ElementUI-2.15.14-blue.svg)](https://element.eleme.cn/#/zh-CN)
[![Axios](https://img.shields.io/badge/Axios-1.13.5-yellow.svg)](https://axios-http.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)

## 🍟 如果这个项目对你有帮助，请 Star 支持

</div>

## 🌟 项目简介

`blog-web` 是博客系统的前台站点，基于 Vue2 构建，提供文章浏览、搜索、归档、分类、标签、关于页和友情链接等核心能力。

项目通过调用 `blog` 后端公开接口动态渲染内容，适合个人博客、作品展示站点等场景。

## 🔗 相关项目

- 后端服务（Spring Boot）：<https://github.com/OOMEcho/blog>
- 后台管理端（Vue2）：<https://github.com/OOMEcho/blog-admin>
- 当前仓库（前台）：<https://github.com/OOMEcho/blog-web>

## 🧭 架构设计

### 1) 系统整体架构

```text
┌───────────────────────┐
│ Browser               │
└──────────┬────────────┘
           │
           ▼
┌───────────────────────┐
│ blog-web (Vue2)       │
│ Router + Vuex + UI    │
└──────────┬────────────┘
           │ /api
           ▼
┌───────────────────────┐
│ blog-api (SpringBoot) │
└──────────┬────────────┘
           ├────────────► MySQL
           └────────────► Redis
```

### 2) 前端页面架构

| 层级 | 目录 | 职责 |
| --- | --- | --- |
| 页面层 | `src/views` | 首页、详情、分类、标签、归档、关于 |
| 组件层 | `src/components` | 导航栏、侧栏、文章卡片、页脚 |
| 状态层 | `src/store` | 缓存博客配置、分类、标签 |
| 接口层 | `src/api/blog.js` | 前台公开接口封装 |
| 基础层 | `src/utils` | 请求拦截、格式化、颜色工具 |

### 3) 内容渲染流程

1. 应用启动后并行拉取博客配置、分类、标签并缓存到 Vuex。
2. 首页/分类/标签页按分页参数拉取文章列表。
3. 详情页使用 `mavon-editor` 预览 Markdown，并自动生成目录导航（TOC）。
4. 关于页通过 DOMPurify 对富文本做安全清洗后再渲染。

## ✨ 核心优势

- 内容展示完整：首页流、详情页、归档、分类、标签、关于页一套打通。
- 阅读体验好：目录导航、回到顶部、响应式布局、推荐侧栏。
- 数据驱动：站点标题、公告、社交信息、备案信息均可后台配置。
- 安全友好：富文本渲染前做 XSS 清洗，外链地址做安全归一化处理。
- 部署简单：支持本地代理联调、同域反向代理、独立 API 域名部署。

## 🏗️ 技术栈

| 技术 | 版本 | 说明 |
| --- | --- | --- |
| Vue | 2.6.14 | 前端框架 |
| Vue Router | 3.5.1 | 路由管理（history 模式） |
| Vuex | 3.6.2 | 全局状态管理 |
| Element UI | 2.15.14 | UI 组件库 |
| Axios | 1.13.5 | HTTP 请求 |
| mavon-editor | 2.10.4 | Markdown 预览 |
| DOMPurify | 3.3.3 | HTML 安全清洗 |

## 🚀 快速开始

### 1) 环境准备

- Node.js 16+
- npm 8+

### 2) 克隆项目

```bash
git clone https://github.com/OOMEcho/blog-web.git
cd blog-web
```

### 3) 安装依赖

```bash
npm install
```

### 4) 配置环境变量

开发环境（`.env.development`）：

```bash
VUE_APP_BASE_PRE=/api
VUE_APP_BASE_API=http://127.0.0.1:9090
```

生产环境（`.env.production`）推荐两种模式：

```bash
# 模式A：同域反向代理（推荐）
VUE_APP_BASE_API=/api

# 模式B：独立 API 域名
VUE_APP_BASE_API=https://api.yourblog.cn
```

### 5) 启动开发服务

```bash
npm run serve
```

默认访问：<http://127.0.0.1:9088>

### 6) 启动后验证

- 首页文章列表能正常加载。
- 分类、标签、归档页可正常跳转。
- 文章详情可正常渲染 Markdown。

## 🌐 部署说明

### 1) 打包

```bash
npm run build
```

产物目录：`dist/`

### 2) Nginx 部署（同域反向代理）

> 使用该方案前，请将 `.env.production` 的 `VUE_APP_BASE_API` 设置为 `/api` 后重新构建。

```nginx
server {
  listen 80;
  server_name www.yourblog.cn;

  root /usr/share/nginx/html;
  index index.html;

  location / {
    try_files $uri $uri/ /index.html;
  }

  location /api/ {
    proxy_pass http://127.0.0.1:9090/;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
  }
}
```

### 3) 部署验收清单

- 首页、分类、标签、归档路由刷新不 404。
- 搜索参数变化可正确触发文章重载。
- 页脚备案信息可根据后台配置正常展示。

## 🧩 三端联调

```bash
# 后端
cd D:\Project\OtherProjects\blog
mvn spring-boot:run

# 后台
cd D:\Project\FrontEndProjects\blog-admin
npm run serve

# 前台
cd D:\Project\FrontEndProjects\blog-web
npm run serve
```

默认端口：后端 `9090`，后台 `9099`，前台 `9088`。

## 🖼️ 界面预览（待补充）

| 页面 | 说明 | 图片 |
| --- | --- | --- |
| 首页 | 文章列表 + 搜索 + 侧栏 | 待补充 |
| 详情页 | Markdown 渲染 + 目录导航 | 待补充 |
| 分类页 | 分类筛选与计数展示 | 待补充 |
| 标签页 | 标签筛选与计数展示 | 待补充 |
| 关于页 | 配置化内容 + 友情链接 | 待补充 |

## ❓ 常见问题

1. 页面空白或接口 404：检查 `VUE_APP_BASE_API` 与后端地址是否一致。
2. 刷新页面 404：确认 Nginx 已配置 `try_files $uri $uri/ /index.html`。
3. 关于页富文本显示异常：检查后台配置内容是否为合法 HTML。

## 🤝 贡献

1. Fork 仓库
2. 创建分支：`git checkout -b feature/xxx`
3. 提交代码：`git commit -m "feat: xxx"`
4. 发起 Pull Request

## 📄 许可证

本项目采用 [MIT License](https://opensource.org/licenses/MIT)。

---

<div align="center">

Made with ❤️ by 南常

</div>
