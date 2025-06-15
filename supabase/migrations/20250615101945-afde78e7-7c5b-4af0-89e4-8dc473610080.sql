
-- Add platforms column to prompts table
ALTER TABLE prompts ADD COLUMN platforms text[] DEFAULT '{}';
