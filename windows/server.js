const express = require("express");
const http = require("http");
const WebSocket = require("ws");
const robot = require("robotjs");
const os = require("os");

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const PORT = 3001;

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
          handleJoystickWASD(data.vector);
          break;

        case "joystick-right":
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

function handleJoystickMouse(vector) {
  const speed = 15;
  if (Math.abs(vector.x) > 0.1 || Math.abs(vector.y) > 0.1) {
    const mouse = robot.getMousePos();
    robot.moveMouse(mouse.x + vector.x * speed, mouse.y - vector.y * speed);
  }
}

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

server.listen(PORT, "0.0.0.0", () => {
  const ip = getLocalIP();
  console.log("----------------------------------------");
  console.log("Xobx Host Running");
  console.log(`WebSocket server on: ws://${ip}:${PORT}`);
  console.log(`Also available on: ws://localhost:${PORT}`);
  console.log("----------------------------------------");
});
