-- PROMPT 17: RMTC Schema - Tables et policies pour formations

-- Table des cours de formation
CREATE TABLE IF NOT EXISTS public.training_courses(
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  duration_hours INTEGER,
  reqs JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Table des sessions de formation
CREATE TABLE IF NOT EXISTS public.training_sessions(
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID REFERENCES public.training_courses(id) ON DELETE CASCADE,
  starts_at TIMESTAMPTZ,
  ends_at TIMESTAMPTZ,
  location TEXT,
  capacity INTEGER,
  status TEXT DEFAULT 'scheduled' CHECK(status IN('scheduled','completed','cancelled')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Table des inscriptions
CREATE TABLE IF NOT EXISTS public.enrollments(
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES public.training_sessions(id) ON DELETE CASCADE,
  talent_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  source TEXT DEFAULT 'self' CHECK(source IN('self','mission')),
  status TEXT DEFAULT 'pending' CHECK(status IN('pending','confirmed','attended','no_show','cancelled')),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(session_id, talent_id)
);

-- Table des certificats
CREATE TABLE IF NOT EXISTS public.certificates(
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  talent_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  course_code TEXT,
  issued_at DATE,
  expires_at DATE,
  file_url TEXT,
  issuer TEXT DEFAULT 'RMTC',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.training_courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.training_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;

-- Policies pour training_courses (lecture publique)
CREATE POLICY "Public can view training courses" ON public.training_courses
FOR SELECT USING (true);

CREATE POLICY "Staff can manage training courses" ON public.training_courses
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.profiles p 
    WHERE p.user_id = auth.uid() 
    AND p.role IN ('ops', 'recruiter', 'finance')
  )
);

-- Policies pour training_sessions (lecture publique)
CREATE POLICY "Public can view training sessions" ON public.training_sessions
FOR SELECT USING (true);

CREATE POLICY "Staff can manage training sessions" ON public.training_sessions
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.profiles p 
    WHERE p.user_id = auth.uid() 
    AND p.role IN ('ops', 'recruiter', 'finance')
  )
);

-- Policies pour enrollments
CREATE POLICY "Users can view their own enrollments" ON public.enrollments
FOR SELECT USING (talent_id = auth.uid());

CREATE POLICY "Users can create their own enrollments" ON public.enrollments
FOR INSERT WITH CHECK (talent_id = auth.uid());

CREATE POLICY "Users can update their own enrollments" ON public.enrollments
FOR UPDATE USING (talent_id = auth.uid());

CREATE POLICY "Staff can view all enrollments" ON public.enrollments
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.profiles p 
    WHERE p.user_id = auth.uid() 
    AND p.role IN ('ops', 'recruiter', 'finance')
  )
);

CREATE POLICY "Staff can manage all enrollments" ON public.enrollments
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.profiles p 
    WHERE p.user_id = auth.uid() 
    AND p.role IN ('ops', 'recruiter', 'finance')
  )
);

-- Policies pour certificates
CREATE POLICY "Users can view their own certificates" ON public.certificates
FOR SELECT USING (talent_id = auth.uid());

CREATE POLICY "Users can create their own certificates" ON public.certificates
FOR INSERT WITH CHECK (talent_id = auth.uid());

CREATE POLICY "Staff can view all certificates" ON public.certificates
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.profiles p 
    WHERE p.user_id = auth.uid() 
    AND p.role IN ('ops', 'recruiter', 'finance')
  )
);

CREATE POLICY "Staff can manage all certificates" ON public.certificates
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.profiles p 
    WHERE p.user_id = auth.uid() 
    AND p.role IN ('ops', 'recruiter', 'finance')
  )
);

-- Insert sample courses
INSERT INTO public.training_courses (code, title, description, duration_hours, reqs) VALUES
('H2S', 'H2S Safety Training', 'Formation obligatoire à la sécurité H2S pour les sites pétroliers', 8, '[]'),
('BOSIET', 'Basic Offshore Safety Induction', 'Formation de base à la sécurité offshore', 16, '["Medical certificate"]'),
('FIRST_AID', 'Premier Secours', 'Formation premiers secours et gestes de survie', 12, '[]'),
('HELICOPTER', 'Helicopter Safety', 'Formation sécurité hélicoptère et évacuation', 8, '["BOSIET"]'),
('FIRE_SAFETY', 'Fire Prevention & Safety', 'Prévention incendie et sécurité', 6, '[]')
ON CONFLICT (code) DO NOTHING;