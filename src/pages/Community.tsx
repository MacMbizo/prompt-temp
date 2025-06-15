
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Prompt } from '@/hooks/usePrompts';
import { SearchBar } from '@/components/SearchBar';
import { CategoryFilter } from '@/components/CategoryFilter';
import { PlatformFilter } from '@/components/PlatformFilter';
import { PromptCard } from '@/components/PromptCard';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, TrendingUp, Award } from 'lucide-react';
import { toast } from 'sonner';

// Helper function to parse variables from database
const parseVariables = (variables: any) => {
  if (!variables) return [];
  if (Array.isArray(variables)) return variables;
  return [];
};

export const Community: React.FC = () => {
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);

  useEffect(() => {
    fetchCommunityPrompts();
  }, []);

  const fetchCommunityPrompts = async () => {
    try {
      const { data, error } = await supabase
        .from('prompts')
        .select('*')
        .eq('is_community', true)
        .order('average_rating', { ascending: false, nullsFirst: false })
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching community prompts:', error);
        toast.error('Failed to load community prompts');
      } else {
        const transformedData: Prompt[] = (data || []).map(item => ({
          ...item,
          platforms: item.platforms || [],
          variables: parseVariables(item.variables),
          is_template: item.is_template || false,
          is_community: item.is_community || false,
          copy_count: item.copy_count || 0,
          average_rating: item.average_rating || null,
          rating_count: item.rating_count || 0
        }));
        setPrompts(transformedData);
      }
    } catch (error) {
      console.error('Error fetching community prompts:', error);
      toast.error('Failed to load community prompts');
    } finally {
      setLoading(false);
    }
  };

  const filteredPrompts = prompts.filter(prompt => {
    const matchesSearch = prompt.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         prompt.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         prompt.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || prompt.category === selectedCategory;
    const matchesPlatforms = selectedPlatforms.length === 0 || 
                            selectedPlatforms.some(platform => prompt.platforms?.includes(platform));
    
    return matchesSearch && matchesCategory && matchesPlatforms;
  });

  const topRatedPrompts = prompts
    .filter(p => (p.rating_count || 0) >= 3 && (p.average_rating || 0) >= 4.0)
    .slice(0, 3);

  const trendingPrompts = prompts
    .filter(p => (p.copy_count || 0) > 0)
    .sort((a, b) => (b.copy_count || 0) - (a.copy_count || 0))
    .slice(0, 3);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Loading community prompts...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold text-gray-900">Community Prompts</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Discover and use high-quality prompts shared by our community. These prompts have been 
          reviewed and approved by our moderation team.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6 text-center">
            <Users className="w-8 h-8 mx-auto mb-2 text-blue-600" />
            <div className="text-2xl font-bold">{prompts.length}</div>
            <div className="text-sm text-gray-600">Community Prompts</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <TrendingUp className="w-8 h-8 mx-auto mb-2 text-green-600" />
            <div className="text-2xl font-bold">{trendingPrompts.length}</div>
            <div className="text-sm text-gray-600">Trending This Week</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <Award className="w-8 h-8 mx-auto mb-2 text-yellow-600" />
            <div className="text-2xl font-bold">{topRatedPrompts.length}</div>
            <div className="text-sm text-gray-600">Top Rated</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="flex-1">
          <SearchBar 
            onSearch={setSearchQuery}
            placeholder="Search community prompts..."
          />
        </div>
        <CategoryFilter 
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
        />
        <PlatformFilter 
          selectedPlatforms={selectedPlatforms}
          onPlatformChange={setSelectedPlatforms}
        />
      </div>

      {/* Featured Sections */}
      {topRatedPrompts.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-yellow-600" />
            <h2 className="text-xl font-semibold">Top Rated Prompts</h2>
            <Badge variant="secondary">4.0+ stars</Badge>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {topRatedPrompts.map((prompt) => (
              <PromptCard
                key={prompt.id}
                prompt={{
                  ...prompt,
                  createdAt: new Date(prompt.created_at),
                  updatedAt: new Date(prompt.updated_at)
                }}
                onDelete={() => {}}
                onDuplicate={() => {}}
              />
            ))}
          </div>
        </div>
      )}

      {trendingPrompts.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-green-600" />
            <h2 className="text-xl font-semibold">Trending Prompts</h2>
            <Badge variant="secondary">Most copied</Badge>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {trendingPrompts.map((prompt) => (
              <PromptCard
                key={prompt.id}
                prompt={{
                  ...prompt,
                  createdAt: new Date(prompt.created_at),
                  updatedAt: new Date(prompt.updated_at)
                }}
                onDelete={() => {}}
                onDuplicate={() => {}}
              />
            ))}
          </div>
        </div>
      )}

      {/* All Community Prompts */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">All Community Prompts</h2>
        
        {filteredPrompts.length === 0 ? (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900 mb-2">No prompts found</h3>
            <p className="text-gray-600">
              {searchQuery || selectedCategory || selectedPlatforms.length > 0
                ? 'Try adjusting your filters to see more prompts.'
                : 'No community prompts are available yet.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredPrompts.map((prompt) => (
              <PromptCard
                key={prompt.id}
                prompt={{
                  ...prompt,
                  createdAt: new Date(prompt.created_at),
                  updatedAt: new Date(prompt.updated_at)
                }}
                onDelete={() => {}}
                onDuplicate={() => {}}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
