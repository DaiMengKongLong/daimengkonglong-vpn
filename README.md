# 🚀 Cloudflare 订阅转换服务

一个基于 Cloudflare Workers 和 Pages 的多格式订阅转换服务，支持 Base64、Clash、SingBox、Loon、Surge 等多种订阅格式，具有 Glassmorphism（磨砂玻璃）风格的管理界面。

## ✨ 特性

- 🔄 **多格式支持**: Base64、Clash、SingBox、Loon、Surge
- 🎨 **Glassmorphism 设计**: 现代化磨砂玻璃风格界面
- 🛠️ **完整管理面板**: 节点管理、配置管理、反代IP管理
- 📱 **响应式设计**: 完美适配桌面和移动设备
- 🔧 **自定义配置**: 支持自定义 INI 模板和 Clash 模板
- 🌐 **反代IP支持**: 支持批量导入和管理反代IP
- 💾 **数据持久化**: 使用 Cloudflare KV 存储配置数据
- 🎯 **多Token支持**: 支持多个独立的订阅配置
- 🚀 **双部署支持**: 同时支持 Workers 和 Pages 部署
- 🔧 **环境自适应**: 自动检测和适配运行环境

## 🚀 快速开始

本项目支持两种部署方式：**Cloudflare Workers** 和 **Cloudflare Pages**。

### 方式一：使用部署脚本（推荐）

**Workers 部署：**
```bash
# Linux/Mac
./deploy.sh

# Windows
deploy.bat
```

**Pages 部署：**
```bash
# Linux/Mac
./deploy-pages.sh

# Windows
deploy-pages.bat
```

### 方式二：手动部署

#### 1. 克隆项目

```bash
git clone <repository-url>
cd subscription-converter
```

#### 2. 安装依赖

```bash
npm install
```

#### 3. 配置 Cloudflare

1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. 创建一个新的 KV 命名空间：
   ```bash
   npx wrangler kv:namespace create "CONFIG_KV"
   npx wrangler kv:namespace create "CONFIG_KV" --preview
   ```
3. 复制命名空间 ID 并更新配置

#### 4A. 部署到 Cloudflare Workers

```bash
# 开发环境
npm run dev

# 部署到生产环境
npm run deploy
```

#### 4B. 部署到 Cloudflare Pages

**方法1：Git 仓库部署（推荐）**
1. 将代码推送到 Git 仓库
2. 在 Cloudflare Dashboard 中创建 Pages 项目
3. 连接 Git 仓库并配置构建设置
4. 在环境变量中添加 `CONFIG_KV`

**方法2：直接部署**
```bash
# 创建 Pages 项目
npm run pages:create your-project-name

# 部署到 Pages
npm run deploy:pages
```

## 📊 部署方式对比

| 特性 | Workers | Pages |
|------|---------|-------|
| **部署方式** | CLI 部署 | Git 仓库 + CLI |
| **自动部署** | 手动 | Git 推送自动部署 |
| **版本控制** | 基础 | 完整的部署历史 |
| **分支部署** | 不支持 | 支持预览分支 |
| **回滚** | 手动 | 一键回滚 |
| **域名** | workers.dev | pages.dev |
| **自定义域名** | 支持 | 支持 |
| **静态资源** | 不支持 | 支持 |
| **构建过程** | 无 | 可配置 |
| **适用场景** | 纯 API 服务 | 全栈应用 |

### 推荐选择

- **选择 Workers**：如果你需要简单快速的部署，主要用作 API 服务
- **选择 Pages**：如果你需要版本控制、自动部署、分支预览等高级功能

## 📖 使用说明

### 访问首页

访问你的 Workers 域名，例如：`https://your-worker.your-subdomain.workers.dev/`

### 管理面板

访问管理面板：`https://your-worker.your-subdomain.workers.dev/admin`

### 订阅链接格式

- **Base64**: `/sub/base64?token=your-token`
- **Clash**: `/sub/clash?token=your-token`
- **SingBox**: `/sub/singbox?token=your-token`
- **Loon**: `/sub/loon?token=your-token`
- **Surge**: `/sub/surge?token=your-token`

### Token 系统

- 默认 token: `default`
- 自定义 token: 在 URL 中添加 `?token=your-custom-token`
- 每个 token 对应独立的配置和节点列表

## 🔧 配置管理

### 基础配置

在管理面板的"基础配置"标签页中，你可以设置：

- 订阅名称和描述
- 自定义图标 URL
- 网站标题
- 自定义 CSS 样式

### 节点管理

支持添加以下类型的节点：

- **VMess**: 需要 UUID、AlterID 等参数
- **VLESS**: 需要 UUID 等参数
- **Trojan**: 需要密码等参数
- **Shadowsocks**: 需要密码和加密方式等参数

### 反代IP管理

- 单个添加：在"反代IP"标签页中手动添加
- 批量导入：支持 TXT 和 CSV 格式
  - TXT 格式：每行一个 IP
  - CSV 格式：`IP,端口,备注`（端口和备注可选）

### 模板配置

- **INI 模板**: 用于生成 Clash 规则的 INI 配置
- **Clash 模板**: 自定义 Clash 配置的 JSON 模板

## 🎨 界面特色

### Glassmorphism 设计

- 磨砂玻璃效果背景
- 动态浮动形状动画
- 鼠标跟随交互效果
- 平滑的过渡动画

### 响应式布局

- 桌面端：多列网格布局
- 移动端：单列堆叠布局
- 自适应字体和间距

## 🔌 API 接口

### 获取配置

```http
GET /api/config?token=your-token
```

### 保存配置

```http
POST /api/config?token=your-token
Content-Type: application/json

{
  "name": "订阅名称",
  "nodes": [...],
  "proxyIPs": [...]
}
```

### 获取所有配置列表

```http
GET /api/configs
```

### 测试接口

```http
GET /api/test
GET /api/test?type=node&target=node-data
GET /api/test?type=proxy&target=proxy-ip
```

## 📁 项目结构

```text
├── src/                          # 源代码目录
│   ├── index.js                 # Workers 入口文件
│   ├── handlers/                # 请求处理器
│   │   ├── router.js           # 路由分发
│   │   ├── home.js             # 首页处理
│   │   ├── admin.js            # 管理页面
│   │   ├── subscription.js     # 订阅生成
│   │   └── api.js              # API 接口
│   ├── converters/             # 格式转换器
│   │   ├── base64.js           # Base64 转换
│   │   ├── clash.js            # Clash 转换
│   │   ├── singbox.js          # SingBox 转换
│   │   ├── loon.js             # Loon 转换
│   │   └── surge.js            # Surge 转换
│   └── utils/                  # 工具函数
│       ├── config.js           # 配置管理
│       ├── cors.js             # CORS 处理
│       └── environment.js      # 环境检测
├── functions/                   # Pages Functions
│   └── _middleware.js          # Pages 中间件
├── _worker.js                  # Pages 入口文件
├── package.json                # 项目配置
├── wrangler.toml              # Cloudflare 配置
├── deploy.sh / deploy.bat     # Workers 部署脚本
├── deploy-pages.sh / .bat     # Pages 部署脚本
└── README.md                  # 项目文档
```

## 🛠️ 开发

### 本地开发

```bash
npm run dev
```

### 查看日志

```bash
npm run tail
```

### 环境变量

在 `wrangler.toml` 中配置：

```toml
[vars]
ENVIRONMENT = "production"
```

## 📝 注意事项

1. **KV 存储限制**: Cloudflare KV 有读写频率限制，适合配置存储而非高频访问
2. **Workers 限制**: 免费版有 CPU 时间和请求次数限制
3. **域名配置**: 建议绑定自定义域名以获得更好的访问体验
4. **安全考虑**: 管理面板建议设置访问密码或IP白名单

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

MIT License

## 🙏 致谢

- Cloudflare Workers 平台
- 各种代理协议的开源实现
- Glassmorphism 设计理念
