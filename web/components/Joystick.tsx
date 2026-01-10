"use client";

import { useEffect, useRef } from "react";
import nipplejs from "nipplejs";

interface JoystickProps {
  id: string;
  color: "cyan" | "magenta" | "purple" | "gray";
  size?: number;
  onMove: (data: any) => void;
  onEnd: () => void;
}

export const Joystick = ({
  id,
  color,
  size = 130,
  onMove,
  onEnd,
}: JoystickProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const managerRef = useRef<any>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const getColor = () => {
      switch (color) {
        case "cyan":
          return "#00f2ff";
        case "magenta":
          return "#bc00ff";
        case "purple":
          return "#7b4db8";
        case "gray":
          return "#333";
        default:
          return "#555";
      }
    };

    managerRef.current = nipplejs.create({
      zone: containerRef.current,
      mode: "static",
      position: { left: "50%", top: "50%" },
      color: getColor(),
      size: size,
    });

    managerRef.current.on("move", (evt: any, data: any) => onMove(data));
    managerRef.current.on("end", () => onEnd());

    return () => {
      if (managerRef.current) managerRef.current.destroy();
    };
  }, [color, onMove, onEnd, size]);

  return (
    <div
      ref={containerRef}
      id={id}
      className="w-[130px] h-[130px] rounded-full relative shadow-[inset_0_4px_15px_#000] touch-none select-none"
      style={{
        background:
          "radial-gradient(circle at 50% 40%, #1e1e24 0%, #0a0a0f 100%)",
        border: "1px solid rgba(255,255,255,0.05)",
      }}
    />
  );
};
