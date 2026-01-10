import asyncio
import websockets
import json

# The IP address of your PC running the XOBX controller server
# If running on the same machine, use 'localhost'
HOST_IP = "localhost"
PORT = 3001

async def listen_to_xobx():
    uri = f"ws://{HOST_IP}:{PORT}"
    print(f"Connecting to XOBX at {uri}...")
    
    try:
        async with websockets.connect(uri) as websocket:
            print("Connected! Waiting for inputs...")
            while True:
                message = await websocket.recv()
                data = json.loads(message)
                
                event_type = data.get("type")
                payload = data.get("data")
                
                if event_type == "button-down":
                    print(f"🕹️ Button Pressed: {payload}")
                elif event_type == "button-up":
                    print(f"📤 Button Released: {payload}")
                elif event_type == "joystick-left":
                    vector = payload.get("vector")
                    print(f"🕹️ Left Stick: x={vector['x']:.2f}, y={vector['y']:.2f}")
                
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    # Note: Requires 'websockets' library (pip install websockets)
    asyncio.run(listen_to_xobx())
