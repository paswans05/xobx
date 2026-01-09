"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import dynamic from "next/dynamic";
import { GamepadButton } from "@/components/GamepadButton";
import { Wifi, WifiOff } from "lucide-react";

const Joystick = dynamic(
  () => import("@/components/Joystick").then((mod) => mod.Joystick),
  {
    ssr: false,
  }
);

export default function GamepadPage() {
  const [mounted, setMounted] = useState(false);
  const [status, setStatus] = useState<"CONNECTED" | "DISCONNECTED">(
    "DISCONNECTED"
  );
  const [hostIp, setHostIp] = useState<string>("");
  const socketRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const connect = useCallback(() => {
    if (typeof window === "undefined") return;
    const host = window.location.hostname;
    const wsUrl = `ws://${host}:3001`;
    setHostIp(host);

    const socket = new WebSocket(wsUrl);
    socketRef.current = socket;

    socket.onopen = () => setStatus("CONNECTED");
    socket.onclose = () => {
      setStatus("DISCONNECTED");
      setTimeout(connect, 3000);
    };
  }, []);

  useEffect(() => {
    connect();
    return () => socketRef.current?.close();
  }, [connect]);

  const sendInput = (type: string, data: any) => {
    if (socketRef.current?.readyState === 1) {
      // 1 is WebSocket.OPEN
      socketRef.current.send(JSON.stringify({ type, data }));
    }
  };

  const handlePress = (id: string) => sendInput("button-down", id);
  const handleRelease = (id: string) => sendInput("button-up", id);

  if (!mounted) return null;

  return (
    <div className="w-full h-screen p-4 flex items-center justify-center overflow-hidden bg-[#0a0a0f]">
      <div className="w-full max-w-[900px] h-[95vh] bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl flex flex-col p-6 shadow-2xl relative overflow-hidden">
        {/* Header */}
        <header className="flex justify-between items-center pb-4 border-b border-white/10">
          <h1 className="font-orbitron text-2xl font-bold tracking-[0.2em] bg-gradient-to-r from-[#00f2ff] to-[#bc00ff] bg-clip-text text-transparent">
            XOBX
          </h1>
          <div className="flex items-center gap-2 text-[0.6rem] tracking-wider text-white/40 font-medium">
            {status === "CONNECTED" ? (
              <Wifi size={14} className="text-[#00f2ff] animate-pulse" />
            ) : (
              <WifiOff size={14} className="text-red-500" />
            )}
            <span
              className={
                status === "CONNECTED" ? "text-[#00f2ff]" : "text-red-500"
              }
            >
              {status}
            </span>
          </div>
        </header>

        {/* Main Interface */}
        <div className="flex-1 grid grid-cols-[1fr_120px_1fr] items-center gap-8 py-8">
          {/* Left Side */}
          <div className="flex flex-col items-center gap-12">
            <Joystick
              id="left-stick"
              color="cyan"
              onMove={(data) =>
                sendInput("joystick-left", {
                  vector: data.vector,
                  distance: data.distance,
                })
              }
              onEnd={() =>
                sendInput("joystick-left", {
                  distance: 0,
                  vector: { x: 0, y: 0 },
                })
              }
            />
            <div className="grid grid-cols-3 grid-rows-3 gap-1">
              <div />
              <GamepadButton
                id="btn-up"
                label=""
                variant="dpad"
                onPress={handlePress}
                onRelease={handleRelease}
              />
              <div />
              <GamepadButton
                id="btn-left"
                label=""
                variant="dpad"
                onPress={handlePress}
                onRelease={handleRelease}
              />
              <div className="w-12 h-12 bg-white/5 rounded-lg border border-white/10" />
              <GamepadButton
                id="btn-right"
                label=""
                variant="dpad"
                onPress={handlePress}
                onRelease={handleRelease}
              />
              <div />
              <GamepadButton
                id="btn-down"
                label=""
                variant="dpad"
                onPress={handlePress}
                onRelease={handleRelease}
              />
              <div />
            </div>
          </div>

          {/* Center */}
          <div className="flex flex-col items-center gap-8">
            <div className="flex gap-2">
              <GamepadButton
                id="btn-select"
                label="SELECT"
                variant="menu"
                onPress={handlePress}
                onRelease={handleRelease}
              />
              <GamepadButton
                id="btn-start"
                label="START"
                variant="menu"
                onPress={handlePress}
                onRelease={handleRelease}
              />
            </div>
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#00f2ff] to-[#bc00ff] opacity-80 shadow-[0_0_20px_rgba(0,242,255,0.4)] flex items-center justify-center">
              <div className="w-14 h-14 rounded-full bg-black/40 backdrop-blur-sm" />
            </div>
          </div>

          {/* Right Side */}
          <div className="flex flex-col items-center gap-10">
            <div className="flex flex-col items-center gap-3">
              <GamepadButton
                id="btn-y"
                label="Y"
                variant="y"
                onPress={handlePress}
                onRelease={handleRelease}
              />
              <div className="flex gap-12">
                <GamepadButton
                  id="btn-x"
                  label="X"
                  variant="x"
                  onPress={handlePress}
                  onRelease={handleRelease}
                />
                <GamepadButton
                  id="btn-b"
                  label="B"
                  variant="b"
                  onPress={handlePress}
                  onRelease={handleRelease}
                />
              </div>
              <GamepadButton
                id="btn-a"
                label="A"
                variant="a"
                onPress={handlePress}
                onRelease={handleRelease}
              />
            </div>
            <Joystick
              id="right-stick"
              color="magenta"
              onMove={(data) =>
                sendInput("joystick-right", {
                  vector: data.vector,
                  distance: data.distance,
                })
              }
              onEnd={() =>
                sendInput("joystick-right", {
                  distance: 0,
                  vector: { x: 0, y: 0 },
                })
              }
            />
          </div>
        </div>

        {/* Triggers */}
        <div className="flex justify-between px-4 pb-4">
          <div className="flex gap-4">
            <GamepadButton
              id="btn-l1"
              label="L1"
              variant="trigger"
              onPress={handlePress}
              onRelease={handleRelease}
            />
            <GamepadButton
              id="btn-l2"
              label="L2"
              variant="trigger"
              onPress={handlePress}
              onRelease={handleRelease}
            />
          </div>
          <div className="flex gap-4">
            <GamepadButton
              id="btn-r1"
              label="R1"
              variant="trigger"
              onPress={handlePress}
              onRelease={handleRelease}
            />
            <GamepadButton
              id="btn-r2"
              label="R2"
              variant="trigger"
              onPress={handlePress}
              onRelease={handleRelease}
            />
          </div>
        </div>

        {/* Footer */}
        <footer className="pt-4 border-t border-white/10 flex justify-center opacity-40 text-[0.6rem] tracking-[0.2em] uppercase font-medium">
          HOST: {hostIp || "---.---.---.---"}
        </footer>
      </div>
    </div>
  );
}
