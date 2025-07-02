
import React, { useState } from 'react';
import { CategoryFilter } from '@/components/CategoryFilter';
import { CategoryInsights } from '@/components/CategoryInsights';
import { PlatformFilter } from '@/components/PlatformFilter';
import { SearchBar } from '@/components/SearchBar';
import { SearchHistoryPanel } from '@/components/SearchHistoryPanel';
import { AdvancedSearchFiltersComponent, useAdvancedSearchFilters, type AdvancedSearchFilters } from '@/components/AdvancedSearchFilters';
import type { Prompt } from '@/hooks/usePrompts';

interface FilterSectionProps {
  categories: string[];
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  platforms: string[];
  selectedPlatforms: string[];
  onPlatformToggle: (platform: string) => void;
  onClearAllPlatforms: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  searchPlaceholder: string;
  prompts: Prompt[];
  isLoading: boolean;
  searchSuggestions?: string[];
  isSearching?: boolean;
  searchError?: string | null;
  onSuggestionSelect?: (suggestion: string) => void;
  advancedFilters?: AdvancedSearchFilters;
  onAdvancedFiltersChange?: (filters: AdvancedSearchFilters) => void;
  onAdvancedFiltersApply?: (prompts: Prompt[]) => Prompt[];
}

export const FilterSection: React.FC<FilterSectionProps> = ({
  categories,
  selectedCategory,
  onCategoryChange,
  platforms,
  selectedPlatforms,
  onPlatformToggle,
  onClearAllPlatforms,
  searchQuery,
  onSearchChange,
  searchPlaceholder,
  prompts,
  isLoading,
  searchSuggestions,
  isSearching,
  searchError,
  onSuggestionSelect,
  advancedFilters,
  onAdvancedFiltersChange,
  onAdvancedFiltersApply
}) => {
  const [showSearchHistory, setShowSearchHistory] = useState(false);
  
  const {
    filters: localAdvancedFilters,
    setFilters: setLocalAdvancedFilters,
    isOpen,
    setIsOpen,
    availableCategories,
    availablePlatforms,
    availableTags,
    resetFilters
  } = useAdvancedSearchFilters(prompts);

  // Use external filters if provided, otherwise use local state
  const currentFilters = advancedFilters || localAdvancedFilters;
  const handleFiltersChange = onAdvancedFiltersChange || setLocalAdvancedFilters;
  
  const handleSearchFromHistory = (query: string, filters?: any) => {
    onSearchChange(query);
    if (filters && handleFiltersChange) {
      handleFiltersChange(filters);
    }
    setShowSearchHistory(false);
  };
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-8">
      <div className="lg:col-span-2">
        <div className="space-y-6">
          <CategoryFilter
            categories={categories}
            selectedCategory={selectedCategory}
            onCategoryChange={onCategoryChange}
          />
          <PlatformFilter
            platforms={platforms}
            selectedPlatforms={selectedPlatforms}
            onPlatformToggle={onPlatformToggle}
            onClearAll={onClearAllPlatforms}
          />
        </div>
      </div>
      
      <div className="lg:col-span-3">
        <div className="space-y-6">
          <div className="relative">
            <SearchBar
              searchQuery={searchQuery}
              onSearchChange={onSearchChange}
              placeholder={searchPlaceholder}
              suggestions={searchSuggestions}
              isSearching={isSearching}
              searchError={searchError}
              onSuggestionSelect={onSuggestionSelect}
              onShowHistory={() => setShowSearchHistory(!showSearchHistory)}
            />
            {showSearchHistory && (
              <div className="absolute top-full left-0 right-0 z-50 mt-2">
                <SearchHistoryPanel
                  onSearchSelect={handleSearchFromHistory}
                  onClose={() => setShowSearchHistory(false)}
                  currentFilters={currentFilters}
                />
              </div>
            )}
          </div>
          <AdvancedSearchFiltersComponent
            filters={currentFilters}
            onFiltersChange={handleFiltersChange}
            availableCategories={availableCategories}
            availablePlatforms={availablePlatforms}
            availableTags={availableTags}
            isOpen={isOpen}
            onToggle={() => setIsOpen(!isOpen)}
            onReset={resetFilters}
          />
          <CategoryInsights
            selectedCategory={selectedCategory}
            prompts={prompts}
            isLoading={isLoading}
          />
        </div>
      </div>
    </div>
  );
};
