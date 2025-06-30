#!/usr/bin/env node

// 诊断配置保存问题
console.log('🔍 诊断配置保存问题...\n');

const fs = require('fs');

// 检查wrangler.toml配置
console.log('📋 检查 wrangler.toml 配置:');

if (fs.existsSync('wrangler.toml')) {
  const content = fs.readFileSync('wrangler.toml', 'utf8');
  
  // 检查KV命名空间配置
  if (content.includes('your-kv-namespace-id')) {
    console.log('❌ KV命名空间ID未配置 (仍为占位符)');
    console.log('   需要替换 "your-kv-namespace-id" 为实际的KV命名空间ID');
  } else {
    console.log('✅ KV命名空间ID已配置');
  }
  
  // 检查绑定名称
  if (content.includes('binding = "CONFIG_KV"')) {
    console.log('✅ KV绑定名称正确 (CONFIG_KV)');
  } else {
    console.log('❌ KV绑定名称不正确');
  }
} else {
  console.log('❌ wrangler.toml 文件不存在');
}

console.log('\n🔧 可能的解决方案:\n');

console.log('1. 创建KV命名空间:');
console.log('   npx wrangler kv:namespace create "CONFIG_KV"');
console.log('   npx wrangler kv:namespace create "CONFIG_KV" --preview');

console.log('\n2. 更新wrangler.toml中的KV命名空间ID:');
console.log('   将 "your-kv-namespace-id" 替换为实际的命名空间ID');

console.log('\n3. 如果使用Cloudflare Pages:');
console.log('   - 在Pages项目设置中添加KV绑定');
console.log('   - 绑定名称: CONFIG_KV');
console.log('   - 选择对应的KV命名空间');

console.log('\n4. 检查环境变量:');
console.log('   确保在部署环境中正确配置了KV绑定');

console.log('\n📚 详细步骤:\n');

console.log('Workers部署:');
console.log('1. 登录Cloudflare: npx wrangler login');
console.log('2. 创建KV命名空间: npx wrangler kv:namespace create "CONFIG_KV"');
console.log('3. 复制返回的命名空间ID到wrangler.toml');
console.log('4. 部署: npx wrangler deploy');

console.log('\nPages部署:');
console.log('1. 在Cloudflare Dashboard中进入Pages项目');
console.log('2. 进入Settings > Functions');
console.log('3. 添加KV namespace binding:');
console.log('   - Variable name: CONFIG_KV');
console.log('   - KV namespace: 选择或创建KV命名空间');
console.log('4. 重新部署Pages项目');

console.log('\n🧪 测试配置保存:');
console.log('1. 部署后访问管理面板');
console.log('2. 尝试保存基础配置');
console.log('3. 检查浏览器开发者工具的Network标签');
console.log('4. 查看是否有错误响应');

console.log('\n💡 调试提示:');
console.log('- 如果看到500错误，通常是KV绑定问题');
console.log('- 如果看到302重定向但配置未保存，检查KV权限');
console.log('- 在Workers/Pages日志中查看详细错误信息');

console.log('\n🔍 当前配置检查完成！');

// 检查是否有加密版本
if (fs.existsSync('encrypted/wrangler.toml')) {
  console.log('\n📁 检查加密版本配置:');
  const encryptedContent = fs.readFileSync('encrypted/wrangler.toml', 'utf8');
  
  if (encryptedContent.includes('your-kv-namespace-id')) {
    console.log('❌ 加密版本的KV命名空间ID也需要配置');
    console.log('   请同时更新 encrypted/wrangler.toml');
  } else {
    console.log('✅ 加密版本的KV配置正确');
  }
}

console.log('\n🚀 修复后重新部署即可解决配置保存问题！');
