-- Add a tsvector column to the prompts table for full-text search
ALTER TABLE prompts ADD COLUMN fts tsvector;

-- Create a function to update the fts column
CREATE OR REPLACE FUNCTION update_prompts_fts() RETURNS trigger AS $$
BEGIN
  NEW.fts := 
    setweight(to_tsvector('english', coalesce(NEW.title, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(NEW.prompt_text, '')), 'B');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to automatically update the fts column on insert or update
CREATE TRIGGER prompts_fts_update
BEFORE INSERT OR UPDATE ON prompts
FOR EACH ROW EXECUTE FUNCTION update_prompts_fts();

-- Create a GIN index on the fts column for faster searches
CREATE INDEX prompts_fts_idx ON prompts USING gin(fts);

-- Create a function to search prompts
CREATE OR REPLACE FUNCTION search_prompts(search_term TEXT)
RETURNS TABLE(id UUID, title TEXT, prompt_text TEXT, category TEXT, platform TEXT, created_at TIMESTAMPTZ) AS $$
BEGIN
  RETURN QUERY
  SELECT p.id, p.title, p.prompt_text, p.category, p.platform, p.created_at
  FROM prompts p
  WHERE p.fts @@ to_tsquery('english', search_term)
  ORDER BY ts_rank(p.fts, to_tsquery('english', search_term)) DESC;
END;
$$ LANGUAGE plpgsql;