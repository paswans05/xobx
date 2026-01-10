# Troubleshooting 🛠️

Having trouble connecting? Check these common issues.

## 1. Connection "Blocked/Error"

If the status indicator stays Red or says "Blocked", try the following:

- **Same Network**: Ensure your phone and PC are on the same Wi-Fi. Personal hotspots sometimes isolate devices—try a standard router.
- **Firewall**: Windows Firewall might block port `3001`.
  - Go to **Windows Security > Firewall & network protection > Allow an app through firewall**.
  - Ensure `Node.js` or `Electron` is allowed for Private networks.
- **Mixed Content (HTTPS vs WS)**: If you are accessing the web app over `https://`, some browsers block non-secure `ws://` connections to local IPs.
  - Try accessing the web app via `http://` instead.
  - Or use a service like `ngrok` to tunnel the WebSocket server with SSL.

## 2. Input Lag

If there is a noticeable delay between pressing a button and the action on PC:

- **Signal Strength**: Move closer to your Wi-Fi router.
- **5GHz Wi-Fi**: Use a 5GHz band instead of 2.4GHz for significantly lower latency.
- **Background Apps**: Close unused tabs on your mobile browser and heavy applications on your PC.

## 3. Host Application Crashes

- **RobotJS Compatibility**: RobotJS requires native builds. If it fails to start, run:
  ```bash
  cd windows
  npm install
  npm run rebuild (if script exists) or npx electron-rebuild
  ```
- **Permission**: The Windows Host might need Administrator privileges to simulate inputs in certain games or system-level windows. Try running your terminal as Administrator before `npm start`.

## 4. Mobile Browser Issues

- **iOS Safari**: Ensure "Orientation Lock" is off on your iPhone so the controller can switch to landscape.
- **Android Chrome**: If buttons aren't responsive, ensure you haven't zoomed in on the page. Use "Add to Home Screen" for the most stable touch response.
