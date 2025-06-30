@echo off
chcp 65001 >nul
echo 🚀 Cloudflare Workers 订阅转换服务部署脚本
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

REM 创建 KV 命名空间
echo 🗄️ 创建 KV 命名空间...
npx wrangler kv:namespace create "CONFIG_KV" >kv_output.tmp 2>&1
if %errorlevel% equ 0 (
    echo ✅ KV 命名空间创建成功
    echo ⚠️ 请手动复制 KV 命名空间 ID 到 wrangler.toml 文件
    type kv_output.tmp
) else (
    echo ⚠️ KV 命名空间可能已存在，请检查 wrangler.toml 配置
)

REM 创建预览环境的 KV 命名空间
echo 🗄️ 创建预览环境 KV 命名空间...
npx wrangler kv:namespace create "CONFIG_KV" --preview >kv_preview_output.tmp 2>&1
if %errorlevel% equ 0 (
    echo ✅ 预览环境 KV 命名空间创建成功
    type kv_preview_output.tmp
)

REM 清理临时文件
del kv_output.tmp >nul 2>&1
del kv_preview_output.tmp >nul 2>&1

REM 询问是否要自定义 Worker 名称
echo.
set /p customize_name="🏷️ 是否要自定义 Worker 名称？(当前: subscription-converter) [y/N]: "
if /i "%customize_name%"=="y" (
    set /p worker_name="请输入新的 Worker 名称: "
    if not "!worker_name!"=="" (
        powershell -Command "(Get-Content wrangler.toml) -replace 'name = \"subscription-converter\"', 'name = \"!worker_name!\"' | Set-Content wrangler.toml"
        echo ✅ Worker 名称已更新为: !worker_name!
    )
)

REM 询问部署选项
echo.
echo 🚀 准备部署...
echo 1. 部署到生产环境
echo 2. 启动开发环境
echo 3. 仅验证配置

set /p deploy_option="请选择操作 [1-3]: "

if "%deploy_option%"=="1" (
    echo 🚀 部署到生产环境...
    npx wrangler deploy
    if %errorlevel% equ 0 (
        echo.
        echo 🎉 部署成功！
        echo.
        echo 📋 部署信息:
        echo - 访问你的 Workers 域名查看服务
        echo - 管理面板: 在域名后添加 /admin
        echo - 默认 Token: default
        echo.
        echo 🔧 下一步:
        echo 1. 访问管理面板配置节点
        echo 2. 设置反代IP（可选）
        echo 3. 自定义INI模板（可选）
        echo 4. 获取订阅链接
    ) else (
        echo ❌ 部署失败
        pause
        exit /b 1
    )
) else if "%deploy_option%"=="2" (
    echo 🛠️ 启动开发环境...
    echo 开发服务器将在 http://localhost:8787 启动
    echo 按 Ctrl+C 停止开发服务器
    npx wrangler dev
) else if "%deploy_option%"=="3" (
    echo ✅ 验证配置...
    npx wrangler deploy --dry-run
    if %errorlevel% equ 0 (
        echo ✅ 配置验证成功，可以正常部署
    ) else (
        echo ❌ 配置验证失败，请检查配置
        pause
        exit /b 1
    )
) else (
    echo ❌ 无效选择
    pause
    exit /b 1
)

echo.
echo 📚 更多信息请查看 README.md 文件
echo 🐛 如有问题，请提交 Issue
echo.
echo 感谢使用 Cloudflare Workers 订阅转换服务！
pause
