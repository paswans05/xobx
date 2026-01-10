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
  const [isHttps, setIsHttps] = useState(false);
  const [debugLog, setDebugLog] = useState<string[]>([]);

  const addLog = useCallback((msg: string) => {
    setDebugLog((prev) => [msg, ...prev].slice(0, 5));
    console.log(msg);
  }, []);

  const socketRef = useRef<WebSocket | null>(null);

  // Load saved IP on mount
  useEffect(() => {
    setMounted(true);
    const https = window.location.protocol === "https:";
    setIsHttps(https);
    const savedIp = localStorage.getItem("xobx_ip") || window.location.hostname;
    setHostIp(savedIp);
    setTempIp(savedIp);
    addLog(`[XOBX] Init (HTTPS: ${https})`);
  }, [addLog]);

  const connect = useCallback(() => {
    if (typeof window === "undefined" || !hostIp) return;

    if (socketRef.current) {
      socketRef.current.close();
    }

    const cleanIp = hostIp
      .replace(/^https?:\/\//, "")
      .replace(/^wss?:\/\//, "");

    // Logic: If on HTTPS, we try WSS if it's a domain, otherwise WS (will likely fail unless allowed)
    const isDomain = cleanIp.includes(".") && !/^[0-9.]+$/.test(cleanIp);
    const finalUrl = isHttps
      ? isDomain
        ? `wss://${cleanIp}`
        : `ws://${cleanIp}:3001`
      : `ws://${cleanIp}:3001`;

    addLog(`[XOBX] Linking to: ${finalUrl}`);

    try {
      const socket = new WebSocket(finalUrl);
      socketRef.current = socket;

      socket.onopen = () => {
        addLog(`[XOBX] Connected!`);
        setStatus("CONNECTED");
      };

      socket.onclose = (event) => {
        addLog(`[XOBX] Closed: ${event.code}`);
        setStatus("DISCONNECTED");
        if (hostIp) setTimeout(() => connect(), 3000);
      };

      socket.onerror = (err) => {
        addLog(`[XOBX] Blocked/Error`);
      };
    } catch (e) {
      addLog(`[XOBX] Setup failed`);
      setStatus("DISCONNECTED");
    }
  }, [hostIp, isHttps, addLog]);

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
    <div className="w-full h-screen flex items-center justify-center overflow-hidden bg-[#0a0a0f] text-white">
      {/* Orientation Warning */}
      <div className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center p-8 text-center sm:hidden landscape:hidden">
        <div className="w-20 h-20 border-2 border-neon-cyan/50 rounded-2xl flex items-center justify-center mb-6 animate-pulse">
          <Cpu size={40} className="text-neon-cyan" />
        </div>
        <h2 className="font-orbitron text-lg font-bold tracking-[0.2em] mb-2 uppercase">
          ROTATE DEVICE
        </h2>
        <p className="text-[0.7rem] text-white/40 tracking-widest uppercase">
          Best experienced in Landscape mode
        </p>
      </div>

      <div className="w-full h-full sm:h-[95vh] sm:max-w-[950px] sm:glass-effect sm:rounded-3xl flex flex-col p-4 sm:p-6 relative overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-20">
          <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[70%] bg-neon-cyan/30 blur-[120px] rounded-full" />
          <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[70%] bg-neon-magenta/30 blur-[120px] rounded-full" />
        </div>

        {/* Header */}
        <header className="flex justify-between items-center pb-2 sm:pb-4 border-b border-white/10 z-10 shrink-0">
          <div className="flex items-center gap-3 sm:gap-4">
            <h1 className="font-orbitron text-xl sm:text-2xl font-black tracking-[0.3em] bg-gradient-to-r from-neon-cyan to-neon-magenta bg-clip-text text-transparent italic">
              XOBX
            </h1>
            <div className="h-4 w-[1px] bg-white/10 hidden sm:block" />
            <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full border border-white/5 text-[0.6rem] font-bold tracking-widest text-neon-cyan opacity-80">
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
        <main className="flex-1 grid grid-cols-[1fr_auto_1fr] sm:grid-cols-[1fr_120px_1fr] items-center gap-2 sm:gap-4 py-2 sm:py-6 z-10 min-h-0 overflow-hidden">
          {/* Left Control Cluster */}
          <section className="flex flex-col items-center justify-around h-full gap-4 sm:gap-10">
            <div className="relative p-1 sm:p-2 rounded-full border border-neon-cyan/20 bg-neon-cyan/5 shadow-[0_0_40px_rgba(0,242,255,0.05)]">
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

            <div className="grid grid-cols-3 grid-rows-3 gap-1 sm:gap-2 scale-75 sm:scale-100 origin-center">
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
          <section className="flex flex-col items-center justify-center h-full gap-4 sm:gap-10 px-2">
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 scale-75 sm:scale-100">
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

            <div className="relative group scale-50 sm:scale-100">
              <div className="absolute inset-0 bg-gradient-to-br from-neon-cyan to-neon-magenta opacity-30 blur-2xl group-hover:opacity-60 transition-opacity" />
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-neon-cyan to-neon-magenta p-[2px] shadow-[0_0_30px_rgba(0,242,255,0.3)]">
                <div className="w-full h-full rounded-full bg-[#0a0a0f] flex items-center justify-center backdrop-blur-3xl">
                  <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center animate-pulse">
                    <div className="w-4 h-4 bg-neon-cyan rounded-full shadow-[0_0_15px_#00f2ff]" />
                  </div>
                </div>
              </div>
            </div>

            <div className="hidden sm:block text-[0.5rem] tracking-[0.4em] font-black text-white/30 uppercase mt-4">
              X-Interface v2
            </div>
          </section>

          {/* Right Action Cluster */}
          <section className="flex flex-col items-center justify-around h-full gap-4 sm:gap-8">
            <div className="relative p-2 sm:p-8 rounded-full border border-white/5 bg-white/5 shadow-inner scale-75 sm:scale-100 origin-center">
              <div className="grid grid-cols-3 grid-rows-3 items-center justify-center gap-1 sm:gap-2">
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

            <div className="relative p-1 sm:p-2 rounded-full border border-neon-magenta/20 bg-neon-magenta/5 shadow-[0_0_40px_rgba(188,0,255,0.05)]">
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
        <section className="flex justify-between px-2 sm:px-6 pb-2 sm:pb-6 pt-1 sm:pt-2 z-10 shrink-0">
          <div className="flex gap-2 sm:gap-6 scale-75 sm:scale-100 origin-left">
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
          <div className="flex gap-2 sm:gap-6 scale-75 sm:scale-100 origin-right">
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
        <footer className="pt-4 border-t border-white/10 flex justify-between items-end z-10">
          <div className="flex flex-col gap-1">
            {debugLog.map((log, i) => (
              <div
                key={i}
                className="text-[0.45rem] tracking-[0.1em] font-mono text-white/30 uppercase"
              >
                {i === 0 ? "⚡ " : "  "} {log}
              </div>
            ))}
          </div>
          <div className="text-right flex flex-col gap-1">
            <div className="text-[0.6rem] tracking-[0.2em] font-black text-white/20 uppercase">
              ID: {hostIp || "UNCONFIGURED"}
            </div>
            <div className="text-[0.5rem] tracking-[0.1em] font-medium text-white/10 italic">
              SECURE LINK PORT: 3001
            </div>
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
                  {isHttps && (
                    <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
                      <p className="text-[0.7rem] text-red-400 font-bold flex gap-2">
                        <WifiOff size={16} />
                        HTTPS DETECTED: Browsers block local connections (ws://)
                        from secure sites.
                      </p>
                      <ul className="mt-2 text-[0.6rem] text-white/50 space-y-1 list-disc pl-4">
                        <li>
                          Use a tunnel (e.g. <b>ngrok</b>) for a <i>wss://</i>{" "}
                          address
                        </li>
                        <li>Or allow "Insecure Content" in Site Settings</li>
                        <li>Or use http://localhost:3000</li>
                      </ul>
                    </div>
                  )}

                  <div>
                    <label className="block text-[0.6rem] font-bold text-white/40 tracking-[0.2em] uppercase mb-2">
                      Host PC IP or Tunnel URL
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 192.168.1.10 or tunnel.ngrok-free.app"
                      value={tempIp}
                      onChange={(e) => setTempIp(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white font-orbitron focus:border-neon-cyan outline-none transition-all shadow-inner"
                    />
                  </div>

                  <div className="p-4 bg-neon-cyan/5 border border-neon-cyan/10 rounded-xl">
                    <p className="text-[0.7rem] text-neon-cyan/60 flex gap-2">
                      <Wifi size={16} />
                      Linking to{" "}
                      {isHttps ? "Secure Tunnel" : "Local IP Port 3001"}
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
