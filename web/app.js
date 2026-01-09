// Xobx Mobile Controller Logic

let socket = null;
const statusText = document.getElementById("status-text");
const statusDot = document.getElementById("conn-status");
const ipDisplay = document.getElementById("ip-display");

// Initialize WebSockets
function initSocket() {
  const host = window.location.hostname;
  const port = 3000;
  const wsUrl = `ws://${host}:${port}`;

  ipDisplay.textContent = `HOST: ${host}`;

  try {
    socket = new WebSocket(wsUrl);

    socket.onopen = () => {
      statusText.textContent = "CONNECTED";
      statusDot.classList.add("connected");
      console.log("Connected to Xobx Host");
    };

    socket.onclose = () => {
      statusText.textContent = "DISCONNECTED";
      statusDot.classList.remove("connected");
      console.log("Disconnected from Xobx Host, retrying...");
      setTimeout(initSocket, 3000);
    };

    socket.onerror = (err) => {
      console.error("WebSocket Error:", err);
    };
  } catch (e) {
    console.error("Failed to connect:", e);
  }
}

// Send Input Data
function sendInput(type, data) {
  if (socket && socket.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify({ type, data }));
  }
}

// Initialize Joysticks
const leftJoystick = nipplejs.create({
  zone: document.getElementById("joystick-left"),
  mode: "static",
  position: { left: "50%", top: "50%" },
  color: "cyan",
});

const rightJoystick = nipplejs.create({
  zone: document.getElementById("joystick-right"),
  mode: "static",
  position: { left: "50%", top: "50%" },
  color: "magenta",
});

leftJoystick.on("move", (evt, data) => {
  sendInput("joystick-left", {
    distance: data.distance,
    angle: data.angle.degree,
    vector: data.vector,
  });
});

leftJoystick.on("end", () => {
  sendInput("joystick-left", { distance: 0, vector: { x: 0, y: 0 } });
});

rightJoystick.on("move", (evt, data) => {
  sendInput("joystick-right", {
    distance: data.distance,
    angle: data.angle.degree,
    vector: data.vector,
  });
});

rightJoystick.on("end", () => {
  sendInput("joystick-right", { distance: 0, vector: { x: 0, y: 0 } });
});

// Button Handlers
const buttons = [
  "a",
  "b",
  "x",
  "y",
  "up",
  "down",
  "left",
  "right",
  "l1",
  "l2",
  "r1",
  "r2",
  "start",
  "select",
  "home",
];

buttons.forEach((btnId) => {
  const el = document.getElementById(`btn-${btnId}`);
  if (!el) return;

  el.addEventListener("touchstart", (e) => {
    e.preventDefault();
    sendInput("button-down", btnId);
    el.classList.add("active");
  });

  el.addEventListener("touchend", (e) => {
    e.preventDefault();
    sendInput("button-up", btnId);
    el.classList.remove("active");
  });

  // Support mouse for testing on PC
  el.addEventListener("mousedown", () => {
    sendInput("button-down", btnId);
  });
  el.addEventListener("mouseup", () => {
    sendInput("button-up", btnId);
  });
});

// Start connection
initSocket();
