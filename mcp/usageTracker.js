// usageTracker.js
const fs = require('fs');
const path = require('path');

const USAGE_FILE = path.join(__dirname, 'usage.json');
const MONTHLY_LIMIT = 5.0; // USD

function currentMonth() {
  return new Date().toISOString().slice(0, 7); // YYYY-MM
}

function loadUsage() {
  if (!fs.existsSync(USAGE_FILE)) return { month: currentMonth(), used: 0 };
  return JSON.parse(fs.readFileSync(USAGE_FILE, 'utf-8'));
}

function saveUsage(usage) {
  fs.writeFileSync(USAGE_FILE, JSON.stringify(usage, null, 2), 'utf-8');
}

function canProceed(tokenCount) {
  const usage = loadUsage();

  if (usage.month !== currentMonth()) {
    usage.month = currentMonth();
    usage.used = 0;
  }

  const estimatedCost = tokenCount / 100000; // Perplexity 추정 기준: $1 per 100K tokens

  if (usage.used + estimatedCost > MONTHLY_LIMIT) {
    console.warn(`❌ 월간 사용량 초과: $${usage.used.toFixed(2)} / $${MONTHLY_LIMIT}`);
    return false;
  }

  usage.used += estimatedCost;
  saveUsage(usage);

  console.log(`💰 이번 달 누적: $${usage.used.toFixed(4)} / $${MONTHLY_LIMIT}`);
  return true;
}

module.exports = { canProceed };
