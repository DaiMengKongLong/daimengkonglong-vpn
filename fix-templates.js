// 彻底修复模板字符串问题
const fs = require('fs');

console.log('🔧 彻底修复模板字符串问题...\n');

const filesToFix = [
  'src/handlers/admin.js',
  'src/handlers/home.js'
];

filesToFix.forEach(filePath => {
  if (!fs.existsSync(filePath)) {
    console.log(`⚠️ 文件不存在: ${filePath}`);
    return;
  }

  console.log(`🔍 处理文件: ${filePath}`);
  
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;
  
  // 1. 将函数返回的模板字符串改为普通字符串
  content = content.replace(/return `([^`]*)`/gs, (match, p1) => {
    return `return '${p1.replace(/'/g, "\\'")}'`;
  });
  
  // 2. 修复HTML模板中的变量插值
  // 将 ${variable} 改为 ' + variable + '
  content = content.replace(/\$\{([^}]+)\}/g, (match, p1) => {
    return `' + ${p1} + '`;
  });
  
  // 3. 清理多余的空字符串拼接
  content = content.replace(/\'\s*\+\s*\'\s*\+\s*/g, "' + ");
  content = content.replace(/\'\s*\+\s*\'$/gm, "'");
  content = content.replace(/^\'\s*\+\s*/gm, "'");
  
  // 4. 修复开头和结尾的拼接
  content = content.replace(/return\s*\'\s*\+\s*/g, "return '");
  content = content.replace(/\s*\+\s*\'\s*;/g, "';");
  
  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ 已修复: ${filePath}`);
  } else {
    console.log(`✅ 无需修复: ${filePath}`);
  }
});

console.log('\n🎉 模板字符串修复完成！');
console.log('\n🧪 验证修复结果...');

// 验证修复结果
let hasIssues = false;

filesToFix.forEach(filePath => {
  if (!fs.existsSync(filePath)) return;
  
  const content = fs.readFileSync(filePath, 'utf8');
  
  // 检查是否还有模板字符串
  const templateStrings = content.match(/`[^`]*`/g);
  if (templateStrings) {
    console.log(`⚠️ ${filePath} 仍包含模板字符串:`, templateStrings.length);
    hasIssues = true;
  }
  
  // 检查是否有语法错误的拼接
  const badConcat = content.match(/\'\s*\+\s*\'\s*\+/g);
  if (badConcat) {
    console.log(`⚠️ ${filePath} 有不良的字符串拼接`);
  }
});

if (!hasIssues) {
  console.log('✅ 验证通过，所有模板字符串已转换');
} else {
  console.log('⚠️ 仍有一些模板字符串需要手动处理');
}

console.log('\n🚀 现在可以重新部署了！');
