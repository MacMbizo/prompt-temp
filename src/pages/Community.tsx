
import React, { useState, useEffect } from 'react';
import { PromptCard } from '@/components/PromptCard';
import { SearchBar } from '@/components/SearchBar';
import { CategoryFilter } from '@/components/CategoryFilter';
import { PlatformFilter } from '@/components/PlatformFilter';
import { usePrompts, type Prompt } from '@/hooks/usePrompts';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const Community: React.FC = () => {
  const [communityPrompts, setCommunityPrompts] = useState<Prompt[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const { duplicatePrompt } = usePrompts();

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
        .order('rating_count', { ascending: false })
        .order('copy_count', { ascending: false });

      if (error) throw error;

      const transformedData: Prompt[] = (data || []).map(item => ({
        ...item,
        platforms: item.platforms || [],
        variables: item.variables || [],
        is_template: item.is_template || false,
        is_community: item.is_community || false,
        copy_count: item.copy_count || 0,
        average_rating: item.average_rating || null,
        rating_count: item.rating_count || 0
      }));

      setCommunityPrompts(transformedData);
    } catch (error) {
      console.error('Error fetching community prompts:', error);
      toast.error('Failed to load community prompts');
    } finally {
      setLoading(false);
    }
  };

  // Filter prompts based on search and filters
  const filteredPrompts = communityPrompts.filter(prompt => {
    const matchesSearch = searchTerm === '' || 
      prompt.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prompt.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prompt.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prompt.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = selectedCategory === '' || prompt.category === selectedCategory;
    
    const matchesPlatforms = selectedPlatforms.length === 0 || 
      selectedPlatforms.some(platform => prompt.platforms?.includes(platform));
    
    return matchesSearch && matchesCategory && matchesPlatforms;
  });

  const categories = Array.from(new Set(communityPrompts.map(p => p.category))).sort();

  const handleDelete = () => {
    // Community prompts cannot be deleted by regular users
    toast.error('Community prompts cannot be deleted');
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Loading community prompts...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Community Prompts</h1>
        <p className="text-gray-600">
          Discover high-quality prompts shared and curated by our community
        </p>
      </div>

      {/* Search and Filters */}
      <div className="mb-6 space-y-4">
        <SearchBar 
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
        />
        
        <div className="flex flex-wrap gap-4">
          <CategoryFilter
            categories={categories}
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
          />
          
          <PlatformFilter
            selectedPlatforms={selectedPlatforms}
            onPlatformChange={setSelectedPlatforms}
          />
        </div>
      </div>

      {/* Results count */}
      <div className="mb-6">
        <p className="text-gray-600">
          Showing {filteredPrompts.length} of {communityPrompts.length} community prompts
        </p>
      </div>

      {/* Prompts grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredPrompts.map((prompt) => (
          <PromptCard
            key={prompt.id}
            prompt={{
              ...prompt,
              createdAt: new Date(prompt.created_at),
              updatedAt: new Date(prompt.updated_at)
            }}
            onDelete={handleDelete}
            onDuplicate={duplicatePrompt}
          />
        ))}
      </div>

      {filteredPrompts.length === 0 && (
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchTerm || selectedCategory || selectedPlatforms.length > 0
              ? 'No prompts match your filters'
              : 'No community prompts yet'
            }
          </h3>
          <p className="text-gray-600">
            {searchTerm || selectedCategory || selectedPlatforms.length > 0
              ? 'Try adjusting your search criteria'
              : 'Community prompts will appear here once approved by moderators'
            }
          </p>
        </div>
      )}
    </div>
  );
};
