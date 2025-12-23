"use client";

import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useStore } from "@/lib/store";

export function ChatWidget() {
    const [isOpen, setIsOpen] = useState(false);
    const [inputValue, setInputValue] = useState("");
    const messages = useStore((state) => state.messages);
    const addMessage = useStore((state) => state.addMessage);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isOpen]);

    const handleSendMessage = () => {
        if (!inputValue.trim()) return;

        addMessage({ role: "user", content: inputValue });
        setInputValue("");

        // Simulate bot response
        setTimeout(() => {
            addMessage({ role: "assistant", content: "I'm your AI assistant. I'm here to help you achieve your goals." });
        }, 1000);
    };

    // Idle Timer Logic
    const [isIdle, setIsIdle] = useState(false);
    const idleTimerRef = useRef<NodeJS.Timeout | null>(null);

    const resetIdleTimer = () => {
        setIsIdle(false);
        if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
        idleTimerRef.current = setTimeout(() => {
            if (!isOpen) setIsIdle(true);
        }, 3000);
    };

    useEffect(() => {
        // Initial timer
        resetIdleTimer();

        const handleActivity = () => resetIdleTimer();

        window.addEventListener("mousemove", handleActivity);
        window.addEventListener("scroll", handleActivity);
        window.addEventListener("keydown", handleActivity);

        return () => {
            window.removeEventListener("mousemove", handleActivity);
            window.removeEventListener("scroll", handleActivity);
            window.removeEventListener("keydown", handleActivity);
            if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
        };
    }, [isOpen]);

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-4">
            <AnimatePresence>
                {isIdle && !isOpen && (
                    <motion.div
                        initial={{ opacity: 0, x: 20, scale: 0.8 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        exit={{ opacity: 0, x: 20, scale: 0.8 }}
                        className="bg-neon-blue/20 backdrop-blur-md border border-neon-blue text-white px-6 py-3 rounded-xl rounded-br-none shadow-[0_0_20px_rgba(41,98,255,0.6)] mr-2 mb-2"
                    >
                        <p className="text-sm font-black tracking-widest text-white drop-shadow-[0_0_10px_rgba(41,98,255,1)] animate-pulse uppercase">
                            Never GIVE UP
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        className="w-[90vw] md:w-80 h-[400px] bg-card border border-white/10 rounded-xl flex flex-col shadow-2xl overflow-hidden"
                    >
                        {/* Gradient Border Top */}
                        <div className="h-1 w-full bg-gradient-to-r from-neon-blue via-neon-red to-neon-yellow" />

                        {/* Header */}
                        <div className="p-3 border-b border-white/10 flex justify-between items-center bg-black/40 backdrop-blur-md">
                            <h3 className="font-bold text-white text-sm tracking-wider flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-neon-green animate-pulse shadow-[0_0_5px_var(--color-neon-green)]" />
                                AI ASSISTANT
                            </h3>
                            <Button
                                size="icon"
                                variant="ghost"
                                className="h-6 w-6 text-muted-foreground hover:text-white"
                                onClick={() => setIsOpen(false)}
                            >
                                <X className="w-4 h-4" />
                            </Button>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4 font-mono text-sm">
                            {messages.map((msg) => (
                                <div
                                    key={msg.id}
                                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                                >
                                    <div
                                        className={`max-w-[85%] p-3 rounded-lg ${msg.role === "user"
                                            ? "bg-neon-blue/10 border border-neon-blue/30 text-neon-blue rounded-br-none"
                                            : "bg-white/5 border border-white/10 text-zinc-300 rounded-bl-none"
                                            }`}
                                    >
                                        {msg.content}
                                    </div>
                                </div>
                            ))}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input */}
                        <div className="p-3 border-t border-white/10 bg-black/40 backdrop-blur-md">
                            <div className="flex gap-2">
                                <Input
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                                    placeholder="Type a message..."
                                    className="bg-black/50 border-white/10 text-white focus:border-neon-blue/50 placeholder:text-zinc-600 font-mono text-xs h-9"
                                />
                                <Button onClick={handleSendMessage} size="icon" className="h-9 w-9 bg-neon-blue hover:bg-neon-blue/80 text-white shadow-[0_0_10px_rgba(41,98,255,0.3)]">
                                    <Send className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <Button
                onClick={() => setIsOpen(!isOpen)}
                size="lg"
                className="h-16 w-16 rounded-full bg-neon-blue border-2 border-white/20 text-white shadow-[0_0_30px_rgba(41,98,255,0.6)] hover:scale-110 hover:shadow-[0_0_50px_rgba(41,98,255,0.8)] transition-all duration-300 relative group overflow-hidden"
            >
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent blur-sm rotate-45 translate-y-full group-hover:translate-y-[-100%] transition-transform duration-700 ease-in-out" />
                <MessageCircle className="w-8 h-8 relative z-10 text-white drop-shadow-md fill-white/20" />
            </Button>
        </div>
    );
}
