"use client";

import { useState, useEffect } from "react";
import { useStore } from "@/lib/store";
import { ProgressCircle } from "@/components/dashboard/progress-circle";
import { ActiveTasks } from "@/components/dashboard/active-tasks";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import confetti from "canvas-confetti";
import { addHours, startOfHour, addDays, subDays, differenceInDays, parseISO, format, startOfDay, endOfDay, differenceInSeconds } from "date-fns";
import { ChevronLeft, ChevronRight, Edit2, StickyNote } from "lucide-react";
import { cn } from "@/lib/utils";

import { StarryBackground } from "@/components/ui/starry-background";

export default function DashboardPage() {
  const [currentDate, setCurrentDate] = useState(new Date());

  const mainGoal = useStore((state) => state.mainGoal);
  const mainGoalDeadline = useStore((state) => state.mainGoalDeadline);
  const mainGoalStartDate = useStore((state) => state.mainGoalStartDate);
  const events = useStore((state) => state.events);
  const getDayProgress = useStore((state) => state.getDayProgress);
  const addEvent = useStore((state) => state.addScheduledEvent);

  const progress = getDayProgress(currentDate);

  // Trigger confetti when progress hits 100% (only for today)
  useEffect(() => {
    const isToday = currentDate.toDateString() === new Date().toDateString();
    if (progress === 100 && isToday) {
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#2962FF', '#FF1744', '#FFEA00', '#00E676'] // Neon Google Colors
      });
    }
  }, [progress, currentDate]);

  const handleDebugSeed = () => {
    const baseTime = startOfHour(currentDate);

    addEvent({
      title: "Deep Work: Coding",
      startTime: baseTime.toISOString(),
      endTime: addHours(baseTime, 2).toISOString(), // 2 hours
    });

    addEvent({
      title: "Team Sync",
      startTime: addHours(baseTime, 3).toISOString(),
      endTime: addHours(baseTime, 4).toISOString(), // 1 hour
    });
  };

  const handlePrevDay = () => setCurrentDate(prev => subDays(prev, 1));
  const handleNextDay = () => setCurrentDate(prev => addDays(prev, 1));

  return (
    <main className="min-h-screen w-full flex flex-col items-center py-8 px-4 font-sans selection:bg-neon-blue selection:text-white relative">
      <StarryBackground />
      <div className="w-full max-w-md space-y-8 flex flex-col items-center relative z-10">

        {/* Header & Main Goal */}
        <div className="text-center space-y-4 w-full">
          <div className="flex items-center justify-center gap-4">
            <Button variant="ghost" size="icon" onClick={handlePrevDay} className="text-muted-foreground hover:text-white hover:bg-white/5 transition-colors">
              <ChevronLeft className="w-6 h-6" />
            </Button>
            <div>
              <h1 className="text-3xl font-black tracking-[0.3em] text-transparent bg-clip-text bg-gradient-to-r from-neon-blue via-neon-red to-neon-yellow animate-neon-pulse font-mono uppercase">
                ALTI
              </h1>
              <div className="mt-2 flex items-center justify-center gap-3">
                <span className="text-neon-blue font-bold text-sm md:text-base tracking-wider">
                  {currentDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                </span>
                <span className="h-4 w-[1px] bg-white/10" />
                <span className="text-sm font-medium text-slate-400">
                  {(() => {
                    const today = startOfDay(new Date());
                    const diff = differenceInDays(startOfDay(currentDate), today);

                    if (diff === 0) return <span className="text-neon-green font-bold bg-neon-green/10 px-2 py-0.5 rounded text-xs uppercase tracking-wider shadow-[0_0_10px_rgba(0,230,118,0.2)]">Today</span>;
                    if (diff === 1) return "Tomorrow";
                    if (diff === -1) return "Yesterday";
                    if (diff > 0) return `In ${diff} Days`;
                    return `${Math.abs(diff)} Days Ago`;
                  })()}
                </span>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={handleNextDay} className="text-muted-foreground hover:text-white hover:bg-white/5 transition-colors">
              <ChevronRight className="w-6 h-6" />
            </Button>
          </div>

          <div className="group w-full">
            {mainGoal ? (
              <div className="relative rounded-2xl p-[2px] bg-gradient-to-r from-neon-blue via-neon-red to-neon-yellow">
                <div className="absolute inset-0 bg-gradient-to-r from-neon-blue via-neon-red to-neon-yellow blur-lg opacity-20" />
                <div className="relative bg-black rounded-[14px] p-6 h-full w-full flex flex-col justify-center items-center text-center">
                  <p className="text-[10px] text-neon-blue uppercase tracking-[0.2em] font-extrabold mb-2 opacity-80">Main Objective</p>
                  <p className="text-xl md:text-2xl font-bold text-white tracking-tight leading-tight max-w-[80%] mx-auto">{mainGoal}</p>
                  {(mainGoalStartDate || mainGoalDeadline) && (
                    <div className="flex flex-col items-center gap-2 mt-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2 bg-white/5 rounded-full px-4 py-1 border border-white/5 font-mono text-xs">
                        {mainGoalStartDate && <span className="text-slate-300">{mainGoalStartDate}</span>}
                        {mainGoalStartDate && mainGoalDeadline && <span className="text-neon-yellow">→</span>}
                        {mainGoalDeadline && <span className="text-slate-300">{mainGoalDeadline}</span>}
                      </div>
                      <div className="absolute top-6 right-6 flex flex-col items-end">
                        {(() => {
                          if (!mainGoalDeadline) return null;
                          const today = startOfDay(new Date());
                          const deadline = startOfDay(typeof mainGoalDeadline === 'string' ? parseISO(mainGoalDeadline) : new Date(mainGoalDeadline));
                          const diffDays = differenceInDays(deadline, today);

                          const isUrgent = diffDays <= 7 && diffDays >= 0;
                          const isPast = diffDays < 0;

                          return (
                            <div className={cn("text-right", isUrgent ? "animate-pulse" : "")}>
                              <div className={cn("text-4xl md:text-5xl font-black leading-none",
                                isPast ? "text-slate-500" :
                                  isUrgent ? "text-neon-red drop-shadow-[0_0_10px_rgba(255,23,68,0.5)]" : "text-white"
                              )}>
                                {Math.abs(diffDays)}
                              </div>
                              <div className={cn("text-[10px] font-bold uppercase tracking-widest mt-1",
                                isPast ? "text-slate-600" : "text-neon-blue"
                              )}>
                                {isPast ? "Days Overdue" : "Days Left"}
                              </div>
                            </div>
                          );
                        })()}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <p className="text-muted-foreground text-sm uppercase tracking-widest text-center py-8 border border-dashed border-white/10 rounded-xl hover:border-neon-blue/50 transition-colors cursor-pointer">Initialize Main Objective...</p>
            )}
          </div>
        </div>

        {/* Progress Circle & Stats */}
        <div className="w-full py-4 flex flex-col items-center gap-8">
          <div className="relative group cursor-pointer">
            <ProgressCircle
              percentage={progress}
              size={240}
              strokeWidth={10}
              color={progress === 100 ? "text-neon-green" : "text-neon-blue"}
            />
            {/* Glow backing */}
            <div className="absolute inset-0 rounded-full bg-neon-blue/10 blur-3xl -z-10 group-hover:bg-neon-blue/20 transition-all duration-500" />

            <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
              <span className="text-6xl font-black text-white tracking-tighter drop-shadow-[0_0_15px_rgba(41,98,255,0.5)]">{progress}%</span>
              <span className="text-[10px] text-zinc-500 uppercase tracking-[0.3em] font-bold mt-2">Sync Rate</span>
            </div>
          </div>

          <DayCountdown />

          <div className="text-center space-y-1 w-full">
            {/* Task Progress Bars */}
            <div className="w-full space-y-4 pt-4">
              <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em] border-b border-white/5 pb-2 mb-4 flex justify-between items-center">
                <span>Daily Targets</span>
                <span className="text-neon-green text-[9px] animate-pulse">● ONLINE</span>
              </h3>
              {useStore(state => state.goals).map(goal => (
                <GoalItem key={goal.id} goal={goal} />
              ))}
            </div>
          </div>


        </div>

        {/* Tasks List */}
        <ActiveTasks date={currentDate} />

        {/* Daily Memo */}
        <div className="w-full pt-6">
          <DailyMemo date={currentDate} />
        </div>

        {/* Daily Journal */}
        <div className="w-full pt-6">
          <DailyJournal date={currentDate} />
        </div>

        {/* Daily Score */}
        <div className="w-full pt-6">
          <DailyScore date={currentDate} />
        </div>

        {/* Debug Controls */}
        <div className="pt-8 w-full border-t border-white/5 mt-8 opacity-20 hover:opacity-100 transition-opacity duration-300">
          <p className="text-[10px] text-zinc-600 uppercase tracking-widest text-center mb-4 font-mono">Development Tools</p>
          <Button
            variant="ghost"
            className="w-full text-xs font-mono text-zinc-600 hover:text-neon-red hover:bg-neon-red/5"
            onClick={handleDebugSeed}
          >
            SEED_DATA ({currentDate.toLocaleDateString()})
          </Button>
        </div>

      </div>
    </main>
  );
}

function GoalItem({ goal }: { goal: any }) {
  const progress = useStore(state => state.getGoalProgress(goal.id));
  const totalCompleted = useStore(state => state.events.filter(e => e.goalId === goal.id).reduce((acc, curr) => acc + curr.completedDuration, 0));

  // Helper to format minutes
  const formatTime = (min: number) => {
    const h = Math.floor(min / 60);
    const m = min % 60;
    if (h > 0) return `${h}h ${m}m`;
    return `${m}m`;
  };

  return (
    <div className="space-y-2 group">
      <div className="flex justify-between items-end mb-1 font-mono">
        <span className="text-sm text-white drop-shadow-[0_0_5px_rgba(255,255,255,0.5)] transition-colors uppercase tracking-wider font-bold truncate pr-4">{goal.title}</span>
        <span className={cn("transition-colors font-bold text-xs whitespace-nowrap", progress >= 100 ? "text-neon-green drop-shadow-[0_0_8px_var(--color-neon-green)]" : "text-white drop-shadow-[0_0_5px_rgba(255,255,255,0.6)]")}>
          <span className="text-sm font-bold">{formatTime(totalCompleted)}</span> <span className="text-zinc-500 mx-1">/</span> {formatTime(goal.defaultDuration)} <span className="ml-1 opacity-100 text-white text-xs">[{progress}%]</span>
        </span>
      </div>
      <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden p-[1px]">
        <div
          className={cn("h-full rounded-full transition-all relative overflow-hidden shadow-[0_0_10px_rgba(0,0,0,0.5)]", goal.color || "bg-neon-blue")}
          style={{ width: `${Math.min(100, progress)}%` }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
        </div>
      </div>
    </div>
  );
}


function DailyJournal({ date }: { date: Date }) {
  const [isEditing, setIsEditing] = useState(false);
  const dateKey = format(date, 'yyyy-MM-dd');
  const journalEntry = useStore(state => state.getJournalEntry(dateKey));
  const setJournalEntry = useStore(state => state.setJournalEntry);
  const [tempContent, setTempContent] = useState("");
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted) {
      setTempContent(journalEntry || "");
    }
  }, [journalEntry, isEditing, isMounted]);

  const handleEdit = () => {
    setTempContent(journalEntry || "");
    setIsEditing(true);
  };

  const handleSave = () => {
    setJournalEntry(dateKey, tempContent);
    setIsEditing(false);
  };

  if (!isMounted) {
    return (
      <div className="space-y-3 text-left">
        <div className="bg-[#FF0033]/5 rounded-xl p-6 min-h-[100px] text-sm text-zinc-200 border border-[#FF0033]/30">
          <span className="text-zinc-500 italic text-xs">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3 text-left">
      <div className="flex items-center justify-between border-b border-[#FF0033]/50 pb-2">
        <h3 className="text-xs font-bold text-[#FF0033] flex items-center gap-2 uppercase tracking-widest drop-shadow-[0_0_15px_rgba(255,0,51,0.8)]">
          <span className="w-1.5 h-1.5 bg-[#FF0033] rounded-full shadow-[0_0_12px_#FF0033] animate-pulse" />
          Daily Journal
        </h3>
        {!isEditing && (
          <Button onClick={handleEdit} size="sm" variant="ghost" className="h-6 text-[10px] text-[#FF0033] hover:text-white hover:bg-[#FF0033]/20 transition-colors">
            <Edit2 className="w-3 h-3 mr-1" /> EDIT
          </Button>
        )}
      </div>

      {isEditing ? (
        <div className="space-y-2 animate-in fade-in duration-200">
          <Textarea
            value={tempContent}
            onChange={(e) => setTempContent(e.target.value)}
            className="bg-black/40 border-[#FF0033]/50 min-h-[150px] text-white focus:border-[#FF0033] focus:ring-1 focus:ring-[#FF0033] font-mono text-base md:text-sm shadow-[0_0_20px_rgba(255,0,51,0.1)]"
            placeholder="Write your thoughts for today..."
          />
          <div className="flex justify-end gap-2">
            <Button onClick={() => setIsEditing(false)} size="sm" variant="ghost" className="h-8 text-xs text-zinc-400 hover:text-white">
              Cancel
            </Button>
            <Button onClick={handleSave} size="sm" className="h-8 text-xs bg-[#FF0033] text-white hover:bg-[#FF0033]/90 font-bold tracking-wide shadow-[0_0_20px_#FF0033]">
              SAVE ENTRY
            </Button>
          </div>
        </div>
      ) : (
        <div className="bg-[#FF0033]/5 rounded-xl p-6 min-h-[100px] text-sm text-zinc-200 whitespace-pre-wrap border border-[#FF0033]/30 shadow-[inset_0_0_30px_rgba(255,0,51,0.1)] hover:border-[#FF0033]/60 hover:bg-[#FF0033]/10 transition-all duration-300 hover:shadow-[0_0_20px_rgba(255,0,51,0.2)]">
          {journalEntry || <span className="text-zinc-500 italic text-xs">No entry for today...</span>}
        </div>
      )}
    </div>
  );
}


function DailyMemo({ date }: { date: Date }) {
  const [isEditing, setIsEditing] = useState(false);
  const dateKey = format(date, 'yyyy-MM-dd');
  const memoEntry = useStore(state => state.getMemoEntry(dateKey));
  const setMemoEntry = useStore(state => state.setMemoEntry);
  const [tempContent, setTempContent] = useState("");
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted) {
      setTempContent(memoEntry || "");
    }
  }, [memoEntry, isEditing, isMounted]);

  const handleEdit = () => {
    setTempContent(memoEntry || "");
    setIsEditing(true);
  };

  const handleSave = () => {
    setMemoEntry(dateKey, tempContent);
    setIsEditing(false);
  };

  if (!isMounted) return null;

  return (
    <div className="space-y-3 text-left">
      <div className="flex items-center justify-between border-b border-white/5 pb-2">
        <h3 className="text-xs font-bold text-zinc-100 flex items-center gap-2 uppercase tracking-widest">
          <StickyNote className="w-4 h-4 text-neon-blue" />
          Daily Memo
        </h3>
        {!isEditing && (
          <Button onClick={handleEdit} size="sm" variant="ghost" className="h-6 text-[10px] text-zinc-500 hover:text-white transition-colors">
            <Edit2 className="w-3 h-3 mr-1" /> EDIT
          </Button>
        )}
      </div>

      {isEditing ? (
        <div className="space-y-2 animate-in fade-in duration-200">
          <Textarea
            value={tempContent}
            onChange={(e) => setTempContent(e.target.value)}
            className="bg-black/40 border-white/10 min-h-[80px] text-white focus:border-neon-blue/50 font-mono text-base md:text-sm"
            placeholder="Quick notes or reminders..."
          />
          <div className="flex justify-end gap-2">
            <Button onClick={() => setIsEditing(false)} size="sm" variant="ghost" className="h-8 text-xs text-zinc-400 hover:text-white">
              Cancel
            </Button>
            <Button onClick={handleSave} size="sm" className="h-8 text-xs bg-neon-blue text-white hover:bg-neon-blue/80 font-bold tracking-wide">
              SAVE MEMO
            </Button>
          </div>
        </div>
      ) : (
        <div className="bg-white/5 rounded-xl p-4 min-h-[60px] text-sm text-zinc-300 whitespace-pre-wrap border border-white/5 shadow-inner hover:bg-white/[0.07] transition-colors relative overflow-hidden group">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-neon-blue/50 group-hover:bg-neon-blue transition-colors" />
          {memoEntry || <span className="text-zinc-600 italic text-xs pl-2">No memo for today.</span>}
        </div>
      )}
    </div>
  );
}

function DailyScore({ date }: { date: Date }) {
  const dateKey = format(date, 'yyyy-MM-dd');
  const dailyScore = useStore(state => state.getDailyScore(dateKey));
  const setDailyScore = useStore(state => state.setDailyScore);
  const [tempScore, setTempScore] = useState<string>("");
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted) {
      setTempScore(dailyScore !== null ? dailyScore.toString() : "");
    }
  }, [dailyScore, isMounted]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (val === "") {
      setTempScore("");
      // Optional: clear score if empty? 
      return;
    }
    const num = parseInt(val);
    if (!isNaN(num) && num >= 0 && num <= 10) {
      setTempScore(val);
      setDailyScore(dateKey, num);
    }
  };

  if (!isMounted) return null;

  return (
    <div className="space-y-3 text-left">
      <div className="flex items-center justify-between border-b border-white/5 pb-2">
        <h3 className="text-xs font-bold text-zinc-100 flex items-center gap-2 uppercase tracking-widest">
          <span className="w-1.5 h-1.5 bg-neon-yellow rounded-full shadow-[0_0_12px_var(--color-neon-yellow)]" />
          Daily Score
        </h3>
      </div>

      <div className="bg-white/5 rounded-xl p-3 min-h-[60px] flex items-center justify-between gap-4 border border-white/5 shadow-inner hover:bg-white/[0.07] transition-colors group">
        <div className="flex flex-col">
          <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">Your Score</p>
        </div>
        <div className="flex items-center gap-2">
          <Input
            type="number"
            min={0}
            max={10}
            value={tempScore}
            onChange={handleChange}
            placeholder="-"
            className="w-14 h-10 text-xl md:text-2xl text-center bg-black/50 border-white/10 text-neon-yellow font-black focus:border-neon-yellow focus:ring-1 focus:ring-neon-yellow [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none rounded-lg p-0"
          />
          <span className="text-lg text-zinc-600 font-bold font-mono">/10</span>
        </div>
      </div>
    </div>
  );
}

function DayCountdown() {
  const [timeLeft, setTimeLeft] = useState("");
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const calculateTimeLeft = () => {
      const now = new Date();
      const end = endOfDay(now);
      const diff = differenceInSeconds(end, now);

      if (diff <= 0) return "00:00:00";

      const hours = Math.floor(diff / 3600);
      const minutes = Math.floor((diff % 3600) / 60);
      const seconds = diff % 60;

      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    };

    setTimeLeft(calculateTimeLeft());

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  if (!isMounted) return <div className="h-6" />;

  return (
    <div className="flex flex-col items-center animate-in fade-in duration-700">
      <div className="font-mono text-xl md:text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-neon-blue via-white to-neon-blue drop-shadow-[0_0_10px_rgba(41,98,255,0.8)] tracking-widest tabular-nums">
        {timeLeft}
      </div>
      <p className="text-[10px] text-zinc-500 uppercase tracking-[0.3em] font-bold mt-1">Time Remaining</p>
    </div>
  );
}
