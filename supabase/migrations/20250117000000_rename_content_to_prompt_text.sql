-- Rename content column to prompt_text for consistency
ALTER TABLE public.prompts RENAME COLUMN content TO prompt_text;

-- Update the full-text search function trigger to use the correct column name
-- (This is already correct in the existing migration, but ensuring consistency)
CREATE OR REPLACE FUNCTION update_prompts_fts() RETURNS trigger AS $$
BEGIN
  NEW.fts := 
    setweight(to_tsvector('english', coalesce(NEW.title, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(NEW.prompt_text, '')), 'B');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;