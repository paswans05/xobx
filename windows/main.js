const {
  app,
  Tray,
  Menu,
  nativeImage,
  Notification,
  BrowserWindow,
  ipcMain,
  nativeTheme,
} = require("electron");
const path = require("path");
const { fork } = require("child_process");

let tray = null;
let serverProcess = null;
let mainWindow = null;

// Paths to assets
const ASSETS_DIR = path.join(__dirname, "assets");
const ICON_LIGHT = path.join(ASSETS_DIR, "xobx-light.png"); // For Dark Mode (Light Icon)
const ICON_DARK = path.join(ASSETS_DIR, "xobx-dark.png"); // For Light Mode (Dark Icon)
// Logic: If System is Dark -> Use Light Icon. If System is Light -> Use Dark Icon.

function getTrayIcon() {
  const isDarkMode = nativeTheme.shouldUseDarkColors;
  const iconPath = isDarkMode ? ICON_LIGHT : ICON_DARK;
  return nativeImage.createFromPath(iconPath).resize({
    width: 16,
    height: 16,
  });
}

function updateTrayIcon() {
  if (tray) {
    tray.setImage(getTrayIcon());
  }
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 600,
    height: 500,
    icon: path.join(__dirname, "assets/xobx-dark.png"), // Electron supports SVG icons on some platforms, or fallback
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      nodeIntegration: false,
      contextIsolation: true,
    },
    autoHideMenuBar: true,
    backgroundColor: "#121212",
  });

  mainWindow.loadFile("index.html");

  mainWindow.on("closed", () => {
    mainWindow = null;
  });

  // Minimize to tray instead of closing (optional, but good for host apps)
  mainWindow.on("minimize", (event) => {
    event.preventDefault();
    mainWindow.hide();
  });
}

function startServer() {
  serverProcess = fork(path.join(__dirname, "server.js"));

  serverProcess.on("message", (msg) => {
    // Forward logs to renderer
    if (msg.type === "log" && mainWindow) {
      mainWindow.webContents.send("log-message", msg);
    }
    console.log("Server message:", msg);
  });
}

function createTray() {
  const icon = getTrayIcon();
  tray = new Tray(icon);

  const contextMenu = Menu.buildFromTemplate([
    { label: "Xobx Host Running", enabled: false },
    { type: "separator" },
    {
      label: "Show Window",
      click: () => {
        if (mainWindow) {
          mainWindow.show();
        } else {
          createWindow();
        }
      },
    },
    {
      label: "Restart Server",
      click: () => {
        if (serverProcess) serverProcess.kill();
        startServer();
      },
    },
    {
      label: "Quit",
      click: () => {
        if (serverProcess) serverProcess.kill();
        app.quit();
      },
    },
  ]);

  tray.setToolTip("Xobx Game Controller Host");
  tray.setContextMenu(contextMenu);

  tray.on("click", () => {
    if (mainWindow) mainWindow.show();
  });

  // Update icon when system theme changes
  nativeTheme.on("updated", () => {
    tray.setImage(getTrayIcon());
  });

  new Notification({
    title: "Xobx Host Started",
    body: "The server is running in the background.",
  }).show();
}

app.whenReady().then(() => {
  startServer();
  createTray();
  createWindow();

  if (app.dock) app.dock.hide();
});

app.on("window-all-closed", () => {
  // Do not quit when window is closed, keep running in tray
});
