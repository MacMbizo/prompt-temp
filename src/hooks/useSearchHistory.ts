import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface SearchHistoryEntry {
  id: string;
  search_query: string;
  search_filters: Record<string, any>;
  result_count: number;
  created_at: string;
}

export interface SavedSearch {
  id: string;
  name: string;
  search_query: string;
  search_filters: Record<string, any>;
  description?: string;
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

export const useSearchHistory = () => {
  const [searchHistory, setSearchHistory] = useState<SearchHistoryEntry[]>([]);
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([]);
  const [popularSearches, setPopularSearches] = useState<{ search_query: string; search_count: number }[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // Load search history
  const loadSearchHistory = useCallback(async () => {
    try {
      const { data, error } = await supabase.rpc('get_recent_searches', { limit_count: 20 });
      if (error) throw error;
      setSearchHistory(data || []);
    } catch (error) {
      console.error('Error loading search history:', error);
    }
  }, []);

  // Load saved searches
  const loadSavedSearches = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('saved_searches')
        .select('*')
        .order('updated_at', { ascending: false });
      if (error) throw error;
      setSavedSearches(data || []);
    } catch (error) {
      console.error('Error loading saved searches:', error);
    }
  }, []);

  // Load popular searches
  const loadPopularSearches = useCallback(async () => {
    try {
      const { data, error } = await supabase.rpc('get_popular_searches', { limit_count: 5 });
      if (error) throw error;
      setPopularSearches(data || []);
    } catch (error) {
      console.error('Error loading popular searches:', error);
    }
  }, []);

  // Add search to history
  const addToHistory = useCallback(async (
    searchQuery: string,
    searchFilters: Record<string, any> = {},
    resultCount: number = 0
  ) => {
    if (!searchQuery.trim()) return;

    try {
      const { error } = await supabase.rpc('add_search_to_history', {
        p_search_query: searchQuery,
        p_search_filters: searchFilters,
        p_result_count: resultCount
      });
      if (error) throw error;
      
      // Refresh history
      await loadSearchHistory();
      await loadPopularSearches();
    } catch (error) {
      console.error('Error adding to search history:', error);
    }
  }, [loadSearchHistory, loadPopularSearches]);

  // Save a search
  const saveSearch = useCallback(async (
    name: string,
    searchQuery: string,
    searchFilters: Record<string, any> = {},
    description?: string,
    isPublic: boolean = false
  ) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('saved_searches')
        .insert({
          name,
          search_query: searchQuery,
          search_filters: searchFilters,
          description,
          is_public: isPublic
        })
        .select()
        .single();

      if (error) throw error;

      setSavedSearches(prev => [data, ...prev]);
      toast({
        title: 'Search Saved',
        description: `"${name}" has been saved to your searches.`,
      });
      return data;
    } catch (error) {
      console.error('Error saving search:', error);
      toast({
        title: 'Error',
        description: 'Failed to save search. Please try again.',
        variant: 'destructive',
      });
      throw error;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Update saved search
  const updateSavedSearch = useCallback(async (
    id: string,
    updates: Partial<Omit<SavedSearch, 'id' | 'created_at' | 'updated_at'>>
  ) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('saved_searches')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setSavedSearches(prev => prev.map(search => 
        search.id === id ? data : search
      ));
      toast({
        title: 'Search Updated',
        description: 'Your saved search has been updated.',
      });
      return data;
    } catch (error) {
      console.error('Error updating saved search:', error);
      toast({
        title: 'Error',
        description: 'Failed to update search. Please try again.',
        variant: 'destructive',
      });
      throw error;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Delete saved search
  const deleteSavedSearch = useCallback(async (id: string) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('saved_searches')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setSavedSearches(prev => prev.filter(search => search.id !== id));
      toast({
        title: 'Search Deleted',
        description: 'The saved search has been removed.',
      });
    } catch (error) {
      console.error('Error deleting saved search:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete search. Please try again.',
        variant: 'destructive',
      });
      throw error;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Clear search history
  const clearHistory = useCallback(async () => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('search_history')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all user's history

      if (error) throw error;

      setSearchHistory([]);
      setPopularSearches([]);
      toast({
        title: 'History Cleared',
        description: 'Your search history has been cleared.',
      });
    } catch (error) {
      console.error('Error clearing search history:', error);
      toast({
        title: 'Error',
        description: 'Failed to clear history. Please try again.',
        variant: 'destructive',
      });
      throw error;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Load data on mount
  useEffect(() => {
    loadSearchHistory();
    loadSavedSearches();
    loadPopularSearches();
  }, [loadSearchHistory, loadSavedSearches, loadPopularSearches]);

  return {
    searchHistory,
    savedSearches,
    popularSearches,
    loading,
    addToHistory,
    saveSearch,
    updateSavedSearch,
    deleteSavedSearch,
    clearHistory,
    refreshHistory: loadSearchHistory,
    refreshSavedSearches: loadSavedSearches,
    refreshPopularSearches: loadPopularSearches
  };
};