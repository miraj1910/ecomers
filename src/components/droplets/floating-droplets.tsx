"use client"

import { motion } from "framer-motion"
import { WaterDroplet } from "./water-droplet"
import { cn } from "@/lib/utils"

interface FloatingDropletsProps {
  className?: string
  count?: number
}

export function FloatingDroplets({ className, count = 5 }: FloatingDropletsProps) {
  const sizes = ["sm", "md", "lg", "sm", "md"] as const

  return (
    <div className={cn("relative w-full h-full", className)}>
      {Array.from({ length: count }).map((_, i) => {
        const x = 10 + Math.random() * 80
        const y = 10 + Math.random() * 80
        const delay = i * 1.2
        const duration = 6 + Math.random() * 4

        return (
          <motion.div
            key={i}
            className="absolute"
            style={{ left: `${x}%`, top: `${y}%` }}
            animate={{
              y: [0, -20, 0],
              opacity: [0.4, 0.8, 0.4],
            }}
            transition={{
              duration,
              repeat: Infinity,
              ease: "easeInOut",
              delay,
            }}
          >
            <WaterDroplet size={sizes[i % sizes.length]} />
          </motion.div>
        )
      })}
    </div>
  )
}
