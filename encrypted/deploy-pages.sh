#!/bin/bash
# 加密版本 Pages 部署脚本

echo "🔒 部署加密版本到 Cloudflare Pages..."
echo "============================================"

# 检查环境
if ! command -v node &> /dev/null; then
    echo "❌ 错误: 未找到 Node.js"
    exit 1
fi

echo "✅ 环境检查通过"

# 安装依赖
echo "📦 安装依赖..."
npm install

# 登录检查
echo "🔐 检查 Cloudflare 登录状态..."
npx wrangler whoami
if [ $? -ne 0 ]; then
    echo "🔑 请先登录 Cloudflare:"
    npx wrangler login
fi

# 询问部署方式
echo "📄 选择 Pages 部署方式:"
echo "1. Git 仓库部署 (推荐)"
echo "2. 直接部署"

read -p "请选择 [1-2]: " choice

case $choice in
    1)
        echo "📄 Git 仓库部署指南:"
        echo "1. 将 encrypted/ 目录内容推送到 Git 仓库"
        echo "2. 在 Cloudflare Dashboard 创建 Pages 项目"
        echo "3. 连接 Git 仓库并配置环境变量"
        ;;
    2)
        read -p "请输入 Pages 项目名称: " project_name
        npx wrangler pages deploy . --project-name="$project_name"
        ;;
esac

echo "🔒 加密版本已部署，源码受到保护"
