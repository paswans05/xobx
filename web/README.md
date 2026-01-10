# XOBX Web Controller 📱

This is the mobile-facing part of the XOBX system. It provides a touch-optimized, Xbox-inspired virtual controller that runs in any modern smartphone browser.

## 🚀 Development Setup

1.  **Install dependencies**:
    ```bash
    npm install
    ```
2.  **Run the development server**:
    ```bash
    npm run dev
    ```
3.  **Access the app**:
    Open `http://localhost:3000` on your PC, or `http://<YOUR_PC_IP>:3000` on your mobile device.

## 🎨 Design & Features

- **Next.js 15 & Tailwind**: Modern, fast, and responsive.
- **Framer Motion**: Smooth animations for button presses and UI transitions.
- **Hardware Visualization**: Features "X-Ray" logic that shows internal rumble motors and impulse triggers vibrating based on input.
- **Save State**: Automatically remembers your PC's IP address and preferred layout in `localStorage`.
- **Fullscreen Mode**: Integrated "Launch Experience" button to trigger browser fullscreen and orientation lock.

## 🛠️ Key Components

- `app/page.tsx`: Main controller logic, WebSocket handling, and UI layout.
- `components/GamepadButton.tsx`: Reusable component for various button styles (ABXY, D-Pad, Triggers, Menu).
- `components/Joystick.tsx`: High-performance touch joystick implementation.

## 🔗 Links

- [Root Documentation](../README.md)
- [Architecture Guide](../docs/architecture.md)
- [Future Roadmap](../docs/roadmap.md)
