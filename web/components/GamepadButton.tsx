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
        return "hardware-button text-xbox-yellow font-bold text-2xl";
      case "b":
        return "hardware-button text-xbox-red font-bold text-2xl";
      case "a":
        return "hardware-button text-xbox-green font-bold text-2xl";
      case "x":
        return "hardware-button text-xbox-blue font-bold text-2xl";
      case "dpad":
        return "w-14 h-14 bg-[#111] border-2 border-black rounded-xl shadow-[inset_0_2px_10px_rgba(0,0,0,0.8),0_1px_1px_rgba(255,255,255,0.1)] active:shadow-inner";
      case "menu":
        return "w-8 h-8 hardware-button rounded-full text-[0.5rem] text-white/40";
      case "trigger":
        return "px-6 py-2 bg-[#1a1a1a] border-t-2 border-white/5 rounded-t-2xl rounded-b-lg uppercase text-[0.6rem] font-black tracking-widest text-white/40 shadow-2xl justify-start pl-4";
      default:
        return "hardware-button text-white/80";
    }
  };

  return (
    <motion.button
      id={id}
      whileTap={{
        scale: 0.94,
        filter: "brightness(1.2) contrast(1.1)",
        boxShadow: "inset 0 4px 10px rgba(0,0,0,0.8)",
      }}
      onPointerDown={() => onPress(id.replace("btn-", ""))}
      onPointerUp={() => onRelease(id.replace("btn-", ""))}
      onPointerLeave={() => onRelease(id.replace("btn-", ""))}
      className={cn(
        "flex items-center justify-center transition-all duration-150 select-none touch-none",
        variant === "dpad" || variant === "menu" || variant === "trigger"
          ? ""
          : "w-16 h-16 rounded-full",
        getVariantStyles(),
        className
      )}
    >
      {label}
    </motion.button>
  );
};
