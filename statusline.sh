#!/bin/bash
# Claude Code status line script
# Extracts rate limit data and writes to usage-stats.json for the widget

input=$(cat)
USAGE_FILE="$HOME/.claude/usage-stats.json"

# Find node — check common locations
if command -v node &>/dev/null; then
  NODE=node
elif [ -x "/c/Program Files/nodejs/node.exe" ]; then
  NODE="/c/Program Files/nodejs/node.exe"
elif [ -x "/usr/bin/node" ]; then
  NODE=/usr/bin/node
elif [ -x "/usr/local/bin/node" ]; then
  NODE=/usr/local/bin/node
else
  exit 0
fi

PARSED=$("$NODE" -e "
  const d = JSON.parse(process.argv[1]);
  const rl = d.rate_limits || {};
  const fh = rl.five_hour || {};
  const sd = rl.seven_day || {};
  console.log(JSON.stringify({
    five_hour_pct: fh.used_percentage ?? 0,
    seven_day_pct: sd.used_percentage ?? 0,
    resets_at: fh.resets_at ?? 0,
    session_cost_usd: (d.cost || {}).total_cost_usd ?? 0,
    context_used_pct: (d.context_window || {}).used_percentage ?? 0,
    timestamp: Math.floor(Date.now() / 1000)
  }));
" "$input" 2>/dev/null)

if [ -n "$PARSED" ]; then
  echo "$PARSED" > "$USAGE_FILE"
  FIVE_HR=$("$NODE" -e "process.stdout.write(String(JSON.parse(process.argv[1]).five_hour_pct))" "$PARSED")
  echo "5h: ${FIVE_HR}%"
else
  echo ""
fi
