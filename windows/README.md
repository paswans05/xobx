# XOBX Windows Host 🖥️

The XOBX Windows Host is an Electron-powered bridge that receives inputs from the mobile controller via WebSockets and simulates them as local keyboard and mouse events on your PC.

## 🚀 Setup & Run

1.  **Install dependencies**:
    ```bash
    npm install
    ```
2.  **Start the application**:
    ```bash
    npm start
    ```

## ⚙️ How it Works

- **WebSocket Server**: Listens on port `3001` for incoming JSON packets from the mobile app.
- **RobotJS**: Uses the `robotjs` library to perform low-level input simulation (pressing keys, moving the mouse).
- **Auto-Discovery**: Displays your local IP address on startup so you know what to type into your phone.

## ⌨️ Default Key Bindings

| Controller  | Keyboard/Mouse |
| ----------- | -------------- |
| A           | Space          |
| B           | Escape         |
| X           | R              |
| Y           | F              |
| D-Pad       | Arrow Keys     |
| Menu        | Enter          |
| View        | Tab            |
| Left Stick  | W, A, S, D     |
| Right Stick | Mouse Movement |

_Note: You can customize these mappings in `server.js`._

## 🛠️ Troubleshooting

- **Native Modules**: If `robotjs` gives errors, you may need to run `npx electron-rebuild`.
- **Permissions**: Some games may require you to run this host as **Administrator** to intercept inputs.

## 🔗 Links

- [Root Documentation](../README.md)
- [Troubleshooting Guide](../docs/troubleshooting.md)
- [Future Roadmap](../docs/roadmap.md)
- [Code Examples](../examples/)
