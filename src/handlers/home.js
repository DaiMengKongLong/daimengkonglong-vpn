import { getConfig } from '../utils/config.js';

export async function handleHomePage(request, env) {
  const url = new URL(request.url);
  const token = url.searchParams.get('token') || 'default';
  
  try {
    const config = await getConfig(env, token);
    const baseUrl = url.protocol + '//' + url.host;
    
    const html = generateHomePage(config, baseUrl, token);
    
    return new Response(html, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      }
    });
  } catch (error) {
    console.error('首页生成错误:', error);
    return new Response('服务器错误', { status: 500 });
  }
}

function generateHomePage(config, baseUrl, token) {
  const subscriptionLinks = [
    { name: 'Base64订阅', url: baseUrl + '/sub/base64?token=' + token, icon: '📝' },
    { name: 'Clash订阅', url: baseUrl + '/sub/clash?token=' + token, icon: '⚔️' },
    { name: 'SingBox订阅', url: baseUrl + '/sub/singbox?token=' + token, icon: '📦' },
    { name: 'Loon订阅', url: baseUrl + '/sub/loon?token=' + token, icon: '🌙' },
    { name: 'Surge订阅', url: baseUrl + '/sub/surge?token=' + token, icon: '🌊' }
  ];

  return '<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>' + config.customTitle || \'节点订阅服务\' + '</title>
    <style>
        ' + getGlassmorphismCSS() + '
        ' + config.customCSS || \'\'
    </style>
</head>
<body>
    <div class="background">
        <div class="shape"></div>
        <div class="shape"></div>
        <div class="shape"></div>
    </div>
    
    <div class="container">
        <header class="glass-card">
            <div class="logo">
                <img src="' + config.icon + '" alt="Logo" class="logo-img">
                <h1>' + config.name || \'节点订阅服务\' + '</h1>
            </div>
            <p class="description">' + config.description || \'多格式订阅转换服务\' + '</p>
        </header>

        <main class="main-content">
            <section class="subscription-section">
                <h2>📡 订阅链接</h2>
                <div class="subscription-grid">
                    ' + subscriptionLinks.map(link => '
                        <div class="subscription-card glass-card" onclick="copyToClipboard('${link.url + '')">
                            <div class="subscription-icon">' + link.icon + '</div>
                            <h3>' + link.name + '</h3>
                            <p class="subscription-url">' + link.url + '</p>
                            <button class="copy-btn">📋 复制链接</button>
                        </div>
                    ').join('')
                </div>
            </section>

            <section class="config-section">
                <h2>⚙️ 配置信息</h2>
                <div class="config-card glass-card">
                    <div class="config-item">
                        <span class="config-label">节点数量:</span>
                        <span class="config-value">' + config.nodes ? config.nodes.length : 0 + '</span>
                    </div>
                    <div class="config-item">
                        <span class="config-label">反代IP数量:</span>
                        <span class="config-value">' + config.proxyIPs ? config.proxyIPs.length : 0 + '</span>
                    </div>
                    <div class="config-item">
                        <span class="config-label">Token:</span>
                        <span class="config-value">' + token + '</span>
                    </div>
                </div>
            </section>

            <section class="ini-section">
                <h2>📄 INI配置</h2>
                <div class="ini-card glass-card">
                    <textarea readonly class="ini-content">' + config.iniTemplate || '' + '</textarea>
                    <button class="copy-btn" onclick="copyIniConfig()">📋 复制INI配置</button>
                </div>
            </section>
        </main>

        <footer class="glass-card">
            <p>© 2024 节点订阅服务 | 
                <a href="' + baseUrl + '/admin?token=' + token + '" class="admin-link">🔧 管理面板</a>
            </p>
        </footer>
    </div>

    <div id="toast" class="toast"></div>

    <script>
        ' + getJavaScript() + '
    </script>
</body>
</html>`;

function getGlassmorphismCSS() {
  return '
    * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
    }

    body {
        font-family: 'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        min-height: 100vh;
        overflow-x: hidden;
    }

    .background {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: -1;
    }

    .shape {
        position: absolute;
        border-radius: 50%;
        filter: blur(40px);
        animation: float 6s ease-in-out infinite;
    }

    .shape:nth-child(1) {
        width: 300px;
        height: 300px;
        background: linear-gradient(45deg, #ff6b6b, #feca57);
        top: 10%;
        left: 10%;
        animation-delay: 0s;
    }

    .shape:nth-child(2) {
        width: 200px;
        height: 200px;
        background: linear-gradient(45deg, #48cae4, #023e8a);
        top: 60%;
        right: 10%;
        animation-delay: 2s;
    }

    .shape:nth-child(3) {
        width: 250px;
        height: 250px;
        background: linear-gradient(45deg, #f093fb, #f5576c);
        bottom: 10%;
        left: 50%;
        animation-delay: 4s;
    }

    @keyframes float {
        0%, 100% { transform: translateY(0px) rotate(0deg); }
        33% { transform: translateY(-20px) rotate(120deg); }
        66% { transform: translateY(20px) rotate(240deg); }
    }

    .container {
        max-width: 1200px;
        margin: 0 auto;
        padding: 20px;
        position: relative;
        z-index: 1;
    }

    .glass-card {
        background: rgba(255, 255, 255, 0.1);
        backdrop-filter: blur(20px);
        border-radius: 20px;
        border: 1px solid rgba(255, 255, 255, 0.2);
        padding: 30px;
        margin: 20px 0;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
        transition: all 0.3s ease;
    }

    .glass-card:hover {
        transform: translateY(-5px);
        box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
    }

    .logo {
        display: flex;
        align-items: center;
        gap: 15px;
        margin-bottom: 15px;
    }

    .logo-img {
        width: 60px;
        height: 60px;
        border-radius: 15px;
        object-fit: cover;
    }

    h1 {
        color: white;
        font-size: 2.5em;
        font-weight: 700;
        text-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
    }

    h2 {
        color: white;
        font-size: 1.8em;
        margin-bottom: 20px;
        text-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
    }

    .description {
        color: rgba(255, 255, 255, 0.8);
        font-size: 1.1em;
        line-height: 1.6;
    }

    .subscription-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        gap: 20px;
        margin-top: 20px;
    }

    .subscription-card {
        text-align: center;
        cursor: pointer;
        transition: all 0.3s ease;
        position: relative;
        overflow: hidden;
    }

    .subscription-card::before {
        content: '';
        position: absolute;
        top: 0;
        left: -100%;
        width: 100%;
        height: 100%;
        background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
        transition: left 0.5s;
    }

    .subscription-card:hover::before {
        left: 100%;
    }

    .subscription-icon {
        font-size: 3em;
        margin-bottom: 15px;
    }

    .subscription-card h3 {
        color: white;
        font-size: 1.3em;
        margin-bottom: 10px;
    }

    .subscription-url {
        color: rgba(255, 255, 255, 0.7);
        font-size: 0.9em;
        word-break: break-all;
        margin-bottom: 15px;
        line-height: 1.4;
    }

    .copy-btn {
        background: linear-gradient(45deg, #667eea, #764ba2);
        color: white;
        border: none;
        padding: 10px 20px;
        border-radius: 25px;
        cursor: pointer;
        font-weight: 600;
        transition: all 0.3s ease;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
    }

    .copy-btn:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
    }

    .config-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 15px 0;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }

    .config-item:last-child {
        border-bottom: none;
    }

    .config-label {
        color: rgba(255, 255, 255, 0.8);
        font-weight: 600;
    }

    .config-value {
        color: white;
        font-weight: 700;
        background: rgba(255, 255, 255, 0.1);
        padding: 5px 15px;
        border-radius: 15px;
    }

    .ini-content {
        width: 100%;
        height: 200px;
        background: rgba(0, 0, 0, 0.2);
        border: 1px solid rgba(255, 255, 255, 0.2);
        border-radius: 10px;
        padding: 15px;
        color: white;
        font-family: 'Monaco', 'Menlo', monospace;
        font-size: 0.9em;
        resize: vertical;
        margin-bottom: 15px;
    }

    footer {
        text-align: center;
        margin-top: 40px;
    }

    footer p {
        color: rgba(255, 255, 255, 0.8);
    }

    .admin-link {
        color: #feca57;
        text-decoration: none;
        font-weight: 600;
        transition: color 0.3s ease;
    }

    .admin-link:hover {
        color: #ff6b6b;
    }

    .toast {
        position: fixed;
        top: 20px;
        right: 20px;
        background: rgba(0, 0, 0, 0.8);
        color: white;
        padding: 15px 25px;
        border-radius: 10px;
        transform: translateX(400px);
        transition: transform 0.3s ease;
        z-index: 1000;
    }

    .toast.show {
        transform: translateX(0);
    }

    @media (max-width: 768px) {
        .container {
            padding: 10px;
        }

        .glass-card {
            padding: 20px;
        }

        h1 {
            font-size: 2em;
        }

        .subscription-grid {
            grid-template-columns: 1fr;
        }

        .logo {
            flex-direction: column;
            text-align: center;
        }
    }
  ';
}

function getJavaScript() {
  return '
    function copyToClipboard(text) {
        navigator.clipboard.writeText(text).then(function() {
            showToast('链接已复制到剪贴板！');
        }).catch(function(err) {
            // 降级方案
            const textArea = document.createElement('textarea');
            textArea.value = text;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            showToast('链接已复制到剪贴板！');
        });
    }

    function copyIniConfig() {
        const iniContent = document.querySelector('.ini-content');
        copyToClipboard(iniContent.value);
    }

    function showToast(message) {
        const toast = document.getElementById('toast');
        toast.textContent = message;
        toast.classList.add('show');

        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }

    // 添加页面加载动画
    document.addEventListener('DOMContentLoaded', function() {
        const cards = document.querySelectorAll('.glass-card');
        cards.forEach((card, index) => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(30px)';

            setTimeout(() => {
                card.style.transition = 'all 0.6s ease';
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }, index * 100);
        });
    });

    // 添加鼠标跟随效果
    document.addEventListener('mousemove', function(e) {
        const shapes = document.querySelectorAll('.shape');
        const x = e.clientX / window.innerWidth;
        const y = e.clientY / window.innerHeight;

        shapes.forEach((shape, index) => {
            const speed = (index + 1) * 0.5;
            const xOffset = (x - 0.5) * speed * 20;
            const yOffset = (y - 0.5) * speed * 20;

            shape.style.transform = "translate(" + xOffset + "px, " + yOffset + "px)";
        });
    });
  ';
}
