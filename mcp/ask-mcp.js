// ask-mcp.js
const fs = require('fs');
const path = require('path');

const [, , ...args] = process.argv;
const question = args.join(' ');

if (!question) {
  console.error('❌ 질문을 입력하세요. 예: node ask-mcp.js "Create login route"');
  process.exit(1);
}

const triggerPath = path.join(__dirname, 'trigger.json');

fs.writeFileSync(
  triggerPath,
  JSON.stringify({ question }, null, 2),
  'utf-8'
);

console.log(`✅ 질문이 trigger.json에 저장되었습니다: "${question}"`);
