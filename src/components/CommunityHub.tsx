
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Users, Star, TrendingUp, Filter, Search } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { Prompt } from '@/hooks/usePrompts';

interface CommunityHubProps {
  onPromptSelect: (prompt: Prompt) => void;
}

export const CommunityHub: React.FC<CommunityHubProps> = ({ onPromptSelect }) => {
  const [communityPrompts, setCommunityPrompts] = useState<Prompt[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('rating');
  const [categoryFilter, setCategoryFilter] = useState('All');

  useEffect(() => {
    fetchCommunityPrompts();
  }, [sortBy]);

  const fetchCommunityPrompts = async () => {
    try {
      let query = supabase
        .from('prompts')
        .select('*')
        .eq('is_community', true)
        .eq('status', 'active');

      // Apply sorting
      switch (sortBy) {
        case 'rating':
          query = query.order('average_rating', { ascending: false });
          break;
        case 'usage':
          query = query.order('usage_count', { ascending: false });
          break;
        case 'recent':
          query = query.order('created_at', { ascending: false });
          break;
        default:
          query = query.order('average_rating', { ascending: false });
      }

      const { data, error } = await query.limit(20);

      if (error) {
        console.error('Error fetching community prompts:', error);
        toast.error('Failed to load community prompts');
      } else {
        setCommunityPrompts(data || []);
      }
    } catch (error) {
      console.error('Error fetching community prompts:', error);
      toast.error('Failed to load community prompts');
    } finally {
      setLoading(false);
    }
  };

  const filteredPrompts = communityPrompts.filter(prompt => {
    const matchesSearch = !searchQuery || 
      prompt.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prompt.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = categoryFilter === 'All' || prompt.category === categoryFilter;
    
    return matchesSearch && matchesCategory;
  });

  const categories = Array.from(new Set(communityPrompts.map(p => p.category)));

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Users className="w-5 h-5 mr-2" />
            Community Hub
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="animate-pulse">Loading community prompts...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center">
            <Users className="w-5 h-5 mr-2" />
            Community Hub
          </div>
          <Badge variant="secondary">{filteredPrompts.length} prompts</Badge>
        </CardTitle>
        
        <div className="flex flex-col sm:flex-row gap-4 mt-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search community prompts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-40">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Categories</SelectItem>
              {categories.map(category => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="rating">Top Rated</SelectItem>
              <SelectItem value="usage">Most Used</SelectItem>
              <SelectItem value="recent">Recent</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {filteredPrompts.map((prompt) => (
            <div
              key={prompt.id}
              className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
              onClick={() => onPromptSelect(prompt)}
            >
              <div className="flex items-start justify-between mb-2">
                <h4 className="font-medium text-sm line-clamp-2">{prompt.title}</h4>
                <div className="flex items-center space-x-2 ml-2">
                  {prompt.average_rating && (
                    <div className="flex items-center">
                      <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                      <span className="text-xs ml-1">{prompt.average_rating.toFixed(1)}</span>
                    </div>
                  )}
                  {prompt.usage_count > 0 && (
                    <div className="flex items-center">
                      <TrendingUp className="w-3 h-3 text-blue-500" />
                      <span className="text-xs ml-1">{prompt.usage_count}</span>
                    </div>
                  )}
                </div>
              </div>
              
              <p className="text-xs text-gray-600 line-clamp-2 mb-2">
                {prompt.description}
              </p>
              
              <div className="flex items-center justify-between">
                <Badge variant="outline" className="text-xs">
                  {prompt.category}
                </Badge>
                <span className="text-xs text-gray-500">
                  {new Date(prompt.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))}
          
          {filteredPrompts.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <Users className="w-8 h-8 mx-auto mb-2 text-gray-300" />
              <p>No community prompts found</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
