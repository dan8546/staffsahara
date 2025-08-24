-- PROMPT 21: Ajouter colonne score dans applications pour le moteur de conformité
ALTER TABLE public.applications 
ADD COLUMN IF NOT EXISTS score INTEGER DEFAULT 0;