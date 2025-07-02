-- Create prompt_versions table for version control
CREATE TABLE public.prompt_versions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  prompt_id UUID REFERENCES public.prompts(id) ON DELETE CASCADE NOT NULL,
  version_number INTEGER NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  prompt_text TEXT NOT NULL,
  category TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  platforms TEXT[] DEFAULT '{}',
  variables JSONB DEFAULT '[]',
  change_summary TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  created_by UUID REFERENCES auth.users(id) NOT NULL,
  
  -- Ensure unique version numbers per prompt
  UNIQUE(prompt_id, version_number)
);

-- Create index for efficient querying
CREATE INDEX idx_prompt_versions_prompt_id ON public.prompt_versions(prompt_id);
CREATE INDEX idx_prompt_versions_created_at ON public.prompt_versions(created_at DESC);

-- Add version tracking to prompts table
ALTER TABLE public.prompts 
ADD COLUMN current_version INTEGER DEFAULT 1,
ADD COLUMN version_count INTEGER DEFAULT 1;

-- Create function to automatically create version when prompt is updated
CREATE OR REPLACE FUNCTION create_prompt_version()
RETURNS TRIGGER AS $$
BEGIN
  -- Only create version if content has actually changed
  IF OLD.title != NEW.title OR 
     OLD.description != NEW.description OR 
     OLD.prompt_text != NEW.prompt_text OR 
     OLD.category != NEW.category OR 
     OLD.tags != NEW.tags OR 
     OLD.platforms != NEW.platforms OR 
     OLD.variables != NEW.variables THEN
    
    -- Increment version number
    NEW.current_version := OLD.current_version + 1;
    NEW.version_count := OLD.version_count + 1;
    
    -- Create version record of the OLD data
    INSERT INTO public.prompt_versions (
      prompt_id,
      version_number,
      title,
      description,
      prompt_text,
      category,
      tags,
      platforms,
      variables,
      change_summary,
      created_by
    ) VALUES (
      OLD.id,
      OLD.current_version,
      OLD.title,
      OLD.description,
      OLD.prompt_text,
      OLD.category,
      OLD.tags,
      OLD.platforms,
      OLD.variables,
      'Auto-saved version before update',
      OLD.user_id
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically version prompts
CREATE TRIGGER prompt_version_trigger
  BEFORE UPDATE ON public.prompts
  FOR EACH ROW
  EXECUTE FUNCTION create_prompt_version();

-- Function to restore a specific version
CREATE OR REPLACE FUNCTION restore_prompt_version(
  p_prompt_id UUID,
  p_version_number INTEGER,
  p_user_id UUID
)
RETURNS BOOLEAN AS $$
DECLARE
  version_record RECORD;
BEGIN
  -- Get the version data
  SELECT * INTO version_record
  FROM public.prompt_versions
  WHERE prompt_id = p_prompt_id AND version_number = p_version_number;
  
  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;
  
  -- Update the prompt with version data
  UPDATE public.prompts SET
    title = version_record.title,
    description = version_record.description,
    prompt_text = version_record.prompt_text,
    category = version_record.category,
    tags = version_record.tags,
    platforms = version_record.platforms,
    variables = version_record.variables,
    updated_at = NOW()
  WHERE id = p_prompt_id AND user_id = p_user_id;
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

-- Enable RLS on prompt_versions
ALTER TABLE public.prompt_versions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for prompt_versions
CREATE POLICY "Users can view versions of their own prompts" ON public.prompt_versions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.prompts 
      WHERE prompts.id = prompt_versions.prompt_id 
      AND prompts.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create versions of their own prompts" ON public.prompt_versions
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.prompts 
      WHERE prompts.id = prompt_versions.prompt_id 
      AND prompts.user_id = auth.uid()
    )
  );

-- Grant necessary permissions
GRANT ALL ON public.prompt_versions TO authenticated;