const http = require('http');
const createHandler = require('github-webhook-handler');
const { exec } = require('child_process');

// GitHub Webhook secret과 경로
const handler = createHandler({ path: '/webhook', secret: 'macservice_secret' });

http.createServer((req, res) => {
  handler(req, res, err => {
    res.statusCode = 404;
    res.end('no such location');
  });
}).listen(7777, () => {
  console.log('Webhook server running at http://0.0.0.0:7777/webhook');
});

handler.on('push', event => {
  console.log('> Push received from:', event.payload.repository.full_name);

  // git pull + 서버 재시작
  exec('cd ~/macService && git pull && pm2 restart mcp-core', (err, stdout, stderr) => {
    if (err) {
      console.error('! Error:', err.message);
    } else {
      console.log('✔ Updated and restarted:\n', stdout);
    }
  });
});