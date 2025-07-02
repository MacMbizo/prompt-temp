import { useState, useCallback } from 'react';
import { supabase } from '../integrations/supabase/supabaseClient';

export interface Prompt {
  id: string;
  title: string;
  prompt_text: string;
  category: string;
  platform: string;
  created_at: string;
}

export const useSearch = () => {
  const [searchResults, setSearchResults] = useState<Prompt[]>([]);
  const [loading, setLoading] = useState(false);

  const search = useCallback(async (searchTerm: string) => {
    if (!searchTerm) {
      setSearchResults([]);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase.rpc('search_prompts', { search_term: searchTerm });

      if (error) {
        console.error('Error searching prompts:', error);
        setSearchResults([]);
      } else {
        setSearchResults(data || []);
      }
    } catch (error) {
      console.error('An unexpected error occurred during search:', error);
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  return { searchResults, loading, search };
};