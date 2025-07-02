import React, { useState } from 'react';
import { Clock, Star, Trash2, Edit, Share, Lock, Unlock, Search, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
// import { useSearchHistory, SearchHistoryEntry, SavedSearch } from '@/hooks/useSearchHistory';

// Temporary type definitions for testing
interface SearchHistoryEntry {
  id: string;
  search_query: string;
  search_filters: Record<string, any>;
  result_count: number;
  created_at: string;
}

interface SavedSearch {
  id: string;
  name: string;
  search_query: string;
  search_filters: Record<string, any>;
  description?: string;
  is_public: boolean;
  created_at: string;
  updated_at: string;
}
import { formatDistanceToNow } from 'date-fns';

interface SearchHistoryPanelProps {
  onSearchSelect: (query: string, filters?: Record<string, any>) => void;
  onClose?: () => void;
  currentQuery?: string;
  currentFilters?: Record<string, any>;
}

interface SaveSearchDialogProps {
  query: string;
  filters: Record<string, any>;
  onSave: (name: string, description?: string, isPublic?: boolean) => void;
  loading: boolean;
}

const SaveSearchDialog: React.FC<SaveSearchDialogProps> = ({ query, filters, onSave, loading }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [open, setOpen] = useState(false);

  const handleSave = () => {
    if (name.trim()) {
      onSave(name.trim(), description.trim() || undefined, isPublic);
      setOpen(false);
      setName('');
      setDescription('');
      setIsPublic(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Star className="h-4 w-4 mr-2" />
          Save Search
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Save Search</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="search-name">Name</Label>
            <Input
              id="search-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter a name for this search"
            />
          </div>
          <div>
            <Label htmlFor="search-description">Description (optional)</Label>
            <Textarea
              id="search-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what this search is for"
              rows={3}
            />
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              id="public-search"
              checked={isPublic}
              onCheckedChange={setIsPublic}
            />
            <Label htmlFor="public-search">Make this search public</Label>
          </div>
          <div className="bg-muted p-3 rounded-lg">
            <p className="text-sm font-medium mb-1">Search Query:</p>
            <p className="text-sm text-muted-foreground">{query || 'No query'}</p>
            {Object.keys(filters).length > 0 && (
              <>
                <p className="text-sm font-medium mt-2 mb-1">Filters:</p>
                <div className="flex flex-wrap gap-1">
                  {Object.entries(filters).map(([key, value]) => (
                    <Badge key={key} variant="secondary" className="text-xs">
                      {key}: {Array.isArray(value) ? value.join(', ') : String(value)}
                    </Badge>
                  ))}
                </div>
              </>
            )}
          </div>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={!name.trim() || loading}>
              {loading ? 'Saving...' : 'Save Search'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const SearchHistoryPanel: React.FC<SearchHistoryPanelProps> = ({
  onSearchSelect,
  currentQuery = '',
  currentFilters = {}
}) => {
  // const {
  //   searchHistory,
  //   savedSearches,
  //   popularSearches,
  //   loading,
  //   saveSearch,
  //   deleteSavedSearch,
  //   clearHistory
  // } = useSearchHistory();
  
  // Mock data for testing
  const searchHistory: any[] = [];
  const savedSearches: any[] = [];
  const popularSearches: any[] = [];
  const loading = false;
  const saveSearch = async () => {};
  const deleteSavedSearch = async () => {};
  const clearHistory = async () => {};

  const [editingSearch, setEditingSearch] = useState<SavedSearch | null>(null);

  const handleSaveCurrentSearch = async (name: string, description?: string, isPublic?: boolean) => {
    try {
      await saveSearch(name, currentQuery, currentFilters, description, isPublic);
    } catch (error) {
      console.error('Failed to save search:', error);
    }
  };

  const formatFilters = (filters: Record<string, any>) => {
    const activeFilters = Object.entries(filters).filter(([_, value]) => {
      if (Array.isArray(value)) return value.length > 0;
      if (typeof value === 'object' && value !== null) return Object.keys(value).length > 0;
      return value !== undefined && value !== null && value !== '';
    });
    return activeFilters;
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Search Management</h2>
        {currentQuery && (
          <SaveSearchDialog
            query={currentQuery}
            filters={currentFilters}
            onSave={handleSaveCurrentSearch}
            loading={loading}
          />
        )}
      </div>

      <Tabs defaultValue="history" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="history" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Recent Searches
          </TabsTrigger>
          <TabsTrigger value="saved" className="flex items-center gap-2">
            <Star className="h-4 w-4" />
            Saved Searches
          </TabsTrigger>
          <TabsTrigger value="popular" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Popular
          </TabsTrigger>
        </TabsList>

        <TabsContent value="history" className="mt-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Recent Searches
              </CardTitle>
              {searchHistory.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearHistory}
                  disabled={loading}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Clear History
                </Button>
              )}
            </CardHeader>
            <CardContent>
              {searchHistory.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  No search history yet. Start searching to see your recent queries here.
                </p>
              ) : (
                <ScrollArea className="h-96">
                  <div className="space-y-3">
                    {searchHistory.map((entry) => {
                      const activeFilters = formatFilters(entry.search_filters);
                      return (
                        <div
                          key={entry.id}
                          className="p-3 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                          onClick={() => onSearchSelect(entry.search_query, entry.search_filters)}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <Search className="h-4 w-4 text-muted-foreground" />
                                <span className="font-medium">{entry.search_query}</span>
                                <Badge variant="secondary" className="text-xs">
                                  {entry.result_count} results
                                </Badge>
                              </div>
                              {activeFilters.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-2">
                                  {activeFilters.map(([key, value]) => (
                                    <Badge key={key} variant="outline" className="text-xs">
                                      {key}: {Array.isArray(value) ? value.join(', ') : String(value)}
                                    </Badge>
                                  ))}
                                </div>
                              )}
                            </div>
                            <span className="text-xs text-muted-foreground">
                              {formatDistanceToNow(new Date(entry.created_at), { addSuffix: true })}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="saved" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5" />
                Saved Searches
              </CardTitle>
            </CardHeader>
            <CardContent>
              {savedSearches.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  No saved searches yet. Save your frequently used searches for quick access.
                </p>
              ) : (
                <ScrollArea className="h-96">
                  <div className="space-y-3">
                    {savedSearches.map((search) => {
                      const activeFilters = formatFilters(search.search_filters);
                      return (
                        <div key={search.id} className="p-4 border rounded-lg">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-semibold">{search.name}</h3>
                                {search.is_public ? (
                                  <Unlock className="h-4 w-4 text-green-500" title="Public" />
                                ) : (
                                  <Lock className="h-4 w-4 text-muted-foreground" title="Private" />
                                )}
                              </div>
                              {search.description && (
                                <p className="text-sm text-muted-foreground mb-2">
                                  {search.description}
                                </p>
                              )}
                              <div className="flex items-center gap-2 mb-2">
                                <Search className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm font-mono bg-muted px-2 py-1 rounded">
                                  {search.search_query}
                                </span>
                              </div>
                              {activeFilters.length > 0 && (
                                <div className="flex flex-wrap gap-1">
                                  {activeFilters.map(([key, value]) => (
                                    <Badge key={key} variant="outline" className="text-xs">
                                      {key}: {Array.isArray(value) ? value.join(', ') : String(value)}
                                    </Badge>
                                  ))}
                                </div>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => onSearchSelect(search.search_query, search.search_filters)}
                              >
                                <Search className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => deleteSavedSearch(search.id)}
                                disabled={loading}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Created {formatDistanceToNow(new Date(search.created_at), { addSuffix: true })}
                            {search.updated_at !== search.created_at && (
                              <span>
                                {' • Updated '}
                                {formatDistanceToNow(new Date(search.updated_at), { addSuffix: true })}
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="popular" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Popular Searches
              </CardTitle>
            </CardHeader>
            <CardContent>
              {popularSearches.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  No popular searches yet. Your frequently used searches will appear here.
                </p>
              ) : (
                <div className="space-y-2">
                  {popularSearches.map((search, index) => (
                    <div
                      key={search.search_query}
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                      onClick={() => onSearchSelect(search.search_query)}
                    >
                      <div className="flex items-center gap-3">
                        <Badge variant="secondary" className="w-6 h-6 rounded-full p-0 flex items-center justify-center text-xs">
                          {index + 1}
                        </Badge>
                        <span className="font-medium">{search.search_query}</span>
                      </div>
                      <Badge variant="outline">
                        {search.search_count} {search.search_count === 1 ? 'search' : 'searches'}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SearchHistoryPanel;