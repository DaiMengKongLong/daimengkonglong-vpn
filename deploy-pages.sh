#!/bin/bash

# Cloudflare Pages 订阅转换服务部署脚本

echo "📄 Cloudflare Pages 订阅转换服务部署脚本"
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

# 询问部署方式
echo ""
echo "📄 Cloudflare Pages 部署选项:"
echo "1. 通过 Git 仓库部署 (推荐)"
echo "2. 通过 Wrangler CLI 直接部署"
echo "3. 创建 KV 命名空间"
echo "4. 本地开发测试"

read -p "请选择操作 [1-4]: " deploy_option

case $deploy_option in
    1)
        echo "📄 Git 仓库部署指南:"
        echo ""
        echo "1. 将代码推送到 Git 仓库 (GitHub, GitLab 等)"
        echo "2. 登录 Cloudflare Dashboard"
        echo "3. 进入 Pages 页面，点击 'Create a project'"
        echo "4. 连接你的 Git 仓库"
        echo "5. 配置构建设置:"
        echo "   - Framework preset: None"
        echo "   - Build command: (留空)"
        echo "   - Build output directory: /"
        echo "   - Root directory: /"
        echo "6. 在环境变量中添加:"
        echo "   - CONFIG_KV: (你的KV命名空间ID)"
        echo "7. 点击 'Save and Deploy'"
        echo ""
        echo "📋 Git 仓库部署的优势:"
        echo "- 自动部署: 代码推送后自动部署"
        echo "- 版本控制: 完整的部署历史"
        echo "- 回滚支持: 可以快速回滚到之前版本"
        echo "- 分支部署: 支持预览分支"
        ;;
    2)
        echo "🚀 通过 Wrangler 直接部署到 Pages..."
        
        # 询问项目名称
        read -p "请输入 Pages 项目名称: " pages_project_name
        
        if [ -z "$pages_project_name" ]; then
            echo "❌ 项目名称不能为空"
            exit 1
        fi
        
        # 创建 Pages 项目
        echo "📄 创建 Pages 项目..."
        npx wrangler pages project create "$pages_project_name"
        
        if [ $? -eq 0 ]; then
            echo "✅ Pages 项目创建成功"
            
            # 部署到 Pages
            echo "🚀 部署到 Pages..."
            npx wrangler pages deploy . --project-name="$pages_project_name"
            
            if [ $? -eq 0 ]; then
                echo ""
                echo "🎉 Pages 部署成功！"
                echo ""
                echo "📋 部署信息:"
                echo "- 项目名称: $pages_project_name"
                echo "- 访问地址: https://$pages_project_name.pages.dev"
                echo "- 管理面板: https://$pages_project_name.pages.dev/admin"
                echo ""
                echo "🔧 下一步:"
                echo "1. 在 Cloudflare Dashboard 中配置 KV 绑定"
                echo "2. 设置环境变量 CONFIG_KV"
                echo "3. 访问管理面板配置节点"
            else
                echo "❌ Pages 部署失败"
                exit 1
            fi
        else
            echo "❌ Pages 项目创建失败"
            exit 1
        fi
        ;;
    3)
        echo "🗄️ 创建 KV 命名空间..."
        
        # 创建生产环境 KV
        echo "创建生产环境 KV 命名空间..."
        KV_OUTPUT=$(npx wrangler kv:namespace create "CONFIG_KV" 2>&1)
        
        if [ $? -eq 0 ]; then
            echo "✅ 生产环境 KV 命名空间创建成功"
            echo "$KV_OUTPUT"
            
            # 提取 KV ID
            KV_ID=$(echo "$KV_OUTPUT" | grep -o 'id = "[^"]*"' | cut -d'"' -f2)
            
            if [ -n "$KV_ID" ]; then
                echo ""
                echo "📝 请在 Cloudflare Pages 项目设置中添加以下环境变量:"
                echo "变量名: CONFIG_KV"
                echo "变量值: $KV_ID"
                echo ""
                echo "📍 设置路径: Cloudflare Dashboard > Pages > 你的项目 > Settings > Environment variables"
            fi
        else
            echo "⚠️ KV 命名空间创建失败或已存在"
        fi
        
        # 创建预览环境 KV
        echo ""
        echo "创建预览环境 KV 命名空间..."
        KV_PREVIEW_OUTPUT=$(npx wrangler kv:namespace create "CONFIG_KV" --preview 2>&1)
        
        if [ $? -eq 0 ]; then
            echo "✅ 预览环境 KV 命名空间创建成功"
            echo "$KV_PREVIEW_OUTPUT"
        fi
        ;;
    4)
        echo "🛠️ 启动本地开发环境..."
        echo "本地服务器将在 http://localhost:8787 启动"
        echo "按 Ctrl+C 停止开发服务器"
        echo ""
        echo "注意: 本地开发使用 Workers 模式"
        npx wrangler dev
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
echo "感谢使用 Cloudflare Pages 订阅转换服务！"
