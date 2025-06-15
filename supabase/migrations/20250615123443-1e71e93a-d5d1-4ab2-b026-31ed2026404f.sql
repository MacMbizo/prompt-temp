
-- Create user profiles table
CREATE TABLE public.profiles (
  id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create copy history table to track when users copy prompts
CREATE TABLE public.copy_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  prompt_id UUID NOT NULL REFERENCES public.prompts(id) ON DELETE CASCADE,
  copied_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  platform_used TEXT, -- Which AI platform they said they'd use it with
  UNIQUE(user_id, prompt_id, copied_at) -- Prevent duplicate entries for same copy action
);

-- Create community submissions table for Phase 1C
CREATE TABLE public.community_submissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  prompt_id UUID NOT NULL REFERENCES public.prompts(id) ON DELETE CASCADE,
  submitted_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  submission_reason TEXT,
  moderator_notes TEXT,
  submitted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  moderated_at TIMESTAMP WITH TIME ZONE,
  moderated_by UUID REFERENCES auth.users(id)
);

-- Create ratings table for Phase 1D
CREATE TABLE public.prompt_ratings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  prompt_id UUID NOT NULL REFERENCES public.prompts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(prompt_id, user_id) -- One rating per user per prompt
);

-- Add columns to prompts table for community features
ALTER TABLE public.prompts ADD COLUMN is_community BOOLEAN DEFAULT false;
ALTER TABLE public.prompts ADD COLUMN copy_count INTEGER DEFAULT 0;
ALTER TABLE public.prompts ADD COLUMN average_rating DECIMAL(3,2) DEFAULT 0;
ALTER TABLE public.prompts ADD COLUMN rating_count INTEGER DEFAULT 0;

-- Enable RLS on all new tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.copy_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prompt_ratings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Public profiles are viewable by everyone" 
  ON public.profiles FOR SELECT 
  USING (true);

CREATE POLICY "Users can update own profile" 
  ON public.profiles FOR UPDATE 
  USING (auth.uid() = id);

-- RLS Policies for copy_history
CREATE POLICY "Users can view their own copy history" 
  ON public.copy_history FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own copy history" 
  ON public.copy_history FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for community_submissions
CREATE POLICY "Users can view all submissions" 
  ON public.community_submissions FOR SELECT 
  USING (true);

CREATE POLICY "Users can create submissions" 
  ON public.community_submissions FOR INSERT 
  WITH CHECK (auth.uid() = submitted_by);

-- RLS Policies for ratings
CREATE POLICY "Everyone can view ratings" 
  ON public.prompt_ratings FOR SELECT 
  USING (true);

CREATE POLICY "Users can manage their own ratings" 
  ON public.prompt_ratings FOR ALL 
  USING (auth.uid() = user_id);

-- Function to handle new user profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (
    new.id,
    new.raw_user_meta_data ->> 'full_name',
    new.raw_user_meta_data ->> 'avatar_url'
  );
  RETURN new;
END;
$$;

-- Trigger to create profile on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Function to update copy count
CREATE OR REPLACE FUNCTION public.increment_copy_count()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE public.prompts 
  SET copy_count = copy_count + 1 
  WHERE id = NEW.prompt_id;
  RETURN NEW;
END;
$$;

-- Trigger to update copy count when someone copies a prompt
CREATE TRIGGER on_copy_history_insert
  AFTER INSERT ON public.copy_history
  FOR EACH ROW EXECUTE PROCEDURE public.increment_copy_count();

-- Function to update rating averages
CREATE OR REPLACE FUNCTION public.update_prompt_rating()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE public.prompts 
  SET 
    average_rating = (
      SELECT ROUND(AVG(rating), 2) 
      FROM public.prompt_ratings 
      WHERE prompt_id = COALESCE(NEW.prompt_id, OLD.prompt_id)
    ),
    rating_count = (
      SELECT COUNT(*) 
      FROM public.prompt_ratings 
      WHERE prompt_id = COALESCE(NEW.prompt_id, OLD.prompt_id)
    )
  WHERE id = COALESCE(NEW.prompt_id, OLD.prompt_id);
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Trigger to update rating averages
CREATE TRIGGER on_rating_change
  AFTER INSERT OR UPDATE OR DELETE ON public.prompt_ratings
  FOR EACH ROW EXECUTE PROCEDURE public.update_prompt_rating();
