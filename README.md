# Claude Usage Widget

A minimal, always-on-top desktop widget that displays your [Claude Code](https://docs.anthropic.com/en/docs/claude-code) 5-hour rate limit usage as a pie chart.

## Views

### Simple mode
A small circular widget showing your **5-hour rolling window usage %** with a color-coded ring:
- Green (<50%) | Amber (50–75%) | Red (>75%)

### Advanced mode
Click the **+** button to expand. Shows:
- **5-hour usage** — ring chart (same as simple)
- **7-day usage** — progress bar
- **Context window** — current session context usage
- **Session cost** — USD spent in current session
- **Reset countdown** — time until 5-hour window resets

Click **-** to collapse back.

## How it works

```
Claude Code  ──stdin JSON──>  statusline.sh  ──writes──>  ~/.claude/usage-stats.json
                                                                    │
                                                                    │ polls every 2s
                                                                    ▼
                                                            Electron widget
```

1. Claude Code pipes session data (tokens, cost, rate limits) to a **status line script** on every update
2. The script extracts rate limit data and writes it to `~/.claude/usage-stats.json`
3. The widget reads that file and renders the display

The rate limit data comes from Anthropic's servers — it reflects your **total account usage** across all devices and sessions (Windows, WSL, macOS, etc.).

## Requirements

- [Claude Code](https://docs.anthropic.com/en/docs/claude-code) CLI installed and logged in
- Claude Pro or Max subscription (rate limits are only available for subscribers)
- [Node.js](https://nodejs.org/) 18+

## Install

### Option A: Download the installer

Go to [Releases](../../releases) and download for your platform:

| Platform | File |
|----------|------|
| Windows  | `.exe` (adds Start Menu shortcut) |
| macOS    | `.dmg` |
| Linux    | `.AppImage` |

On first launch, the widget automatically configures Claude Code's status line. No manual setup needed.

**Linux:** Make the AppImage executable first: `chmod +x Claude*.AppImage`

### Option B: Run from source

```bash
git clone https://github.com/hosseinsadeghi/claude-usage-widget.git
cd claude-usage-widget
npm install
npm start
```

## Manual setup

If the widget shows `--` and doesn't update, add the status line to `~/.claude/settings.json`:

```json
{
  "statusLine": {
    "type": "command",
    "command": "bash \"/path/to/claude-usage-widget/statusline.sh\""
  }
}
```

Then restart Claude Code.

## Testing without a live session

```bash
node write-test-data.js 42   # shows 42%
```

## Build installers from source

```bash
npm run dist:win     # Windows .exe
npm run dist:mac     # macOS .dmg
npm run dist:linux   # Linux .AppImage
```

## License

MIT
