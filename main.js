const { app, BrowserWindow, ipcMain, screen, dialog } = require("electron");
const path = require("path");
const fs = require("fs");
const os = require("os");

const CLAUDE_DIR = path.join(os.homedir(), ".claude");
const USAGE_FILE = path.join(CLAUDE_DIR, "usage-stats.json");
const SETTINGS_FILE = path.join(CLAUDE_DIR, "settings.json");
const SIMPLE_SIZE = 120;
const ADVANCED_SIZE = { width: 160, height: 240 };

let win;
let isAdvanced = false;

function getStatusLineScriptPath() {
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

    if (
      settings.statusLine &&
      settings.statusLine.type === "command" &&
      settings.statusLine.command === command
    ) {
      return;
    }

    if (settings.statusLine && settings.statusLine.command !== command) {
      const result = dialog.showMessageBoxSync({
        type: "question",
        buttons: ["Replace", "Skip"],
        title: "Status Line Already Configured",
        message:
          "Claude Code already has a status line configured. Replace it with the usage widget?",
      });
      if (result === 1) return;
    }

    settings.statusLine = { type: "command", command };
    fs.writeFileSync(SETTINGS_FILE, JSON.stringify(settings, null, 2));
  } catch {
    // Settings dir might not exist yet
  }
}

function createWindow() {
  const { width, height } = screen.getPrimaryDisplay().workAreaSize;

  win = new BrowserWindow({
    width: SIMPLE_SIZE,
    height: SIMPLE_SIZE,
    x: width - SIMPLE_SIZE - 16,
    y: height - SIMPLE_SIZE - 16,
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

ipcMain.on("toggle-view", () => {
  if (!win) return;
  isAdvanced = !isAdvanced;

  const bounds = win.getBounds();

  if (isAdvanced) {
    // Expand downward from current position, keep right edge aligned
    win.setBounds({
      x: bounds.x + bounds.width - ADVANCED_SIZE.width,
      y: bounds.y,
      width: ADVANCED_SIZE.width,
      height: ADVANCED_SIZE.height,
    });
  } else {
    // Shrink back, keep top-right corner
    win.setBounds({
      x: bounds.x + bounds.width - SIMPLE_SIZE,
      y: bounds.y,
      width: SIMPLE_SIZE,
      height: SIMPLE_SIZE,
    });
  }
});

app.whenReady().then(() => {
  ensureStatusLineConfigured();
  createWindow();

  setInterval(() => {
    if (!win) return;
    try {
      const raw = fs.readFileSync(USAGE_FILE, "utf-8");
      const data = JSON.parse(raw);
      win.webContents.send("usage-update", data);
    } catch {
      // File doesn't exist yet or parse error
    }
  }, 2000);
});

app.on("window-all-closed", () => app.quit());
