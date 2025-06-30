// 语法修复脚本 - 修复模板字符串转义问题
const fs = require('fs');
const path = require('path');

console.log('🔧 修复语法错误...\n');

// 需要检查的文件
const filesToCheck = [
  'src/handlers/admin.js',
  'src/handlers/home.js'
];

let fixedCount = 0;

filesToCheck.forEach(filePath => {
  if (!fs.existsSync(filePath)) {
    console.log(`⚠️ 文件不存在: ${filePath}`);
    return;
  }

  console.log(`🔍 检查文件: ${filePath}`);
  
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;
  
  // 修复转义的模板字符串
  // 将 \` 替换为 `
  content = content.replace(/\\`/g, '`');
  
  // 修复三重转义的模板字符串变量
  // 将 \\\${} 替换为 \${}
  content = content.replace(/\\\\\\\$\{/g, '\\${');
  
  // 修复三重转义的模板字符串结束
  // 将 \\\` 替换为 \`
  content = content.replace(/\\\\\\\`/g, '\\`');
  
  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ 已修复: ${filePath}`);
    fixedCount++;
  } else {
    console.log(`✅ 无需修复: ${filePath}`);
  }
});

console.log(`\n📊 修复完成: ${fixedCount} 个文件被修复`);

if (fixedCount > 0) {
  console.log('\n🎉 语法错误已修复，现在可以重新部署了！');
  console.log('\n🚀 重新部署命令:');
  console.log('- Workers: ./deploy.sh 或 deploy.bat');
  console.log('- Pages: ./deploy-pages.sh 或 deploy-pages.bat');
} else {
  console.log('\n✅ 所有文件语法正确，无需修复');
}

// 验证修复结果
console.log('\n🧪 验证修复结果...');
let hasErrors = false;

filesToCheck.forEach(filePath => {
  if (!fs.existsSync(filePath)) return;
  
  const content = fs.readFileSync(filePath, 'utf8');
  
  // 检查是否还有转义的反引号
  if (content.includes('\\`') && !content.includes('\\`translate(')) {
    console.log(`❌ ${filePath} 仍有转义的反引号`);
    hasErrors = true;
  }
  
  // 检查是否还有三重转义
  if (content.includes('\\\\\\')) {
    console.log(`❌ ${filePath} 仍有三重转义`);
    hasErrors = true;
  }
});

if (!hasErrors) {
  console.log('✅ 验证通过，所有语法错误已修复');
} else {
  console.log('❌ 验证失败，仍有语法错误需要手动修复');
}
