-- Add search history table
CREATE TABLE search_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  search_query TEXT NOT NULL,
  search_filters JSONB DEFAULT '{}',
  result_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add saved searches table
CREATE TABLE saved_searches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  search_query TEXT NOT NULL,
  search_filters JSONB DEFAULT '{}',
  description TEXT,
  is_public BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX search_history_user_id_idx ON search_history(user_id);
CREATE INDEX search_history_created_at_idx ON search_history(created_at DESC);
CREATE INDEX saved_searches_user_id_idx ON saved_searches(user_id);
CREATE INDEX saved_searches_name_idx ON saved_searches(name);

-- Enable RLS (Row Level Security)
ALTER TABLE search_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_searches ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for search_history
CREATE POLICY "Users can view their own search history" ON search_history
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own search history" ON search_history
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own search history" ON search_history
  FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for saved_searches
CREATE POLICY "Users can view their own saved searches" ON saved_searches
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view public saved searches" ON saved_searches
  FOR SELECT USING (is_public = TRUE);

CREATE POLICY "Users can insert their own saved searches" ON saved_searches
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own saved searches" ON saved_searches
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own saved searches" ON saved_searches
  FOR DELETE USING (auth.uid() = user_id);

-- Create function to clean old search history (keep last 100 entries per user)
CREATE OR REPLACE FUNCTION cleanup_search_history()
RETURNS void AS $$
BEGIN
  DELETE FROM search_history
  WHERE id NOT IN (
    SELECT id FROM (
      SELECT id, ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY created_at DESC) as rn
      FROM search_history
    ) ranked
    WHERE rn <= 100
  );
END;
$$ LANGUAGE plpgsql;

-- Create function to add search to history
CREATE OR REPLACE FUNCTION add_search_to_history(
  p_search_query TEXT,
  p_search_filters JSONB DEFAULT '{}',
  p_result_count INTEGER DEFAULT 0
)
RETURNS UUID AS $$
DECLARE
  search_id UUID;
BEGIN
  -- Insert new search history entry
  INSERT INTO search_history (user_id, search_query, search_filters, result_count)
  VALUES (auth.uid(), p_search_query, p_search_filters, p_result_count)
  RETURNING id INTO search_id;
  
  -- Clean up old entries for this user
  DELETE FROM search_history
  WHERE user_id = auth.uid()
    AND id NOT IN (
      SELECT id FROM search_history
      WHERE user_id = auth.uid()
      ORDER BY created_at DESC
      LIMIT 50
    );
  
  RETURN search_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get recent searches
CREATE OR REPLACE FUNCTION get_recent_searches(limit_count INTEGER DEFAULT 10)
RETURNS TABLE(
  id UUID,
  search_query TEXT,
  search_filters JSONB,
  result_count INTEGER,
  created_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT sh.id, sh.search_query, sh.search_filters, sh.result_count, sh.created_at
  FROM search_history sh
  WHERE sh.user_id = auth.uid()
  ORDER BY sh.created_at DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get popular searches (for suggestions)
CREATE OR REPLACE FUNCTION get_popular_searches(limit_count INTEGER DEFAULT 5)
RETURNS TABLE(
  search_query TEXT,
  search_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT sh.search_query, COUNT(*) as search_count
  FROM search_history sh
  WHERE sh.user_id = auth.uid()
    AND sh.created_at > NOW() - INTERVAL '30 days'
    AND LENGTH(sh.search_query) > 2
  GROUP BY sh.search_query
  ORDER BY search_count DESC, MAX(sh.created_at) DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;