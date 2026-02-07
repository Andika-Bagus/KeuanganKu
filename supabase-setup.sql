-- KeuanganKu Database Setup
-- Run this in Supabase SQL Editor

-- 1. Drop existing tables if any (CAREFUL: This will delete all data!)
DROP TABLE IF EXISTS savings_goals CASCADE;
DROP TABLE IF EXISTS transactions CASCADE;
DROP TABLE IF EXISTS users_data CASCADE;

-- 2. Create users_data table
CREATE TABLE users_data (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  bank_balance BIGINT DEFAULT 0,
  cash_balance BIGINT DEFAULT 0,
  savings_balance BIGINT DEFAULT 0,
  budget_settings JSONB DEFAULT '{"dailyCashLimit": 30000, "enableNotifications": true}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create transactions table
CREATE TABLE transactions (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  amount BIGINT NOT NULL,
  description TEXT NOT NULL,
  account TEXT NOT NULL,
  target_account TEXT,
  date TIMESTAMPTZ NOT NULL,
  category TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Create savings_goals table
CREATE TABLE savings_goals (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  target_amount BIGINT NOT NULL,
  current_amount BIGINT DEFAULT 0,
  deadline TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Enable Row Level Security
ALTER TABLE users_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE savings_goals ENABLE ROW LEVEL SECURITY;

-- 6. Create RLS Policies for users_data (SIMPLE VERSION)
CREATE POLICY "Enable all for authenticated users"
  ON users_data
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 7. Create RLS Policies for transactions (SIMPLE VERSION)
CREATE POLICY "Enable all for authenticated users"
  ON transactions
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 8. Create RLS Policies for savings_goals (SIMPLE VERSION)
CREATE POLICY "Enable all for authenticated users"
  ON savings_goals
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 9. Create indexes for better performance
CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_transactions_date ON transactions(date DESC);
CREATE INDEX idx_savings_goals_user_id ON savings_goals(user_id);

-- Done! Your database is ready.
-- Now refresh your app and try adding a transaction.
