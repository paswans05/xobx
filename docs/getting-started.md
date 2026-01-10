# Getting Started 🚀

Follow these steps to set up your virtual Xbox controller.

## Prerequisites

- **PC**: Windows 10/11 with Node.js installed.
- **Mobile**: Any modern smartphone (iOS/Android) with a web browser.
- **Network**: Both devices must be connected to the same Wi-Fi network.

## 1. Set Up the Windows Host

The host application is the bridge that receives inputs from your phone and tells Windows which keys to press.

1.  Open a terminal (PowerShell or CMD) in the `windows/` folder.
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Start the application:
    ```bash
    npm start
    ```
4.  A window will appear showing your **Local IP Address** (e.g., `192.168.1.15`). Keep this window open.

## 2. Access the Web Controller

You can run the web controller locally or access a hosted version.

### Option A: Local Development

1.  Open a terminal in the `web/` folder.
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Run the dev server:
    ```bash
    npm run dev
    ```
4.  Find your PC's IP address and access `http://<YOUR_IP>:3000` on your mobile browser.

### Option B: Hosted Version

Simply open your deployed URL on your mobile phone.

## 3. Link Your Devices

1.  On your mobile phone, tap the **Gear icon** (Settings) in the top-right corner.
2.  In the **HARDWARE IP** field, type the IP address shown on your Windows Host application.
3.  Tap **INITIATE LINK**.
4.  The status indicator should turn **Green**, indicating you are connected!

## 4. Usage Tips

- **Rotate to Landscape**: Turn your phone sideways for the full controller layout.
- **Add to Home Screen**: For the best experience, use the "Add to Home Screen" feature in Chrome/Safari to run XOBX in full-screen without browser address bars.
- **Tactical Layout**: Use the settings to toggle between "Standard" and "Tactical" shoulder button layouts depending on the game you're playing.
