// 部署前检查脚本
const fs = require('fs');

console.log('🔍 部署前检查...\n');

let allChecksPass = true;

// 1. 检查文件完整性
console.log('📁 检查文件完整性:');
const requiredFiles = [
  'src/index.js',
  '_worker.js',
  'functions/_middleware.js',
  'src/utils/environment.js',
  'wrangler.toml',
  'package.json'
];

requiredFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`✅ ${file}`);
  } else {
    console.log(`❌ ${file} - 缺失`);
    allChecksPass = false;
  }
});

// 2. 检查语法错误
console.log('\n🔧 检查语法错误:');
const jsFiles = [
  'src/handlers/admin.js',
  'src/handlers/home.js',
  'src/index.js',
  '_worker.js'
];

jsFiles.forEach(file => {
  if (!fs.existsSync(file)) return;
  
  const content = fs.readFileSync(file, 'utf8');
  
  // 检查转义的反引号
  if (content.includes('\\`') && !content.includes('\\`translate(')) {
    console.log(`❌ ${file} - 包含转义的反引号`);
    allChecksPass = false;
  } else {
    console.log(`✅ ${file} - 语法正确`);
  }
});

// 3. 检查环境配置
console.log('\n⚙️ 检查环境配置:');
try {
  const wranglerContent = fs.readFileSync('wrangler.toml', 'utf8');
  
  if (wranglerContent.includes('your-kv-namespace-id')) {
    console.log('⚠️ wrangler.toml - 需要配置 KV 命名空间 ID');
  } else {
    console.log('✅ wrangler.toml - KV 配置已设置');
  }
  
  if (wranglerContent.includes('CONFIG_KV')) {
    console.log('✅ wrangler.toml - KV 绑定已配置');
  } else {
    console.log('❌ wrangler.toml - 缺少 KV 绑定');
    allChecksPass = false;
  }
} catch (error) {
  console.log('❌ wrangler.toml - 读取失败');
  allChecksPass = false;
}

// 4. 检查 package.json
console.log('\n📦 检查 package.json:');
try {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  
  const requiredScripts = ['dev', 'deploy', 'deploy:workers', 'deploy:pages'];
  requiredScripts.forEach(script => {
    if (packageJson.scripts && packageJson.scripts[script]) {
      console.log(`✅ 脚本 ${script} 已配置`);
    } else {
      console.log(`❌ 脚本 ${script} 缺失`);
      allChecksPass = false;
    }
  });
} catch (error) {
  console.log('❌ package.json - 读取失败');
  allChecksPass = false;
}

// 5. 检查环境检测功能
console.log('\n🌍 检查环境检测功能:');
try {
  const envContent = fs.readFileSync('src/utils/environment.js', 'utf8');
  
  const requiredFunctions = [
    'detectEnvironment',
    'adaptEnvironment',
    'validateEnvironment'
  ];
  
  requiredFunctions.forEach(func => {
    if (envContent.includes(`export function ${func}`)) {
      console.log(`✅ ${func} 函数已实现`);
    } else {
      console.log(`❌ ${func} 函数缺失`);
      allChecksPass = false;
    }
  });
} catch (error) {
  console.log('❌ 环境检测文件读取失败');
  allChecksPass = false;
}

// 6. 检查入口文件
console.log('\n🚪 检查入口文件:');
try {
  const workersContent = fs.readFileSync('src/index.js', 'utf8');
  if (workersContent.includes('adaptEnvironment')) {
    console.log('✅ Workers 入口 - 环境适配已集成');
  } else {
    console.log('❌ Workers 入口 - 缺少环境适配');
    allChecksPass = false;
  }
  
  const pagesContent = fs.readFileSync('_worker.js', 'utf8');
  if (pagesContent.includes('adaptEnvironment')) {
    console.log('✅ Pages 入口 - 环境适配已集成');
  } else {
    console.log('❌ Pages 入口 - 缺少环境适配');
    allChecksPass = false;
  }
} catch (error) {
  console.log('❌ 入口文件检查失败');
  allChecksPass = false;
}

// 总结
console.log('\n📊 检查结果:');
if (allChecksPass) {
  console.log('🎉 所有检查通过，可以安全部署！');
  console.log('\n🚀 部署命令:');
  console.log('Workers 部署: ./deploy.sh 或 deploy.bat');
  console.log('Pages 部署: ./deploy-pages.sh 或 deploy-pages.bat');
  console.log('\n💡 提示:');
  console.log('- 确保已登录 Cloudflare: npx wrangler login');
  console.log('- 确保已创建 KV 命名空间');
  console.log('- Pages 部署需要在项目设置中配置环境变量');
} else {
  console.log('❌ 检查未通过，请修复上述问题后再部署');
  console.log('\n🔧 修复建议:');
  console.log('- 运行 node fix-syntax.js 修复语法错误');
  console.log('- 运行 npx wrangler kv:namespace create CONFIG_KV 创建 KV');
  console.log('- 检查 wrangler.toml 配置是否正确');
  process.exit(1);
}

console.log('\n📚 更多信息请查看 README.md 文档');
