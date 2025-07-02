import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { Filter, X, Calendar as CalendarIcon, Star, Tag, Layers } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import type { Prompt } from '@/integrations/supabase/types';

export interface AdvancedSearchFilters {
  categories: string[];
  platforms: string[];
  tags: string[];
  dateRange: {
    from: Date | null;
    to: Date | null;
  };
  ratingRange: [number, number];
  hasContent: boolean;
  hasDescription: boolean;
  sortBy: 'relevance' | 'date' | 'rating' | 'title';
  sortOrder: 'asc' | 'desc';
}

interface AdvancedSearchFiltersProps {
  filters: AdvancedSearchFilters;
  onFiltersChange: (filters: AdvancedSearchFilters) => void;
  availableCategories: string[];
  availablePlatforms: string[];
  availableTags: string[];
  isOpen: boolean;
  onToggle: () => void;
  onReset: () => void;
}

export const AdvancedSearchFiltersComponent = ({
  filters,
  onFiltersChange,
  availableCategories,
  availablePlatforms,
  availableTags,
  isOpen,
  onToggle,
  onReset
}: AdvancedSearchFiltersProps) => {
  const [datePickerOpen, setDatePickerOpen] = useState<'from' | 'to' | null>(null);

  const updateFilters = (updates: Partial<AdvancedSearchFilters>) => {
    onFiltersChange({ ...filters, ...updates });
  };

  const toggleArrayFilter = (array: string[], value: string, key: keyof Pick<AdvancedSearchFilters, 'categories' | 'platforms' | 'tags'>) => {
    const newArray = array.includes(value)
      ? array.filter(item => item !== value)
      : [...array, value];
    updateFilters({ [key]: newArray });
  };

  const removeFilter = (type: string, value: string) => {
    switch (type) {
      case 'category':
        updateFilters({ categories: filters.categories.filter(c => c !== value) });
        break;
      case 'platform':
        updateFilters({ platforms: filters.platforms.filter(p => p !== value) });
        break;
      case 'tag':
        updateFilters({ tags: filters.tags.filter(t => t !== value) });
        break;
    }
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.categories.length > 0) count++;
    if (filters.platforms.length > 0) count++;
    if (filters.tags.length > 0) count++;
    if (filters.dateRange.from || filters.dateRange.to) count++;
    if (filters.ratingRange[0] > 0 || filters.ratingRange[1] < 5) count++;
    if (filters.hasContent || filters.hasDescription) count++;
    return count;
  };

  const activeFiltersCount = getActiveFiltersCount();

  return (
    <div className="space-y-4">
      {/* Filter Toggle Button */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={onToggle}
          className="flex items-center gap-2"
        >
          <Filter className="w-4 h-4" />
          Advanced Filters
          {activeFiltersCount > 0 && (
            <Badge variant="secondary" className="ml-1">
              {activeFiltersCount}
            </Badge>
          )}
        </Button>
        
        {activeFiltersCount > 0 && (
          <Button variant="ghost" size="sm" onClick={onReset}>
            Clear All
          </Button>
        )}
      </div>

      {/* Active Filters Display */}
      {activeFiltersCount > 0 && (
        <div className="flex flex-wrap gap-2">
          {filters.categories.map(category => (
            <Badge key={category} variant="outline" className="flex items-center gap-1">
              <Layers className="w-3 h-3" />
              {category}
              <button
                onClick={() => removeFilter('category', category)}
                className="ml-1 hover:text-red-500"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          ))}
          {filters.platforms.map(platform => (
            <Badge key={platform} variant="outline" className="flex items-center gap-1">
              <Layers className="w-3 h-3" />
              {platform}
              <button
                onClick={() => removeFilter('platform', platform)}
                className="ml-1 hover:text-red-500"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          ))}
          {filters.tags.map(tag => (
            <Badge key={tag} variant="outline" className="flex items-center gap-1">
              <Tag className="w-3 h-3" />
              {tag}
              <button
                onClick={() => removeFilter('tag', tag)}
                className="ml-1 hover:text-red-500"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}

      {/* Advanced Filters Panel */}
      {isOpen && (
        <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-6 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* Categories Filter */}
            <div className="space-y-3">
              <Label className="text-sm font-medium flex items-center gap-2">
                <Layers className="w-4 h-4" />
                Categories
              </Label>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {availableCategories.filter(cat => cat !== 'All').map(category => (
                  <div key={category} className="flex items-center space-x-2">
                    <Checkbox
                      id={`category-${category}`}
                      checked={filters.categories.includes(category)}
                      onCheckedChange={() => toggleArrayFilter(filters.categories, category, 'categories')}
                    />
                    <Label htmlFor={`category-${category}`} className="text-sm">
                      {category}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Platforms Filter */}
            <div className="space-y-3">
              <Label className="text-sm font-medium flex items-center gap-2">
                <Layers className="w-4 h-4" />
                Platforms
              </Label>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {availablePlatforms.map(platform => (
                  <div key={platform} className="flex items-center space-x-2">
                    <Checkbox
                      id={`platform-${platform}`}
                      checked={filters.platforms.includes(platform)}
                      onCheckedChange={() => toggleArrayFilter(filters.platforms, platform, 'platforms')}
                    />
                    <Label htmlFor={`platform-${platform}`} className="text-sm">
                      {platform}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Tags Filter */}
            <div className="space-y-3">
              <Label className="text-sm font-medium flex items-center gap-2">
                <Tag className="w-4 h-4" />
                Tags
              </Label>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {availableTags.slice(0, 20).map(tag => (
                  <div key={tag} className="flex items-center space-x-2">
                    <Checkbox
                      id={`tag-${tag}`}
                      checked={filters.tags.includes(tag)}
                      onCheckedChange={() => toggleArrayFilter(filters.tags, tag, 'tags')}
                    />
                    <Label htmlFor={`tag-${tag}`} className="text-sm">
                      {tag}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Date Range Filter */}
            <div className="space-y-3">
              <Label className="text-sm font-medium flex items-center gap-2">
                <CalendarIcon className="w-4 h-4" />
                Date Range
              </Label>
              <div className="flex gap-2">
                <Popover open={datePickerOpen === 'from'} onOpenChange={(open) => setDatePickerOpen(open ? 'from' : null)}>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {filters.dateRange.from ? format(filters.dateRange.from, 'PPP') : 'From date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={filters.dateRange.from || undefined}
                      onSelect={(date) => {
                        updateFilters({ dateRange: { ...filters.dateRange, from: date || null } });
                        setDatePickerOpen(null);
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                
                <Popover open={datePickerOpen === 'to'} onOpenChange={(open) => setDatePickerOpen(open ? 'to' : null)}>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {filters.dateRange.to ? format(filters.dateRange.to, 'PPP') : 'To date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={filters.dateRange.to || undefined}
                      onSelect={(date) => {
                        updateFilters({ dateRange: { ...filters.dateRange, to: date || null } });
                        setDatePickerOpen(null);
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {/* Rating Range Filter */}
            <div className="space-y-3">
              <Label className="text-sm font-medium flex items-center gap-2">
                <Star className="w-4 h-4" />
                Rating Range: {filters.ratingRange[0]} - {filters.ratingRange[1]} stars
              </Label>
              <Slider
                value={filters.ratingRange}
                onValueChange={(value) => updateFilters({ ratingRange: value as [number, number] })}
                max={5}
                min={0}
                step={0.5}
                className="w-full"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Content Requirements */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Content Requirements</Label>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="has-content"
                    checked={filters.hasContent}
                    onCheckedChange={(checked) => updateFilters({ hasContent: !!checked })}
                  />
                  <Label htmlFor="has-content" className="text-sm">
                    Has content/body
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="has-description"
                    checked={filters.hasDescription}
                    onCheckedChange={(checked) => updateFilters({ hasDescription: !!checked })}
                  />
                  <Label htmlFor="has-description" className="text-sm">
                    Has description
                  </Label>
                </div>
              </div>
            </div>

            {/* Sort Options */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Sort Options</Label>
              <div className="flex gap-2">
                <Select value={filters.sortBy} onValueChange={(value) => updateFilters({ sortBy: value as any })}>
                  <SelectTrigger className="flex-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="relevance">Relevance</SelectItem>
                    <SelectItem value="date">Date</SelectItem>
                    <SelectItem value="rating">Rating</SelectItem>
                    <SelectItem value="title">Title</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select value={filters.sortOrder} onValueChange={(value) => updateFilters({ sortOrder: value as any })}>
                  <SelectTrigger className="w-24">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="asc">Asc</SelectItem>
                    <SelectItem value="desc">Desc</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Hook for managing advanced search filters
export const useAdvancedSearchFilters = (prompts: Prompt[]) => {
  const [filters, setFilters] = useState<AdvancedSearchFilters>({
    categories: [],
    platforms: [],
    tags: [],
    dateRange: { from: null, to: null },
    ratingRange: [0, 5],
    hasContent: false,
    hasDescription: false,
    sortBy: 'relevance',
    sortOrder: 'desc'
  });
  
  const [isOpen, setIsOpen] = useState(false);

  // Extract available options from prompts
  const availableCategories = Array.from(new Set(prompts.map(p => p.category).filter(Boolean)));
  const availablePlatforms = Array.from(new Set(prompts.flatMap(p => p.platforms || []).filter(Boolean)));
  const availableTags = Array.from(new Set(prompts.flatMap(p => p.tags || []).filter(Boolean)));

  const resetFilters = () => {
    setFilters({
      categories: [],
      platforms: [],
      tags: [],
      dateRange: { from: null, to: null },
      ratingRange: [0, 5],
      hasContent: false,
      hasDescription: false,
      sortBy: 'relevance',
      sortOrder: 'desc'
    });
  };

  // Apply filters to prompts
  const applyFilters = (prompts: Prompt[]): Prompt[] => {
    let filtered = [...prompts];

    // Category filter
    if (filters.categories.length > 0) {
      filtered = filtered.filter(p => filters.categories.includes(p.category));
    }

    // Platform filter
    if (filters.platforms.length > 0) {
      filtered = filtered.filter(p => 
        p.platforms && p.platforms.some(platform => filters.platforms.includes(platform))
      );
    }

    // Tags filter
    if (filters.tags.length > 0) {
      filtered = filtered.filter(p => 
        p.tags && p.tags.some(tag => filters.tags.includes(tag))
      );
    }

    // Date range filter
    if (filters.dateRange.from || filters.dateRange.to) {
      filtered = filtered.filter(p => {
        const createdAt = new Date(p.created_at);
        if (filters.dateRange.from && createdAt < filters.dateRange.from) return false;
        if (filters.dateRange.to && createdAt > filters.dateRange.to) return false;
        return true;
      });
    }

    // Rating filter
    if (filters.ratingRange[0] > 0 || filters.ratingRange[1] < 5) {
      filtered = filtered.filter(p => {
        const rating = p.average_rating || 0;
        return rating >= filters.ratingRange[0] && rating <= filters.ratingRange[1];
      });
    }

    // Content requirements
    if (filters.hasContent) {
      filtered = filtered.filter(p => p.content && p.content.trim().length > 0);
    }
    if (filters.hasDescription) {
      filtered = filtered.filter(p => p.description && p.description.trim().length > 0);
    }

    // Sort results
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (filters.sortBy) {
        case 'date':
          comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
          break;
        case 'rating':
          comparison = (a.average_rating || 0) - (b.average_rating || 0);
          break;
        case 'title':
          comparison = a.title.localeCompare(b.title);
          break;
        case 'relevance':
        default:
          // For relevance, maintain original order (search results are already ranked)
          return 0;
      }
      
      return filters.sortOrder === 'desc' ? -comparison : comparison;
    });

    return filtered;
  };

  return {
    filters,
    setFilters,
    isOpen,
    setIsOpen,
    availableCategories,
    availablePlatforms,
    availableTags,
    resetFilters,
    applyFilters
  };
};