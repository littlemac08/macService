const http = require('http');
const createHandler = require('github-webhook-handler');
const { exec } = require('child_process');

// GitHub Webhook의 path 및 secret
const handler = createHandler({
  path: '/webhook',
  secret: 'macservice_secret' // GitHub Webhook 설정과 일치해야 함
});

// 서버 시작 (0.0.0.0으로 외부 접속 허용)
http.createServer((req, res) => {
  handler(req, res, err => {
    res.statusCode = 404;
    res.end('no such location');
  });
}).listen(7777, () => {
  console.log('✅ Webhook server running at http://0.0.0.0:7777/webhook');
});

// 푸시 이벤트 처리
handler.on('push', event => {
  const repo = event.payload.repository.full_name;
  console.log(`📦 Push received from: ${repo}`);

  // Git pull 후 pm2 재시작
  exec('cd /home/casnice/macService && git pull && pm2 restart webhook-listener', (err, stdout, stderr) => {
    if (err) {
      console.error('❌ Error:', err.message);
      return;
    }

    console.log('✔ Code updated and process restarted:');
    console.log(stdout);
  });
});
