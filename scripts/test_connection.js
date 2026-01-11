const WebSocket = require("ws");

const ws = new WebSocket("ws://localhost:3001");

ws.on("open", () => {
  console.log("Connected to XOBX Host");

  // Simulate some actions
  setTimeout(() => {
    console.log("Sending: Button A Down");
    ws.send(JSON.stringify({ type: "button-down", data: "a" }));
  }, 1000);

  setTimeout(() => {
    console.log("Sending: Button A Up");
    ws.send(JSON.stringify({ type: "button-up", data: "a" }));
  }, 1500);

  setTimeout(() => {
    console.log("Sending: Joystick Move");
    ws.send(
      JSON.stringify({
        type: "joystick-left",
        data: { vector: { x: 0.5, y: 0.5 } },
      })
    );
  }, 2000);

  setTimeout(() => {
    console.log("Closing connection");
    ws.close();
  }, 3000);
});

ws.on("error", (err) => {
  console.error("Connection error:", err.message);
});
