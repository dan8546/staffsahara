-- Add missing columns to rfqs table for RFQ form data
ALTER TABLE public.rfqs
ADD COLUMN IF NOT EXISTS profiles_json jsonb,
ADD COLUMN IF NOT EXISTS sites_json jsonb,
ADD COLUMN IF NOT EXISTS sla_json jsonb;