
-- ============================================================
-- ClearExam: Core schema
-- ============================================================

-- Shared updated_at trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Roles infrastructure (security definer pattern)
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'student');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own roles"
  ON public.user_roles FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- ============================================================
-- Question bank
-- ============================================================

CREATE TABLE public.tracks (
  id text PRIMARY KEY,
  name_en text NOT NULL,
  name_bn text NOT NULL,
  description_en text NOT NULL,
  description_bn text NOT NULL,
  color_token text NOT NULL DEFAULT 'primary',
  ordinal int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.tracks TO anon, authenticated;
GRANT ALL ON public.tracks TO service_role;
ALTER TABLE public.tracks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Tracks are publicly readable"
  ON public.tracks FOR SELECT TO anon, authenticated USING (true);
CREATE TRIGGER trg_tracks_updated_at BEFORE UPDATE ON public.tracks
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.subjects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  track_id text NOT NULL REFERENCES public.tracks(id) ON DELETE CASCADE,
  name_en text NOT NULL,
  name_bn text NOT NULL,
  ordinal int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_subjects_track ON public.subjects(track_id);
GRANT SELECT ON public.subjects TO anon, authenticated;
GRANT ALL ON public.subjects TO service_role;
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Subjects are publicly readable"
  ON public.subjects FOR SELECT TO anon, authenticated USING (true);
CREATE TRIGGER trg_subjects_updated_at BEFORE UPDATE ON public.subjects
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_id uuid NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
  year int NOT NULL,
  institution text NOT NULL,
  question_text text NOT NULL,
  question_text_bn text,
  difficulty text NOT NULL DEFAULT 'medium' CHECK (difficulty IN ('easy','medium','hard')),
  topic_tags text[] NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_questions_subject ON public.questions(subject_id);
CREATE INDEX idx_questions_year ON public.questions(year);
CREATE INDEX idx_questions_tags ON public.questions USING gin(topic_tags);
GRANT SELECT ON public.questions TO anon, authenticated;
GRANT ALL ON public.questions TO service_role;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Questions are publicly readable"
  ON public.questions FOR SELECT TO anon, authenticated USING (true);
CREATE TRIGGER trg_questions_updated_at BEFORE UPDATE ON public.questions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.question_options (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id uuid NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
  label text NOT NULL CHECK (label IN ('A','B','C','D','E')),
  option_text text NOT NULL,
  ordinal int NOT NULL DEFAULT 0,
  UNIQUE (question_id, label)
);
CREATE INDEX idx_options_question ON public.question_options(question_id);
GRANT SELECT ON public.question_options TO anon, authenticated;
GRANT ALL ON public.question_options TO service_role;
ALTER TABLE public.question_options ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Options are publicly readable"
  ON public.question_options FOR SELECT TO anon, authenticated USING (true);

CREATE TABLE public.correct_answers (
  question_id uuid PRIMARY KEY REFERENCES public.questions(id) ON DELETE CASCADE,
  option_id uuid NOT NULL REFERENCES public.question_options(id) ON DELETE CASCADE,
  explanation text,
  explanation_bn text
);
GRANT SELECT ON public.correct_answers TO anon, authenticated;
GRANT ALL ON public.correct_answers TO service_role;
ALTER TABLE public.correct_answers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Correct answers are publicly readable"
  ON public.correct_answers FOR SELECT TO anon, authenticated USING (true);

CREATE TABLE public.citations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id uuid NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
  source_label text NOT NULL,
  page_ref text,
  confidence numeric(4,3) NOT NULL DEFAULT 0.9 CHECK (confidence >= 0 AND confidence <= 1),
  excerpt text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_citations_question ON public.citations(question_id);
GRANT SELECT ON public.citations TO anon, authenticated;
GRANT ALL ON public.citations TO service_role;
ALTER TABLE public.citations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Citations are publicly readable"
  ON public.citations FOR SELECT TO anon, authenticated USING (true);

-- ============================================================
-- User-scoped tables
-- ============================================================

CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name text,
  preferred_language text NOT NULL DEFAULT 'en' CHECK (preferred_language IN ('en','bn')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own profile"
  ON public.profiles FOR ALL TO authenticated
  USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE TRIGGER trg_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.user_sessions (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  active_track text REFERENCES public.tracks(id) ON DELETE SET NULL,
  notes jsonb NOT NULL DEFAULT '[]'::jsonb,
  exam_state jsonb,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_sessions TO authenticated;
GRANT ALL ON public.user_sessions TO service_role;
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own session"
  ON public.user_sessions FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Reset exam_state when active_track changes
CREATE OR REPLACE FUNCTION public.reset_session_on_track_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.active_track IS DISTINCT FROM OLD.active_track THEN
    NEW.exam_state := NULL;
    NEW.notes := '[]'::jsonb;
  END IF;
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;
CREATE TRIGGER trg_user_sessions_track_change
  BEFORE UPDATE ON public.user_sessions
  FOR EACH ROW EXECUTE FUNCTION public.reset_session_on_track_change();

CREATE TABLE public.exam_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  track_id text NOT NULL REFERENCES public.tracks(id) ON DELETE CASCADE,
  started_at timestamptz NOT NULL DEFAULT now(),
  finished_at timestamptz,
  score int NOT NULL DEFAULT 0,
  total int NOT NULL DEFAULT 0,
  duration_seconds int NOT NULL DEFAULT 0,
  breakdown jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_attempts_user ON public.exam_attempts(user_id);
CREATE INDEX idx_attempts_started ON public.exam_attempts(started_at);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.exam_attempts TO authenticated;
GRANT ALL ON public.exam_attempts TO service_role;
ALTER TABLE public.exam_attempts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own attempts"
  ON public.exam_attempts FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- Auto provisioning on signup
-- ============================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email));

  INSERT INTO public.user_sessions (user_id)
  VALUES (NEW.id);

  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'student');

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- Seed: core tracks
-- ============================================================

INSERT INTO public.tracks (id, name_en, name_bn, description_en, description_bn, color_token, ordinal) VALUES
  ('engineering', 'Engineering', 'ইঞ্জিনিয়ারিং', 'BUET, CUET, RUET, KUET admission preparation.', 'বুয়েট, চুয়েট, রুয়েট, কুয়েট ভর্তি প্রস্তুতি।', 'primary', 1),
  ('medical', 'Medical', 'মেডিকেল', 'MBBS and BDS admission preparation across Bangladesh.', 'বাংলাদেশের এমবিবিএস ও বিডিএস ভর্তি প্রস্তুতি।', 'destructive', 2),
  ('varsity', 'Varsity', 'বিশ্ববিদ্যালয়', 'DU, JU, CU, RU cluster admission preparation.', 'ঢাবি, জাবি, চবি, রাবি গুচ্ছ ভর্তি প্রস্তুতি।', 'accent', 3),
  ('iba', 'IBA', 'আইবিএ', 'IBA DU and IBA JU business admission preparation.', 'আইবিএ ঢাবি ও আইবিএ জাবি ব্যবসায় ভর্তি প্রস্তুতি।', 'secondary', 4);
