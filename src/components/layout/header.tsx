"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Menu, Home, Calendar, Target, PlusCircle, BookOpen, LogIn, LogOut, Timer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { useStore } from "@/lib/store";
import { usePomodoro } from "@/context/pomodoro-context";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
    SheetClose,
} from "@/components/ui/sheet";

export function MobileHeader() {
    const router = useRouter();
    const userId = useStore(state => state.userId);
    const setUserId = useStore(state => state.setUserId);
    const syncWithSupabase = useStore(state => state.syncWithSupabase);

    // Pomodoro State
    const { isActive, timeLeft } = usePomodoro();
    const minutes = Math.floor(timeLeft / 60).toString().padStart(2, '0');
    const seconds = (timeLeft % 60).toString().padStart(2, '0');

    useEffect(() => {
        // Check session on mount
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session) {
                setUserId(session.user.id);
                syncWithSupabase();
            } else {
                setUserId(null);
            }
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            if (session) {
                setUserId(session.user.id);
                syncWithSupabase();
            } else {
                setUserId(null);
                router.refresh();
            }
        });

        return () => subscription.unsubscribe();
    }, [setUserId, syncWithSupabase, router]);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push("/login");
    };

    const menuItems = [
        { label: "Dashboard", href: "/", icon: Home },
        { label: "Calendar", href: "/calendar", icon: Calendar },
        { label: "Main Objective", href: "/objective", icon: Target },
        { label: "Journal", href: "/journal", icon: BookOpen },
        {
            label: "Pomodoro",
            href: "/pomodoro",
            icon: Timer,
            extra: isActive ? (
                <div className="ml-auto flex items-center gap-2 text-xs font-mono text-neon-blue animate-pulse">
                    <span className="w-1.5 h-1.5 rounded-full bg-neon-blue" />
                    {minutes}:{seconds}
                </div>
            ) : null
        },
        { label: "Task Manager", href: "/goals/new", icon: PlusCircle },
    ];

    return (
        <header className="fixed top-0 left-0 right-0 h-16 bg-slate-950/80 backdrop-blur-md border-b border-white/10 flex items-center justify-between px-4 z-50 md:hidden">
            <div className="flex items-center gap-2" onClick={() => router.push("/")}>
                <div className="w-8 h-8 flex items-center justify-center">
                    <svg viewBox="0 0 24 24" fill="none" className="w-8 h-8 drop-shadow-[0_0_10px_rgba(41,98,255,0.5)]">
                        <path d="M12 2L2 22H6L12 8L18 22H22L12 2Z" fill="url(#alti-gradient)" />
                        <defs>
                            <linearGradient id="alti-gradient" x1="2" y1="2" x2="22" y2="22" gradientUnits="userSpaceOnUse">
                                <stop offset="0%" stopColor="#2962FF" />
                                <stop offset="50%" stopColor="#00E676" />
                                <stop offset="100%" stopColor="#2962FF" />
                            </linearGradient>
                        </defs>
                    </svg>
                </div>
                <span className="font-bold text-lg text-white tracking-widest uppercase" style={{ fontFamily: 'var(--font-mono)' }}>ALTI</span>
            </div>

            <Sheet>
                <SheetTrigger asChild>
                    <Button variant="ghost" size="icon" className="text-slate-300 hover:text-white hover:bg-white/10">
                        <Menu className="w-6 h-6" />
                    </Button>
                </SheetTrigger>
                <SheetContent side="left" className="bg-slate-950 border-r-slate-800 text-slate-100 w-[300px]">
                    <SheetHeader className="mb-8 text-left">
                        <SheetTitle className="text-2xl font-bold text-white flex items-center gap-2">
                            <div className="w-8 h-8 flex items-center justify-center">
                                <svg viewBox="0 0 24 24" fill="none" className="w-8 h-8 drop-shadow-[0_0_10px_rgba(41,98,255,0.5)]">
                                    <path d="M12 2L2 22H6L12 8L18 22H22L12 2Z" fill="url(#alti-gradient-mobile)" />
                                    <defs>
                                        <linearGradient id="alti-gradient-mobile" x1="2" y1="2" x2="22" y2="22" gradientUnits="userSpaceOnUse">
                                            <stop offset="0%" stopColor="#2962FF" />
                                            <stop offset="50%" stopColor="#00E676" />
                                            <stop offset="100%" stopColor="#2962FF" />
                                        </linearGradient>
                                    </defs>
                                </svg>
                            </div>
                            <span className="tracking-widest uppercase font-mono">ALTI</span>
                        </SheetTitle>
                    </SheetHeader>

                    <nav className="flex flex-col gap-2">
                        {menuItems.map((item) => (
                            <SheetClose key={item.href} asChild>
                                <Link
                                    href={item.href}
                                    className="flex items-center gap-4 px-4 py-3 rounded-lg text-slate-300 hover:bg-indigo-500/10 hover:text-indigo-400 transition-all group"
                                >
                                    <item.icon className="w-5 h-5 group-hover:text-indigo-400" />
                                    <span className="font-medium">{item.label}</span>
                                    {/* @ts-ignore */}
                                    {item.extra}
                                </Link>
                            </SheetClose>
                        ))}
                    </nav>

                    <div className="absolute bottom-8 left-4 right-4 space-y-4">
                        {userId ? (
                            <Button onClick={handleLogout} variant="destructive" className="w-full justify-start gap-4" size="lg">
                                <LogOut className="w-5 h-5" /> Logout
                            </Button>
                        ) : (
                            <Link href="/login" onClick={() => document.querySelector('[data-state="open"]')?.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))}>
                                <Button variant="default" className="w-full justify-start gap-4 bg-neon-blue text-white" size="lg">
                                    <LogIn className="w-5 h-5" /> Login / Signup
                                </Button>
                            </Link>
                        )}

                        <div className="bg-slate-900 rounded-xl p-4 border border-slate-800">
                            <p className="text-xs text-slate-500 mb-2">Current Version</p>
                            <p className="text-sm font-mono text-slate-300">Alpha 1.0.2</p>
                        </div>
                    </div>
                </SheetContent>
            </Sheet>
        </header>
    );
}

export function Sidebar() {
    const router = useRouter();
    const userId = useStore(state => state.userId);

    // Pomodoro State
    const { isActive, timeLeft } = usePomodoro();
    const minutes = Math.floor(timeLeft / 60).toString().padStart(2, '0');
    const seconds = (timeLeft % 60).toString().padStart(2, '0');

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push("/login");
    };

    const menuItems = [
        { label: "Dashboard", href: "/", icon: Home },
        { label: "Calendar", href: "/calendar", icon: Calendar },
        { label: "Main Objective", href: "/objective", icon: Target },
        { label: "Journal", href: "/journal", icon: BookOpen },
        {
            label: "Pomodoro",
            href: "/pomodoro",
            icon: Timer,
            extra: isActive ? (
                <div className="ml-auto flex items-center gap-2 text-xs font-mono text-neon-blue">
                    <span className="w-1.5 h-1.5 rounded-full bg-neon-blue animate-pulse" />
                    {minutes}:{seconds}
                </div>
            ) : null
        },
        { label: "Task Manager", href: "/goals/new", icon: PlusCircle },
    ];

    return (
        <aside className="hidden md:flex fixed top-0 left-0 bottom-0 w-[300px] bg-slate-950 border-r border-white/10 flex-col z-40">
            <div className="p-8 pb-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 flex items-center justify-center">
                        <svg viewBox="0 0 24 24" fill="none" className="w-10 h-10 drop-shadow-[0_0_15px_rgba(41,98,255,0.8)] filter brightness-125">
                            <path d="M12 2L2 22H6L12 8L18 22H22L12 2Z" fill="url(#alti-gradient-sidebar)" />
                            <defs>
                                <linearGradient id="alti-gradient-sidebar" x1="2" y1="2" x2="22" y2="22" gradientUnits="userSpaceOnUse">
                                    <stop offset="0%" stopColor="#2962FF" />
                                    <stop offset="50%" stopColor="#00E676" />
                                    <stop offset="100%" stopColor="#2962FF" />
                                </linearGradient>
                            </defs>
                        </svg>
                    </div>
                    <span className="font-bold text-2xl text-white tracking-[0.2em] font-mono leading-none mt-1">ALTI</span>
                </div>
            </div>

            <div className="h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent mx-6 mb-6" />

            <nav className="flex-1 px-4 flex flex-col gap-2 overflow-y-auto">
                {menuItems.map((item) => (
                    <Link
                        key={item.href}
                        href={item.href}
                        className="flex items-center gap-4 px-4 py-3 rounded-xl text-slate-400 hover:bg-white/5 hover:text-white transition-all group border border-transparent hover:border-white/5"
                    >
                        <item.icon className="w-5 h-5 group-hover:text-neon-blue transition-colors" />
                        <span className="font-medium tracking-wide">{item.label}</span>
                        {/* @ts-ignore */}
                        {item.extra}
                    </Link>
                ))}
            </nav>

            <div className="p-6 mt-auto space-y-4">
                {userId ? (
                    <Button onClick={handleLogout} variant="ghost" className="w-full justify-start gap-4 text-zinc-400 hover:text-white hover:bg-white/5">
                        <LogOut className="w-5 h-5" /> Logout
                    </Button>
                ) : (
                    <Link href="/login">
                        <Button variant="ghost" className="w-full justify-start gap-4 text-neon-blue hover:text-white hover:bg-neon-blue/20">
                            <LogIn className="w-5 h-5" /> Login / Signup
                        </Button>
                    </Link>
                )}

                <div className="bg-black/40 rounded-xl p-4 border border-white/5 backdrop-blur-sm">
                    <div className="flex justify-between items-center mb-2">
                        <p className="text-xs text-slate-500 uppercase tracking-wider font-bold">Version</p>
                        <span className="w-2 h-2 rounded-full bg-neon-green animate-pulse" />
                    </div>
                    <p className="text-sm font-mono text-slate-300">Alpha 1.0.2</p>
                </div>
            </div>
        </aside>
    );
}
