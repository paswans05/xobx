"use client";

import { useEffect, useRef } from "react";
import nipplejs from "nipplejs";

interface JoystickProps {
  id: string;
  color: "cyan" | "magenta";
  onMove: (data: any) => void;
  onEnd: () => void;
}

export const Joystick = ({ id, color, onMove, onEnd }: JoystickProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const managerRef = useRef<any>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    managerRef.current = nipplejs.create({
      zone: containerRef.current,
      mode: "static",
      position: { left: "50%", top: "50%" },
      color: color === "cyan" ? "cyan" : "magenta",
    });

    managerRef.current.on("move", (evt: any, data: any) => onMove(data));
    managerRef.current.on("end", () => onEnd());

    return () => {
      if (managerRef.current) managerRef.current.destroy();
    };
  }, [color, onMove, onEnd]);

  return (
    <div
      ref={containerRef}
      id={id}
      className="w-[140px] h-[140px] bg-black/30 rounded-full border-2 border-glass-border relative shadow-[inset_0_0_20px_rgba(0,0,0,0.5)]"
    />
  );
};
