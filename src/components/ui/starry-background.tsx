"use client";

import React, { useEffect, useRef } from "react";

interface Star {
    x: number;
    y: number;
    size: number;
    type: "dot" | "cross";
    alpha: number;
    alphaChange: number;
    velocity: number;
}

export function StarryBackground() {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        let animationFrameId: number;
        let stars: Star[] = [];
        let width = 0;
        let height = 0;

        // Configuration
        const STAR_DENSITY = 0.00015; // Adjusted for "60% density feeling" without overkill
        const DRIFT_SPEED_X = 0.05;
        const DRIFT_SPEED_Y = 0.02;

        const resize = () => {
            width = window.innerWidth;
            height = window.innerHeight;
            canvas.width = width;
            canvas.height = height;
            initStars();
        };

        const initStars = () => {
            stars = [];
            const area = width * height;
            const starCount = Math.floor(area * STAR_DENSITY);

            for (let i = 0; i < starCount; i++) {
                stars.push({
                    x: Math.random() * width,
                    y: Math.random() * height,
                    size: Math.random() < 0.9 ? Math.random() * 1.5 + 0.5 : Math.random() * 3 + 1, // Dots are small, others larger
                    type: Math.random() < 0.95 ? "dot" : "cross",
                    alpha: Math.random(),
                    alphaChange: (Math.random() - 0.5) * 0.02, // Twinkle speed
                    velocity: Math.random() * 0.5 + 0.5, // Parallax depth factor
                });
            }
        };

        const drawMilkyWay = () => {
            ctx.save();
            ctx.globalCompositeOperation = "lighter";

            // Rotate for diagonal effect
            ctx.translate(width / 2, height / 2);
            ctx.rotate(-Math.PI / 4);
            ctx.translate(-width / 2, -height / 2);

            const gradient = ctx.createLinearGradient(0, 0, width, height);
            gradient.addColorStop(0, "rgba(255, 255, 255, 0)");
            gradient.addColorStop(0.4, "rgba(255, 255, 255, 0.02)");
            gradient.addColorStop(0.5, "rgba(255, 255, 255, 0.04)"); // Core
            gradient.addColorStop(0.6, "rgba(255, 255, 255, 0.02)");
            gradient.addColorStop(1, "rgba(255, 255, 255, 0)");

            ctx.fillStyle = gradient;
            ctx.fillRect(-width, -height, width * 3, height * 3); // Oversize to cover rotation
            ctx.restore();
        };

        const drawStars = () => {
            // Clear with background gradient
            const bgGradient = ctx.createLinearGradient(0, 0, 0, height);
            bgGradient.addColorStop(0, "#000000"); // Deep black
            bgGradient.addColorStop(1, "#090a0f"); // Dark Navy

            ctx.fillStyle = bgGradient;
            ctx.fillRect(0, 0, width, height);

            // Draw Milky Way
            drawMilkyWay();

            // Draw Stars
            for (const star of stars) {
                // Update twinkle
                star.alpha += star.alphaChange;
                if (star.alpha <= 0.1 || star.alpha >= 1) {
                    star.alphaChange *= -1;
                }

                // Update Position (Drift)
                star.x -= DRIFT_SPEED_X * star.velocity;
                star.y += DRIFT_SPEED_Y * star.velocity;

                // Wrap around
                if (star.x < 0) star.x = width;
                if (star.y > height) star.y = 0;

                // Draw
                ctx.fillStyle = `rgba(255, 255, 255, ${star.alpha})`;

                if (star.type === "dot") {
                    ctx.beginPath();
                    ctx.arc(star.x, star.y, star.size / 2, 0, Math.PI * 2);
                    ctx.fill();
                } else {
                    // Cross shape
                    ctx.save();
                    ctx.translate(star.x, star.y);
                    ctx.shadowBlur = 4;
                    ctx.shadowColor = "white";

                    const len = star.size * 2;
                    const thick = star.size * 0.4;

                    ctx.fillRect(-len, -thick / 2, len * 2, thick);
                    ctx.fillRect(-thick / 2, -len, thick, len * 2);

                    ctx.restore();
                }
            }
        };

        const animate = () => {
            drawStars();
            animationFrameId = requestAnimationFrame(animate);
        };

        // Initialize
        resize();
        animate();

        // Listeners
        window.addEventListener("resize", resize);

        return () => {
            window.removeEventListener("resize", resize);
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className="fixed inset-0 pointer-events-none z-[-1]"
        />
    );
}
