# XOBX 🎮

**XOBX** is an open-source, mobile-to-PC game controller that turns your smartphone into a high-performance virtual gamepad. It works entirely in your browser, requiring no app installation on your mobile device.

![XOBX Banner](https://raw.githubusercontent.com/paswans05/xobx/main/public/banner.png) _(Note: Placeholder for actual banner if exists)_

## ✨ Features

- **Zero Install on Mobile**: Runs in any modern mobile browser.
- **Low Latency**: Uses WebSockets for real-time input transmission.
- **Premium Xbox-inspired UI**: Beautifully designed interface with haptic feedback (rumble effects visualized) and responsive layouts.
- **Customizable Layouts**: Switch between Standard and Tactical layouts for different gaming needs.
- **Electron-powered Host**: Simple Windows application to bridge your mobile inputs to game actions.

## 🚀 Quick Start

1.  **Host Setup (PC)**:
    - Navigate to the `windows/` directory.
    - Run `npm install` followed by `npm start`.
    - Note the IP address displayed in the terminal.
2.  **Controller Setup (Mobile)**:
    - Open the XOBX web app in your mobile browser.
    - Open **Settings** (Gear icon).
    - Enter your PC's IP address and tap **Initiate Link**.

## 📖 Documentation

- [Architecture Guide](docs/architecture.md) - How XOBX works under the hood.
- [Getting Started](docs/getting-started.md) - Detailed setup instructions.
- [Troubleshooting](docs/troubleshooting.md) - Fix common connectivity issues.

## 🛠️ Project Structure

- [`web/`](web/) - The Next.js mobile controller application.
- [`windows/`](windows/) - The Electron host bridge for PC.

---

Built with ❤️ by the XOBX Team.
