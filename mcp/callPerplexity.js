// callPerplexity.js
require('dotenv').config();
const axios = require('axios');
const { savePerplexityResultToFile } = require('./mapTemplate');
const { canProceed } = require('./usageTracker'); // ✅ 사용량 추적 모듈

async function askPerplexity(question) {
  // ✅ 대략적인 토큰 수 추정 (단어 수 × 3)
  const estimatedTokens = question.split(/\s+/).length * 3;

  if (!canProceed(estimatedTokens)) {
    console.warn('⛔ Perplexity 예산 초과로 요청 차단됨');
    return null;
  }

  try {
    const response = await axios.post(
      'https://api.perplexity.ai/chat/completions',
      {
        model: 'sonar-pro', // 또는 'sonar-small'
        messages: [
          {
            role: 'user',
            content: question
          }
        ]
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.PERPLEXITY_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const content = response.data?.choices?.[0]?.message?.content;
    console.log('📥 Perplexity 응답:\n', content);

    // 👉 결과 저장
    savePerplexityResultToFile(content);

    return content;
  } catch (error) {
    console.error('❌ Perplexity API 호출 실패:', error.message);
    if (error.response?.data) {
      console.error('응답 내용:', JSON.stringify(error.response.data, null, 2));
    }
    return null;
  }
}

module.exports = { askPerplexity };
