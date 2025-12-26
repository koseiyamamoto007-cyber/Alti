-- Enable Realtime for Journal and Memo tables
-- Run this in your Supabase SQL Editor

begin;
  -- Check if publication exists, if not create it (standard setup usually has it)
  -- But usually we just add tables to 'supabase_realtime'

  alter publication supabase_realtime add table journal_entries;
  alter publication supabase_realtime add table memo_entries;
  
  -- Ensure daily_scores is also added if not already
  -- alter publication supabase_realtime add table daily_scores;
commit;
