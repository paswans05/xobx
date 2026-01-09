const { app, Tray, Menu, nativeImage, Notification } = require("electron");
const path = require("path");
const { fork } = require("child_process");

let tray = null;
let serverProcess = null;

function startServer() {
  serverProcess = fork(path.join(__dirname, "server.js"));

  serverProcess.on("message", (msg) => {
    console.log("Server message:", msg);
  });
}

function createTray() {
  const icon = nativeImage.createEmpty();
  tray = new Tray(icon);

  const contextMenu = Menu.buildFromTemplate([
    { label: "Xobx Host Running", enabled: false },
    { type: "separator" },
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

  new Notification({
    title: "Xobx Host Started",
    body: "The server is running in the background.",
  }).show();
}

app.whenReady().then(() => {
  startServer();
  createTray();

  if (app.dock) app.dock.hide();
});

app.on("window-all-closed", () => {
  // Keep running in tray
});
