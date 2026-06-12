
-- 1. Revision bookmarks
CREATE TABLE public.revision_bookmarks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  question_id uuid NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
  reason text NOT NULL DEFAULT 'incorrect',
  created_at timestamptz NOT NULL DEFAULT now(),
  last_reviewed_at timestamptz,
  review_count integer NOT NULL DEFAULT 0,
  UNIQUE (user_id, question_id)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.revision_bookmarks TO authenticated;
GRANT ALL ON public.revision_bookmarks TO service_role;

ALTER TABLE public.revision_bookmarks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage their own bookmarks"
  ON public.revision_bookmarks
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX revision_bookmarks_user_idx ON public.revision_bookmarks(user_id, created_at DESC);

-- 2. Update handle_new_user to capture initial track from signup metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_track text;
BEGIN
  v_track := NULLIF(NEW.raw_user_meta_data->>'active_track', '');

  INSERT INTO public.profiles (id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', NEW.email));

  INSERT INTO public.user_sessions (user_id, active_track)
  VALUES (NEW.id, v_track);

  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'student');

  RETURN NEW;
END;
$$;

-- Ensure trigger exists (idempotent)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
