"use client";

import React, { createContext, useContext, useState, useEffect, useRef, useCallback, ReactNode } from "react";

type TimerMode = 'focus' | 'short' | 'long';

interface TimerModeConfig {
    label: string;
    minutes: number;
    color: string;
}

export const MODES: Record<TimerMode, TimerModeConfig> = {
    focus: { label: 'Focus', minutes: 25, color: 'text-neon-blue' },
    short: { label: 'Short Break', minutes: 5, color: 'text-neon-green' },
    long: { label: 'Long Break', minutes: 15, color: 'text-neon-purple' }
};

interface PomodoroContextType {
    mode: TimerMode;
    timeLeft: number;
    isActive: boolean;
    soundEnabled: boolean;
    switchMode: (newMode: TimerMode) => void;
    toggleTimer: () => void;
    resetTimer: () => void;
    toggleSound: () => void;
}

const PomodoroContext = createContext<PomodoroContextType | undefined>(undefined);

export function PomodoroProvider({ children }: { children: ReactNode }) {
    const [mode, setMode] = useState<TimerMode>('focus');
    const [timeLeft, setTimeLeft] = useState(MODES.focus.minutes * 60);
    const [isActive, setIsActive] = useState(false);
    const [soundEnabled, setSoundEnabled] = useState(true);

    const audioRef = useRef<HTMLAudioElement | null>(null);

    // Initialize audio
    useEffect(() => {
        audioRef.current = new Audio("https://actions.google.com/sounds/v1/alarms/beep_short.ogg");
        return () => {
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current = null;
            }
        };
    }, []);

    // Timer Logic
    useEffect(() => {
        let interval: NodeJS.Timeout;

        if (isActive && timeLeft > 0) {
            interval = setInterval(() => {
                setTimeLeft((prev) => prev - 1);
            }, 1000);
        } else if (timeLeft === 0 && isActive) {
            setIsActive(false);
            if (soundEnabled && audioRef.current) {
                audioRef.current.play().catch(e => console.error("Audio play failed:", e));
            }
            if (Notification.permission === "granted") {
                new Notification("Time's up!", { body: `${MODES[mode].label} session completed.` });
            }
        }

        return () => clearInterval(interval);
    }, [isActive, timeLeft, mode, soundEnabled]);

    // Update document title
    useEffect(() => {
        if (isActive) {
            const minutes = Math.floor(timeLeft / 60).toString().padStart(2, '0');
            const seconds = (timeLeft % 60).toString().padStart(2, '0');
            document.title = `${minutes}:${seconds} - ${MODES[mode].label}`;
        } else {
            document.title = "Alti - Advanced Goal Tracking";
        }

        return () => {
            if (!isActive) document.title = "Alti - Advanced Goal Tracking";
        };
    }, [timeLeft, mode, isActive]);

    const switchMode = useCallback((newMode: TimerMode) => {
        setMode(newMode);
        setIsActive(false);
        setTimeLeft(MODES[newMode].minutes * 60);
    }, []);

    const toggleTimer = useCallback(() => {
        setIsActive(prev => !prev);
    }, []);

    const resetTimer = useCallback(() => {
        setIsActive(false);
        setTimeLeft(MODES[mode].minutes * 60);
    }, [mode]);

    const toggleSound = useCallback(() => {
        setSoundEnabled(prev => !prev);
    }, []);

    return (
        <PomodoroContext.Provider value={{
            mode,
            timeLeft,
            isActive,
            soundEnabled,
            switchMode,
            toggleTimer,
            resetTimer,
            toggleSound
        }}>
            {children}
        </PomodoroContext.Provider>
    );
}

export function usePomodoro() {
    const context = useContext(PomodoroContext);
    if (context === undefined) {
        throw new Error("usePomodoro must be used within a PomodoroProvider");
    }
    return context;
}
