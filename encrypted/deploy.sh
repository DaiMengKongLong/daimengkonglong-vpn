#!/bin/bash
# 加密版本 Workers 部署脚本

echo "🔒 部署加密版本到 Cloudflare Workers..."
echo "============================================"

# 检查环境
if ! command -v node &> /dev/null; then
    echo "❌ 错误: 未找到 Node.js"
    exit 1
fi

if ! command -v npm &> /dev/null; then
    echo "❌ 错误: 未找到 npm"
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

# 部署
echo "🚀 部署加密版本..."
npx wrangler deploy

if [ $? -eq 0 ]; then
    echo "🎉 加密版本部署成功！"
    echo "🔒 源码已加密保护，防止检测"
else
    echo "❌ 部署失败"
    exit 1
fi
