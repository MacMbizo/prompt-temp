import { useState, useCallback } from 'react';
import { supabase } from '../integrations/supabase/supabaseClient';

import type { Prompt } from '@/integrations/supabase/types';

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