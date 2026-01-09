"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import dynamic from "next/dynamic";
import { GamepadButton } from "@/components/GamepadButton";
import { Wifi, WifiOff, Settings, X, Cpu } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const Joystick = dynamic(
  () => import("@/components/Joystick").then((mod) => mod.Joystick),
  { ssr: false }
);

export default function GamepadPage() {
  const [mounted, setMounted] = useState(false);
  const [status, setStatus] = useState<"CONNECTED" | "DISCONNECTED">(
    "DISCONNECTED"
  );
  const [hostIp, setHostIp] = useState<string>("");
  const [showSettings, setShowSettings] = useState(false);
  const [tempIp, setTempIp] = useState("");

  const socketRef = useRef<WebSocket | null>(null);

  // Load saved IP on mount
  useEffect(() => {
    setMounted(true);
    const savedIp = localStorage.getItem("xobx_ip") || window.location.hostname;
    setHostIp(savedIp);
    setTempIp(savedIp);
  }, []);

  const connect = useCallback(() => {
    if (typeof window === "undefined" || !hostIp) return;

    // Close existing socket if any
    if (socketRef.current) {
      socketRef.current.close();
    }

    const wsUrl = `ws://${hostIp}:3001`;
    console.log(`Connecting to ${wsUrl}...`);

    try {
      const socket = new WebSocket(wsUrl);
      socketRef.current = socket;

      socket.onopen = () => setStatus("CONNECTED");
      socket.onclose = () => {
        setStatus("DISCONNECTED");
        // Only retry if we're not waiting for a new IP
        setTimeout(() => connect(), 3000);
      };
      socket.onerror = (err) => {
        console.error("WebSocket Error:", err);
        setStatus("DISCONNECTED");
      };
    } catch (e) {
      console.error("Connection failed:", e);
      setStatus("DISCONNECTED");
    }
  }, [hostIp]);

  useEffect(() => {
    if (mounted && hostIp) {
      connect();
    }
    return () => socketRef.current?.close();
  }, [connect, mounted, hostIp]);

  const saveSettings = () => {
    setHostIp(tempIp);
    localStorage.setItem("xobx_ip", tempIp);
    setShowSettings(false);
    setStatus("DISCONNECTED"); // Trigger reconnect via hostIp change
  };

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
    <div className="w-full h-screen p-4 flex items-center justify-center overflow-hidden bg-[#0a0a0f] text-white">
      <div className="w-full max-w-[950px] h-[95vh] glass-effect rounded-3xl flex flex-col p-6 relative overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-20">
          <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[70%] bg-neon-cyan/30 blur-[120px] rounded-full" />
          <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[70%] bg-neon-magenta/30 blur-[120px] rounded-full" />
        </div>

        {/* Header */}
        <header className="flex justify-between items-center pb-4 border-b border-white/10 z-10">
          <div className="flex items-center gap-4">
            <h1 className="font-orbitron text-2xl font-black tracking-[0.3em] bg-gradient-to-r from-neon-cyan to-neon-magenta bg-clip-text text-transparent italic">
              XOBX
            </h1>
            <div className="h-4 w-[1px] bg-white/10" />
            <div className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full border border-white/5 text-[0.6rem] font-bold tracking-widest text-neon-cyan opacity-80">
              PROTOTYPE v2.0
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 text-[0.6rem] tracking-widest font-black uppercase transition-all duration-300">
              {status === "CONNECTED" ? (
                <>
                  <Wifi size={14} className="text-neon-cyan animate-pulse" />
                  <span className="text-neon-cyan shadow-neon-cyan drop-shadow-[0_0_5px_rgba(0,242,255,0.5)]">
                    STABLE
                  </span>
                </>
              ) : (
                <>
                  <WifiOff size={14} className="text-red-500" />
                  <span className="text-red-500">OFFLINE</span>
                </>
              )}
            </div>
            <button
              onClick={() => setShowSettings(true)}
              className="p-2 hover:bg-white/10 rounded-full transition-all border border-transparent hover:border-white/10"
            >
              <Settings size={20} className="text-white/60 hover:text-white" />
            </button>
          </div>
        </header>

        {/* Controller Layout */}
        <main className="flex-1 grid grid-cols-[1fr_120px_1fr] items-center gap-4 py-6 z-10">
          {/* Left Control Cluster */}
          <section className="flex flex-col items-center gap-10">
            <div className="relative p-2 rounded-full border border-neon-cyan/20 bg-neon-cyan/5 shadow-[0_0_40px_rgba(0,242,255,0.05)]">
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
            </div>

            <div className="grid grid-cols-3 grid-rows-3 gap-2">
              <div />
              <GamepadButton
                id="btn-up"
                label="▲"
                variant="dpad"
                onPress={handlePress}
                onRelease={handleRelease}
              />
              <div />
              <GamepadButton
                id="btn-left"
                label="◀"
                variant="dpad"
                onPress={handlePress}
                onRelease={handleRelease}
              />
              <div className="w-12 h-12 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center shadow-inner">
                <Cpu size={16} className="text-white/20" />
              </div>
              <GamepadButton
                id="btn-right"
                label="▶"
                variant="dpad"
                onPress={handlePress}
                onRelease={handleRelease}
              />
              <div />
              <GamepadButton
                id="btn-down"
                label="▼"
                variant="dpad"
                onPress={handlePress}
                onRelease={handleRelease}
              />
              <div />
            </div>
          </section>

          {/* Central Core */}
          <section className="flex flex-col items-center gap-10">
            <div className="flex gap-3">
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

            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-neon-cyan to-neon-magenta opacity-30 blur-2xl group-hover:opacity-60 transition-opacity" />
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-neon-cyan to-neon-magenta p-[2px] shadow-[0_0_30px_rgba(0,242,255,0.3)]">
                <div className="w-full h-full rounded-full bg-[#0a0a0f] flex items-center justify-center backdrop-blur-3xl">
                  <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center animate-pulse">
                    <div className="w-4 h-4 bg-neon-cyan rounded-full shadow-[0_0_15px_#00f2ff]" />
                  </div>
                </div>
              </div>
            </div>

            <div className="text-[0.5rem] tracking-[0.4em] font-black text-white/30 uppercase mt-4">
              X-Interface v2
            </div>
          </section>

          {/* Right Action Cluster */}
          <section className="flex flex-col items-center gap-8">
            <div className="relative p-8 rounded-full border border-white/5 bg-white/5 shadow-inner">
              <div className="grid grid-cols-3 grid-rows-3 items-center justify-center">
                <div />
                <GamepadButton
                  id="btn-y"
                  label="Y"
                  variant="y"
                  onPress={handlePress}
                  onRelease={handleRelease}
                />
                <div />
                <GamepadButton
                  id="btn-x"
                  label="X"
                  variant="x"
                  onPress={handlePress}
                  onRelease={handleRelease}
                />
                <div />
                <GamepadButton
                  id="btn-b"
                  label="B"
                  variant="b"
                  onPress={handlePress}
                  onRelease={handleRelease}
                />
                <div />
                <GamepadButton
                  id="btn-a"
                  label="A"
                  variant="a"
                  onPress={handlePress}
                  onRelease={handleRelease}
                />
                <div />
              </div>
            </div>

            <div className="relative p-2 rounded-full border border-neon-magenta/20 bg-neon-magenta/5 shadow-[0_0_40px_rgba(188,0,255,0.05)]">
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
          </section>
        </main>

        {/* Triggers */}
        <section className="flex justify-between px-6 pb-6 pt-2 z-10">
          <div className="flex gap-6">
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
          <div className="flex gap-6">
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
        </section>

        {/* Footer */}
        <footer className="pt-4 border-t border-white/10 flex justify-between items-center z-10">
          <div className="text-[0.6rem] tracking-[0.2em] font-black text-white/20 uppercase">
            System Identity: {hostIp || "UNCONFIGURED"}
          </div>
          <div className="text-[0.6rem] tracking-[0.1em] font-medium text-white/30">
            SECURE LINK PORT: 3001
          </div>
        </footer>

        {/* Settings Overlay */}
        <AnimatePresence>
          {showSettings && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-6"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="w-full max-w-md bg-[#0d0d12] border border-white/10 rounded-3xl p-8 shadow-2xl"
              >
                <div className="flex justify-between items-center mb-8">
                  <h2 className="font-orbitron text-xl font-bold tracking-widest text-white">
                    CONNECTION
                  </h2>
                  <button
                    onClick={() => setShowSettings(false)}
                    className="text-white/40 hover:text-white"
                  >
                    <X size={24} />
                  </button>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-[0.6rem] font-bold text-white/40 tracking-[0.2em] uppercase mb-2">
                      Host PC IP Address
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 192.168.1.10"
                      value={tempIp}
                      onChange={(e) => setTempIp(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white font-orbitron focus:border-neon-cyan outline-none transition-all shadow-inner"
                    />
                  </div>

                  <div className="p-4 bg-neon-cyan/5 border border-neon-cyan/10 rounded-xl">
                    <p className="text-[0.7rem] text-neon-cyan/60 flex gap-2">
                      <Wifi size={16} />
                      Make sure your PC and Mobile are on the same Wi-Fi
                      network.
                    </p>
                  </div>

                  <button
                    onClick={saveSettings}
                    className="w-full bg-gradient-to-r from-neon-cyan to-neon-blue py-4 rounded-xl font-black tracking-widest text-sm hover:opacity-90 transition-opacity shadow-[0_4px_20px_rgba(0,242,255,0.3)] uppercase"
                  >
                    LINK CONTROLLER
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
