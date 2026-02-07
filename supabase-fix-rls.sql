-- Temporary fix: Disable RLS to test if that's the issue
-- Run this in Supabase SQL Editor

-- Check if tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('users_data', 'transactions', 'savings_goals');

-- If tables exist, let's check RLS status
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('users_data', 'transactions', 'savings_goals');

-- Temporarily disable RLS for testing (ONLY FOR TESTING!)
ALTER TABLE users_data DISABLE ROW LEVEL SECURITY;

-- Try to insert a test record
INSERT INTO users_data (user_id, bank_balance, cash_balance, savings_balance)
VALUES (auth.uid(), 0, 0, 0)
ON CONFLICT (user_id) DO NOTHING;

-- Re-enable RLS
ALTER TABLE users_data ENABLE ROW LEVEL SECURITY;

-- Check if policies exist
SELECT schemaname, tablename, policyname 
FROM pg_policies 
WHERE tablename IN ('users_data', 'transactions', 'savings_goals');
