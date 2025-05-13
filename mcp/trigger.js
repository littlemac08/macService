// trigger.js
const fs = require('fs');
const path = require('path');
const { askPerplexity } = require('./callPerplexity');
const { extractSpecFromText } = require('./parseSpec');
const { savePerplexityResultToFile } = require('./mapTemplate');
const { renderTemplate } = require('./renderTemplate');
const { saveMcpResult } = require('./firebaseService'); // 🔥 Firestore 저장 추가

const triggerPath = path.join(__dirname, 'trigger.json');

// 최초 실행 시에도 처리
function handleTrigger() {
  try {
    const content = fs.readFileSync(triggerPath, 'utf-8');
    const { question } = JSON.parse(content);

    console.log('🟢 질문 감지됨:', question);

    askPerplexity(question).then(aiResponse => {
      if (!aiResponse) {
        console.error('❌ AI 응답 없음');
        return;
      }

      const spec = extractSpecFromText(aiResponse);
      console.log('📘 추출된 명세:', spec);

      savePerplexityResultToFile(aiResponse); // 결과 저장 (output_result.js)

      // 렌더링 실행
      renderTemplate({
        templateFile: 'express_login_basic.hbs',
        data: {
          timestamp: new Date().toISOString(),
          code: aiResponse
        },
        outputFile: 'generated_code.js'
      });

      // Firestore 저장
      saveMcpResult({
        question,
        response: aiResponse,
        spec,
        template: 'express_login_basic.hbs'
      });
    });
  } catch (e) {
    console.error('❌ 트리거 처리 중 오류:', e.message);
  }
}

// 파일 변경 감지
fs.watchFile(triggerPath, (curr, prev) => {
  console.log('📡 trigger.json 변경 감지');
  handleTrigger();
});

console.log('🛰 MCP Trigger 서비스 실행 중... trigger.json을 수정해보세요.');
