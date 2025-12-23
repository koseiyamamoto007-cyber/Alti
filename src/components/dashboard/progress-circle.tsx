"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface ProgressCircleProps {
    percentage: number; // 0 to 100
    size?: number;
    strokeWidth?: number;
    color?: string;
}

export function ProgressCircle({
    percentage,
    size = 200,
    strokeWidth = 15,
    color = "text-primary",
}: ProgressCircleProps) {
    // Ensure percentage is between 0 and 100
    const safePercentage = Math.min(100, Math.max(0, percentage));

    // Create circular geometry
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const strokeDashoffset = circumference - (safePercentage / 100) * circumference;

    return (
        <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
            {/* Background Circle */}
            <svg
                width={size}
                height={size}
                viewBox={`0 0 ${size} ${size}`}
                className="rotate-[-90deg] transition-all duration-500"
            >
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={strokeWidth}
                    className="text-muted/20"
                />
                {/* Animated Progress Circle */}
                <motion.circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={strokeWidth}
                    strokeLinecap="round"
                    className={cn(color, "drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]")}
                    initial={{ strokeDashoffset: circumference }}
                    animate={{ strokeDashoffset }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    style={{ strokeDasharray: circumference }}
                />
            </svg>


        </div>
    );
}
