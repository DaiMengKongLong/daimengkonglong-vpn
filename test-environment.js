// 环境测试脚本 - 验证 Workers 和 Pages 双部署支持
const fs = require('fs');

console.log('🧪 测试双部署环境支持...\n');

// 检查必需的文件
const requiredFiles = {
  'Workers 入口': 'src/index.js',
  'Pages 入口': '_worker.js',
  'Pages 中间件': 'functions/_middleware.js',
  '环境检测工具': 'src/utils/environment.js',
  'Workers 部署脚本': 'deploy.sh',
  'Pages 部署脚本': 'deploy-pages.sh',
  'Wrangler 配置': 'wrangler.toml'
};

let allFilesExist = true;

console.log('📁 检查双部署文件结构:');
Object.entries(requiredFiles).forEach(([name, file]) => {
  if (fs.existsSync(file)) {
    console.log(`✅ ${name}: ${file}`);
  } else {
    console.log(`❌ ${name}: ${file} - 文件不存在`);
    allFilesExist = false;
  }
});

// 检查环境检测功能
console.log('\n🔧 检查环境检测功能:');
try {
  const envContent = fs.readFileSync('src/utils/environment.js', 'utf8');
  
  const requiredFunctions = [
    'detectEnvironment',
    'adaptEnvironment',
    'getEnvironmentConfig',
    'validateEnvironment'
  ];
  
  requiredFunctions.forEach(func => {
    if (envContent.includes(`export function ${func}`)) {
      console.log(`✅ ${func} 函数已实现`);
    } else {
      console.log(`❌ ${func} 函数缺失`);
      allFilesExist = false;
    }
  });
} catch (error) {
  console.log('❌ 无法读取环境检测文件');
  allFilesExist = false;
}

// 检查 Workers 入口文件
console.log('\n⚡ 检查 Workers 入口文件:');
try {
  const workersContent = fs.readFileSync('src/index.js', 'utf8');
  
  if (workersContent.includes('adaptEnvironment')) {
    console.log('✅ Workers 入口已集成环境适配');
  } else {
    console.log('❌ Workers 入口缺少环境适配');
    allFilesExist = false;
  }
  
  if (workersContent.includes('validateEnvironment')) {
    console.log('✅ Workers 入口已集成环境验证');
  } else {
    console.log('❌ Workers 入口缺少环境验证');
    allFilesExist = false;
  }
} catch (error) {
  console.log('❌ 无法读取 Workers 入口文件');
  allFilesExist = false;
}

// 检查 Pages 入口文件
console.log('\n📄 检查 Pages 入口文件:');
try {
  const pagesContent = fs.readFileSync('_worker.js', 'utf8');
  
  if (pagesContent.includes('adaptEnvironment')) {
    console.log('✅ Pages 入口已集成环境适配');
  } else {
    console.log('❌ Pages 入口缺少环境适配');
    allFilesExist = false;
  }
  
  if (pagesContent.includes('DEPLOYMENT_TYPE')) {
    console.log('✅ Pages 入口已设置部署类型标识');
  } else {
    console.log('❌ Pages 入口缺少部署类型标识');
    allFilesExist = false;
  }
} catch (error) {
  console.log('❌ 无法读取 Pages 入口文件');
  allFilesExist = false;
}

// 检查 package.json 脚本
console.log('\n📦 检查 package.json 脚本:');
try {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  
  const requiredScripts = {
    'deploy:workers': 'Workers 部署',
    'deploy:pages': 'Pages 部署',
    'pages:create': 'Pages 项目创建',
    'pages:dev': 'Pages 开发环境'
  };
  
  Object.entries(requiredScripts).forEach(([script, desc]) => {
    if (packageJson.scripts && packageJson.scripts[script]) {
      console.log(`✅ ${desc}: npm run ${script}`);
    } else {
      console.log(`❌ ${desc}: npm run ${script} - 脚本缺失`);
      allFilesExist = false;
    }
  });
} catch (error) {
  console.log('❌ 无法读取 package.json');
  allFilesExist = false;
}

// 检查 wrangler.toml 配置
console.log('\n⚙️ 检查 Wrangler 配置:');
try {
  const wranglerContent = fs.readFileSync('wrangler.toml', 'utf8');
  
  if (wranglerContent.includes('DEPLOYMENT_TYPE')) {
    console.log('✅ Wrangler 配置包含部署类型变量');
  } else {
    console.log('⚠️ Wrangler 配置建议添加 DEPLOYMENT_TYPE 变量');
  }
  
  if (wranglerContent.includes('CONFIG_KV')) {
    console.log('✅ Wrangler 配置包含 KV 绑定');
  } else {
    console.log('❌ Wrangler 配置缺少 KV 绑定');
    allFilesExist = false;
  }
} catch (error) {
  console.log('❌ 无法读取 wrangler.toml');
  allFilesExist = false;
}

// 检查部署脚本
console.log('\n🚀 检查部署脚本:');
const deployScripts = [
  { name: 'Workers 部署脚本 (Linux/Mac)', file: 'deploy.sh' },
  { name: 'Workers 部署脚本 (Windows)', file: 'deploy.bat' },
  { name: 'Pages 部署脚本 (Linux/Mac)', file: 'deploy-pages.sh' },
  { name: 'Pages 部署脚本 (Windows)', file: 'deploy-pages.bat' }
];

deployScripts.forEach(({ name, file }) => {
  if (fs.existsSync(file)) {
    console.log(`✅ ${name}: ${file}`);
  } else {
    console.log(`❌ ${name}: ${file} - 文件不存在`);
    allFilesExist = false;
  }
});

// 总结
console.log('\n📊 测试结果:');
if (allFilesExist) {
  console.log('🎉 双部署环境支持完整！');
  console.log('\n✨ 支持的功能:');
  console.log('- ⚡ Cloudflare Workers 部署');
  console.log('- 📄 Cloudflare Pages 部署');
  console.log('- 🔧 自动环境检测和适配');
  console.log('- 🛠️ 环境配置验证');
  console.log('- 📱 响应式部署脚本');
  
  console.log('\n🚀 下一步:');
  console.log('1. 选择部署方式 (Workers 或 Pages)');
  console.log('2. 运行对应的部署脚本');
  console.log('3. 配置 KV 命名空间');
  console.log('4. 访问服务并配置节点');
} else {
  console.log('❌ 双部署环境支持不完整，请检查缺失的文件');
  process.exit(1);
}

console.log('\n📚 更多信息请查看 README.md 和 项目说明.md 文件');
