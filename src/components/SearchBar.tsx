
import { useState, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, X, Clock, TrendingUp, History } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSearchHistory } from '@/hooks/useSearchHistory';

interface SearchBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  placeholder?: string;
  suggestions?: string[];
  isSearching?: boolean;
  searchError?: string | null;
  onSuggestionSelect?: (suggestion: string) => void;
  onShowHistory?: () => void;
}

export const SearchBar = ({ 
  searchQuery, 
  onSearchChange, 
  placeholder = "Search...", 
  suggestions = [],
  isSearching = false,
  searchError = null,
  onSuggestionSelect,
  onShowHistory
}: SearchBarProps) => {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showHistoryDropdown, setShowHistoryDropdown] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const { searchHistory, popularSearches, quickSearches } = useSearchHistory();

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions || suggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setFocusedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setFocusedIndex(prev => 
          prev > 0 ? prev - 1 : suggestions.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (focusedIndex >= 0 && suggestions[focusedIndex]) {
          handleSuggestionClick(suggestions[focusedIndex]);
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setFocusedIndex(-1);
        inputRef.current?.blur();
        break;
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    onSearchChange(suggestion);
    onSuggestionSelect?.(suggestion);
    setShowSuggestions(false);
    setFocusedIndex(-1);
  };

  const handleClear = () => {
    onSearchChange('');
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
        setFocusedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={suggestionsRef}>
      <div className="relative">
        <Search className={cn(
          "absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 transition-colors",
          isSearching ? "text-purple-500 animate-pulse" : "text-gray-400"
        )} />
        <Input
          ref={inputRef}
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (suggestions.length > 0) {
              setShowSuggestions(true);
            }
          }}
          placeholder={placeholder}
          className={cn(
            "pl-10 pr-10 py-2 border-gray-300 focus:border-purple-500 focus:ring-purple-500 shadow-sm bg-white/80 backdrop-blur-sm transition-all",
            searchError && "border-red-300 focus:border-red-500 focus:ring-red-500",
            isSearching && "ring-2 ring-purple-200"
          )}
        />
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
          {onShowHistory && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowHistoryDropdown(!showHistoryDropdown)}
              className="h-6 w-6 p-0 text-gray-400 hover:text-gray-600"
              type="button"
            >
              <History className="w-4 h-4" />
            </Button>
          )}
          {searchQuery && (
            <button
              onClick={handleClear}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              type="button"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Search Error */}
      {searchError && (
        <div className="absolute top-full left-0 right-0 mt-1 p-2 bg-red-50 border border-red-200 rounded-md text-sm text-red-600 z-50">
          {searchError}
        </div>
      )}

      {/* Quick Search History Dropdown */}
      {showHistoryDropdown && quickSearches.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-50 max-h-60 overflow-y-auto">
          <div className="p-2 text-xs text-gray-500 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              Quick Access
            </div>
            {onShowHistory && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShowHistoryDropdown(false);
                  onShowHistory();
                }}
                className="h-5 text-xs px-2"
              >
                View All
              </Button>
            )}
          </div>
          {quickSearches.map((item, index) => (
            <button
              key={`${item.type}-${item.query}`}
              onClick={() => {
                handleSuggestionClick(item.query);
                setShowHistoryDropdown(false);
              }}
              className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 transition-colors flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                {item.type === 'recent' ? (
                  <Clock className="w-3 h-3 text-blue-400" />
                ) : (
                  <TrendingUp className="w-3 h-3 text-green-400" />
                )}
                <span className="truncate">{item.query}</span>
              </div>
              <span className="text-xs text-gray-400">
                {item.count} {item.type === 'recent' ? 'results' : 'searches'}
              </span>
            </button>
          ))}
        </div>
      )}

      {/* Autocomplete Suggestions */}
      {showSuggestions && suggestions.length > 0 && !searchError && !showHistoryDropdown && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-50 max-h-60 overflow-y-auto">
          <div className="p-2 text-xs text-gray-500 border-b border-gray-100 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            Suggestions
          </div>
          {suggestions.map((suggestion, index) => (
            <button
              key={suggestion}
              onClick={() => handleSuggestionClick(suggestion)}
              className={cn(
                "w-full text-left px-3 py-2 text-sm hover:bg-gray-50 transition-colors flex items-center gap-2",
                index === focusedIndex && "bg-purple-50 text-purple-700"
              )}
            >
              <Search className="w-3 h-3 text-gray-400" />
              <span className="truncate">{suggestion}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
