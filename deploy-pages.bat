@echo off
chcp 65001 >nul
echo 📄 Cloudflare Pages 订阅转换服务部署脚本
echo ============================================

REM 检查是否安装了 Node.js
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ 错误: 未找到 Node.js，请先安装 Node.js
    pause
    exit /b 1
)

REM 检查是否安装了 npm
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ 错误: 未找到 npm，请先安装 npm
    pause
    exit /b 1
)

echo ✅ Node.js 和 npm 已安装

REM 安装依赖
echo 📦 安装项目依赖...
npm install
if %errorlevel% neq 0 (
    echo ❌ 依赖安装失败
    pause
    exit /b 1
)

echo ✅ 依赖安装成功

REM 检查是否已登录 Cloudflare
echo 🔐 检查 Cloudflare 登录状态...
npx wrangler whoami >nul 2>&1
if %errorlevel% neq 0 (
    echo 🔑 请先登录 Cloudflare:
    npx wrangler login
    if %errorlevel% neq 0 (
        echo ❌ Cloudflare 登录失败
        pause
        exit /b 1
    )
)

echo ✅ Cloudflare 登录成功

REM 询问部署方式
echo.
echo 📄 Cloudflare Pages 部署选项:
echo 1. 通过 Git 仓库部署 (推荐)
echo 2. 通过 Wrangler CLI 直接部署
echo 3. 创建 KV 命名空间
echo 4. 本地开发测试

set /p deploy_option="请选择操作 [1-4]: "

if "%deploy_option%"=="1" (
    echo 📄 Git 仓库部署指南:
    echo.
    echo 1. 将代码推送到 Git 仓库 (GitHub, GitLab 等)
    echo 2. 登录 Cloudflare Dashboard
    echo 3. 进入 Pages 页面，点击 'Create a project'
    echo 4. 连接你的 Git 仓库
    echo 5. 配置构建设置:
    echo    - Framework preset: None
    echo    - Build command: (留空)
    echo    - Build output directory: /
    echo    - Root directory: /
    echo 6. 在环境变量中添加:
    echo    - CONFIG_KV: (你的KV命名空间ID)
    echo 7. 点击 'Save and Deploy'
    echo.
    echo 📋 Git 仓库部署的优势:
    echo - 自动部署: 代码推送后自动部署
    echo - 版本控制: 完整的部署历史
    echo - 回滚支持: 可以快速回滚到之前版本
    echo - 分支部署: 支持预览分支
) else if "%deploy_option%"=="2" (
    echo 🚀 通过 Wrangler 直接部署到 Pages...
    
    set /p pages_project_name="请输入 Pages 项目名称: "
    
    if "!pages_project_name!"=="" (
        echo ❌ 项目名称不能为空
        pause
        exit /b 1
    )
    
    echo 📄 创建 Pages 项目...
    npx wrangler pages project create "!pages_project_name!"
    
    if %errorlevel% equ 0 (
        echo ✅ Pages 项目创建成功
        
        echo 🚀 部署到 Pages...
        npx wrangler pages deploy . --project-name="!pages_project_name!"
        
        if %errorlevel% equ 0 (
            echo.
            echo 🎉 Pages 部署成功！
            echo.
            echo 📋 部署信息:
            echo - 项目名称: !pages_project_name!
            echo - 访问地址: https://!pages_project_name!.pages.dev
            echo - 管理面板: https://!pages_project_name!.pages.dev/admin
            echo.
            echo 🔧 下一步:
            echo 1. 在 Cloudflare Dashboard 中配置 KV 绑定
            echo 2. 设置环境变量 CONFIG_KV
            echo 3. 访问管理面板配置节点
        ) else (
            echo ❌ Pages 部署失败
            pause
            exit /b 1
        )
    ) else (
        echo ❌ Pages 项目创建失败
        pause
        exit /b 1
    )
) else if "%deploy_option%"=="3" (
    echo 🗄️ 创建 KV 命名空间...
    
    echo 创建生产环境 KV 命名空间...
    npx wrangler kv:namespace create "CONFIG_KV" >kv_output.tmp 2>&1
    
    if %errorlevel% equ 0 (
        echo ✅ 生产环境 KV 命名空间创建成功
        type kv_output.tmp
        echo.
        echo 📝 请在 Cloudflare Pages 项目设置中添加环境变量:
        echo 变量名: CONFIG_KV
        echo 变量值: (从上面输出中复制 ID)
        echo.
        echo 📍 设置路径: Cloudflare Dashboard ^> Pages ^> 你的项目 ^> Settings ^> Environment variables
    ) else (
        echo ⚠️ KV 命名空间创建失败或已存在
        type kv_output.tmp
    )
    
    echo.
    echo 创建预览环境 KV 命名空间...
    npx wrangler kv:namespace create "CONFIG_KV" --preview >kv_preview_output.tmp 2>&1
    
    if %errorlevel% equ 0 (
        echo ✅ 预览环境 KV 命名空间创建成功
        type kv_preview_output.tmp
    )
    
    del kv_output.tmp >nul 2>&1
    del kv_preview_output.tmp >nul 2>&1
) else if "%deploy_option%"=="4" (
    echo 🛠️ 启动本地开发环境...
    echo 本地服务器将在 http://localhost:8787 启动
    echo 按 Ctrl+C 停止开发服务器
    echo.
    echo 注意: 本地开发使用 Workers 模式
    npx wrangler dev
) else (
    echo ❌ 无效选择
    pause
    exit /b 1
)

echo.
echo 📚 更多信息请查看 README.md 文件
echo 🐛 如有问题，请提交 Issue
echo.
echo 感谢使用 Cloudflare Pages 订阅转换服务！
pause
