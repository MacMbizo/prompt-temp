
import React, { useState, useEffect } from 'react';
import { usePrompts, type Prompt, parseVariables } from '@/hooks/usePrompts';
import { PromptCard } from '@/components/PromptCard';
import { SearchBar } from '@/components/SearchBar';
import { CategoryFilter } from '@/components/CategoryFilter';
import { PlatformFilter } from '@/components/PlatformFilter';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const Community: React.FC = () => {
  const { duplicatePrompt } = usePrompts();
  const [communityPrompts, setCommunityPrompts] = useState<Prompt[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
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
        .order('average_rating', { ascending: false, nullsLast: true });

      if (error) throw error;
      
      // Transform the data to match our Prompt interface
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
      
      setCommunityPrompts(transformedData);
    } catch (error) {
      console.error('Error fetching community prompts:', error);
      toast.error('Failed to load community prompts');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    // For community prompts, only allow moderators to delete
    toast.error('Community prompts can only be managed by moderators');
  };

  const filteredPrompts = communityPrompts.filter(prompt => {
    const matchesSearch = prompt.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         prompt.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         prompt.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         prompt.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = !selectedCategory || prompt.category === selectedCategory;
    
    const matchesPlatforms = selectedPlatforms.length === 0 || 
                           selectedPlatforms.some(platform => prompt.platforms?.includes(platform));
    
    return matchesSearch && matchesCategory && matchesPlatforms;
  });

  const categories = [...new Set(communityPrompts.map(prompt => prompt.category))];

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
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Community Prompts</h1>
        <p className="text-gray-600">
          Discover and use high-quality prompts shared by the community. These prompts have been 
          reviewed and approved by our moderators.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        <aside className="lg:w-64 space-y-6">
          <SearchBar value={searchTerm} onChange={setSearchTerm} />
          
          <CategoryFilter 
            categories={categories}
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
          />
          
          <PlatformFilter 
            selectedPlatforms={selectedPlatforms}
            onSelectedPlatformsChange={setSelectedPlatforms}
          />
        </aside>

        <main className="flex-1">
          {filteredPrompts.length === 0 ? (
            <div className="text-center py-12">
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {communityPrompts.length === 0 ? 'No community prompts yet' : 'No prompts match your filters'}
              </h3>
              <p className="text-gray-600">
                {communityPrompts.length === 0 
                  ? 'Be the first to submit a prompt to the community!'
                  : 'Try adjusting your search criteria or filters.'
                }
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
          )}
        </main>
      </div>
    </div>
  );
};
