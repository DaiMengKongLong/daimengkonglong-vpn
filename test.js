// 简单的项目结构测试脚本
const fs = require('fs');
const path = require('path');

console.log('🧪 测试项目结构...\n');

// 必需的文件列表
const requiredFiles = [
  'package.json',
  'wrangler.toml',
  'README.md',
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
  'src/utils/cors.js'
];

let allFilesExist = true;

// 检查文件是否存在
requiredFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`✅ ${file}`);
  } else {
    console.log(`❌ ${file} - 文件不存在`);
    allFilesExist = false;
  }
});

console.log('\n📊 测试结果:');
if (allFilesExist) {
  console.log('✅ 所有必需文件都存在');
  console.log('🎉 项目结构完整，可以开始部署！');
} else {
  console.log('❌ 部分文件缺失，请检查项目结构');
  process.exit(1);
}

// 检查 package.json 内容
try {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  console.log('\n📦 Package.json 信息:');
  console.log(`- 项目名称: ${packageJson.name}`);
  console.log(`- 版本: ${packageJson.version}`);
  console.log(`- 描述: ${packageJson.description}`);
  
  if (packageJson.scripts) {
    console.log('- 可用脚本:');
    Object.keys(packageJson.scripts).forEach(script => {
      console.log(`  • npm run ${script}`);
    });
  }
} catch (error) {
  console.log('⚠️ 无法读取 package.json');
}

// 检查 wrangler.toml 配置
try {
  const wranglerConfig = fs.readFileSync('wrangler.toml', 'utf8');
  console.log('\n⚙️ Wrangler 配置:');
  
  const nameMatch = wranglerConfig.match(/name = "(.+)"/);
  if (nameMatch) {
    console.log(`- Worker 名称: ${nameMatch[1]}`);
  }
  
  const mainMatch = wranglerConfig.match(/main = "(.+)"/);
  if (mainMatch) {
    console.log(`- 入口文件: ${mainMatch[1]}`);
  }
  
  if (wranglerConfig.includes('your-kv-namespace-id')) {
    console.log('⚠️ 需要配置 KV 命名空间 ID');
  } else {
    console.log('✅ KV 命名空间已配置');
  }
} catch (error) {
  console.log('⚠️ 无法读取 wrangler.toml');
}

console.log('\n🚀 下一步:');
console.log('1. 运行 npm install 安装依赖');
console.log('2. 运行 ./deploy.sh (Linux/Mac) 或 deploy.bat (Windows) 进行部署');
console.log('3. 或者手动运行 npx wrangler dev 启动开发环境');
console.log('\n📚 更多信息请查看 README.md 文件');
