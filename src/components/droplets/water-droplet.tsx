"use client"

import { cn } from "@/lib/utils"

interface WaterDropletProps {
  size?: "sm" | "md" | "lg" | "xl"
  className?: string
  style?: React.CSSProperties
}

const sizeMap = {
  sm: "w-16 h-16",
  md: "w-24 h-24",
  lg: "w-32 h-32",
  xl: "w-48 h-48",
}

export function WaterDroplet({ size = "md", className, style }: WaterDropletProps) {
  return (
    <div
      className={cn("relative", sizeMap[size], className)}
      style={style}
    >
      <div className="absolute inset-0 rounded-full bg-white/10 backdrop-blur-[2px] shadow-[inset_0_0_20px_rgba(255,255,255,0.15),0_8px_32px_rgba(0,0,0,0.04),0_2px_8px_rgba(0,0,0,0.02)] border border-white/20" />
      <div className="absolute top-[15%] left-[20%] w-[30%] h-[20%] rounded-full bg-white/30 blur-sm" />
      <div className="absolute top-[12%] left-[25%] w-[12%] h-[12%] rounded-full bg-white/40 blur-[1px]" />
      <div className="absolute bottom-[20%] right-[18%] w-[18%] h-[10%] rounded-full bg-white/10 blur-sm" />
    </div>
  )
}
