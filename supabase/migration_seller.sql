-- =================================================================
-- TSLA SELLER MARKETPLACE MIGRATION
-- Copy and run this once in your Supabase Dashboard -> SQL Editor
-- =================================================================

-- 1. CRITICAL: Allow 'seller' role in profiles table
-- (Previously restricted to 'user' and 'admin', which blocked promotions)
ALTER TABLE public.profiles
  DROP CONSTRAINT IF EXISTS profiles_role_check;

ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_role_check
  CHECK (role IN ('user', 'admin', 'seller'));

-- 2. Add updated_at to profiles if missing
ALTER TABLE public.profiles 
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

-- 3. Extend marketplace_logs with seller tracking & commissions
ALTER TABLE public.marketplace_logs 
  ADD COLUMN IF NOT EXISTS seller_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL;

ALTER TABLE public.marketplace_logs 
  ADD COLUMN IF NOT EXISTS commission_pct NUMERIC(5,2) DEFAULT 10.00;

ALTER TABLE public.marketplace_logs 
  ADD COLUMN IF NOT EXISTS seller_paid BOOLEAN DEFAULT FALSE;

-- 4. Create seller_applications table (for merchant requests)
CREATE TABLE IF NOT EXISTS public.seller_applications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  full_name TEXT,
  email TEXT,
  reason TEXT,
  social_handles TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  admin_note TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id)
);

-- 5. Enable Row Level Security (RLS)
ALTER TABLE public.seller_applications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own application" ON public.seller_applications;
CREATE POLICY "Users can view own application" ON public.seller_applications
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own application" ON public.seller_applications;
CREATE POLICY "Users can insert own application" ON public.seller_applications
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own application" ON public.seller_applications;
CREATE POLICY "Users can update own application" ON public.seller_applications
  FOR UPDATE USING (auth.uid() = user_id);

-- 6. Marketplace seller RLS permissions
DROP POLICY IF EXISTS "Sellers can insert own listings" ON public.marketplace_logs;
CREATE POLICY "Sellers can insert own listings" ON public.marketplace_logs
  FOR INSERT WITH CHECK (auth.uid() = seller_id);

DROP POLICY IF EXISTS "Sellers can update own listings" ON public.marketplace_logs;
CREATE POLICY "Sellers can update own listings" ON public.marketplace_logs
  FOR UPDATE USING (auth.uid() = seller_id AND status = 'available');
