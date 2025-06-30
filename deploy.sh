#!/bin/bash

# Cloudflare Workers 订阅转换服务部署脚本

echo "🚀 Cloudflare Workers 订阅转换服务部署脚本"
echo "============================================"

# 检查是否安装了 Node.js
if ! command -v node &> /dev/null; then
    echo "❌ 错误: 未找到 Node.js，请先安装 Node.js"
    exit 1
fi

# 检查是否安装了 npm
if ! command -v npm &> /dev/null; then
    echo "❌ 错误: 未找到 npm，请先安装 npm"
    exit 1
fi

echo "✅ Node.js 和 npm 已安装"

# 安装依赖
echo "📦 安装项目依赖..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ 依赖安装失败"
    exit 1
fi

echo "✅ 依赖安装成功"

# 检查是否已登录 Cloudflare
echo "🔐 检查 Cloudflare 登录状态..."
npx wrangler whoami

if [ $? -ne 0 ]; then
    echo "🔑 请先登录 Cloudflare:"
    npx wrangler login
    
    if [ $? -ne 0 ]; then
        echo "❌ Cloudflare 登录失败"
        exit 1
    fi
fi

echo "✅ Cloudflare 登录成功"

# 创建 KV 命名空间
echo "🗄️ 创建 KV 命名空间..."
KV_OUTPUT=$(npx wrangler kv:namespace create "CONFIG_KV" 2>&1)

if [ $? -eq 0 ]; then
    echo "✅ KV 命名空间创建成功"
    
    # 提取 KV 命名空间 ID
    KV_ID=$(echo "$KV_OUTPUT" | grep -o 'id = "[^"]*"' | cut -d'"' -f2)
    
    if [ -n "$KV_ID" ]; then
        echo "📝 KV 命名空间 ID: $KV_ID"
        
        # 更新 wrangler.toml 文件
        sed -i.bak "s/id = \"your-kv-namespace-id\"/id = \"$KV_ID\"/" wrangler.toml
        
        echo "✅ wrangler.toml 已更新"
    else
        echo "⚠️ 无法自动提取 KV 命名空间 ID，请手动更新 wrangler.toml"
    fi
else
    echo "⚠️ KV 命名空间可能已存在，请检查 wrangler.toml 配置"
fi

# 创建预览环境的 KV 命名空间
echo "🗄️ 创建预览环境 KV 命名空间..."
KV_PREVIEW_OUTPUT=$(npx wrangler kv:namespace create "CONFIG_KV" --preview 2>&1)

if [ $? -eq 0 ]; then
    echo "✅ 预览环境 KV 命名空间创建成功"
    
    # 提取预览环境 KV 命名空间 ID
    KV_PREVIEW_ID=$(echo "$KV_PREVIEW_OUTPUT" | grep -o 'preview_id = "[^"]*"' | cut -d'"' -f2)
    
    if [ -n "$KV_PREVIEW_ID" ]; then
        echo "📝 预览环境 KV 命名空间 ID: $KV_PREVIEW_ID"
        
        # 更新 wrangler.toml 文件
        sed -i.bak "s/preview_id = \"your-preview-kv-namespace-id\"/preview_id = \"$KV_PREVIEW_ID\"/" wrangler.toml
        
        echo "✅ wrangler.toml 预览配置已更新"
    fi
fi

# 询问是否要自定义 Worker 名称
echo ""
read -p "🏷️ 是否要自定义 Worker 名称？(当前: subscription-converter) [y/N]: " customize_name

if [[ $customize_name =~ ^[Yy]$ ]]; then
    read -p "请输入新的 Worker 名称: " worker_name
    
    if [ -n "$worker_name" ]; then
        sed -i.bak "s/name = \"subscription-converter\"/name = \"$worker_name\"/" wrangler.toml
        echo "✅ Worker 名称已更新为: $worker_name"
    fi
fi

# 询问部署选项
echo ""
echo "🚀 准备部署..."
echo "1. 部署到生产环境"
echo "2. 启动开发环境"
echo "3. 仅验证配置"

read -p "请选择操作 [1-3]: " deploy_option

case $deploy_option in
    1)
        echo "🚀 部署到生产环境..."
        npx wrangler deploy
        
        if [ $? -eq 0 ]; then
            echo ""
            echo "🎉 部署成功！"
            echo ""
            echo "📋 部署信息:"
            echo "- 生产环境: https://$(grep 'name = ' wrangler.toml | cut -d'"' -f2).$(npx wrangler whoami | grep 'Account ID' | awk '{print $3}').workers.dev"
            echo "- 管理面板: 在上述地址后添加 /admin"
            echo "- 默认 Token: default"
            echo ""
            echo "🔧 下一步:"
            echo "1. 访问管理面板配置节点"
            echo "2. 设置反代IP（可选）"
            echo "3. 自定义INI模板（可选）"
            echo "4. 获取订阅链接"
        else
            echo "❌ 部署失败"
            exit 1
        fi
        ;;
    2)
        echo "🛠️ 启动开发环境..."
        echo "开发服务器将在 http://localhost:8787 启动"
        echo "按 Ctrl+C 停止开发服务器"
        npx wrangler dev
        ;;
    3)
        echo "✅ 验证配置..."
        npx wrangler deploy --dry-run
        
        if [ $? -eq 0 ]; then
            echo "✅ 配置验证成功，可以正常部署"
        else
            echo "❌ 配置验证失败，请检查配置"
            exit 1
        fi
        ;;
    *)
        echo "❌ 无效选择"
        exit 1
        ;;
esac

echo ""
echo "📚 更多信息请查看 README.md 文件"
echo "🐛 如有问题，请提交 Issue"
echo ""
echo "感谢使用 Cloudflare Workers 订阅转换服务！"
