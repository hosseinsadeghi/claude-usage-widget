// Writes fake usage data so you can test the widget without a live session
const fs = require("fs");
const path = require("path");
const os = require("os");

const file = path.join(os.homedir(), ".claude", "usage-stats.json");
const pct = parseFloat(process.argv[2]) || 42;

const data = {
  five_hour_pct: pct,
  seven_day_pct: pct * 0.6,
  resets_at: Math.floor(Date.now() / 1000) + 3600,
  session_cost_usd: 0.12,
  context_used_pct: 15,
  timestamp: Math.floor(Date.now() / 1000),
};

fs.writeFileSync(file, JSON.stringify(data, null, 2));
console.log(`Wrote ${pct}% to ${file}`);
