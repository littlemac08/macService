// renderTemplate.js
const fs = require('fs');
const path = require('path');
const handlebars = require('handlebars');

function renderTemplate({ templateFile, data, outputFile = 'generated_code.js' }) {
  try {
    const templatePath = path.join(__dirname, 'templates', templateFile);

    if (!fs.existsSync(templatePath)) {
      console.error(`❌ 템플릿 파일 없음: ${templatePath}`);
      return;
    }

    const templateContent = fs.readFileSync(templatePath, 'utf-8');
    const compiled = handlebars.compile(templateContent);
    const result = compiled(data);

    const outputPath = path.join(__dirname, outputFile);
    fs.writeFileSync(outputPath, result, 'utf-8');

    console.log(`✅ 코드 생성 완료: ${outputPath}`);
  } catch (error) {
    console.error('❌ 렌더링 중 오류:', error.message);
  }
}

module.exports = { renderTemplate };
