// 修复多行字符串问题
const fs = require('fs');

console.log('🔧 修复多行字符串问题...\n');

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
  
  // 查找并修复 generateAdminPage 和 generateHomePage 函数
  content = fixMultilineStringFunction(content, 'generateAdminPage');
  content = fixMultilineStringFunction(content, 'generateHomePage');
  
  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ 已修复: ${filePath}`);
  } else {
    console.log(`✅ 无需修复: ${filePath}`);
  }
});

function fixMultilineStringFunction(content, functionName) {
  // 查找函数开始位置
  const functionStart = content.indexOf(`function ${functionName}`);
  if (functionStart === -1) return content;
  
  // 查找 return 语句
  const returnStart = content.indexOf("return '", functionStart);
  if (returnStart === -1) return content;
  
  // 查找函数结束位置（最后一个大括号）
  let braceCount = 0;
  let functionEnd = functionStart;
  let inFunction = false;
  
  for (let i = functionStart; i < content.length; i++) {
    if (content[i] === '{') {
      braceCount++;
      inFunction = true;
    } else if (content[i] === '}') {
      braceCount--;
      if (inFunction && braceCount === 0) {
        functionEnd = i;
        break;
      }
    }
  }
  
  // 提取函数内容
  const functionContent = content.substring(functionStart, functionEnd + 1);
  
  // 修复多行字符串
  const fixedFunction = fixMultilineString(functionContent);
  
  // 替换原函数
  return content.substring(0, functionStart) + fixedFunction + content.substring(functionEnd + 1);
}

function fixMultilineString(functionContent) {
  // 查找 return ' 开始的位置
  const returnIndex = functionContent.indexOf("return '");
  if (returnIndex === -1) return functionContent;
  
  // 查找函数结束的 } 位置
  const functionEndIndex = functionContent.lastIndexOf('}');
  
  // 提取 return 语句之前的部分
  const beforeReturn = functionContent.substring(0, returnIndex);
  
  // 提取 return 语句之后到函数结束的部分
  const afterReturn = functionContent.substring(returnIndex + 8); // 8 = "return '".length
  const beforeFunctionEnd = afterReturn.substring(0, afterReturn.lastIndexOf('}'));
  const functionEnd = afterReturn.substring(afterReturn.lastIndexOf('}'));
  
  // 将多行字符串转换为字符串拼接
  const lines = beforeFunctionEnd.split('\n');
  const stringParts = [];
  
  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];
    
    // 跳过最后的分号和空行
    if (line.trim() === ';' || line.trim() === '') continue;
    
    // 转义单引号
    line = line.replace(/'/g, "\\'");
    
    // 如果是最后一行，不添加换行符
    if (i === lines.length - 1 || lines[i + 1].trim() === ';') {
      stringParts.push(`'${line}'`);
    } else {
      stringParts.push(`'${line}\\n'`);
    }
  }
  
  // 重新组装函数
  const fixedReturn = `return ${stringParts.join(' + ')};`;
  
  return beforeReturn + fixedReturn + '\n' + functionEnd;
}

console.log('\n🎉 多行字符串修复完成！');
console.log('\n🧪 验证修复结果...');

// 验证修复结果
let hasErrors = false;

filesToFix.forEach(filePath => {
  if (!fs.existsSync(filePath)) return;
  
  const content = fs.readFileSync(filePath, 'utf8');
  
  // 检查是否还有未终止的字符串
  const lines = content.split('\n');
  lines.forEach((line, index) => {
    if (line.includes("return '") && !line.includes("';")) {
      // 检查是否是多行字符串的开始
      const nextLine = lines[index + 1];
      if (nextLine && !nextLine.trim().startsWith("'")) {
        console.log(`❌ ${filePath}:${index + 1} 可能有未终止的字符串`);
        hasErrors = true;
      }
    }
  });
});

if (!hasErrors) {
  console.log('✅ 验证通过，所有字符串问题已修复');
} else {
  console.log('⚠️ 仍有一些问题需要手动处理');
}

console.log('\n🚀 现在可以重新部署了！');
