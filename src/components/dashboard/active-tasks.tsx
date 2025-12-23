"use client";

import { useStore } from "@/lib/store";
import { parseISO, differenceInMinutes, format } from "date-fns";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface ActiveTasksProps {
    date: Date;
}

export function ActiveTasks({ date }: ActiveTasksProps) {
    const events = useStore((state) => state.events);
    const updateProgress = useStore((state) => state.updateEventProgress);

    const targetEvents = events.filter((e) => {
        return parseISO(e.startTime).toDateString() === date.toDateString() && e.goalId;
    });

    const sortedEvents = [...targetEvents].sort((a, b) =>
        parseISO(a.startTime).getTime() - parseISO(b.startTime).getTime()
    );

    if (sortedEvents.length === 0) {
        return (
            <div className="text-center text-muted-foreground p-8">
                No tasks scheduled for today.
            </div>
        );
    }

    return (
        <div className="w-full max-w-2xl bg-slate-950 rounded-xl overflow-hidden border border-white/10 shadow-xl">
            <Table>
                <TableHeader>
                    <TableRow className="border-b border-white/10 hover:bg-transparent bg-slate-900/50">
                        <TableHead className="text-neon-yellow font-bold uppercase tracking-wider text-[10px]">Task Name</TableHead>
                        <TableHead className="text-neon-yellow font-bold uppercase tracking-wider text-[10px]">Goal</TableHead>
                        <TableHead className="text-neon-yellow font-bold uppercase tracking-wider text-[10px]">Current Effort</TableHead>
                        <TableHead className="text-right text-neon-yellow font-bold uppercase tracking-wider text-[10px] w-20">Rate</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    <AnimatePresence>
                        {sortedEvents.map((event) => {
                            const start = parseISO(event.startTime);
                            const end = parseISO(event.endTime);
                            const totalMinutes = differenceInMinutes(end, start);
                            const progressPercent = Math.min(100, Math.round((event.completedDuration / totalMinutes) * 100));

                            return (
                                <TableRow key={event.id} className="border-b border-white/10 hover:bg-white/5 transition-colors group">
                                    <TableCell className="font-bold text-white tracking-wide w-[40%] whitespace-normal break-words">
                                        <div className="text-sm md:text-base drop-shadow-md leading-tight">{event.title}</div>
                                        <div className="text-[10px] md:text-sm font-bold text-neon-green font-mono mt-1 opacity-100 drop-shadow-[0_0_5px_var(--color-neon-green)]">
                                            {format(start, "HH:mm")} - {format(end, "HH:mm")}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-white font-mono text-xs md:text-sm font-bold pl-2 md:pl-6 whitespace-normal break-words w-[25%]">
                                        <div className="leading-tight">
                                            <span className="bg-white/10 px-2 py-1 rounded-md text-xs text-white font-bold tracking-wide shadow-inner">{totalMinutes}m</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="pl-2 md:pl-6 w-[25%]">
                                        <div className="space-y-1">
                                            <div className="flex justify-between items-center text-xs gap-2">
                                                <Input
                                                    type="number"
                                                    value={event.completedDuration.toString()}
                                                    onChange={(e) => {
                                                        const val = parseInt(e.target.value) || 0;
                                                        updateProgress(event.id, Math.min(totalMinutes, Math.max(0, val)));
                                                    }}
                                                    className="w-16 h-6 text-xs bg-slate-900 border-slate-700 text-neon-yellow font-mono text-center p-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                                />
                                                <span className="text-muted-foreground text-[10px] font-mono">min</span>
                                            </div>
                                            <Slider
                                                defaultValue={[event.completedDuration]}
                                                max={totalMinutes}
                                                step={1}
                                                onValueChange={(val) => updateProgress(event.id, val[0])}
                                                className="cursor-pointer py-1"
                                            />
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right pl-2 md:pl-6 w-[10%]">
                                        <Badge variant="outline" className={cn("font-mono text-[10px] px-1 py-0.5 border md:text-xs md:px-2 md:py-1", progressPercent === 100 ? "bg-neon-green/20 text-neon-green border-neon-green shadow-[0_0_10px_var(--color-neon-green)]" : "bg-slate-900/80 text-white border-slate-600")}>
                                            {progressPercent}%
                                        </Badge>
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </AnimatePresence>
                </TableBody>
            </Table>
        </div>
    );
}
