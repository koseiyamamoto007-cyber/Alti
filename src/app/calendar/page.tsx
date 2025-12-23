"use client";

import { useState } from "react";
import { format, startOfWeek, endOfWeek, eachDayOfInterval, addDays, subDays, isSameDay, addMonths, subMonths, startOfMonth, endOfMonth, isSameMonth, parse, addMinutes, differenceInMinutes, startOfDay, parseISO, startOfHour, addHours } from "date-fns";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, Plus, Trash2, Check, X, Edit2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

type ViewMode = 'day' | 'week' | 'month';

export default function CalendarPage() {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [view, setView] = useState<ViewMode>('day');
    const [isNewEventOpen, setIsNewEventOpen] = useState(false);
    const [newEventForm, setNewEventForm] = useState({
        title: "",
        date: format(new Date(), 'yyyy-MM-dd'),
        startTime: "09:00",
        endTime: "10:00",
        goalId: ""
    });

    const goals = useStore((state) => state.goals);
    const events = useStore((state) => state.events);
    const dailyScores = useStore((state) => state.dailyScores);
    const updateEvent = useStore((state) => state.updateScheduledEvent);
    const removeEvent = useStore((state) => state.deleteScheduledEvent);

    const handlePrev = () => {
        if (view === 'day') setCurrentDate(subDays(currentDate, 1));
        else if (view === 'week') setCurrentDate(subDays(currentDate, 7));
        else setCurrentDate(subMonths(currentDate, 1));
    };

    const handleNext = () => {
        if (view === 'day') setCurrentDate(addDays(currentDate, 1));
        else if (view === 'week') setCurrentDate(addDays(currentDate, 7));
        else setCurrentDate(addMonths(currentDate, 1));
    };

    const handleAddEvent = () => {
        setNewEventForm({
            title: "",
            date: format(currentDate, 'yyyy-MM-dd'),
            startTime: "09:00",
            endTime: "10:00",
            goalId: goals.length > 0 ? goals[0].id : "custom" // Default to first goal or custom if none
        });
        setIsNewEventOpen(true);
    };

    const handleCreateEvent = () => {
        const start = parse(`${newEventForm.date} ${newEventForm.startTime}`, "yyyy-MM-dd HH:mm", new Date());
        const end = parse(`${newEventForm.date} ${newEventForm.endTime}`, "yyyy-MM-dd HH:mm", new Date());

        let eventTitle = "New Event";
        let finalGoalId: string | undefined = undefined;

        if (newEventForm.goalId === "custom") {
            eventTitle = newEventForm.title || "Custom Event";
        } else {
            const selectedGoalObj = goals.find(g => g.id === newEventForm.goalId);
            if (selectedGoalObj) {
                eventTitle = selectedGoalObj.title;
                finalGoalId = selectedGoalObj.id;
            }
        }

        useStore.getState().addScheduledEvent({
            title: eventTitle,
            startTime: start.toISOString(),
            endTime: end.toISOString(),
            goalId: finalGoalId
        });
        setIsNewEventOpen(false);
    };

    const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
    const weekDays = eachDayOfInterval({ start: weekStart, end: endOfWeek(currentDate, { weekStartsOn: 1 }) });

    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const monthDays = eachDayOfInterval({ start: startOfWeek(monthStart, { weekStartsOn: 1 }), end: endOfWeek(monthEnd, { weekStartsOn: 1 }) });

    return (
        <div className="h-screen w-full flex flex-col md:flex-row overflow-hidden bg-background text-foreground font-sans selection:bg-neon-blue selection:text-white">

            {/* Sidebar (Desktop) */}
            <aside className="hidden md:flex w-64 border-r border-white/5 bg-black/40 p-4 flex-col gap-4">
                <div className="flex items-center gap-2 mb-4">
                    <Button variant="ghost" size="icon" onClick={() => window.location.href = '/'} className="text-muted-foreground hover:text-white hover:bg-white/5">
                        <ChevronLeft className="w-5 h-5" />
                    </Button>
                    <h1 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
                        CALENDAR
                    </h1>
                </div>

                <Button
                    onClick={handleAddEvent}
                    className="w-full bg-neon-blue text-white hover:bg-neon-blue/80 font-bold tracking-wider shadow-[0_0_15px_rgba(41,98,255,0.4)] mb-4"
                >
                    <Plus className="w-4 h-4 mr-2" />
                    NEW EVENT
                </Button>

                <div className="space-y-2">
                    <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2 font-mono">Views</div>
                    <Button
                        variant={view === 'day' ? 'secondary' : 'ghost'}
                        className={cn("w-full justify-start text-xs font-bold tracking-wider", view === 'day' ? "bg-neon-blue text-white shadow-[0_0_10px_rgba(41,98,255,0.4)]" : "text-muted-foreground hover:text-white hover:bg-white/5")}
                        onClick={() => setView('day')}
                    >
                        DAY VIEW
                    </Button>
                    <Button
                        variant={view === 'week' ? 'secondary' : 'ghost'}
                        className={cn("w-full justify-start text-xs font-bold tracking-wider", view === 'week' ? "bg-neon-blue text-white shadow-[0_0_10px_rgba(41,98,255,0.4)]" : "text-muted-foreground hover:text-white hover:bg-white/5")}
                        onClick={() => setView('week')}
                    >
                        WEEK VIEW
                    </Button>
                    <Button
                        variant={view === 'month' ? 'secondary' : 'ghost'}
                        className={cn("w-full justify-start text-xs font-bold tracking-wider", view === 'month' ? "bg-neon-blue text-white shadow-[0_0_10px_rgba(41,98,255,0.4)]" : "text-muted-foreground hover:text-white hover:bg-white/5")}
                        onClick={() => setView('month')}
                    >
                        MONTH VIEW
                    </Button>
                </div>

                <div className="flex-1" />

                <div className="p-4 bg-white/5 rounded-xl border border-white/5 shadow-inner">
                    <div className="text-[10px] text-muted-foreground mb-2 font-bold uppercase tracking-wider">Today's Schedule</div>
                    <div className="flex justify-between items-center text-sm font-mono">
                        <span>Events</span>
                        <span className="font-bold text-neon-green">{events.filter(e => isSameDay(parseISO(e.startTime), new Date())).length}</span>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col h-full bg-background relative">
                {/* Top Gradient Line */}
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-neon-blue via-transparent to-neon-green opacity-50" />

                <header className="border-b border-white/5 bg-black/40 backdrop-blur-sm z-10 flex flex-col">
                    <div className="p-4 flex justify-between items-center">
                        <div className="flex items-center gap-4 overflow-hidden">
                            <div className="md:hidden shrink-0">
                                <Button variant="ghost" size="icon" onClick={() => window.location.href = '/'}>
                                    <ChevronLeft className="w-5 h-5" />
                                </Button>
                            </div>
                            <h2 className="text-lg font-black tracking-tight uppercase truncate">
                                {format(currentDate, view === 'day' ? 'MMMM d, yyyy' : (view === 'week' ? "'Week of' MMM d" : 'MMMM yyyy'))}
                            </h2>
                            <div className="hidden md:flex items-center bg-white/5 rounded-lg p-1 border border-white/5">
                                <Button variant="ghost" size="icon" onClick={handlePrev} className="h-7 w-7 hover:bg-white/10 text-muted-foreground hover:text-white">
                                    <ChevronLeft className="w-4 h-4" />
                                </Button>
                                <Button variant="ghost" size="sm" onClick={() => setCurrentDate(new Date())} className="h-7 px-3 text-[10px] hover:bg-white/10 font-bold uppercase tracking-wider text-neon-blue">
                                    Today
                                </Button>
                                <Button variant="ghost" size="icon" onClick={handleNext} className="h-7 w-7 hover:bg-white/10 text-muted-foreground hover:text-white">
                                    <ChevronRight className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                            {/* Mobile Date Nav (Compact) */}
                            <div className="flex md:hidden items-center bg-white/5 rounded-lg p-1 border border-white/5 mr-2">
                                <Button variant="ghost" size="icon" onClick={handlePrev} className="h-7 w-7 hover:bg-white/10 text-muted-foreground hover:text-white">
                                    <ChevronLeft className="w-4 h-4" />
                                </Button>
                                <Button variant="ghost" size="icon" onClick={handleNext} className="h-7 w-7 hover:bg-white/10 text-muted-foreground hover:text-white">
                                    <ChevronRight className="w-4 h-4" />
                                </Button>
                            </div>

                            {/* Mobile Add Button */}
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={handleAddEvent}
                                className="md:hidden h-8 w-8 bg-neon-blue/10 text-neon-blue border border-neon-blue/50 hover:bg-neon-blue hover:text-white"
                            >
                                <Plus className="w-5 h-5" />
                            </Button>
                        </div>
                    </div>

                    {/* Mobile View Toggles (Second Row) */}
                    <div className="px-4 pb-4 md:hidden w-full">
                        <div className="flex bg-white/5 rounded-lg p-1 w-full border border-white/5">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setView('day')}
                                className={cn("flex-1 text-[10px] h-7 font-bold transition-all", view === 'day' && "bg-neon-blue text-white shadow-[0_0_10px_rgba(41,98,255,0.4)]")}
                            >
                                DAY
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setView('week')}
                                className={cn("flex-1 text-[10px] h-7 font-bold transition-all", view === 'week' && "bg-neon-blue text-white shadow-[0_0_10px_rgba(41,98,255,0.4)]")}
                            >
                                WEEK
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setView('month')}
                                className={cn("flex-1 text-[10px] h-7 font-bold transition-all", view === 'month' && "bg-neon-blue text-white shadow-[0_0_10px_rgba(41,98,255,0.4)]")}
                            >
                                MONTH
                            </Button>
                        </div>
                    </div>
                </header>

                <div className="flex-1 overflow-auto p-4 md:p-8">
                    <AnimatePresence mode="wait">
                        {view === 'day' && (
                            <motion.div
                                key="day"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="max-w-3xl mx-auto space-y-6"
                            >
                                <DayListView
                                    date={currentDate}
                                    events={events}
                                    goals={goals}
                                    onDelete={removeEvent}
                                    onUpdate={updateEvent}
                                />
                            </motion.div>
                        )}

                        {view === 'week' && (
                            <div className="w-full overflow-x-auto pb-4">
                                <motion.div
                                    key="week"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="min-w-[800px] flex gap-4"
                                >
                                    {weekDays.map(day => (
                                        <div key={day.toISOString()} className={cn("flex-1 min-w-[200px] bg-card rounded-xl border p-3 flex flex-col gap-3 transition-colors", isSameDay(day, new Date()) ? "border-neon-blue shadow-[0_0_15px_rgba(41,98,255,0.15)]" : "border-white/5 opacity-80 hover:opacity-100")}>
                                            <div className={cn("text-center pb-2 border-b border-white/5", isSameDay(day, new Date()) ? "text-neon-blue" : "text-muted-foreground")}>
                                                <div className="text-[10px] uppercase font-bold tracking-widest">{format(day, 'EEE')}</div>
                                                <div className="text-xl font-black">{format(day, 'd')}</div>
                                            </div>
                                            <DayListView
                                                date={day}
                                                events={events}
                                                goals={goals}
                                                onDelete={removeEvent}
                                                onUpdate={updateEvent}
                                                compact
                                            />
                                        </div>
                                    ))}
                                </motion.div>
                            </div>
                        )}

                        {view === 'month' && (
                            <motion.div
                                key="month"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="grid grid-cols-7 gap-px bg-white/5 rounded-xl overflow-hidden border border-white/5"
                            >
                                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                                    <div key={day} className="bg-black/80 p-2 text-center text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                                        {day}
                                    </div>
                                ))}
                                {monthDays.map(day => {
                                    const isCurrentMonth = isSameMonth(day, currentDate);
                                    const dayEvents = events.filter(e => isSameDay(parseISO(e.startTime), day));
                                    const dateKey = format(day, 'yyyy-MM-dd');
                                    const score = dailyScores[dateKey];

                                    return (
                                        <div
                                            key={day.toISOString()}
                                            className={cn(
                                                "min-h-[100px] bg-card p-2 border-t border-l border-white/5 hover:bg-white/5 transition-colors flex flex-col gap-1 cursor-pointer",
                                                !isCurrentMonth && "opacity-30 bg-black",
                                                isSameDay(day, new Date()) && "bg-white/5 ring-1 ring-inset ring-neon-blue"
                                            )}
                                            onClick={() => { setCurrentDate(day); setView('day'); }}
                                        >
                                            <div className="flex justify-between items-start mb-1">
                                                <span className={cn(
                                                    "text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full",
                                                    isSameDay(day, new Date()) ? "bg-neon-blue text-white shadow-[0_0_8px_var(--color-neon-blue)]" : "text-muted-foreground"
                                                )}>
                                                    {format(day, 'd')}
                                                </span>
                                                {score !== undefined && (
                                                    <span className={cn(
                                                        "text-[10px] font-black px-1.5 py-0.5 rounded border shadow-sm",
                                                        score >= 8 ? "bg-neon-green/20 text-neon-green border-neon-green/50" :
                                                            score >= 5 ? "bg-neon-yellow/20 text-neon-yellow border-neon-yellow/50" :
                                                                "bg-neon-red/20 text-neon-red border-neon-red/50"
                                                    )}>
                                                        {score}
                                                    </span>
                                                )}
                                            </div>
                                            {dayEvents.slice(0, 3).map(event => (
                                                <div key={event.id} className="text-[10px] truncate px-1.5 py-0.5 rounded bg-white/10 text-zinc-300 border border-white/5 font-mono">
                                                    {event.title}
                                                </div>
                                            ))}
                                            {dayEvents.length > 3 && (
                                                <div className="text-[10px] text-muted-foreground pl-1">+{dayEvents.length - 3} more</div>
                                            )}
                                        </div>
                                    );
                                })}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </main>

            <Dialog open={isNewEventOpen} onOpenChange={setIsNewEventOpen}>
                <DialogContent className="bg-slate-950 border-white/10 text-white">
                    <DialogHeader>
                        <DialogTitle>Create New Event</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Date</Label>
                            <Input
                                type="date"
                                value={newEventForm.date}
                                onChange={(e) => setNewEventForm({ ...newEventForm, date: e.target.value })}
                                className="bg-black/50 border-white/10 text-white"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Start Time</Label>
                                <Select
                                    value={newEventForm.startTime}
                                    onValueChange={(v) => setNewEventForm({ ...newEventForm, startTime: v })}
                                >
                                    <SelectTrigger className="bg-black/50 border-white/10 text-white">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {Array.from({ length: 24 * 4 }).map((_, i) => {
                                            const h = Math.floor(i / 4).toString().padStart(2, '0');
                                            const m = ((i % 4) * 15).toString().padStart(2, '0');
                                            const time = `${h}:${m}`;
                                            return <SelectItem key={time} value={time}>{time}</SelectItem>;
                                        })}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>End Time</Label>
                                <Select
                                    value={newEventForm.endTime}
                                    onValueChange={(v) => setNewEventForm({ ...newEventForm, endTime: v })}
                                >
                                    <SelectTrigger className="bg-black/50 border-white/10 text-white">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {Array.from({ length: 24 * 4 }).map((_, i) => {
                                            const h = Math.floor(i / 4).toString().padStart(2, '0');
                                            const m = ((i % 4) * 15).toString().padStart(2, '0');
                                            const time = `${h}:${m}`;
                                            return <SelectItem key={time} value={time}>{time}</SelectItem>;
                                        })}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Task / Goal</Label>
                            <Select
                                value={newEventForm.goalId}
                                onValueChange={(v) => setNewEventForm({ ...newEventForm, goalId: v })}
                            >
                                <SelectTrigger className="bg-black/50 border-white/10 text-white">
                                    <SelectValue placeholder="Select a Task" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="custom" className="text-neon-blue font-bold">
                                        <span className="flex items-center gap-2">
                                            <span className="w-2 h-2 rounded-full bg-neon-blue" />
                                            Custom Event (No Task)
                                        </span>
                                    </SelectItem>
                                    {goals.map(g => (
                                        <SelectItem key={g.id} value={g.id}>
                                            <span className="flex items-center gap-2">
                                                <span className={cn("w-2 h-2 rounded-full", g.color)} />
                                                {g.title}
                                            </span>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {newEventForm.goalId === "custom" && (
                            <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                                <Label>Event Title</Label>
                                <Input
                                    placeholder="e.g. Dentist Appointment"
                                    value={newEventForm.title}
                                    onChange={(e) => setNewEventForm({ ...newEventForm, title: e.target.value })}
                                    className="bg-black/50 border-white/10 text-white"
                                />
                            </div>
                        )}
                    </div>
                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setIsNewEventOpen(false)} className="text-muted-foreground hover:text-white">Cancel</Button>
                        <Button onClick={handleCreateEvent} className="bg-neon-blue text-white hover:bg-neon-blue/80 font-bold">Create Event</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}


function DayListView({ date, events, goals, onDelete, onUpdate, compact = false }: {
    date: Date,
    events: any[],
    goals: any[],
    onDelete: (id: string) => void,
    onUpdate: (id: string, updates: any) => void,
    compact?: boolean
}) {
    const dayEvents = events
        .filter(event => isSameDay(parseISO(event.startTime), date))
        .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());

    // Time options for dropdown
    const timeOptions: string[] = [];
    for (let i = 0; i < 24; i++) {
        for (let j = 0; j < 60; j += 15) {
            const h = i.toString().padStart(2, '0');
            const m = j.toString().padStart(2, '0');
            timeOptions.push(`${h}:${m}`);
        }
    }

    const [editingId, setEditingId] = useState<string | null>(null);
    const [editForm, setEditForm] = useState({ title: "", start: "09:00", end: "10:00", goalId: "" });

    const startEdit = (event: any) => {
        setEditingId(event.id);
        const start = format(parseISO(event.startTime), "HH:mm");
        const end = format(parseISO(event.endTime), "HH:mm");
        setEditForm({
            title: event.title,
            start,
            end,
            goalId: event.goalId || "custom"
        });
    };

    const cancelEdit = () => setEditingId(null);

    const saveEdit = (event: any) => {
        const dateStr = format(parseISO(event.startTime), "yyyy-MM-dd");
        const newStart = parse(`${dateStr} ${editForm.start}`, "yyyy-MM-dd HH:mm", new Date()).toISOString();
        const newEnd = parse(`${dateStr} ${editForm.end}`, "yyyy-MM-dd HH:mm", new Date()).toISOString();

        // Calculate new duration
        const duration = differenceInMinutes(parseISO(newEnd), parseISO(newStart));

        onUpdate(event.id, {
            title: editForm.title,
            goalId: editForm.goalId === "custom" ? undefined : editForm.goalId,
            startTime: newStart,
            endTime: newEnd,
            completedDuration: event.completed ? duration : 0
        });
        setEditingId(null);
    };

    if (dayEvents.length === 0) {
        return <div className="text-center py-8 text-muted-foreground text-xs italic border border-dashed border-white/5 rounded-lg">No schedule initialized.</div>;
    }

    return (
        <div className="space-y-4">
            {dayEvents.map(event => {
                const goal = goals.find(g => g.id === event.goalId);
                const start = parseISO(event.startTime);
                const end = parseISO(event.endTime);
                const duration = differenceInMinutes(end, start);
                const isEditing = editingId === event.id;

                return (
                    <div key={event.id} className={cn("relative group bg-card border border-white/5 rounded-xl p-3 transition-all hover:border-white/20 hover:bg-white/5 cursor-default", compact ? "p-2" : "p-4")}>
                        <div className={cn("flex gap-3", compact ? "flex-col gap-1" : "items-center")}>
                            {/* Color Accent */}
                            <div className={cn("w-1 self-stretch rounded-full shadow-[0_0_5px_currentColor]", goal?.color.replace('bg-', 'bg-') || "bg-neon-blue text-neon-blue")} />

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                                {isEditing ? (
                                    <div className="space-y-2 mb-2">
                                        <div className="flex items-center gap-2">
                                            <Select value={editForm.start} onValueChange={(v) => setEditForm(prev => ({ ...prev, start: v }))}>
                                                <SelectTrigger className="w-[85px] h-7 text-xs bg-black/50 border-white/10 text-white"><SelectValue /></SelectTrigger>
                                                <SelectContent>{timeOptions.map(t => <SelectItem key={`s-${t}`} value={t}>{t}</SelectItem>)}</SelectContent>
                                            </Select>
                                            <span className="text-muted-foreground">-</span>
                                            <Select value={editForm.end} onValueChange={(v) => setEditForm(prev => ({ ...prev, end: v }))}>
                                                <SelectTrigger className="w-[85px] h-7 text-xs bg-black/50 border-white/10 text-white"><SelectValue /></SelectTrigger>
                                                <SelectContent>{timeOptions.map(t => <SelectItem key={`e-${t}`} value={t}>{t}</SelectItem>)}</SelectContent>
                                            </Select>
                                        </div>

                                        <Select
                                            value={editForm.goalId}
                                            onValueChange={(v) => {
                                                const selectedGoal = goals.find(g => g.id === v);
                                                setEditForm(prev => ({
                                                    ...prev,
                                                    goalId: v,
                                                    title: selectedGoal ? selectedGoal.title : (v === "custom" ? prev.title : prev.title)
                                                }));
                                            }}
                                        >
                                            <SelectTrigger className="w-full h-7 text-xs bg-black/50 border-white/10 text-white truncate">
                                                <SelectValue placeholder="Select Task" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="custom" className="text-neon-blue font-bold">
                                                    <span className="flex items-center gap-2">
                                                        <span className="w-2 h-2 rounded-full bg-neon-blue" />
                                                        Custom Event
                                                    </span>
                                                </SelectItem>
                                                {goals.map(g => (
                                                    <SelectItem key={g.id} value={g.id}>
                                                        <span className="flex items-center gap-2">
                                                            <span className={cn("w-2 h-2 rounded-full", g.color)} />
                                                            {g.title}
                                                        </span>
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>

                                        {editForm.goalId === "custom" && (
                                            <Input
                                                value={editForm.title}
                                                onChange={(e) => setEditForm(prev => ({ ...prev, title: e.target.value }))}
                                                className="h-7 text-xs bg-black/50 border-white/10 text-white"
                                                placeholder="Event Title"
                                            />
                                        )}
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono mb-1">
                                        <Clock className="w-3 h-3" />
                                        <span>{format(start, 'HH:mm')} - {format(end, 'HH:mm')}</span>
                                        <span className="text-zinc-500">({duration}m)</span>
                                    </div>
                                )}

                                <div className={cn("font-bold text-white truncate tracking-wide", compact ? "text-xs" : "text-sm")}>
                                    {event.title}
                                </div>
                            </div>

                            {/* Actions */}
                            {!compact && (
                                <div className="flex items-center gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                                    {isEditing ? (
                                        <>
                                            <Button size="icon" variant="ghost" className="h-7 w-7 text-green-500 hover:text-green-400 hover:bg-green-500/10" onClick={() => saveEdit(event)}>
                                                <Check className="w-4 h-4" />
                                            </Button>
                                            <Button size="icon" variant="ghost" className="h-7 w-7 text-muted-foreground hover:text-white" onClick={cancelEdit}>
                                                <X className="w-4 h-4" />
                                            </Button>
                                        </>
                                    ) : (
                                        <>
                                            <Button
                                                size="icon"
                                                variant="ghost"
                                                className={cn("h-7 w-7 hover:text-white transition-colors", event.completed ? "text-neon-green" : "text-muted-foreground")}
                                                onClick={() => onUpdate(event.id, { completed: !event.completed, completedDuration: !event.completed ? duration : 0 })}
                                                title="Toggle Check-in"
                                            >
                                                <Check className="w-4 h-4" />
                                            </Button>
                                            <Button size="icon" variant="ghost" className="h-7 w-7 text-zinc-300 hover:text-white" onClick={() => startEdit(event)}>
                                                <Edit2 className="w-4 h-4" />
                                            </Button>
                                            <Button size="icon" variant="ghost" className="h-7 w-7 text-zinc-300 hover:text-neon-red hover:bg-neon-red/10" onClick={() => onDelete(event.id)}>
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
