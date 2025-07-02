
import { useState, useEffect, useMemo, useCallback } from 'react';
import { usePromptCache } from './usePromptCache';
import { useSearchHistory } from './useSearchHistory';
import { supabase } from '@/integrations/supabase/client';
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
  const { addToHistory } = useSearchHistory();

  // Debounce search query
  useEffect(() => {
    setIsSearching(true);
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
      setIsSearching(false);
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [searchQuery, debounceMs]);

  // Enhanced search with database full-text search and client-side fallback
  const [searchResults, setSearchResults] = useState<Prompt[]>([]);
  const [searchError, setSearchError] = useState<string | null>(null);

  // Perform database search for text queries, client-side for other filters
  useEffect(() => {
    const performSearch = async () => {
      if (!debouncedQuery.trim()) {
        setSearchResults(prompts);
        setSearchError(null);
        return;
      }

      const cacheKey = { query: debouncedQuery, promptCount: prompts.length };
      const cached = getFromCache(cacheKey);
      if (cached) {
        setSearchResults(cached);
        return;
      }

      try {
        // Use database full-text search for better performance
        const searchTerm = debouncedQuery.replace(/[^\w\s]/g, '').trim();
        if (searchTerm) {
          const { data: dbResults, error } = await supabase.rpc('search_prompts', { 
            search_term: searchTerm 
          });

          if (error) {
            console.warn('Database search failed, falling back to client-side:', error);
            // Fallback to client-side search
            const clientResults = performClientSideSearch(prompts, debouncedQuery, searchFields);
            setSearchResults(clientResults);
            setCache(cacheKey, clientResults);
          } else {
          // Filter database results to match current prompt set (for folder/category filters)
          const promptIds = new Set(prompts.map(p => p.id));
          const filteredDbResults = (dbResults || []).filter(result => promptIds.has(result.id));
          setSearchResults(filteredDbResults);
          setCache(cacheKey, filteredDbResults);
          
          // Add to search history if we have a meaningful query and results
          if (debouncedQuery.trim().length > 2 && filteredDbResults.length > 0) {
            addToHistory(debouncedQuery, {}, filteredDbResults.length);
          }
        }
        } else {
          // If search term is empty after cleaning, fall back to client-side
          const clientResults = performClientSideSearch(prompts, debouncedQuery, searchFields);
          setSearchResults(clientResults);
          setCache(cacheKey, clientResults);
        }
        setSearchError(null);
      } catch (error) {
        console.error('Search error:', error);
        setSearchError('Search temporarily unavailable');
        // Fallback to client-side search
        const clientResults = performClientSideSearch(prompts, debouncedQuery, searchFields);
        setSearchResults(clientResults);
      }
    };

    performSearch();
  }, [prompts, debouncedQuery, searchFields, getFromCache, setCache]);

  // Client-side search fallback function
  const performClientSideSearch = (prompts: Prompt[], query: string, fields: (keyof Prompt)[]) => {
    const searchQuery = query.toLowerCase();
    return prompts.filter((prompt) => {
      return fields.some((field) => {
        const value = prompt[field];
        if (typeof value === 'string') {
          return value.toLowerCase().includes(searchQuery);
        }
        if (Array.isArray(value)) {
          return value.some((item) => 
            typeof item === 'string' && item.toLowerCase().includes(searchQuery)
          );
        }
        return false;
      });
    });
  };

  const filteredPrompts = searchResults;

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
    searchError,
    resultCount: filteredPrompts.length
  };
};
