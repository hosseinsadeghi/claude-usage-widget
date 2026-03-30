const { app, BrowserWindow, screen, dialog } = require("electron");
const path = require("path");
const fs = require("fs");
const os = require("os");

const CLAUDE_DIR = path.join(os.homedir(), ".claude");
const USAGE_FILE = path.join(CLAUDE_DIR, "usage-stats.json");
const SETTINGS_FILE = path.join(CLAUDE_DIR, "settings.json");
const SIZE = 120;

let win;

function getStatusLineScriptPath() {
  // In packaged app, statusline.sh is in resources/
  if (app.isPackaged) {
    return path.join(process.resourcesPath, "statusline.sh").replace(/\\/g, "/");
  }
  return path.join(__dirname, "statusline.sh").replace(/\\/g, "/");
}

function ensureStatusLineConfigured() {
  const scriptPath = getStatusLineScriptPath();
  const command = `bash "${scriptPath}"`;

  try {
    let settings = {};
    if (fs.existsSync(SETTINGS_FILE)) {
      settings = JSON.parse(fs.readFileSync(SETTINGS_FILE, "utf-8"));
    }

    // Check if already configured
    if (
      settings.statusLine &&
      settings.statusLine.type === "command" &&
      settings.statusLine.command === command
    ) {
      return;
    }

    // Warn if there's an existing different statusLine
    if (settings.statusLine && settings.statusLine.command !== command) {
      const result = dialog.showMessageBoxSync({
        type: "question",
        buttons: ["Replace", "Skip"],
        title: "Status Line Already Configured",
        message:
          "Claude Code already has a status line configured. Replace it with the usage widget?",
      });
      if (result === 1) return; // Skip
    }

    settings.statusLine = { type: "command", command };
    fs.writeFileSync(SETTINGS_FILE, JSON.stringify(settings, null, 2));
  } catch {
    // Settings dir might not exist yet — that's ok, widget will show --% until Claude Code runs
  }
}

function createWindow() {
  const { width, height } = screen.getPrimaryDisplay().workAreaSize;

  win = new BrowserWindow({
    width: SIZE,
    height: SIZE,
    x: width - SIZE - 16,
    y: height - SIZE - 16,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    resizable: false,
    skipTaskbar: true,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  win.loadFile("index.html");

  win.on("closed", () => {
    win = null;
  });
}

app.whenReady().then(() => {
  ensureStatusLineConfigured();
  createWindow();

  // Poll usage file and send to renderer
  setInterval(() => {
    if (!win) return;
    try {
      const raw = fs.readFileSync(USAGE_FILE, "utf-8");
      const data = JSON.parse(raw);
      win.webContents.send("usage-update", data);
    } catch {
      // File doesn't exist yet or parse error — that's ok
    }
  }, 2000);
});

app.on("window-all-closed", () => app.quit());
