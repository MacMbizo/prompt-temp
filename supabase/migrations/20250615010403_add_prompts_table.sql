
-- Add a variables column to store template variables for prompts
ALTER TABLE public.prompts 
ADD COLUMN variables JSONB DEFAULT '[]'::jsonb;

-- Add a column to track if this is a template prompt
ALTER TABLE public.prompts 
ADD COLUMN is_template BOOLEAN DEFAULT false;

-- Update the updated_at trigger to handle the new columns
-- (The existing trigger will automatically handle this)
