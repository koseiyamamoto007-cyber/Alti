"use client";

import { useStore } from "@/lib/store";
import { format, parseISO, compareDesc } from "date-fns";
import { StickyNote, BookOpen, Star, Filter } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useMemo, useEffect } from "react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

export default function JournalPage() {
    const journalEntries = useStore((state) => state.journalEntries);
    const memoEntries = useStore((state) => state.memoEntries);
    const dailyScores = useStore((state) => state.dailyScores);

    // Collect all unique dates
    const allDates = useMemo(() => {
        return new Set([
            ...Object.keys(journalEntries),
            ...Object.keys(memoEntries),
            ...Object.keys(dailyScores)
        ]);
    }, [journalEntries, memoEntries, dailyScores]);

    // Sort dates descending
    const sortedDates = useMemo(() =>
        Array.from(allDates).sort((a, b) => compareDesc(parseISO(a), parseISO(b))),
        [allDates]);

    // Group by Month
    const groupedEntries = useMemo(() => {
        const groups: Record<string, string[]> = {};
        sortedDates.forEach(dateKey => {
            const date = parseISO(dateKey);
            const monthKey = format(date, 'MMMM yyyy');
            if (!groups[monthKey]) {
                groups[monthKey] = [];
            }
            groups[monthKey].push(dateKey);
        });
        return groups;
    }, [sortedDates]);

    const months = useMemo(() => Object.keys(groupedEntries), [groupedEntries]);
    const [selectedMonth, setSelectedMonth] = useState<string>("");

    // Update selectedMonth if it's empty and we have months (e.g. initial load)
    useEffect(() => {
        if (!selectedMonth && months.length > 0) {
            setSelectedMonth(months[0]);
        } else if (months.length > 0 && !months.includes(selectedMonth)) {
            // If selected month no longer exists (e.g. data deleted), reset
            setSelectedMonth(months[0]);
        }
    }, [months, selectedMonth]);

    const displayedDates = selectedMonth ? groupedEntries[selectedMonth] || [] : [];

    return (
        <div className="min-h-screen bg-[#020617] text-white p-4 md:p-8 pb-24 md:pl-[320px]">
            <div className="max-w-4xl mx-auto space-y-8">
                <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-white via-zinc-400 to-zinc-600 mb-4">
                            JOURNAL LOG
                        </h1>
                        <p className="text-zinc-400 font-mono text-sm tracking-widest uppercase">
                            Your daily reflections and progress
                        </p>
                    </div>

                    {months.length > 0 && (
                        <div className="flex items-center gap-3 bg-white/5 p-1 rounded-lg border border-white/5">
                            <div className="px-3">
                                <Filter className="w-4 h-4 text-neon-blue" />
                            </div>
                            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                                <SelectTrigger className="w-[180px] bg-transparent border-none focus:ring-0 text-white font-mono text-sm">
                                    <SelectValue placeholder="Select Month" />
                                </SelectTrigger>
                                <SelectContent>
                                    {months.map(month => (
                                        <SelectItem key={month} value={month} className="font-mono">
                                            {month}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    )}
                </header>

                <div className="space-y-12">
                    {selectedMonth && displayedDates.length > 0 ? (
                        <div className="space-y-6">
                            <div className="space-y-6">
                                {displayedDates.map(dateKey => {
                                    const journal = journalEntries[dateKey];
                                    const memo = memoEntries[dateKey];
                                    const score = dailyScores[dateKey];
                                    const date = parseISO(dateKey);

                                    if (!journal && !memo && score === undefined) return null;

                                    return (
                                        <div key={dateKey} className="group relative">
                                            <div className="absolute -left-3 top-0 bottom-0 w-[2px] bg-gradient-to-b from-white/10 via-white/5 to-transparent group-hover:from-neon-blue/50 transition-colors" />

                                            <div className="pl-6 pb-8">
                                                <div className="flex items-center gap-4 mb-4">
                                                    <div className="flex flex-col">
                                                        <span className="text-xl font-bold text-white tracking-tight">{format(date, 'd')}</span>
                                                        <span className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest">{format(date, 'EEEE')}</span>
                                                    </div>

                                                    {score !== undefined && (
                                                        <div className={cn(
                                                            "ml-auto flex items-center gap-2 px-3 py-1.5 rounded-full border",
                                                            score >= 8 ? "bg-neon-green/10 border-neon-green/30 text-neon-green" :
                                                                score >= 5 ? "bg-neon-yellow/10 border-neon-yellow/30 text-neon-yellow" :
                                                                    "bg-neon-red/10 border-neon-red/30 text-neon-red"
                                                        )}>
                                                            <Star className="w-4 h-4 fill-current" />
                                                            <span className="font-bold font-mono text-sm">{score} / 10</span>
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="grid gap-4 md:grid-cols-2">
                                                    {journal && (
                                                        <div className="bg-white/5 rounded-xl p-5 border border-white/5 shadow-sm hover:bg-white/[0.07] transition-colors relative overflow-hidden">
                                                            <div className="absolute top-0 right-0 p-3 opacity-20">
                                                                <BookOpen className="w-8 h-8 text-neon-blue" />
                                                            </div>
                                                            <h3 className="text-[9px] items-center gap-2 text-neon-blue font-bold uppercase tracking-widest mb-2 flex">
                                                                <BookOpen className="w-3 h-3" /> Journal
                                                            </h3>
                                                            <p className="text-sm text-zinc-300 whitespace-pre-wrap leading-relaxed relative z-10">
                                                                {journal}
                                                            </p>
                                                        </div>
                                                    )}

                                                    {memo && (
                                                        <div className="bg-white/5 rounded-xl p-5 border border-white/5 shadow-sm hover:bg-white/[0.07] transition-colors relative overflow-hidden">
                                                            <div className="absolute top-0 right-0 p-3 opacity-20">
                                                                <StickyNote className="w-8 h-8 text-neon-yellow" />
                                                            </div>
                                                            <h3 className="text-[9px] items-center gap-2 text-neon-yellow font-bold uppercase tracking-widest mb-2 flex">
                                                                <StickyNote className="w-3 h-3" /> Memo
                                                            </h3>
                                                            <p className="text-sm text-zinc-300 whitespace-pre-wrap leading-relaxed font-mono relative z-10">
                                                                {memo}
                                                            </p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-20">
                            <p className="text-zinc-600 font-mono text-sm uppercase tracking-widest">No entries found.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
