
import React from 'react';
import { CategoryFilter } from '@/components/CategoryFilter';
import { CategoryInsights } from '@/components/CategoryInsights';
import { PlatformFilter } from '@/components/PlatformFilter';
import { SearchBar } from '@/components/SearchBar';
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
          <SearchBar
            searchQuery={searchQuery}
            onSearchChange={onSearchChange}
            placeholder={searchPlaceholder}
            suggestions={searchSuggestions}
            isSearching={isSearching}
            searchError={searchError}
            onSuggestionSelect={onSuggestionSelect}
          />
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
