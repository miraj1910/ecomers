"use client"

import { WaterDroplet } from "./water-droplet"
import { cn } from "@/lib/utils"

interface WaterDropletClusterProps {
  className?: string
  density?: "light" | "medium" | "dense"
}

export function WaterDropletCluster({ className, density = "medium" }: WaterDropletClusterProps) {
  const droplets = {
    light: [
      { size: "lg" as const, x: "10%", y: "10%" },
      { size: "md" as const, x: "50%", y: "40%" },
    ],
    medium: [
      { size: "xl" as const, x: "5%", y: "5%" },
      { size: "md" as const, x: "55%", y: "35%" },
      { size: "sm" as const, x: "30%", y: "60%" },
      { size: "lg" as const, x: "70%", y: "15%" },
    ],
    dense: [
      { size: "xl" as const, x: "2%", y: "2%" },
      { size: "lg" as const, x: "60%", y: "10%" },
      { size: "md" as const, x: "25%", y: "45%" },
      { size: "sm" as const, x: "50%", y: "65%" },
      { size: "md" as const, x: "75%", y: "50%" },
      { size: "lg" as const, x: "10%", y: "70%" },
      { size: "sm" as const, x: "80%", y: "25%" },
    ],
  }

  const items = droplets[density]

  return (
    <div className={cn("relative w-full h-full", className)}>
      {items.map((d, i) => (
        <WaterDroplet
          key={i}
          size={d.size}
          className="absolute"
          style={{
            left: d.x,
            top: d.y,
            animationDelay: `${i * 0.8}s`,
          }}
        />
      ))}
    </div>
  )
}
