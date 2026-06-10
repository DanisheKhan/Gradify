-- ============================================================================
-- Gradify Supabase Database Schema
-- ============================================================================

-- ── CUSTOM TYPES ──
CREATE TYPE public.user_role AS ENUM ('admin', 'student');

-- ── TABLES ──

-- 1. Schools Table
CREATE TABLE public.schools (
    id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    name TEXT NOT NULL,
    logo_url TEXT,
    address TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 2. Users Profile Table (Extends Auth.Users)
CREATE TABLE public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    role public.user_role NOT NULL DEFAULT 'student'::public.user_role,
    school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 3. Students Profiles Table
CREATE TABLE public.students (
    id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    roll_number TEXT NOT NULL,
    class TEXT NOT NULL,
    section TEXT,
    photo_url TEXT,
    date_of_birth DATE,
    parent_name TEXT,
    contact_number TEXT,
    address TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    CONSTRAINT students_school_id_roll_number_key UNIQUE (school_id, roll_number)
);

-- 4. Exams Table
CREATE TABLE public.exams (
    id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    class TEXT NOT NULL,
    academic_year TEXT NOT NULL,
    exam_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 5. Subjects Table
CREATE TABLE public.subjects (
    id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    class TEXT NOT NULL,
    max_marks INTEGER NOT NULL DEFAULT 100,
    pass_marks INTEGER NOT NULL DEFAULT 35,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 6. Marks Table
CREATE TABLE public.marks (
    id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    student_id UUID REFERENCES public.students(id) ON DELETE CASCADE,
    exam_id UUID REFERENCES public.exams(id) ON DELETE CASCADE,
    subject_id UUID REFERENCES public.subjects(id) ON DELETE CASCADE,
    marks_obtained NUMERIC NOT NULL,
    grade TEXT,
    remarks TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    CONSTRAINT marks_student_id_exam_id_subject_id_key UNIQUE (student_id, exam_id, subject_id)
);

-- ============================================================================
-- ── ROW LEVEL SECURITY (RLS) & POLICIES ──
-- ============================================================================

ALTER TABLE public.schools ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marks ENABLE ROW LEVEL SECURITY;

-- ── HELPER FUNCTIONS FOR POLICIES ──

-- Check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin(user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = user_id AND role = 'admin'
  );
$$;

-- Get user's school ID
CREATE OR REPLACE FUNCTION public.get_user_school(user_id UUID)
RETURNS UUID
LANGUAGE sql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT school_id FROM public.users 
  WHERE id = user_id;
$$;

-- ── POLICIES ──

-- A. Schools Policies
CREATE POLICY admins_schools ON public.schools 
    FOR ALL USING ((id = public.get_user_school(auth.uid())) AND public.is_admin(auth.uid()));

CREATE POLICY students_school ON public.schools 
    FOR SELECT USING (id IN (SELECT students.school_id FROM public.students WHERE students.user_id = auth.uid()));

-- B. Users Policies
CREATE POLICY admins_users ON public.users 
    FOR ALL USING ((school_id = public.get_user_school(auth.uid())) AND public.is_admin(auth.uid()));

CREATE POLICY users_own ON public.users 
    FOR SELECT USING (id = auth.uid());

-- C. Students Policies
CREATE POLICY admins_students ON public.students 
    FOR ALL USING ((school_id = public.get_user_school(auth.uid())) AND public.is_admin(auth.uid()));

CREATE POLICY students_own_profile ON public.students 
    FOR SELECT USING (user_id = auth.uid());

-- D. Exams Policies
CREATE POLICY admins_exams ON public.exams 
    FOR ALL USING ((school_id = public.get_user_school(auth.uid())) AND public.is_admin(auth.uid()));

CREATE POLICY students_exams ON public.exams 
    FOR SELECT USING (school_id IN (SELECT students.school_id FROM public.students WHERE students.user_id = auth.uid()));

-- E. Subjects Policies
CREATE POLICY admins_subjects ON public.subjects 
    FOR ALL USING ((school_id = public.get_user_school(auth.uid())) AND public.is_admin(auth.uid()));

CREATE POLICY students_subjects ON public.subjects 
    FOR SELECT USING (school_id IN (SELECT students.school_id FROM public.students WHERE students.user_id = auth.uid()));

-- F. Marks Policies
CREATE POLICY admins_marks ON public.marks 
    FOR ALL USING (
        (student_id IN (SELECT students.id FROM public.students WHERE students.school_id = public.get_user_school(auth.uid()))) 
        AND public.is_admin(auth.uid())
    );

CREATE POLICY students_own_marks ON public.marks 
    FOR SELECT USING (student_id IN (SELECT students.id FROM public.students WHERE students.user_id = auth.uid()));


-- ============================================================================
-- ── AUTH USER TRIGGER ──
-- ============================================================================

-- Function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  default_school_id UUID;
  assigned_role public.user_role;
  student_roll TEXT;
BEGIN
  -- Get the default school ID
  SELECT id INTO default_school_id FROM public.schools LIMIT 1;
  
  -- If email contains "student", assign student role, otherwise admin
  IF NEW.email LIKE '%student%' THEN
    assigned_role := 'student'::public.user_role;
  ELSE
    assigned_role := 'admin'::public.user_role;
  END IF;

  INSERT INTO public.users (id, role, school_id)
  VALUES (NEW.id, assigned_role, default_school_id)
  ON CONFLICT (id) DO NOTHING;
  
  -- If it is a student, we can also insert a default student record
  IF assigned_role = 'student' THEN
    -- Generate a unique roll number
    student_roll := 'ROLL-' || FLOOR(RANDOM() * 9000 + 1000)::TEXT;
    
    INSERT INTO public.students (user_id, school_id, name, roll_number, class, section, date_of_birth, parent_name, contact_number, address)
    VALUES (
      NEW.id, 
      default_school_id, 
      COALESCE(NEW.raw_user_meta_data->>'name', 'New Student'),
      student_roll,
      '10',  -- Default Class
      'A',   -- Default Section
      '2010-01-01',
      'Parent Name',
      '9876543210',
      'Student Address'
    )
    ON CONFLICT (school_id, roll_number) DO NOTHING;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Trigger execution
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
