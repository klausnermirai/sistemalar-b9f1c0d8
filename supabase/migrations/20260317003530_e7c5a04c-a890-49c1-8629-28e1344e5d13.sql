ALTER TABLE public.candidates ADD COLUMN IF NOT EXISTS referral_source text;
ALTER TABLE public.candidates ADD COLUMN IF NOT EXISTS case_description text;