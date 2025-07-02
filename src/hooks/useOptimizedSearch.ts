
import { useState, useEffect, useMemo, useCallback } from 'react';
import { usePromptCache } from './usePromptCache';
import type { Prompt } from '@/integrations/supabase/types';

interface UseOptimizedSearchProps {
  prompts: Prompt[];
  searchFields: (keyof Prompt)[];
  debounceMs?: number;
}

export const useOptimizedSearch = ({
  prompts,
  searchFields,
  debounceMs = 300
}: UseOptimizedSearchProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const { getFromCache, setCache } = usePromptCache();

  // Debounce search query
  useEffect(() => {
    setIsSearching(true);
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
      setIsSearching(false);
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [searchQuery, debounceMs]);

  // Optimized search with caching
  const filteredPrompts = useMemo(() => {
    if (!debouncedQuery.trim()) {
      return prompts;
    }

    const cacheKey = { query: debouncedQuery, promptCount: prompts.length };
    const cached = getFromCache(cacheKey);
    if (cached) {
      return cached;
    }

    const query = debouncedQuery.toLowerCase();
    const results = prompts.filter((prompt) => {
      return searchFields.some((field) => {
        const value = prompt[field];
        if (typeof value === 'string') {
          return value.toLowerCase().includes(query);
        }
        if (Array.isArray(value)) {
          return value.some((item) => 
            typeof item === 'string' && item.toLowerCase().includes(query)
          );
        }
        return false;
      });
    });

    setCache(cacheKey, results);
    return results;
  }, [prompts, debouncedQuery, searchFields, getFromCache, setCache]);

  // Highlighted search results
  const highlightMatches = useCallback((text: string, query: string) => {
    if (!query.trim()) return text;
    
    const regex = new RegExp(`(${query})`, 'gi');
    return text.replace(regex, '<mark class="bg-yellow-200 rounded px-1">$1</mark>');
  }, []);

  // Search suggestions based on existing prompts
  const searchSuggestions = useMemo(() => {
    if (!searchQuery.trim() || searchQuery.length < 2) return [];

    const suggestions = new Set<string>();
    const query = searchQuery.toLowerCase();

    prompts.forEach((prompt) => {
      // Add matching tags
      prompt.tags?.forEach((tag) => {
        if (tag.toLowerCase().includes(query) && tag.toLowerCase() !== query) {
          suggestions.add(tag);
        }
      });

      // Add matching categories
      if (prompt.category.toLowerCase().includes(query) && 
          prompt.category.toLowerCase() !== query) {
        suggestions.add(prompt.category);
      }

      // Add matching platforms
      prompt.platforms?.forEach((platform) => {
        if (platform.toLowerCase().includes(query) && 
            platform.toLowerCase() !== query) {
          suggestions.add(platform);
        }
      });
    });

    return Array.from(suggestions).slice(0, 5);
  }, [searchQuery, prompts]);

  return {
    searchQuery,
    setSearchQuery,
    filteredPrompts,
    isSearching,
    highlightMatches,
    searchSuggestions,
    resultCount: filteredPrompts.length
  };
};
