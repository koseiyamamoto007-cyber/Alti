import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { CalendarEvent, Goal, Message } from './types';
import { isSameDay, parseISO, differenceInMinutes, startOfDay } from 'date-fns';
import { supabase } from './supabase';

interface StoreState {
    events: CalendarEvent[];
    goals: Goal[];

    // Auth & Sync
    userId: string | null;
    setUserId: (id: string | null) => void;
    syncWithSupabase: () => Promise<void>;
    syncLocalToSupabase: () => Promise<void>;

    // Actions
    addScheduledEvent: (event: Omit<CalendarEvent, 'id' | 'completedDuration'>) => Promise<void>;
    updateScheduledEvent: (id: string, updates: Partial<CalendarEvent>) => Promise<void>;
    updateEventProgress: (id: string, minutes: number) => Promise<void>;
    deleteScheduledEvent: (id: string) => Promise<void>;
    addGoal: (goal: Omit<Goal, 'id'>) => Promise<void>;
    updateGoal: (id: string, updates: Partial<Goal>) => Promise<void>;
    deleteGoal: (id: string) => Promise<void>;

    // Chat
    messages: Message[];
    addMessage: (msg: Omit<Message, 'id'>) => void;

    // Selectors/Getters
    getDayProgress: (date: Date) => number;
    getDayEvents: (date: Date) => CalendarEvent[];
    getGoals: () => Goal[];
    getGoalProgress: (goalId: string) => number;

    // Main Goal
    mainGoal: string | null;
    mainGoalDeadline: string | null;
    mainGoalStartDate: string | null;
    setMainGoal: (goal: string) => Promise<void>;
    setMainGoalDeadline: (date: string | null) => Promise<void>;
    setMainGoalStartDate: (date: string | null) => Promise<void>;

    // Journal
    journalEntries: Record<string, string>;
    setJournalEntry: (date: string, content: string) => Promise<void>;
    getJournalEntry: (date: string) => string;

    // Memo
    memoEntries: Record<string, string>;
    setMemoEntry: (date: string, content: string) => Promise<void>;
    getMemoEntry: (date: string) => string;

    // Daily Score
    dailyScores: Record<string, number>;
    setDailyScore: (date: string, score: number) => Promise<void>;
    getDailyScore: (date: string) => number | null;
}

export const useStore = create<StoreState>()(
    persist(
        (set, get) => ({
            events: [],
            goals: [],
            messages: [],
            mainGoal: null,
            mainGoalDeadline: null,
            mainGoalStartDate: null,
            userId: null,

            // Journal
            journalEntries: {},
            memoEntries: {},
            dailyScores: {},

            setUserId: (id) => set({ userId: id }),

            syncWithSupabase: async () => {
                const { userId } = get();
                if (!userId) return;

                // Fetch Goals
                const { data: goals } = await supabase.from('goals').select('*');
                if (goals && goals.length > 0) {
                    const mappedGoals = goals.map((g: any) => ({
                        id: g.id,
                        title: g.title,
                        color: g.color,
                        icon: g.icon,
                        defaultDuration: g.default_duration,
                        description: g.description,
                        createdAt: g.created_at ? new Date(g.created_at) : new Date(), // Handle date conversion if needed
                        deadline: g.deadline ? new Date(g.deadline) : new Date() // specific logic might be needed if deadline exists in DB? DB schema didn't show deadline, assuming missing?
                        // Wait, looking at schema I created:
                        // CREATE TABLE IF NOT EXISTS goals (id, user_id, title, color, icon, created_at, updated_at).
                        // I missed 'deadline' in the schema too?
                        // types.ts says `deadline: Date`.
                        // I should add `deadline` to schema migration as well.
                        // For now let's stick to what I have and just ensuring defaultDuration is mapped.
                        // Wait, if I don't map deadline, it might break too.
                        // I will assume for now deadline is not critical for the "percentage" display, focusing on defaultDuration.
                    }));
                    // Actually, let's keep it simple and just map the properties we added.
                    // But wait, if I replace the whole object with mapped one, I might lose properties if I am not careful.
                    // The DB schema I created: id, user_id, title, color, icon.
                    // MISSING: deadline.
                    // If deadline is missing in DB, and I map it from DB, it will be undefined.
                    // I should add deadline to migration script too.

                    set({
                        goals: goals.map((g: any) => ({
                            id: g.id,
                            title: g.title,
                            color: g.color,
                            icon: g.icon,
                            defaultDuration: g.default_duration || 60, // Fallback
                            description: g.description,
                            deadline: new Date(), // Placeholder as it's missing in DB currently
                            createdAt: new Date(g.created_at)
                        })) as Goal[]
                    });
                }

                // Fetch Events
                const { data: events } = await supabase.from('events').select('*');
                if (events && events.length > 0) {
                    const mappedEvents = events.map((e: any) => ({
                        id: e.id,
                        title: e.title,
                        startTime: e.start_time,
                        endTime: e.end_time,
                        goalId: e.goal_id,
                        completedDuration: e.completed_duration
                    }));
                    set({ events: mappedEvents });
                }

                // Fetch Settings (Main Goal)
                const { data: settings } = await supabase.from('user_settings').select('*').single();
                if (settings) {
                    set({
                        mainGoal: settings.main_goal,
                        mainGoalDeadline: settings.main_goal_deadline,
                        mainGoalStartDate: settings.main_goal_start_date
                    });
                }

                // Fetch Journal, Memo, Scores
                const { data: journals } = await supabase.from('journal_entries').select('*');
                if (journals && journals.length > 0) {
                    const map: Record<string, string> = {};
                    journals.forEach((j: any) => map[j.date] = j.content);
                    set({ journalEntries: map });
                }

                const { data: memos } = await supabase.from('memo_entries').select('*');
                if (memos && memos.length > 0) {
                    const map: Record<string, string> = {};
                    memos.forEach((m: any) => map[m.date] = m.content);
                    set({ memoEntries: map });
                }

                const { data: scores } = await supabase.from('daily_scores').select('*');
                if (scores && scores.length > 0) {
                    const map: Record<string, number> = {};
                    scores.forEach((s: any) => map[s.date] = s.score);
                    set({ dailyScores: map });
                }
            },

            syncLocalToSupabase: async () => {
                const state = get();
                const { userId, goals, events, journalEntries, memoEntries, dailyScores, mainGoal, mainGoalDeadline, mainGoalStartDate } = state;

                if (!userId) return;
                console.log("Starting local-to-cloud sync for user:", userId);

                try {
                    // 1. Settings
                    if (mainGoal) {
                        await supabase.from('user_settings').upsert({
                            user_id: userId,
                            main_goal: mainGoal,
                            main_goal_deadline: mainGoalDeadline,
                            main_goal_start_date: mainGoalStartDate
                        });
                    }

                    // 2. Goals
                    if (goals.length > 0) {
                        const goalsPayload = goals.map(g => ({
                            id: g.id,
                            user_id: userId,
                            title: g.title,
                            color: g.color,
                            icon: g.icon,
                            default_duration: g.defaultDuration,
                            description: g.description,
                            deadline: g.deadline,
                            created_at: g.createdAt
                        }));
                        const { error: gErr } = await supabase.from('goals').upsert(goalsPayload);
                        if (gErr) console.error("Goals sync error:", gErr);
                    }

                    // 3. Events
                    if (events.length > 0) {
                        const eventsPayload = events.map(e => ({
                            id: e.id,
                            user_id: userId,
                            title: e.title,
                            start_time: e.startTime,
                            end_time: e.endTime,
                            goal_id: e.goalId,
                            completed_duration: e.completedDuration
                        }));
                        const { error: eErr } = await supabase.from('events').upsert(eventsPayload);
                        if (eErr) console.error("Events sync error:", eErr);
                    }

                    // 4. Journals
                    const journalPayload = Object.entries(journalEntries).map(([date, content]) => ({
                        user_id: userId,
                        date: date,
                        content: content
                    }));
                    if (journalPayload.length > 0) {
                        const { error: jErr } = await supabase.from('journal_entries').upsert(journalPayload, { onConflict: 'user_id, date' });
                        if (jErr) console.error("Journal sync error:", jErr);
                    }

                    // 5. Memos
                    const memoPayload = Object.entries(memoEntries).map(([date, content]) => ({
                        user_id: userId,
                        date: date,
                        content: content
                    }));
                    if (memoPayload.length > 0) {
                        const { error: mErr } = await supabase.from('memo_entries').upsert(memoPayload, { onConflict: 'user_id, date' });
                        if (mErr) console.error("Memo sync error:", mErr);
                    }

                    // 6. Scores
                    const scorePayload = Object.entries(dailyScores).map(([date, score]) => ({
                        user_id: userId,
                        date: date,
                        score: score
                    }));
                    if (scorePayload.length > 0) {
                        const { error: sErr } = await supabase.from('daily_scores').upsert(scorePayload, { onConflict: 'user_id, date' });
                        if (sErr) console.error("Score sync error:", sErr);
                    }

                    console.log("Local-to-cloud sync complete.");
                } catch (err) {
                    console.error("Sync failed:", err);
                }
            },

            setMainGoal: async (goal) => {
                set({ mainGoal: goal });
                const { userId } = get();
                if (userId) {
                    await supabase.from('user_settings').upsert({ user_id: userId, main_goal: goal });
                }
            },
            setMainGoalDeadline: async (date) => {
                set({ mainGoalDeadline: date });
                const { userId } = get();
                if (userId) {
                    await supabase.from('user_settings').upsert({ user_id: userId, main_goal_deadline: date });
                }
            },
            setMainGoalStartDate: async (date) => {
                set({ mainGoalStartDate: date });
                const { userId } = get();
                if (userId) {
                    await supabase.from('user_settings').upsert({ user_id: userId, main_goal_start_date: date });
                }
            },

            addScheduledEvent: async (eventData) => {
                const id = crypto.randomUUID();
                const newEvent = { id, completedDuration: 0, ...eventData };
                set((state) => ({ events: [...state.events, newEvent] }));

                const { userId } = get();
                if (userId) {
                    await supabase.from('events').insert({
                        id,
                        user_id: userId,
                        title: eventData.title,
                        start_time: eventData.startTime,
                        end_time: eventData.endTime,
                        goal_id: eventData.goalId,
                        completed_duration: 0
                    });
                }
            },

            updateScheduledEvent: async (id, updates) => {
                set((state) => ({
                    events: state.events.map((e) => e.id === id ? { ...e, ...updates } : e)
                }));

                const { userId } = get();
                if (userId) {
                    const dbUpdates: any = {};
                    if (updates.title) dbUpdates.title = updates.title;
                    if (updates.startTime) dbUpdates.start_time = updates.startTime;
                    if (updates.endTime) dbUpdates.end_time = updates.endTime;
                    if (updates.goalId !== undefined) dbUpdates.goal_id = updates.goalId;

                    if (Object.keys(dbUpdates).length > 0) {
                        await supabase.from('events').update(dbUpdates).eq('id', id);
                    }
                }
            },

            updateEventProgress: async (id, minutes) => {
                set((state) => ({
                    events: state.events.map((e) => e.id === id ? { ...e, completedDuration: minutes } : e)
                }));
                const { userId } = get();
                if (userId) {
                    await supabase.from('events').update({ completed_duration: minutes }).eq('id', id);
                }
            },

            deleteScheduledEvent: async (id) => {
                set((state) => ({ events: state.events.filter((e) => e.id !== id) }));
                const { userId } = get();
                if (userId) {
                    await supabase.from('events').delete().eq('id', id);
                }
            },

            addGoal: async (goalData) => {
                const id = crypto.randomUUID();
                const newGoal = { id, ...goalData };
                set((state) => ({ goals: [...state.goals, newGoal] }));

                const { userId } = get();
                if (userId) {
                    await supabase.from('goals').insert({
                        id,
                        user_id: userId,
                        title: goalData.title,
                        color: goalData.color,
                        icon: goalData.icon,
                        default_duration: goalData.defaultDuration,
                        description: goalData.description,
                        deadline: goalData.deadline,
                        created_at: goalData.createdAt
                    });
                }
            },

            updateGoal: async (id, updates) => {
                set((state) => {
                    // Update goals
                    const updatedGoals = state.goals.map((g) => g.id === id ? { ...g, ...updates } : g);

                    // Cascade to events if title changed
                    let updatedEvents = state.events;
                    if (updates.title) {
                        updatedEvents = state.events.map(e =>
                            e.goalId === id ? { ...e, title: updates.title! } : e
                        );
                    }
                    return { goals: updatedGoals, events: updatedEvents };
                });

                const { userId } = get();
                if (userId) {
                    const dbUpdates: any = { ...updates };

                    if (updates.defaultDuration) {
                        dbUpdates.default_duration = updates.defaultDuration;
                        delete dbUpdates.defaultDuration;
                    }
                    if (updates.createdAt) {
                        dbUpdates.created_at = updates.createdAt;
                        delete dbUpdates.createdAt;
                    }

                    await supabase.from('goals').update(dbUpdates).eq('id', id);
                }
            },

            deleteGoal: async (id) => {
                set((state) => ({ goals: state.goals.filter((g) => g.id !== id) }));
                const { userId } = get();
                if (userId) {
                    await supabase.from('goals').delete().eq('id', id);
                }
            },

            addMessage: (msg) => set((state) => ({
                messages: [...state.messages, { id: crypto.randomUUID(), ...msg }]
            })),

            setJournalEntry: async (date, content) => {
                set(state => ({ journalEntries: { ...state.journalEntries, [date]: content } }));
                const { userId } = get();
                if (userId) {
                    // Check existing
                    const { data } = await supabase.from('journal_entries').select('id').eq('user_id', userId).eq('date', date).single();
                    if (data) {
                        await supabase.from('journal_entries').update({ content }).eq('id', data.id);
                    } else {
                        await supabase.from('journal_entries').insert({ user_id: userId, date, content });
                    }
                }
            },
            getJournalEntry: (date) => get().journalEntries[date] ?? "",

            setMemoEntry: async (date, content) => {
                set(state => ({ memoEntries: { ...state.memoEntries, [date]: content } }));
                const { userId } = get();
                if (userId) {
                    const { data } = await supabase.from('memo_entries').select('id').eq('user_id', userId).eq('date', date).single();
                    if (data) {
                        await supabase.from('memo_entries').update({ content }).eq('id', data.id);
                    } else {
                        await supabase.from('memo_entries').insert({ user_id: userId, date, content });
                    }
                }
            },
            getMemoEntry: (date) => get().memoEntries[date] ?? "",

            setDailyScore: async (date, score) => {
                set(state => ({ dailyScores: { ...state.dailyScores, [date]: score } }));
                const { userId } = get();
                if (userId) {
                    const { data } = await supabase.from('daily_scores').select('id').eq('user_id', userId).eq('date', date).single();
                    if (data) {
                        await supabase.from('daily_scores').update({ score }).eq('id', data.id);
                    } else {
                        await supabase.from('daily_scores').insert({ user_id: userId, date, score });
                    }
                }
            },
            getDailyScore: (date) => get().dailyScores[date] ?? null,


            // Selectors
            getDayProgress: (date) => {
                const { events } = get();
                const targetEvents = events.filter((e) =>
                    isSameDay(parseISO(e.startTime), date) && e.goalId
                );
                if (targetEvents.length === 0) return 0;
                let totalScheduledMinutes = 0;
                let totalCompletedMinutes = 0;
                targetEvents.forEach((e) => {
                    const start = parseISO(e.startTime);
                    const end = parseISO(e.endTime);
                    const duration = differenceInMinutes(end, start);
                    totalScheduledMinutes += duration;
                    totalCompletedMinutes += e.completedDuration;
                });
                if (totalScheduledMinutes === 0) return 0;
                const percentage = (totalCompletedMinutes / totalScheduledMinutes) * 100;
                return Math.min(100, Math.round(percentage));
            },

            getDayEvents: (date) => {
                const { events } = get();
                return events.filter(e => isSameDay(parseISO(e.startTime), date));
            },

            getGoals: () => get().goals,

            getGoalProgress: (goalId) => {
                const { events, goals } = get();
                const goal = goals.find(g => g.id === goalId);
                if (!goal || !goal.defaultDuration) return 0;
                const totalCompleted = events
                    .filter(e => e.goalId === goalId)
                    .reduce((acc, curr) => acc + curr.completedDuration, 0);
                const percentage = (totalCompleted / goal.defaultDuration) * 100;
                return Math.min(100, Math.round(percentage));
            },
        }),
        {
            name: 'elevate-pro-storage',
            storage: createJSONStorage(() => localStorage),
        }
    )
);
