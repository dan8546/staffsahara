-- Add missing columns to missions table
ALTER TABLE public.missions 
ADD COLUMN IF NOT EXISTS site text,
ADD COLUMN IF NOT EXISTS rfq_id uuid REFERENCES public.rfqs(id),
ADD COLUMN IF NOT EXISTS sla_json jsonb;

-- Add missing columns to rfqs table  
ALTER TABLE public.rfqs
ADD COLUMN IF NOT EXISTS addons_json jsonb;