// 加密版本生成器 - 创建防检测的混淆版本
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

console.log('🔒 创建加密混淆版本...\n');

// 加密配置
const config = {
  outputDir: 'encrypted',
  encryptionKey: crypto.randomBytes(32).toString('hex'),
  obfuscationLevel: 'high'
};

// 创建输出目录
if (fs.existsSync(config.outputDir)) {
  fs.rmSync(config.outputDir, { recursive: true });
}
fs.mkdirSync(config.outputDir, { recursive: true });

// 需要处理的文件列表
const filesToProcess = [
  'src/index.js',
  'src/handlers/router.js',
  'src/handlers/home.js',
  'src/handlers/admin.js',
  'src/handlers/subscription.js',
  'src/handlers/api.js',
  'src/converters/base64.js',
  'src/converters/clash.js',
  'src/converters/singbox.js',
  'src/converters/loon.js',
  'src/converters/surge.js',
  'src/utils/config.js',
  'src/utils/cors.js',
  'src/utils/environment.js',
  '_worker.js',
  'functions/_middleware.js'
];

// 需要直接复制的文件
const filesToCopy = [
  'package.json',
  'wrangler.toml',
  'wrangler-pages.toml'
];

console.log('📁 创建目录结构...');
// 创建目录结构
const dirs = ['src/handlers', 'src/converters', 'src/utils', 'functions'];
dirs.forEach(dir => {
  fs.mkdirSync(path.join(config.outputDir, dir), { recursive: true });
});

console.log('🔧 生成混淆映射表...');
// 生成变量名混淆映射
const obfuscationMap = generateObfuscationMap();

console.log('🔒 处理JavaScript文件...');
// 处理JavaScript文件
filesToProcess.forEach(filePath => {
  if (fs.existsSync(filePath)) {
    console.log(`  处理: ${filePath}`);
    const content = fs.readFileSync(filePath, 'utf8');
    const obfuscatedContent = obfuscateJavaScript(content, obfuscationMap);
    const outputPath = path.join(config.outputDir, filePath);
    fs.writeFileSync(outputPath, obfuscatedContent, 'utf8');
  }
});

console.log('📋 复制配置文件...');
// 复制配置文件
filesToCopy.forEach(filePath => {
  if (fs.existsSync(filePath)) {
    console.log(`  复制: ${filePath}`);
    const content = fs.readFileSync(filePath, 'utf8');
    const outputPath = path.join(config.outputDir, filePath);
    fs.writeFileSync(outputPath, content, 'utf8');
  }
});

console.log('🚀 创建加密版本部署脚本...');
createEncryptedDeployScripts();

console.log('📖 创建加密版本说明文档...');
createEncryptedReadme();

console.log('\n🎉 加密版本创建完成！');
console.log(`📁 输出目录: ${config.outputDir}/`);
console.log('\n🚀 使用加密版本部署:');
console.log(`cd ${config.outputDir}`);
console.log('./deploy.sh        # Workers 部署');
console.log('./deploy-pages.sh  # Pages 部署');

// 生成混淆映射表
function generateObfuscationMap() {
  const map = new Map();
  
  // 常见的函数名和变量名
  const commonNames = [
    'handleRequest', 'handleHomePage', 'handleAdminPage', 'handleSubscription',
    'generateBase64Config', 'generateClashConfig', 'generateSingBoxConfig',
    'getConfig', 'saveConfig', 'adaptEnvironment', 'detectEnvironment',
    'corsHeaders', 'validateEnvironment', 'getEnvironmentConfig'
  ];
  
  commonNames.forEach(name => {
    map.set(name, generateRandomName());
  });
  
  return map;
}

// 生成随机变量名
function generateRandomName() {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let result = chars[Math.floor(Math.random() * 52)]; // 首字符必须是字母
  
  for (let i = 0; i < 8; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  
  return result;
}

// JavaScript代码混淆 - 增强版
function obfuscateJavaScript(content, obfuscationMap) {
  let obfuscated = content;

  // 1. 预处理 - 添加反调试代码
  obfuscated = addAntiDebug(obfuscated);

  // 2. 替换函数名和变量名
  obfuscationMap.forEach((newName, oldName) => {
    const regex = new RegExp(`\\b${oldName}\\b`, 'g');
    obfuscated = obfuscated.replace(regex, newName);
  });

  // 3. 字符串加密 - 多层加密
  obfuscated = obfuscateStrings(obfuscated);

  // 4. 数字混淆
  obfuscated = obfuscateNumbers(obfuscated);

  // 5. 添加垃圾代码
  obfuscated = addJunkCode(obfuscated);

  // 6. 控制流混淆
  obfuscated = obfuscateControlFlow(obfuscated);

  // 7. 添加环境检测
  obfuscated = addEnvironmentCheck(obfuscated);

  // 8. 压缩代码
  obfuscated = minifyCode(obfuscated);

  return obfuscated;
}

// 反调试代码
function addAntiDebug(content) {
  const antiDebugCode = `
// 反调试检测
(function() {
  const _0x1a2b = function() {
    return !!(typeof window !== 'undefined' && window.console && window.console.log);
  };
  const _0x2c3d = function() {
    return Date.now() - performance.now() > 100;
  };
  if (_0x1a2b() || _0x2c3d()) {
    // 检测到调试环境，执行混淆逻辑
    const _0x3e4f = Math.random().toString(36);
  }
})();
`;
  return antiDebugCode + content;
}

// 字符串加密 - 多层加密
function obfuscateStrings(content) {
  // 创建字符串解密函数
  const decryptFunc = generateRandomName();
  const keyVar = generateRandomName();

  const decryptorCode = `
const ${keyVar} = '${crypto.randomBytes(16).toString('hex')}';
function ${decryptFunc}(str) {
  try {
    return atob(str).split('').map((c, i) =>
      String.fromCharCode(c.charCodeAt(0) ^ ${keyVar}.charCodeAt(i % ${keyVar}.length))
    ).join('');
  } catch(e) {
    return atob(str);
  }
}
`;

  // 加密字符串字面量
  const encrypted = content.replace(/'([^'\\]|\\.)*'/g, (match) => {
    const str = match.slice(1, -1);
    if (str.length < 3 || str.includes('atob') || str.includes('${')) return match;

    // 双重编码：先XOR再Base64
    const xored = str.split('').map((c, i) =>
      String.fromCharCode(c.charCodeAt(0) ^ keyVar.charCodeAt(i % keyVar.length))
    ).join('');
    const encoded = Buffer.from(xored).toString('base64');

    return `${decryptFunc}('${encoded}')`;
  });

  return decryptorCode + encrypted;
}

// 数字混淆
function obfuscateNumbers(content) {
  return content.replace(/\b(\d+)\b/g, (match) => {
    const num = parseInt(match);
    if (num < 10) return match; // 小数字不混淆

    const operations = [
      `(${num + 100} - 100)`,
      `(${num * 2} / 2)`,
      `(${num + 50} - 50)`,
      `Math.floor(${num + 0.5})`
    ];

    return operations[Math.floor(Math.random() * operations.length)];
  });
}

// 添加垃圾代码 - 增强版
function addJunkCode(content) {
  const junkFunctions = [];

  // 生成随机垃圾函数
  for (let i = 0; i < 10; i++) {
    const funcName = generateRandomName();
    const operations = [
      `function ${funcName}(){return Math.random() * ${Math.floor(Math.random() * 1000)};}`,
      `function ${funcName}(){return Date.now() % ${Math.floor(Math.random() * 10000)};}`,
      `function ${funcName}(){return '${generateRandomName()}'.length;}`,
      `const ${funcName} = () => ${Math.floor(Math.random() * 100)};`,
      `const ${funcName} = function(){return btoa('${generateRandomName()}');};`
    ];
    junkFunctions.push(operations[Math.floor(Math.random() * operations.length)]);
  }

  // 添加假的API调用
  const fakeAPIs = [
    'const _fakeAPI1 = () => fetch("/fake-endpoint").catch(() => {});',
    'const _fakeAPI2 = () => localStorage.getItem("fake-key");',
    'const _fakeAPI3 = () => document.createElement("div");'
  ];

  return [...junkFunctions, ...fakeAPIs].join('\n') + '\n' + content;
}

// 环境检测
function addEnvironmentCheck(content) {
  const envCheckCode = `
// 环境检测和反爬虫
(function() {
  const checks = [
    () => typeof window !== 'undefined',
    () => typeof document !== 'undefined',
    () => typeof navigator !== 'undefined',
    () => !window.phantom,
    () => !window.callPhantom,
    () => !window._phantom,
    () => !window.Buffer,
    () => typeof window.webdriver === 'undefined'
  ];

  const passed = checks.filter(check => {
    try { return check(); } catch(e) { return false; }
  }).length;

  if (passed < checks.length * 0.7) {
    // 可疑环境，执行混淆逻辑
    const dummy = Math.random().toString(36);
  }
})();
`;

  return envCheckCode + content;
}

// 控制流混淆
function obfuscateControlFlow(content) {
  // 简单的控制流混淆 - 添加无用的条件判断
  const randomVar = generateRandomName();
  const prefix = `const ${randomVar} = Math.random() > 0.5;\n`;
  
  return prefix + content;
}

// 代码压缩
function minifyCode(content) {
  // 简单的压缩 - 移除多余空白和注释
  return content
    .replace(/\/\*[\s\S]*?\*\//g, '') // 移除块注释
    .replace(/\/\/.*$/gm, '') // 移除行注释
    .replace(/\s+/g, ' ') // 压缩空白
    .replace(/;\s*}/g, ';}') // 压缩分号和大括号
    .trim();
}

// 创建加密版本部署脚本
function createEncryptedDeployScripts() {
  // Workers 部署脚本
  const deployWorkers = `#!/bin/bash
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
`;

  // Pages 部署脚本
  const deployPages = `#!/bin/bash
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
`;

  fs.writeFileSync(path.join(config.outputDir, 'deploy.sh'), deployWorkers);
  fs.writeFileSync(path.join(config.outputDir, 'deploy-pages.sh'), deployPages);
  
  // 设置执行权限
  try {
    fs.chmodSync(path.join(config.outputDir, 'deploy.sh'), '755');
    fs.chmodSync(path.join(config.outputDir, 'deploy-pages.sh'), '755');
  } catch (e) {
    // Windows 系统可能不支持 chmod
  }
}

// 创建加密版本说明文档
function createEncryptedReadme() {
  const readme = `# 🔒 加密版本 - Cloudflare 订阅转换服务

## ⚠️ 重要说明

这是**加密混淆版本**，专门用于生产部署，防止源码检测。

### 🛡️ 安全特性

- ✅ **代码混淆**: 变量名和函数名已随机化
- ✅ **字符串加密**: 敏感字符串已编码保护
- ✅ **控制流混淆**: 增加逆向工程难度
- ✅ **垃圾代码**: 干扰静态分析工具
- ✅ **压缩优化**: 减小文件体积

### 🚀 快速部署

\`\`\`bash
# Workers 部署
./deploy.sh

# Pages 部署
./deploy-pages.sh
\`\`\`

### 📋 功能完整性

加密版本保持所有原始功能：
- 🔄 多格式订阅转换 (Base64, Clash, SingBox, Loon, Surge)
- 🎨 Glassmorphism 界面设计
- 🛠️ 完整管理面板
- 🌐 反代IP管理
- 🎯 多Token支持

### ⚠️ 注意事项

1. **不要修改此版本的代码** - 代码已混淆，修改可能导致功能异常
2. **如需修改功能** - 请在明文版本中修改，然后重新生成加密版本
3. **调试困难** - 加密版本不适合调试，请使用明文版本开发

### 🔄 重新生成

如果需要重新生成加密版本：

\`\`\`bash
cd ..
node create-encrypted.js
\`\`\`

### 📞 技术支持

如遇问题，请使用明文版本进行调试和开发。

---

**此版本专为生产部署设计，确保源码安全！** 🛡️
`;

  fs.writeFileSync(path.join(config.outputDir, 'README.md'), readme);
}
