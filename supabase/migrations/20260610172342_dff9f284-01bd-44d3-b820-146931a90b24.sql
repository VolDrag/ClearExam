
ALTER TABLE public.questions ADD COLUMN IF NOT EXISTS language text NOT NULL DEFAULT 'en' CHECK (language IN ('en','bn'));
CREATE INDEX IF NOT EXISTS idx_questions_language ON public.questions(language);
ALTER TABLE public.question_options ADD COLUMN IF NOT EXISTS option_text_bn text;
