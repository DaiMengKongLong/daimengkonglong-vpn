// 版本管理器 - 管理明文版本和加密版本
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('📦 版本管理器');
console.log('============================================\n');

// 检查版本状态
function checkVersions() {
  const hasPlaintext = fs.existsSync('src/index.js');
  const hasEncrypted = fs.existsSync('encrypted/src/index.js');
  
  console.log('📊 版本状态:');
  console.log(`📝 明文版本: ${hasPlaintext ? '✅ 存在' : '❌ 不存在'}`);
  console.log(`🔒 加密版本: ${hasEncrypted ? '✅ 存在' : '❌ 不存在'}`);
  
  return { hasPlaintext, hasEncrypted };
}

// 显示菜单
function showMenu() {
  console.log('\n🎯 可用操作:');
  console.log('1. 📝 查看明文版本信息');
  console.log('2. 🔒 生成/更新加密版本');
  console.log('3. 🚀 部署明文版本');
  console.log('4. 🛡️ 部署加密版本');
  console.log('5. 🔍 比较两个版本');
  console.log('6. 🧹 清理加密版本');
  console.log('7. 📋 显示部署状态');
  console.log('0. 🚪 退出');
}

// 主函数
function main() {
  const versions = checkVersions();
  
  if (!versions.hasPlaintext) {
    console.log('❌ 错误: 明文版本不存在，请确保在正确的目录中运行此脚本');
    process.exit(1);
  }
  
  showMenu();
  
  const readline = require('readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  rl.question('\n请选择操作 [0-7]: ', (choice) => {
    handleChoice(choice, rl);
  });
}

// 处理用户选择
function handleChoice(choice, rl) {
  switch (choice) {
    case '1':
      showPlaintextInfo();
      break;
    case '2':
      generateEncryptedVersion();
      break;
    case '3':
      deployPlaintextVersion(rl);
      return;
    case '4':
      deployEncryptedVersion(rl);
      return;
    case '5':
      compareVersions();
      break;
    case '6':
      cleanEncryptedVersion();
      break;
    case '7':
      showDeploymentStatus();
      break;
    case '0':
      console.log('👋 再见！');
      rl.close();
      return;
    default:
      console.log('❌ 无效选择');
  }
  
  // 继续显示菜单
  setTimeout(() => {
    showMenu();
    rl.question('\n请选择操作 [0-7]: ', (newChoice) => {
      handleChoice(newChoice, rl);
    });
  }, 1000);
}

// 显示明文版本信息
function showPlaintextInfo() {
  console.log('\n📝 明文版本信息:');
  
  try {
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    console.log(`📦 项目名称: ${packageJson.name}`);
    console.log(`📊 版本号: ${packageJson.version}`);
    console.log(`📝 描述: ${packageJson.description}`);
    
    // 统计文件数量
    const jsFiles = getJSFiles('src');
    console.log(`📄 JavaScript 文件: ${jsFiles.length} 个`);
    
    // 统计代码行数
    let totalLines = 0;
    jsFiles.forEach(file => {
      const content = fs.readFileSync(file, 'utf8');
      totalLines += content.split('\n').length;
    });
    console.log(`📏 总代码行数: ${totalLines} 行`);
    
  } catch (error) {
    console.log('❌ 读取项目信息失败:', error.message);
  }
}

// 生成加密版本
function generateEncryptedVersion() {
  console.log('\n🔒 生成加密版本...');
  
  try {
    execSync('node create-encrypted.js', { stdio: 'inherit' });
    console.log('✅ 加密版本生成成功！');
  } catch (error) {
    console.log('❌ 生成加密版本失败:', error.message);
  }
}

// 部署明文版本
function deployPlaintextVersion(rl) {
  console.log('\n📝 部署明文版本:');
  console.log('1. Workers 部署');
  console.log('2. Pages 部署');
  
  rl.question('请选择部署方式 [1-2]: ', (choice) => {
    try {
      if (choice === '1') {
        console.log('🚀 部署到 Workers...');
        execSync('./deploy.sh', { stdio: 'inherit' });
      } else if (choice === '2') {
        console.log('📄 部署到 Pages...');
        execSync('./deploy-pages.sh', { stdio: 'inherit' });
      } else {
        console.log('❌ 无效选择');
      }
    } catch (error) {
      console.log('❌ 部署失败:', error.message);
    }
    
    rl.close();
  });
}

// 部署加密版本
function deployEncryptedVersion(rl) {
  if (!fs.existsSync('encrypted/src/index.js')) {
    console.log('❌ 加密版本不存在，请先生成加密版本');
    rl.close();
    return;
  }
  
  console.log('\n🔒 部署加密版本:');
  console.log('1. Workers 部署');
  console.log('2. Pages 部署');
  
  rl.question('请选择部署方式 [1-2]: ', (choice) => {
    try {
      process.chdir('encrypted');
      
      if (choice === '1') {
        console.log('🛡️ 部署加密版本到 Workers...');
        execSync('./deploy.sh', { stdio: 'inherit' });
      } else if (choice === '2') {
        console.log('🛡️ 部署加密版本到 Pages...');
        execSync('./deploy-pages.sh', { stdio: 'inherit' });
      } else {
        console.log('❌ 无效选择');
      }
      
      process.chdir('..');
    } catch (error) {
      console.log('❌ 部署失败:', error.message);
      process.chdir('..');
    }
    
    rl.close();
  });
}

// 比较版本
function compareVersions() {
  console.log('\n🔍 版本比较:');
  
  if (!fs.existsSync('encrypted/src/index.js')) {
    console.log('❌ 加密版本不存在，无法比较');
    return;
  }
  
  const plaintextFiles = getJSFiles('src');
  const encryptedFiles = getJSFiles('encrypted/src');
  
  console.log(`📝 明文版本文件数: ${plaintextFiles.length}`);
  console.log(`🔒 加密版本文件数: ${encryptedFiles.length}`);
  
  // 比较文件大小
  let plaintextSize = 0;
  let encryptedSize = 0;
  
  plaintextFiles.forEach(file => {
    plaintextSize += fs.statSync(file).size;
  });
  
  encryptedFiles.forEach(file => {
    encryptedSize += fs.statSync(file).size;
  });
  
  console.log(`📏 明文版本总大小: ${(plaintextSize / 1024).toFixed(2)} KB`);
  console.log(`📏 加密版本总大小: ${(encryptedSize / 1024).toFixed(2)} KB`);
  console.log(`📊 大小变化: ${encryptedSize > plaintextSize ? '+' : ''}${((encryptedSize - plaintextSize) / 1024).toFixed(2)} KB`);
}

// 清理加密版本
function cleanEncryptedVersion() {
  console.log('\n🧹 清理加密版本...');
  
  if (fs.existsSync('encrypted')) {
    fs.rmSync('encrypted', { recursive: true });
    console.log('✅ 加密版本已清理');
  } else {
    console.log('ℹ️ 加密版本不存在，无需清理');
  }
}

// 显示部署状态
function showDeploymentStatus() {
  console.log('\n📋 部署状态检查:');
  
  // 检查 wrangler 登录状态
  try {
    execSync('npx wrangler whoami', { stdio: 'pipe' });
    console.log('✅ Cloudflare 已登录');
  } catch (error) {
    console.log('❌ Cloudflare 未登录，请运行: npx wrangler login');
  }
  
  // 检查 KV 配置
  const wranglerContent = fs.readFileSync('wrangler.toml', 'utf8');
  if (wranglerContent.includes('your-kv-namespace-id')) {
    console.log('⚠️ KV 命名空间 ID 需要配置');
  } else {
    console.log('✅ KV 命名空间已配置');
  }
  
  // 检查依赖
  if (fs.existsSync('node_modules')) {
    console.log('✅ 依赖已安装');
  } else {
    console.log('⚠️ 依赖未安装，请运行: npm install');
  }
}

// 获取JavaScript文件列表
function getJSFiles(dir) {
  const files = [];
  
  function scanDir(currentDir) {
    const items = fs.readdirSync(currentDir);
    
    items.forEach(item => {
      const fullPath = path.join(currentDir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        scanDir(fullPath);
      } else if (item.endsWith('.js')) {
        files.push(fullPath);
      }
    });
  }
  
  if (fs.existsSync(dir)) {
    scanDir(dir);
  }
  
  return files;
}

// 启动程序
main();
