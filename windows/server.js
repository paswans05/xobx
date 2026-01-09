const express = require("express");
const http = require("http");
const WebSocket = require("ws");
const robot = require("robotjs");
const path = require("path");
const os = require("os");

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const PORT = 3000;

// Serve the web app from the 'web' directory
app.use(express.static(path.join(__dirname, "../web")));

// Map virtual buttons to actual keys
const buttonMap = {
  a: "space",
  b: "escape",
  x: "r",
  y: "f",
  up: "up",
  down: "down",
  left: "left",
  right: "right",
  start: "enter",
  select: "tab",
};

// WebSocket logic
wss.on("connection", (ws) => {
  console.log("Mobile controller connected");

  ws.on("message", (message) => {
    try {
      const { type, data } = JSON.parse(message);

      switch (type) {
        case "button-down":
          if (buttonMap[data]) {
            robot.keyToggle(buttonMap[data], "down");
          }
          console.log(`Button Down: ${data}`);
          break;

        case "button-up":
          if (buttonMap[data]) {
            robot.keyToggle(buttonMap[data], "up");
          }
          console.log(`Button Up: ${data}`);
          break;

        case "joystick-left":
          // Map joystick to WASD for now
          handleJoystickWASD(data.vector);
          break;

        case "joystick-right":
          // Map joystick to Mouse movement
          handleJoystickMouse(data.vector);
          break;
      }
    } catch (e) {
      console.error("Error handling message:", e);
    }
  });

  ws.on("close", () => {
    console.log("Mobile controller disconnected");
  });
});

// Helper: Map Joystick to WASD
let activeKeys = { w: false, a: false, s: false, d: false };
function handleJoystickWASD(vector) {
  const threshold = 0.3;
  const targets = {
    w: vector.y < -threshold,
    s: vector.y > threshold,
    a: vector.x < -threshold,
    d: vector.x > threshold,
  };

  for (let key in targets) {
    if (targets[key] && !activeKeys[key]) {
      robot.keyToggle(key, "down");
      activeKeys[key] = true;
    } else if (!targets[key] && activeKeys[key]) {
      robot.keyToggle(key, "up");
      activeKeys[key] = false;
    }
  }
}

// Helper: Map Joystick to Mouse
function handleJoystickMouse(vector) {
  const speed = 15;
  if (Math.abs(vector.x) > 0.1 || Math.abs(vector.y) > 0.1) {
    const mouse = robot.getMousePos();
    robot.moveMouse(
      mouse.x + vector.x * speed,
      mouse.y - vector.y * speed // Y is inverted in screen space
    );
  }
}

// Get Local IP Address
function getLocalIP() {
  const interfaces = os.networkInterfaces();
  for (let dev in interfaces) {
    for (let details of interfaces[dev]) {
      if (details.family === "IPv4" && !details.internal) {
        return details.address;
      }
    }
  }
  return "127.0.0.1";
}

server.listen(PORT, () => {
  const ip = getLocalIP();
  console.log("----------------------------------------");
  console.log("Xobx Host Running");
  console.log(`Access the controller at: http://${ip}:${PORT}`);
  console.log("----------------------------------------");
});
