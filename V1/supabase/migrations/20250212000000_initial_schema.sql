-- Initial Schema for Jokes LLM App
-- Creates tables, RLS policies, and indexes

-- Profiles table (extends Supabase auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  display_name TEXT,
  avatar_url TEXT,
  is_premium BOOLEAN DEFAULT TRUE, -- Everyone gets premium initially
  premium_expires_at TIMESTAMP,
  subscription_platform TEXT,

  -- Preferences for daily delivery
  delivery_enabled BOOLEAN DEFAULT FALSE,
  delivery_time TIME DEFAULT '09:00:00',
  delivery_method TEXT DEFAULT 'push', -- 'sms', 'push', 'both'
  phone_number TEXT,
  timezone TEXT DEFAULT 'UTC',

  -- Push notification token
  expo_push_token TEXT,

  -- Rate limiting (for when we enable it later)
  jokes_generated_today INTEGER DEFAULT 0,
  last_joke_date DATE,

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Jokes table
CREATE TABLE jokes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  topic TEXT,
  joke_type TEXT, -- 'pun', 'one-liner', 'dad-joke', 'dark', 'observational'
  category TEXT,
  model_used TEXT,
  tokens_used INTEGER,
  cost_usd DECIMAL(10, 6),

  -- User engagement
  user_rating INTEGER CHECK (user_rating BETWEEN 1 AND 5),
  favorited BOOLEAN DEFAULT FALSE,
  shared BOOLEAN DEFAULT FALSE,

  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for jokes
CREATE INDEX idx_jokes_user_id ON jokes(user_id);
CREATE INDEX idx_jokes_created_at ON jokes(created_at DESC);
CREATE INDEX idx_jokes_favorited ON jokes(user_id, favorited) WHERE favorited = TRUE;
CREATE INDEX idx_jokes_user_created ON jokes(user_id, created_at DESC);

-- Enable RLS for jokes
ALTER TABLE jokes ENABLE ROW LEVEL SECURITY;

-- RLS Policies for jokes
CREATE POLICY "Users can view own jokes"
  ON jokes FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own jokes"
  ON jokes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own jokes"
  ON jokes FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own jokes"
  ON jokes FOR DELETE
  USING (auth.uid() = user_id);

-- Subscriptions table (for RevenueCat tracking)
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  platform TEXT NOT NULL, -- 'ios', 'android', 'web'
  product_id TEXT NOT NULL,
  purchase_date TIMESTAMP NOT NULL,
  expiration_date TIMESTAMP,
  is_active BOOLEAN DEFAULT TRUE,
  auto_renew_enabled BOOLEAN DEFAULT TRUE,

  -- RevenueCat data
  revenuecat_subscriber_id TEXT,
  original_transaction_id TEXT UNIQUE,

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_expiration ON subscriptions(expiration_date) WHERE is_active = TRUE;

-- Enable RLS for subscriptions
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own subscriptions"
  ON subscriptions FOR SELECT
  USING (auth.uid() = user_id);

-- Daily deliveries log
CREATE TABLE daily_deliveries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  joke_id UUID REFERENCES jokes(id) ON DELETE SET NULL,
  delivery_method TEXT, -- 'sms', 'push'
  status TEXT, -- 'sent', 'failed', 'pending'
  error_message TEXT,
  delivered_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_daily_deliveries_user_date ON daily_deliveries(user_id, delivered_at DESC);
CREATE INDEX idx_daily_deliveries_status ON daily_deliveries(status, delivered_at DESC);

-- Enable RLS for daily_deliveries
ALTER TABLE daily_deliveries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own deliveries"
  ON daily_deliveries FOR SELECT
  USING (auth.uid() = user_id);

-- Rate limiting table (for future use)
CREATE TABLE rate_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL,
  request_count INTEGER DEFAULT 1,
  window_start TIMESTAMP DEFAULT NOW(),

  UNIQUE(user_id, endpoint, window_start)
);

CREATE INDEX idx_rate_limits_lookup ON rate_limits(user_id, endpoint, window_start);

-- Function to automatically create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, display_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
