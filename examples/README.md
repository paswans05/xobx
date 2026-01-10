# XOBX Examples 💡

This directory contains snippets and scripts to help you customize XOBX or integrate it into your own projects.

## Included Examples

- **[Custom Key Mapping](custom-mapping.js)**: Example of how to modify the Windows host to map buttons to specific game controls.
- **[Python Input Listener](python-listener.py)**: A simple Python script to receive and log controller data without the Electron host.

## How to use

Most of these are standalone files or snippets. Refer to the comments inside each file for specific instructions.

### 🧩 Integration Tips

If you want to build your own host bridge, you only need to connect to the WebSocket server on port `3001` (default) and listen for JSON messages with `type` and `data` fields.
