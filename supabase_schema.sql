-- ============================================================
-- FitCore Supabase Schema
-- Run this in the Supabase SQL editor
-- ============================================================

-- USERS (extends Supabase auth.users)
CREATE TABLE public.users (
  id              UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email           TEXT NOT NULL,
  name            TEXT NOT NULL DEFAULT '',
  age             SMALLINT NOT NULL DEFAULT 25,
  sex             TEXT NOT NULL DEFAULT 'other' CHECK (sex IN ('male','female','other')),
  height_cm       NUMERIC(5,1) NOT NULL DEFAULT 170,
  weight_kg       NUMERIC(5,2) NOT NULL DEFAULT 70,
  activity_level  TEXT NOT NULL DEFAULT 'sedentary'
                    CHECK (activity_level IN ('sedentary','lightly_active','moderately_active','very_active','extra_active')),
  goal            TEXT NOT NULL DEFAULT 'maintain'
                    CHECK (goal IN ('lose_fat','maintain','build_muscle')),
  tdee            NUMERIC(7,2) NOT NULL DEFAULT 2000,
  target_calories NUMERIC(7,2) NOT NULL DEFAULT 2000,
  target_protein  NUMERIC(6,2) NOT NULL DEFAULT 150,
  target_carbs    NUMERIC(6,2) NOT NULL DEFAULT 200,
  target_fat      NUMERIC(6,2) NOT NULL DEFAULT 65,
  onboarding_complete BOOLEAN NOT NULL DEFAULT FALSE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users_own" ON public.users
  USING (id = auth.uid()) WITH CHECK (id = auth.uid());

-- PRESETS
CREATE TABLE public.presets (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  name            TEXT NOT NULL,
  items           JSONB NOT NULL DEFAULT '[]',
  total_calories  NUMERIC(7,2) NOT NULL DEFAULT 0,
  total_protein   NUMERIC(6,2) NOT NULL DEFAULT 0,
  total_carbs     NUMERIC(6,2) NOT NULL DEFAULT 0,
  total_fat       NUMERIC(6,2) NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.presets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "presets_own" ON public.presets
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE INDEX idx_presets_user_id ON public.presets(user_id);

-- FOOD LOGS
CREATE TABLE public.food_logs (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  date            DATE NOT NULL,
  meal_slot       TEXT NOT NULL CHECK (meal_slot IN ('breakfast','snack','meal')),
  food_item       JSONB NOT NULL,
  quantity_g      NUMERIC(7,2) NOT NULL DEFAULT 100,
  logged_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.food_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "food_logs_own" ON public.food_logs
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE INDEX idx_food_logs_user_date ON public.food_logs(user_id, date);

-- TRAINING SPLITS
CREATE TABLE public.training_splits (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  type            TEXT NOT NULL CHECK (type IN ('PPL','UpperLower','FullBody','Bro')),
  days            JSONB NOT NULL DEFAULT '[]',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.training_splits ENABLE ROW LEVEL SECURITY;
CREATE POLICY "splits_own" ON public.training_splits
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE INDEX idx_splits_user_id ON public.training_splits(user_id);

-- SESSIONS
CREATE TABLE public.sessions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  date            DATE NOT NULL,
  split_day_label TEXT NOT NULL,
  exercise_logs   JSONB NOT NULL DEFAULT '[]',
  completed_at    TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "sessions_own" ON public.sessions
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE INDEX idx_sessions_user_date ON public.sessions(user_id, date);

-- SLEEP LOGS
CREATE TABLE public.sleep_logs (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  date              DATE NOT NULL,
  bedtime_iso       TIMESTAMPTZ NOT NULL,
  wake_iso          TIMESTAMPTZ NOT NULL,
  duration_minutes  SMALLINT NOT NULL,
  quality_score     SMALLINT CHECK (quality_score BETWEEN 1 AND 5),
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.sleep_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "sleep_logs_own" ON public.sleep_logs
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE INDEX idx_sleep_logs_user_date ON public.sleep_logs(user_id, date);

-- WEIGHT LOGS
CREATE TABLE public.weight_logs (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  date            DATE NOT NULL,
  weight_kg       NUMERIC(5,2) NOT NULL,
  body_fat_pct    NUMERIC(4,2),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.weight_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "weight_logs_own" ON public.weight_logs
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE INDEX idx_weight_logs_user_date ON public.weight_logs(user_id, date);

-- updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_splits_updated_at
  BEFORE UPDATE ON public.training_splits
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
