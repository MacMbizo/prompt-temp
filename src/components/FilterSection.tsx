
import React from 'react';
import { CategoryFilter } from '@/components/CategoryFilter';
import { CategoryInsights } from '@/components/CategoryInsights';
import { PlatformFilter } from '@/components/PlatformFilter';
import { SearchBar } from '@/components/SearchBar';
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
  isLoading
}) => {
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
