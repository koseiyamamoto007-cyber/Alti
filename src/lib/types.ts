export interface Goal {
    id: string;
    title: string;
    deadline: Date;
    createdAt: Date;

    // New fields
    color: string; // Tailwind class e.g., "bg-blue-500"
    defaultDuration: number; // Minutes
    description?: string;
    icon?: string; // Icon name
}

export interface CalendarEvent {
    id: string;
    title: string;
    startTime: string; // ISO String for easier JSON persistence
    endTime: string;   // ISO String
    completedDuration: number; // Minutes
    goalId?: string;
}

export interface DailyProgress {
    date: string;
    totalScheduledMinutes: number;
    completedMinutes: number;
    percentage: number;
}

export interface Message {
    id: string;
    role: "user" | "assistant";
    content: string;
}
