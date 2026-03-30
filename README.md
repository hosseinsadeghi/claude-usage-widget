# Claude Usage Widget

A minimal, always-on-top desktop widget that displays your [Claude Code](https://docs.anthropic.com/en/docs/claude-code) 5-hour rate limit usage as a pie chart.

![widget preview](https://img.shields.io/badge/5h_usage-17%25-10b981?style=for-the-badge)

## What it shows

- **5-hour rolling window usage %** — the same rate limit you see on [claude.ai/settings/usage](https://claude.ai/settings/usage)
- Color-coded: green (<50%), amber (50–75%), red (>75%)
- Stale-data indicator (amber dot) if no update in 2+ minutes
- Tracks usage across all devices and sessions (account-level, server-side)

## Requirements

- [Claude Code](https://docs.anthropic.com/en/docs/claude-code) CLI installed and logged in
- Claude Pro or Max subscription (rate limits are only available for subscribers)
- [Node.js](https://nodejs.org/) 18+ (for the status line script)

## Install

### Option A: Download the installer

Go to [Releases](../../releases) and download the installer for your platform:

| Platform | File |
|----------|------|
| Windows  | `Claude.Usage.Widget.Setup.x.x.x.exe` |
| macOS    | `Claude.Usage.Widget-x.x.x.dmg` |
| Linux    | `Claude.Usage.Widget-x.x.x.AppImage` |

Run the installer. On first launch, the widget automatically configures Claude Code's status line. No manual setup needed.

**Windows:** The app appears in your Start Menu as "Claude Usage Widget".

**Linux:** Make the AppImage executable: `chmod +x Claude*.AppImage && ./Claude*.AppImage`

### Option B: Run from source

```bash
git clone https://github.com/<your-username>/claude-usage-widget.git
cd claude-usage-widget
npm install
npm start
```

## How it works

```
Claude Code  ──stdin JSON──>  statusline.sh  ──writes──>  ~/.claude/usage-stats.json
                                                                    │
                                                                    │ polls every 2s
                                                                    ▼
                                                            Electron widget
                                                          (always-on-top pie chart)
```

1. Claude Code pipes session data (tokens, cost, rate limits) to a **status line script** on every update
2. The script (`statusline.sh`) extracts the 5-hour rate limit percentage and writes it to `~/.claude/usage-stats.json`
3. The Electron widget reads that file every 2 seconds and renders the pie chart

The rate limit data comes from Anthropic's servers — it reflects your **total account usage** across all devices and sessions (Windows, WSL, macOS, etc.).

## Manual setup (if auto-config doesn't work)

If the widget shows `--` and doesn't update, manually add the status line to `~/.claude/settings.json`:

```json
{
  "statusLine": {
    "type": "command",
    "command": "bash /path/to/claude-usage-widget/statusline.sh"
  }
}
```

If running from source, use the path to `statusline.sh` in your cloned repo. If using the installer, the path is:
- **Windows:** `%LOCALAPPDATA%/Programs/claude-usage-widget/resources/statusline.sh`
- **macOS:** `/Applications/Claude Usage Widget.app/Contents/Resources/statusline.sh`
- **Linux:** Mounted inside the AppImage at runtime — run from source instead

Then restart Claude Code.

## Testing without a live session

Write fake data to preview the widget:

```bash
node write-test-data.js 42   # shows 42%
```

## Build installers from source

```bash
npm run dist:win     # Windows .exe installer
npm run dist:mac     # macOS .dmg
npm run dist:linux   # Linux .AppImage
```

Installers are output to the `dist/` folder.

## License

MIT
