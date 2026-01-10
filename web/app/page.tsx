"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import dynamic from "next/dynamic";
import { GamepadButton } from "@/components/GamepadButton";
import {
  Wifi,
  WifiOff,
  Settings,
  X,
  Cpu,
  Maximize,
  Minimize,
  RotateCcw,
} from "lucide-react";
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
  const [enabledLeft, setEnabledLeft] = useState(false);
  const [enabledRight, setEnabledRight] = useState(false);
  const [hostIp, setHostIp] = useState<string>("");
  const [showSettings, setShowSettings] = useState(false);
  const [tempIp, setTempIp] = useState("");
  const [triggerLayout, setTriggerLayout] = useState<"standard" | "tactical">(
    "standard"
  );
  const [tempTriggerLayout, setTempTriggerLayout] = useState<
    "standard" | "tactical"
  >("standard");
  const [isHttps, setIsHttps] = useState(false);
  const [debugLog, setDebugLog] = useState<string[]>([]);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [orientation, setOrientation] = useState<"portrait" | "landscape">(
    "portrait"
  );

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
    const savedLayout = localStorage.getItem("xobx_layout") as
      | "standard"
      | "tactical";
    setHostIp(savedIp);
    setTempIp(savedIp);
    if (savedLayout) {
      setTriggerLayout(savedLayout);
      setTempTriggerLayout(savedLayout);
    }
    addLog(`[XOBX] Init (HTTPS: ${https})`);

    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    const handleOrientationChange = () => {
      setOrientation(
        window.innerHeight > window.innerWidth ? "portrait" : "landscape"
      );
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    window.addEventListener("resize", handleOrientationChange);
    handleOrientationChange();

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      window.removeEventListener("resize", handleOrientationChange);
    };
  }, [addLog]);

  const toggleFullscreen = async () => {
    if (!document.fullscreenElement) {
      try {
        await document.documentElement.requestFullscreen();
        if (screen.orientation && (screen.orientation as any).lock) {
          await (screen.orientation as any).lock("landscape").catch(() => {});
        }
      } catch (err) {
        addLog(`[XOBX] Fullscreen Error: ${err}`);
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

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
    setTriggerLayout(tempTriggerLayout);
    localStorage.setItem("xobx_ip", tempIp);
    localStorage.setItem("xobx_layout", tempTriggerLayout);
    setShowSettings(false);
    setStatus("DISCONNECTED"); // Trigger reconnect via hostIp change
  };

  const sendInput = (type: string, data: any) => {
    if (socketRef.current?.readyState === 1) {
      // 1 is WebSocket.OPEN
      socketRef.current.send(JSON.stringify({ type, data }));
    }
  };

  const [activeFeedback, setActiveFeedback] = useState<string[]>([]);

  const handlePress = (id: string) => {
    sendInput("button-down", id);
    setActiveFeedback((prev) => [...prev, id]);
  };
  const handleRelease = (id: string) => {
    sendInput("button-up", id);
    setActiveFeedback((prev) => prev.filter((item) => item !== id));
  };

  if (!mounted) return null;

  return (
    <div className="w-full h-screen flex items-center justify-center overflow-hidden bg-[#0a0a0f] text-white">
      {/* Orientation Warning */}
      <AnimatePresence>
        {orientation === "portrait" && !isFullscreen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-xbox-dark flex flex-col items-center justify-center p-8 text-center h-[100dvh]"
          >
            <div className="relative mb-6 sm:mb-10 scale-90 sm:scale-100">
              <div className="absolute inset-0 bg-xbox-purple/30 blur-3xl rounded-full animate-pulse" />
              <div className="w-24 h-24 border-2 border-xbox-purple/50 rounded-3xl flex items-center justify-center relative bg-black/40 backdrop-blur-xl">
                <RotateCcw
                  size={48}
                  className="text-xbox-purple animate-spin"
                />
              </div>
            </div>

            <h2 className="font-orbitron text-2xl font-black tracking-[0.3em] mb-4 uppercase bg-gradient-to-r from-xbox-purple to-white bg-clip-text text-transparent">
              ROTATE HARDWARE
            </h2>
            <p className="text-xs text-white/40 tracking-widest uppercase max-w-[200px] leading-relaxed mb-8">
              Optimization required: Please switch to landscape mode for the
              full Xbox interface.
            </p>

            <button
              onClick={toggleFullscreen}
              className="px-8 py-4 bg-white/5 border border-white/10 rounded-2xl flex items-center gap-3 hover:bg-white/10 transition-all group"
            >
              <Maximize
                size={18}
                className="text-xbox-purple group-hover:scale-110 transition-transform"
              />
              <span className="text-[0.65rem] font-black tracking-[0.2em] uppercase text-white/80">
                Launch Experience
              </span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div
        className={`w-full min-h-[100dvh] transition-all duration-500 ${
          isFullscreen ? "p-0" : "sm:p-6"
        } flex items-center justify-center overflow-y-auto bg-black`}
      >
        <div
          className={`w-full ${
            isFullscreen || orientation === "landscape"
              ? "h-[100dvh] max-w-none"
              : "min-h-[600px] h-[95dvh] sm:max-w-[1100px] sm:rounded-3xl"
          } flex flex-col relative overflow-hidden transition-all duration-700 hardware-shell touch-none select-none shrink-0`}
        >
          {/* Hardware Internals - Rumble Motors & Impulse Triggers (X-Ray reactive) */}
          <div className="absolute inset-0 pointer-events-none z-0">
            {/* Left Grip - Low Frequency Motor */}
            <div
              className={`absolute bottom-[15%] left-[10%] w-32 h-32 rumble-motor transition-all duration-300 ${
                activeFeedback.some((id) =>
                  ["l1", "l2", "up", "down", "left", "right"].includes(id)
                )
                  ? "animate-vibrate-slow opacity-60 scale-100"
                  : "opacity-0 scale-95"
              }`}
            >
              <div className="rumble-weight w-16 h-8 -translate-x-4" />
              <div className="text-[0.4rem] font-mono text-white/40 mt-16">
                LF_RUMBLE
              </div>
            </div>

            {/* Right Grip - High Frequency Motor (Only in Standard) */}
            {triggerLayout === "standard" && (
              <div
                className={`absolute bottom-[15%] right-[10%] w-24 h-24 rumble-motor transition-all duration-300 ${
                  activeFeedback.some((id) =>
                    ["r1", "r2", "a", "b", "x", "y"].includes(id)
                  )
                    ? "animate-vibrate-fast opacity-60 scale-100"
                    : "opacity-0 scale-95"
                }`}
              >
                <div className="rumble-weight w-8 h-4 translate-x-4" />
                <div className="text-[0.4rem] font-mono text-white/40 mt-12">
                  HF_RUMBLE
                </div>
              </div>
            )}

            {/* Left Impulse Trigger */}
            <div
              className={`absolute top-[5%] left-[20%] p-1 impulse-motor transition-all duration-200 ${
                activeFeedback.includes("l2")
                  ? "animate-vibrate-fast opacity-100 border-xbox-purple -translate-y-1"
                  : "opacity-0 translate-y-2"
              }`}
            >
              <div className="text-[0.3rem] font-mono text-white/80">
                L_IMPULSE
              </div>
            </div>

            {/* Right Impulse Trigger (Only in Standard) */}
            {triggerLayout === "standard" && (
              <div
                className={`absolute top-[5%] right-[20%] p-1 impulse-motor transition-all duration-200 ${
                  activeFeedback.includes("r2")
                    ? "animate-vibrate-fast opacity-100 border-xbox-purple -translate-y-1"
                    : "opacity-0 translate-y-2"
                }`}
              >
                <div className="text-[0.3rem] font-mono text-white/80">
                  R_IMPULSE
                </div>
              </div>
            )}
          </div>
          {/* Hardware Body Highlights */}
          <div className="absolute top-0 left-0 w-full h-[30%] bg-gradient-to-b from-white/10 to-transparent pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-full h-[20%] bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />

          {/* Tactical Shoulders - Standard Positions for Asphalt Legends */}
          {triggerLayout === "standard" ? (
            <>
              <div className="absolute top-[6%] sm:top-[8%] left-4 sm:left-10 z-30 flex flex-col gap-2 scale-75 sm:scale-100">
                <GamepadButton
                  id="l1"
                  label="LB"
                  variant="trigger"
                  onPress={handlePress}
                  onRelease={handleRelease}
                />
                <GamepadButton
                  id="l2"
                  label="LT"
                  variant="trigger"
                  onPress={handlePress}
                  onRelease={handleRelease}
                />
              </div>
              <div className="absolute top-[6%] sm:top-[8%] right-4 sm:right-10 z-30 flex flex-col gap-2 scale-75 sm:scale-100 items-end">
                <GamepadButton
                  id="r1"
                  label="RB"
                  variant="trigger"
                  onPress={handlePress}
                  onRelease={handleRelease}
                />
                <GamepadButton
                  id="r2"
                  label="RT"
                  variant="trigger"
                  onPress={handlePress}
                  onRelease={handleRelease}
                />
              </div>
            </>
          ) : (
            <div className="absolute top-[6%] sm:top-[8%] left-4 sm:left-10 z-30 flex gap-4 scale-75 sm:scale-100">
              <div className="flex flex-col gap-2">
                <GamepadButton
                  id="l1"
                  label="LB"
                  variant="trigger"
                  onPress={handlePress}
                  onRelease={handleRelease}
                />
                <GamepadButton
                  id="l2"
                  label="LT"
                  variant="trigger"
                  onPress={handlePress}
                  onRelease={handleRelease}
                />
              </div>
              <div className="flex flex-col gap-2">
                <GamepadButton
                  id="r1"
                  label="RB"
                  variant="trigger"
                  onPress={handlePress}
                  onRelease={handleRelease}
                />
                <GamepadButton
                  id="r2"
                  label="RT"
                  variant="trigger"
                  onPress={handlePress}
                  onRelease={handleRelease}
                />
              </div>
            </div>
          )}

          {/* Controller Layout */}
          <main className="flex-1 grid grid-cols-[1.2fr_1fr_1.2fr] items-center gap-2 sm:gap-4 py-4 sm:py-8 z-10 min-h-0 overflow-hidden px-4 sm:px-8">
            {/* Left Control Cluster - Offset Xbox Style */}
            <section className="flex flex-col items-center justify-center gap-4 sm:gap-6 h-full">
              <label className="flex items-center gap-3 cursor-pointer select-none">
                {/* Left Label */}
                <span
                  className={`text-sm font-medium ${
                    !enabledLeft ? "text-blue-600" : "text-gray-400"
                  }`}
                  title="Left Grid"
                >
                  LG
                </span>

                {/* Switch */}
                <div className="relative inline-flex items-center">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={enabledLeft}
                    onChange={() => setEnabledLeft(!enabledLeft)}
                  />

                  <div className="w-11 h-6 bg-gray-300 rounded-full peer-checked:bg-blue-600 transition"></div>
                  <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full peer-checked:translate-x-5 transition"></div>
                </div>

                {/* Right Label */}
                <span
                  className={`text-sm font-medium ${
                    enabledLeft ? "text-blue-600" : "text-gray-400"
                  }`}
                  title="Right Trigger"
                >
                  RT
                </span>
              </label>
              {/* TOP Stick */}
              {!enabledLeft && (
                <div className="relative p-2 sm:p-3 rounded-full hardware-stick-base scale-[0.9] sm:scale-[1.1]">
                  <Joystick
                    id="left-stick"
                    color="purple"
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
              )}

              {/* BOTTOM D-Pad */}
              {enabledLeft && (
                <div className="grid grid-cols-3 grid-rows-3 gap-0.5 scale-[0.8] sm:scale-[1.1] sm:mt-4">
                  <div />
                  <GamepadButton
                    id="up"
                    label=""
                    variant="dpad"
                    onPress={handlePress}
                    onRelease={handleRelease}
                  />
                  <div />
                  <GamepadButton
                    id="left"
                    label=""
                    variant="dpad"
                    onPress={handlePress}
                    onRelease={handleRelease}
                  />
                  <div className="w-10 h-10 sm:w-14 sm:h-14 bg-black/40 flex items-center justify-center" />
                  <GamepadButton
                    id="right"
                    label=""
                    variant="dpad"
                    onPress={handlePress}
                    onRelease={handleRelease}
                  />
                  <div />
                  <GamepadButton
                    id="down"
                    label=""
                    variant="dpad"
                    onPress={handlePress}
                    onRelease={handleRelease}
                  />
                  <div />
                </div>
              )}
            </section>

            {/* Central Hub Cluster */}
            <section className="flex flex-col items-center justify-between h-full py-8 sm:py-12">
              {/* Xbox Logo Button */}
              <div className="relative group scale-90 sm:scale-110">
                <div className="absolute inset-0 bg-white/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="w-14 h-14 sm:w-20 sm:h-20 rounded-full bg-[#eee] p-1 shadow-2xl flex items-center justify-center border-b-4 border-black/20">
                  <div className="w-full h-full rounded-full bg-[#111] flex items-center justify-center">
                    <span className="font-orbitron italic text-[0.6rem] sm:text-sm font-black tracking-tighter text-white">
                      XOBX
                    </span>
                  </div>
                </div>
              </div>

              {/* View/Menu/Share cluster */}
              <div className="flex gap-4 sm:gap-10 items-center justify-center scale-90 sm:scale-100">
                <GamepadButton
                  id="select"
                  label="View"
                  variant="menu"
                  onPress={handlePress}
                  onRelease={handleRelease}
                />

                {/* Share Button (Hardware Only) */}
                <div className="w-8 h-6 bg-[#111] rounded-lg border-b-2 border-white/5 shadow-inner flex items-center justify-center">
                  <div className="w-1 h-3 bg-white/20 rounded-full" />
                </div>

                <GamepadButton
                  id="start"
                  label="Menu"
                  variant="menu"
                  onPress={handlePress}
                  onRelease={handleRelease}
                />
              </div>

              <div className="text-[0.4rem] sm:text-[0.6rem] font-black tracking-[1em] text-white/5 uppercase">
                XOBX-S
              </div>
            </section>

            {/* Right Control Cluster - Xbox Style Offset */}
            <section className="flex flex-col items-center justify-center gap-3 sm:gap-5as h-full">
              <label className="flex items-center gap-3 cursor-pointer select-none">
                {/* Left Label */}
                <span
                  className={`text-sm font-medium ${
                    !enabledRight ? "text-blue-600" : "text-gray-400"
                  }`}
                  title="Right Grid"
                >
                  RG
                </span>

                {/* Switch */}
                <div className="relative inline-flex items-center">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={enabledRight}
                    onChange={() => setEnabledRight(!enabledRight)}
                  />

                  <div className="w-11 h-6 bg-gray-300 rounded-full peer-checked:bg-blue-600 transition"></div>
                  <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full peer-checked:translate-x-5 transition"></div>
                </div>

                {/* Right Label */}
                <span
                  className={`text-sm font-medium ${
                    enabledRight ? "text-blue-600" : "text-gray-400"
                  }`}
                  title="Right Trigger"
                >
                  RT
                </span>
              </label>
              {/* TOP ABXY Buttons */}
              {!enabledRight && (
                <div className="relative p-1 sm:p-4 rounded-full bg-black/20 shadow-inner scale-[0.9] sm:scale-[1.1]">
                  <div className="grid grid-cols-3 grid-rows-3 items-center justify-center gap-4">
                    <div />
                    <GamepadButton
                      id="y"
                      label="Y"
                      variant="y"
                      onPress={handlePress}
                      onRelease={handleRelease}
                    />
                    <div />
                    <GamepadButton
                      id="x"
                      label="X"
                      variant="x"
                      onPress={handlePress}
                      onRelease={handleRelease}
                    />
                    <div />
                    <GamepadButton
                      id="b"
                      label="B"
                      variant="b"
                      onPress={handlePress}
                      onRelease={handleRelease}
                    />
                    <div />
                    <GamepadButton
                      id="a"
                      label="A"
                      variant="a"
                      onPress={handlePress}
                      onRelease={handleRelease}
                    />
                    <div />
                  </div>
                </div>
              )}

              {/* BOTTOM Stick */}
              {enabledRight && (
                <div className="relative p-3 rounded-full hardware-stick-base scale-[1.1] mt-4">
                  <Joystick
                    id="right-stick"
                    color="purple"
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
              )}
            </section>
          </main>

          {/* Minimal Status Text */}
          <footer
            className={`px-6 sm:px-10 py-2 sm:py-4 justify-between items-center z-20 ${
              orientation === "landscape" ? "hidden" : "flex"
            }`}
          >
            <div className="text-[0.4rem] sm:text-[0.5rem] font-mono text-white/20 tracking-widest uppercase">
              {debugLog[0] || "HARDWARE READY"}
            </div>
            <div
              className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${
                status === "CONNECTED"
                  ? "bg-green-500 shadow-[0_0_8px_#107c10]"
                  : "bg-red-500"
              }`}
            />
          </footer>

          {/* Settings Overlay - Kept Black for Contrast */}
          <AnimatePresence>
            {showSettings && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/90 backdrop-blur-xl z-50 flex items-center justify-center p-6 overflow-y-auto"
              >
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  className="w-full max-w-sm bg-neutral-900 border border-white/10 rounded-3xl p-8 shadow-2xl my-auto"
                >
                  <div className="flex justify-between items-center mb-8">
                    <h2 className="font-orbitron text-lg font-bold tracking-widest text-white">
                      X-LINK CONFIG
                    </h2>
                    <button
                      onClick={() => setShowSettings(false)}
                      className="text-white/40 hover:text-white"
                    >
                      <X size={20} />
                    </button>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <label className="block text-[0.5rem] font-black text-white/30 tracking-widest uppercase mb-2">
                        HARDWARE IP
                      </label>
                      <input
                        type="text"
                        placeholder="192.168.1.X"
                        value={tempIp}
                        onChange={(e) => setTempIp(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white font-orbitron focus:border-xbox-purple outline-none transition-all text-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-[0.5rem] font-black text-white/30 tracking-widest uppercase mb-2">
                        TRIGGER LAYOUT
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => setTempTriggerLayout("standard")}
                          className={`py-3 rounded-xl text-[0.6rem] font-black tracking-widest transition-all ${
                            tempTriggerLayout === "standard"
                              ? "bg-xbox-purple text-white shadow-lg"
                              : "bg-white/5 text-white/40 hover:bg-white/10"
                          }`}
                        >
                          STANDARD
                        </button>
                        <button
                          onClick={() => setTempTriggerLayout("tactical")}
                          className={`py-3 rounded-xl text-[0.6rem] font-black tracking-widest transition-all ${
                            tempTriggerLayout === "tactical"
                              ? "bg-xbox-purple text-white shadow-lg"
                              : "bg-white/5 text-white/40 hover:bg-white/10"
                          }`}
                        >
                          TACTICAL
                        </button>
                      </div>
                    </div>

                    <button
                      onClick={saveSettings}
                      className="w-full bg-xbox-purple py-3.5 rounded-xl font-black tracking-[0.2em] text-[0.6rem] hover:brightness-110 transition-all shadow-xl uppercase"
                    >
                      INITIATE LINK
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
