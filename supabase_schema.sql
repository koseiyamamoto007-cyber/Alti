-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Goals Table
create table goals (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  title text not null,
  color text,
  icon text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Events Table
create table events (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  title text not null,
  start_time timestamp with time zone not null,
  end_time timestamp with time zone not null,
  goal_id uuid references goals(id), -- Nullable for custom events
  completed_duration integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Journal Entries Table
create table journal_entries (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  date text not null, -- Storing as YYYY-MM-DD string for simplicity matching store
  content text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, date)
);

-- Memo Entries Table
create table memo_entries (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  date text not null,
  content text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, date)
);

-- Daily Scores Table
create table daily_scores (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  date text not null,
  score integer,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, date)
);

-- User Settings Table (Main Goal)
create table user_settings (
  user_id uuid references auth.users primary key,
  main_goal text,
  main_goal_deadline text,
  main_goal_start_date text,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Row Level Security (RLS) Policies
alter table goals enable row level security;
alter table events enable row level security;
alter table journal_entries enable row level security;
alter table memo_entries enable row level security;
alter table daily_scores enable row level security;
alter table user_settings enable row level security;

-- Goals Policy
create policy "Users can view their own goals" on goals for select using (auth.uid() = user_id);
create policy "Users can insert their own goals" on goals for insert with check (auth.uid() = user_id);
create policy "Users can update their own goals" on goals for update using (auth.uid() = user_id);
create policy "Users can delete their own goals" on goals for delete using (auth.uid() = user_id);

-- Events Policy
create policy "Users can view their own events" on events for select using (auth.uid() = user_id);
create policy "Users can insert their own events" on events for insert with check (auth.uid() = user_id);
create policy "Users can update their own events" on events for update using (auth.uid() = user_id);
create policy "Users can delete their own events" on events for delete using (auth.uid() = user_id);

-- Journal Policy
create policy "Users can all on journal" on journal_entries for all using (auth.uid() = user_id);

-- Memo Policy
create policy "Users can all on memo" on memo_entries for all using (auth.uid() = user_id);

-- Daily Score Policy
create policy "Users can all on scores" on daily_scores for all using (auth.uid() = user_id);

-- Settings Policy
create policy "Users can all on settings" on user_settings for all using (auth.uid() = user_id);
