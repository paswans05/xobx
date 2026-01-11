const {
  app,
  Tray,
  Menu,
  nativeImage,
  Notification,
  BrowserWindow,
  ipcMain,
} = require("electron");
const path = require("path");
const { fork } = require("child_process");

let tray = null;
let serverProcess = null;
let mainWindow = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 600,
    height: 500,
    icon: path.join(__dirname, "assets/logo.svg"), // Electron supports SVG icons on some platforms, or fallback
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
  const icon = nativeImage.createEmpty(); // TODO: Use actual icon
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
