-- Enable RLS on all tables
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE memo_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_scores ENABLE ROW LEVEL SECURITY;

-- Create policies for 'goals'
create policy "Users can manage their own goals"
on goals for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- Create policies for 'events'
create policy "Users can manage their own events"
on events for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- Create policies for 'user_settings'
create policy "Users can manage their own settings"
on user_settings for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- Create policies for 'journal_entries'
create policy "Users can manage their own journal entries"
on journal_entries for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- Create policies for 'memo_entries'
create policy "Users can manage their own memo entries"
on memo_entries for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- Create policies for 'daily_scores'
create policy "Users can manage their own daily scores"
on daily_scores for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);
