-- ====================================================================
-- TransitWake Zero-Trust Row Level Security (RLS) Migration
-- Enforces 100% RLS Coverage and Prevents Cross-Tenant Data Leakage
-- ====================================================================

-- 1. USER PROFILES
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  display_name TEXT,
  role TEXT NOT NULL DEFAULT 'commuter' CHECK (role IN ('commuter', 'admin')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profiles FORCE ROW LEVEL SECURITY;

CREATE POLICY "user_profiles_select_own" ON public.user_profiles
  FOR SELECT TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "user_profiles_update_own" ON public.user_profiles
  FOR UPDATE TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id AND
    role = (SELECT role FROM public.user_profiles WHERE id = auth.uid())
  );

-- 2. SUBSCRIPTIONS TABLE
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tier TEXT NOT NULL DEFAULT 'free' CHECK (tier IN ('free', 'prime')),
  status TEXT NOT NULL DEFAULT 'none' CHECK (status IN ('none', 'active', 'cancelled_grace_period', 'expired')),
  product_id TEXT NOT NULL,
  price_inr NUMERIC(10, 2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'INR',
  subscribed_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  auto_renew BOOLEAN NOT NULL DEFAULT false,
  transaction_id TEXT,
  receipt_signature TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT uq_user_subscription UNIQUE (user_id)
);

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions FORCE ROW LEVEL SECURITY;

CREATE POLICY "subscriptions_select_own" ON public.subscriptions
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "subscriptions_service_role_all" ON public.subscriptions
  FOR ALL TO service_role
  USING (true)
  WITH CHECK (true);

-- 3. STUDENT REFERRALS TABLE
CREATE TABLE IF NOT EXISTS public.student_referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  referral_code TEXT NOT NULL UNIQUE,
  redeemed_count INTEGER NOT NULL DEFAULT 0,
  semester_pass_unlocked BOOLEAN NOT NULL DEFAULT false,
  semester_pass_expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.student_referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_referrals FORCE ROW LEVEL SECURITY;

CREATE POLICY "student_referrals_select_own" ON public.student_referrals
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "student_referrals_service_role_all" ON public.student_referrals
  FOR ALL TO service_role
  USING (true)
  WITH CHECK (true);

-- 4. COMMUTE PRESETS TABLE
CREATE TABLE IF NOT EXISTS public.commute_presets (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  origin_name TEXT NOT NULL,
  origin_lat DOUBLE PRECISION NOT NULL,
  origin_lon DOUBLE PRECISION NOT NULL,
  destination_name TEXT NOT NULL,
  destination_lat DOUBLE PRECISION NOT NULL,
  destination_lon DOUBLE PRECISION NOT NULL,
  radius_km DOUBLE PRECISION NOT NULL DEFAULT 4.0,
  direction TEXT NOT NULL CHECK (direction IN ('OUTBOUND', 'RETURN')),
  transfer_interchange JSONB,
  last_used_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.commute_presets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.commute_presets FORCE ROW LEVEL SECURITY;

CREATE POLICY "commute_presets_select_own" ON public.commute_presets
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "commute_presets_insert_own" ON public.commute_presets
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "commute_presets_update_own" ON public.commute_presets
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "commute_presets_delete_own" ON public.commute_presets
  FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- 5. AUDIT LOGS TABLE
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  event_type TEXT NOT NULL,
  details JSONB NOT NULL DEFAULT '{}'::jsonb,
  ip_address TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs FORCE ROW LEVEL SECURITY;

CREATE POLICY "audit_logs_insert_own" ON public.audit_logs
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "audit_logs_service_role_all" ON public.audit_logs
  FOR ALL TO service_role
  USING (true)
  WITH CHECK (true);

-- SECURE RPC: Student Referral Redemption Function
CREATE OR REPLACE FUNCTION public.redeem_student_referral(invite_code TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_referrer_id UUID;
  v_caller_id UUID;
  v_new_count INT;
BEGIN
  v_caller_id := auth.uid();
  IF v_caller_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required.';
  END IF;

  SELECT user_id INTO v_referrer_id
  FROM public.student_referrals
  WHERE referral_code = UPPER(TRIM(invite_code));

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'message', 'Invalid referral code.');
  END IF;

  IF v_referrer_id = v_caller_id THEN
    RETURN jsonb_build_object('success', false, 'message', 'Cannot redeem your own code.');
  END IF;

  UPDATE public.student_referrals
  SET redeemed_count = redeemed_count + 1
  WHERE user_id = v_referrer_id
  RETURNING redeemed_count INTO v_new_count;

  RETURN jsonb_build_object('success', true, 'redeemed_count', v_new_count);
END;
$$;
