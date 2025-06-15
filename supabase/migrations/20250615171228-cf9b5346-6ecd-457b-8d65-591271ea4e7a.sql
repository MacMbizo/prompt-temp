
-- Add reputation and trust system to profiles
ALTER TABLE public.profiles 
ADD COLUMN reputation_score INTEGER DEFAULT 0,
ADD COLUMN is_trusted BOOLEAN DEFAULT false;

-- Add missing fields to prompts table
ALTER TABLE public.prompts 
ADD COLUMN is_featured BOOLEAN DEFAULT false,
ADD COLUMN status TEXT DEFAULT 'active' CHECK (status IN ('active', 'draft', 'archived', 'flagged')),
ADD COLUMN usage_count INTEGER DEFAULT 0;

-- Create proper categories table
CREATE TABLE public.categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  icon TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add is_helpful field to prompt_ratings
ALTER TABLE public.prompt_ratings 
ADD COLUMN is_helpful BOOLEAN DEFAULT null;

-- Add private collections flag to folders
ALTER TABLE public.folders 
ADD COLUMN is_private BOOLEAN DEFAULT false;

-- Create trigger for categories updated_at
CREATE TRIGGER update_categories_updated_at 
    BEFORE UPDATE ON public.categories 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS for categories
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- Create policies for categories (public read, authenticated users can suggest)
CREATE POLICY "Anyone can view categories" 
  ON public.categories 
  FOR SELECT 
  USING (true);

CREATE POLICY "Authenticated users can suggest categories" 
  ON public.categories 
  FOR INSERT 
  TO authenticated
  WITH CHECK (true);

-- Seed some initial categories
INSERT INTO public.categories (name, slug, description, icon) VALUES 
('Writing & Content', 'writing-content', 'Prompts for content creation, copywriting, and creative writing', '✍️'),
('Business & Marketing', 'business-marketing', 'Professional prompts for business strategy and marketing', '💼'),
('Coding & Development', 'coding-development', 'Programming and software development prompts', '💻'),
('Education & Learning', 'education-learning', 'Educational prompts and learning assistance', '📚'),
('Creative & Design', 'creative-design', 'Creative prompts for design and artistic projects', '🎨'),
('Data & Analysis', 'data-analysis', 'Data analysis and research prompts', '📊'),
('Customer Service', 'customer-service', 'Customer support and service prompts', '🤝'),
('General Productivity', 'general-productivity', 'General productivity and task management prompts', '⚡');

-- Create function to increment usage count
CREATE OR REPLACE FUNCTION public.increment_usage_count()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE public.prompts 
  SET usage_count = usage_count + 1 
  WHERE id = NEW.prompt_id;
  RETURN NEW;
END;
$$;

-- Create trigger to auto-increment usage count when prompt is copied
CREATE TRIGGER increment_prompt_usage_count 
    AFTER INSERT ON public.copy_history 
    FOR EACH ROW 
    EXECUTE FUNCTION increment_usage_count();
