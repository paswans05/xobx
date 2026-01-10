/**
 * Example: Custom Key Mapping for Racing Games (e.g., Forza, Asphalt)
 *
 * To use this:
 * 1. Open `windows/server.js`.
 * 2. Locate the `buttonMap` object.
 * 3. Replace it with the mappings below.
 */

const racingButtonMap = {
  a: "space", // Handbrake
  b: "escape", // Menu
  x: "shift", // Upshift
  y: "control", // Downshift
  up: "up",
  down: "down",
  left: "left",
  right: "right",
  start: "enter",
  select: "v", // Change Camera
  l1: "z", // Look back
  r1: "c", // Look forward
  l2: "s", // Brake/Reverse
  r2: "w", // Accelerate
};

module.exports = racingButtonMap;
