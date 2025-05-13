const http = require('http');
const createHandler = require('github-webhook-handler');
const { exec } = require('child_process');
require('dotenv').config({ path: './mcp/.env' });  // mcp/.env 경로로 설정

// GitHub Webhook의 path 및 secret
const handler = createHandler({
  path: '/webhook',
  secret: 'macservice_secret' // GitHub Webhook 설정과 일치해야 함
});

// 서버 시작 (0.0.0.0으로 외부 접속 허용)
http.createServer((req, res) => {
  if (req.method === 'POST' && req.url === '/mcp') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      let question;
      try {
        question = JSON.parse(body).question;
      } catch (e) {
        res.writeHead(400);
        res.end('Invalid JSON');
        return;
      }
      if (!question) {
        res.writeHead(400);
        res.end('질문이 필요합니다. { "question": "..." }');
        return;
      }
      // 라즈베리파이에서 ask-mcp.js 실행
      const sshCmd = `ssh casnice@221.146.185.171 'cd ~/macService/mcp && node ask-mcp.js "${question}"'`;
      exec(sshCmd, (err, stdout, stderr) => {
        if (err) {
          res.writeHead(500);
          res.end('MCP 실행 오류: ' + err.message);
          return;
        }
        res.writeHead(200, { 'Content-Type': 'text/plain' });
        res.end('MCP 실행 결과:\n' + stdout);
      });
    });
  } else {
    handler(req, res, err => {
      res.statusCode = 404;
      res.end('no such location');
    });
  }
}).listen(7777, () => {
  console.log('✅ Webhook server running at http://0.0.0.0:7777/webhook');
  console.log('✅ MCP Trigger endpoint running at http://0.0.0.0:7777/mcp');
});

// 푸시 이벤트 처리
handler.on('push', event => {
  const repo = event.payload.repository.full_name;
  console.log(`📦 Push received from: ${repo}`);

  // Git pull 후 pm2 재시작
  exec('cd /home/casnice/macService && git pull && pm2 restart webhook-listener && pm2 restart mcp-core', (err, stdout, stderr) => {
    if (err) {
      console.error('❌ Error:', err.message);
      return;
    }

    console.log('✔ Code updated and process restarted:');
    console.log(stdout);
  });
});
