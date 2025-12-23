-- 1. Create Tables

-- Goals Table
CREATE TABLE IF NOT EXISTS goals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    title TEXT NOT NULL,
    color TEXT,
    icon TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Events Table
CREATE TABLE IF NOT EXISTS events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    title TEXT NOT NULL,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    goal_id UUID,
    completed_duration INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User Settings Table
CREATE TABLE IF NOT EXISTS user_settings (
    user_id UUID PRIMARY KEY, -- Maps to auth.users.id
    main_goal TEXT,
    main_goal_deadline TEXT, -- Storing as text (ISO date) for simplicity
    main_goal_start_date TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Journal Entries Table
CREATE TABLE IF NOT EXISTS journal_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    date TEXT NOT NULL, -- YYYY-MM-DD
    content TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, date) -- One entry per day per user
);

-- Memo Entries Table
CREATE TABLE IF NOT EXISTS memo_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    date TEXT NOT NULL,
    content TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, date)
);

-- Daily Scores Table
CREATE TABLE IF NOT EXISTS daily_scores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    date TEXT NOT NULL,
    score INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, date)
);


-- 2. Enable RLS and Create Policies

-- Goals
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own goals" ON goals
    FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Events
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own events" ON events
    FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- User Settings
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own settings" ON user_settings
    FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Journal Entries
ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own journal entries" ON journal_entries
    FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Memo Entries
ALTER TABLE memo_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own memo entries" ON memo_entries
    FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Daily Scores
ALTER TABLE daily_scores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own daily scores" ON daily_scores
    FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);
