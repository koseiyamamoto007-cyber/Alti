"use client";

import { usePomodoro, MODES } from "@/context/pomodoro-context";
import { StarryBackground } from "@/components/ui/starry-background";
import { Button } from "@/components/ui/button";
import { Play, Pause, RotateCcw, Volume2, VolumeX } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

type TimerMode = 'focus' | 'short' | 'long';

export default function PomodoroPage() {
    const {
        mode,
        timeLeft,
        isActive,
        soundEnabled,
        switchMode,
        toggleTimer,
        resetTimer,
        toggleSound
    } = usePomodoro();

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60).toString().padStart(2, '0');
        const s = (seconds % 60).toString().padStart(2, '0');
        return { m, s };
    };

    const { m, s } = formatTime(timeLeft);
    const progress = (timeLeft / (MODES[mode].minutes * 60)) * 100;

    return (
        <main className="min-h-screen w-full flex flex-col items-center justify-center relative overflow-hidden font-sans selection:bg-neon-blue selection:text-white">
            <StarryBackground />

            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-neon-blue to-transparent opacity-50" />

            <div className="z-10 w-full max-w-md px-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-black/30 backdrop-blur-md border border-white/10 rounded-3xl p-8 shadow-[0_0_50px_rgba(0,0,0,0.5)] flex flex-col items-center relative"
                >
                    {/* Mode Tabs */}
                    <div className="flex bg-black/40 p-1 rounded-xl mb-8 border border-white/5">
                        {(Object.keys(MODES) as TimerMode[]).map((m) => (
                            <button
                                key={m}
                                onClick={() => switchMode(m)}
                                className={cn(
                                    "px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all",
                                    mode === m ? "bg-white/10 text-white shadow-sm" : "text-muted-foreground hover:text-white hover:bg-white/5"
                                )}
                            >
                                {MODES[m].label}
                            </button>
                        ))}
                    </div>

                    {/* Timer Display */}
                    <div className="relative mb-12 group cursor-default select-none">
                        {/* Glowing Ring Effect */}
                        <div className={cn(
                            "absolute inset-0 rounded-full blur-3xl opacity-20 transition-colors duration-700",
                            mode === 'focus' ? "bg-neon-blue" : mode === 'short' ? "bg-neon-green" : "bg-neon-purple"
                        )} />

                        <div className="relative text-8xl md:text-9xl font-black tracking-tighter text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.3)] flex items-center justify-center font-mono tabular-nums">
                            <span>{m}</span>
                            <span className="animate-pulse text-white/50 mx-2">:</span>
                            <span>{s}</span>
                        </div>

                        <div className={cn(
                            "text-center text-sm font-bold uppercase tracking-[0.2em] mt-2 transition-colors duration-500",
                            MODES[mode].color
                        )}>
                            {isActive ? "Running" : "Paused"}
                        </div>
                    </div>

                    {/* Controls */}
                    <div className="flex items-center gap-6 mb-8 w-full justify-center">
                        <Button
                            size="icon"
                            variant="ghost"
                            onClick={resetTimer}
                            className="w-12 h-12 rounded-full border border-white/10 hover:bg-white/10 hover:text-white transition-all text-muted-foreground"
                            title="Reset"
                        >
                            <RotateCcw className="w-5 h-5" />
                        </Button>

                        <Button
                            onClick={toggleTimer}
                            className={cn(
                                "w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 shadow-[0_0_30px_rgba(0,0,0,0.5)] active:scale-95",
                                isActive
                                    ? "bg-white/10 text-white border border-white/20 hover:bg-white/20"
                                    : "bg-white text-black hover:bg-zinc-200 hover:scale-105"
                            )}
                        >
                            {isActive ? (
                                <Pause className="w-8 h-8 fill-current" />
                            ) : (
                                <Play className="w-8 h-8 fill-current ml-1" />
                            )}
                        </Button>

                        <Button
                            size="icon"
                            variant="ghost"
                            onClick={toggleSound}
                            className={cn(
                                "w-12 h-12 rounded-full border border-white/10 hover:bg-white/10 transition-all",
                                soundEnabled ? "text-neon-blue hover:text-white" : "text-muted-foreground hover:text-white"
                            )}
                            title={soundEnabled ? "Mute" : "Unmute"}
                        >
                            {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
                        </Button>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-white/5 h-1 rounded-full overflow-hidden">
                        <motion.div
                            className={cn("h-full transition-colors duration-500",
                                mode === 'focus' ? "bg-neon-blue" : mode === 'short' ? "bg-neon-green" : "bg-neon-purple"
                            )}
                            initial={{ width: "100%" }}
                            animate={{ width: `${progress}%` }}
                            transition={{ duration: 0.5, ease: "linear" }}
                        />
                    </div>

                </motion.div>

                <p className="text-center text-muted-foreground text-xs mt-8 font-mono opacity-50">
                    STAY FOCUSED • ACHIEVE MORE
                </p>
            </div>
        </main>
    );
}
