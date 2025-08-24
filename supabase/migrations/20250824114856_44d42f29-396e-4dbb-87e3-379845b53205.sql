-- PROMPT 15 & 16: Documents & Aviation - Create bucket, policies, and update tables

-- Create docs bucket
INSERT INTO storage.buckets (id, name, public) 
VALUES ('docs', 'docs', false) 
ON CONFLICT (id) DO NOTHING;

-- Create storage policies for docs bucket (staff only)
CREATE POLICY IF NOT EXISTS docs_read_staff ON storage.objects 
FOR SELECT USING (
  bucket_id = 'docs' AND 
  EXISTS (
    SELECT 1 FROM public.profiles p 
    WHERE p.user_id = auth.uid() 
    AND p.role IN ('ops', 'recruiter', 'finance')
  )
);

CREATE POLICY IF NOT EXISTS docs_write_staff ON storage.objects 
FOR INSERT WITH CHECK (
  bucket_id = 'docs' AND 
  EXISTS (
    SELECT 1 FROM public.profiles p 
    WHERE p.user_id = auth.uid() 
    AND p.role IN ('ops', 'recruiter', 'finance')
  )
);

CREATE POLICY IF NOT EXISTS docs_update_staff ON storage.objects 
FOR UPDATE USING (
  bucket_id = 'docs' AND 
  EXISTS (
    SELECT 1 FROM public.profiles p 
    WHERE p.user_id = auth.uid() 
    AND p.role IN ('ops', 'recruiter', 'finance')
  )
);

CREATE POLICY IF NOT EXISTS docs_delete_staff ON storage.objects 
FOR DELETE USING (
  bucket_id = 'docs' AND 
  EXISTS (
    SELECT 1 FROM public.profiles p 
    WHERE p.user_id = auth.uid() 
    AND p.role IN ('ops', 'recruiter', 'finance')
  )
);

-- Add missing columns to mission_docs
ALTER TABLE public.mission_docs 
ADD COLUMN IF NOT EXISTS kind TEXT DEFAULT 'other',
ADD COLUMN IF NOT EXISTS version INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS file_size BIGINT,
ADD COLUMN IF NOT EXISTS mime_type TEXT;

-- Add missing columns to air_requests for aviation functionality
ALTER TABLE public.air_requests 
ADD COLUMN IF NOT EXISTS kind TEXT DEFAULT 'air_personnel',
ADD COLUMN IF NOT EXISTS pax_count INTEGER,
ADD COLUMN IF NOT EXISTS route JSONB,
ADD COLUMN IF NOT EXISTS site TEXT,
ADD COLUMN IF NOT EXISTS extra JSONB;