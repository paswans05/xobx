"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface ButtonProps {
  id: string;
  label: string;
  variant?: "default" | "y" | "b" | "a" | "x" | "dpad" | "menu" | "trigger";
  className?: string;
  onPress: (id: string) => void;
  onRelease: (id: string) => void;
}

export const GamepadButton = ({
  id,
  label,
  variant = "default",
  className,
  onPress,
  onRelease,
}: ButtonProps) => {
  const getVariantStyles = () => {
    switch (variant) {
      case "y":
        return "border-yellow-400/40 text-white font-orbitron";
      case "b":
        return "border-red-500/40 text-white font-orbitron";
      case "a":
        return "border-green-500/40 text-white font-orbitron";
      case "x":
        return "border-blue-500/40 text-white font-orbitron";
      case "dpad":
        return "w-12 h-12 bg-white/5 border-glass-border rounded-lg";
      case "menu":
        return "px-3 py-1 text-[0.6rem] border-glass-border rounded-full text-white/60 font-medium";
      case "trigger":
        return "px-6 py-2 bg-white/5 border-glass-border rounded uppercase text-[0.7rem] font-orbitron";
      default:
        return "border-glass-border bg-white/5";
    }
  };

  return (
    <motion.button
      id={id}
      whileTap={{
        scale: 0.9,
        backgroundColor: "rgba(0, 242, 255, 0.2)",
        borderColor: "#00f2ff",
        boxShadow: "0 0 15px #00f2ff",
      }}
      onPointerDown={() => onPress(id.replace("btn-", ""))}
      onPointerUp={() => onRelease(id.replace("btn-", ""))}
      onPointerLeave={() => onRelease(id.replace("btn-", ""))}
      className={cn(
        "flex items-center justify-center border-2 transition-colors active:shadow-[0_0_20px_var(--neon-cyan)]",
        variant === "dpad" || variant === "menu" || variant === "trigger"
          ? "border"
          : "w-14 h-14 rounded-full text-xl",
        getVariantStyles(),
        className
      )}
    >
      {label}
    </motion.button>
  );
};
