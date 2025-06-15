
import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Header } from '@/components/Header';
import { PromptCard } from '@/components/PromptCard';
import { CategoryFilter } from '@/components/CategoryFilter';
import { PlatformFilter } from '@/components/PlatformFilter';
import { SearchBar } from '@/components/SearchBar';
import { CategoryInsights } from '@/components/CategoryInsights';
import { supabase } from '@/integrations/supabase/client';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import type { Prompt } from '@/hooks/usePrompts';

const CATEGORIES = [
  'All',
  'Writing & Content',
  'Programming & Development',
  'System Prompts',
  'Data Science & Analytics',
  'Image Generation',
  'Marketing & Sales',
  'Business Strategy',
  'Education & Learning',
  'Creative & Storytelling',
  'Code Review & Debugging',
  'API Documentation',
  'Research & Analysis',
  'Customer Support',
  'Social Media'
];

const AVAILABLE_PLATFORMS = [
  'ChatGPT',
  'Claude',
  'Gemini',
  'GPT-4',
  'Midjourney',
  'DALL-E',
  'Stable Diffusion',
  'Perplexity',
  'GitHub Copilot',
  'Notion AI'
];

// Helper function to parse variables from Json to PromptVariable[]
const parseVariables = (variables: any) => {
  if (!variables) return [];
  if (Array.isArray(variables)) return variables;
  return [];
};

const Community = () => {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  const { data: communityPrompts = [], isLoading } = useQuery({
    queryKey: ['community-prompts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('prompts')
        .select(`
          *,
          profiles:user_id (
            full_name,
            username
          )
        `)
        .eq('is_community', true)
        .order('average_rating', { ascending: false });

      if (error) {
        console.error('Error fetching community prompts:', error);
        throw error;
      }

      // Transform the data to match our Prompt interface
      return (data || []).map(item => ({
        ...item,
        platforms: item.platforms || [],
        variables: parseVariables(item.variables),
        is_template: item.is_template || false,
        tags: item.tags || []
      })) as Prompt[];
    }
  });

  const filteredPrompts = useMemo(() => {
    let filtered = communityPrompts;

    // Filter by platforms
    if (selectedPlatforms.length > 0) {
      filtered = filtered.filter(prompt => 
        prompt.platforms && prompt.platforms.some(platform => selectedPlatforms.includes(platform))
      );
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(prompt =>
        prompt.title.toLowerCase().includes(query) ||
        prompt.description?.toLowerCase().includes(query) ||
        prompt.content.toLowerCase().includes(query) ||
        prompt.tags.some(tag => tag.toLowerCase().includes(query)) ||
        (prompt.platforms && prompt.platforms.some(platform => platform.toLowerCase().includes(query)))
      );
    }

    // Filter by category
    if (selectedCategory !== 'All') {
      filtered = filtered.filter(prompt => prompt.category === selectedCategory);
    }

    return filtered;
  }, [communityPrompts, selectedCategory, selectedPlatforms, searchQuery]);

  const handlePlatformToggle = (platform: string) => {
    setSelectedPlatforms(prev => 
      prev.includes(platform) 
        ? prev.filter(p => p !== platform)
        : [...prev, platform]
    );
  };

  const handleClearAllPlatforms = () => {
    setSelectedPlatforms([]);
  };

  const getPromptCountText = () => {
    const totalPrompts = communityPrompts.length;
    const filteredCount = filteredPrompts.length;
    
    if (searchQuery || selectedCategory !== 'All' || selectedPlatforms.length > 0) {
      return `Showing ${filteredCount} of ${totalPrompts} community prompts`;
    }
    return `${totalPrompts} community prompts`;
  };

  if (isLoading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg flex items-center justify-center mx-auto mb-4 animate-pulse">
            </div>
            <p className="text-gray-600">Loading community prompts...</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
        <Header />
        
        <main className="container mx-auto px-4 py-8">
          <div className="flex flex-col lg:flex-row gap-6 mb-8">
            <div className="flex-1">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-2">
                Community Prompts
              </h1>
              <p className="text-gray-600 text-lg mb-2">
                Discover and use high-quality prompts shared by the community
              </p>
              <p className="text-sm text-gray-500">
                {getPromptCountText()}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-8">
            <div className="lg:col-span-2">
              <div className="space-y-6">
                <CategoryFilter
                  categories={CATEGORIES}
                  selectedCategory={selectedCategory}
                  onCategoryChange={setSelectedCategory}
                />
                <PlatformFilter
                  platforms={AVAILABLE_PLATFORMS}
                  selectedPlatforms={selectedPlatforms}
                  onPlatformToggle={handlePlatformToggle}
                  onClearAll={handleClearAllPlatforms}
                />
              </div>
            </div>
            
            <div className="lg:col-span-3">
              <div className="space-y-6">
                <SearchBar
                  searchQuery={searchQuery}
                  onSearchChange={setSearchQuery}
                  placeholder="Search community prompts, tags, or descriptions..."
                />
                <CategoryInsights
                  selectedCategory={selectedCategory}
                  prompts={filteredPrompts}
                  isLoading={isLoading}
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPrompts.map((prompt) => (
              <PromptCard
                key={prompt.id}
                prompt={{
                  ...prompt,
                  createdAt: new Date(prompt.created_at),
                  updatedAt: new Date(prompt.updated_at)
                }}
                onDelete={() => {}} // Community prompts can't be deleted by users
                onDuplicate={() => {}} // TODO: Add duplicate to personal collection
                onUpdate={() => {}} // Community prompts are read-only
              />
            ))}
          </div>

          {filteredPrompts.length === 0 && !isLoading && (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">🌟</div>
              <h3 className="text-xl font-semibold text-gray-600 mb-2">No community prompts found</h3>
              <p className="text-gray-500">
                {searchQuery 
                  ? `No prompts match "${searchQuery}"`
                  : selectedCategory !== 'All' || selectedPlatforms.length > 0
                  ? 'Try adjusting your search or filter selection'
                  : 'Be the first to share a prompt with the community!'
                }
              </p>
            </div>
          )}
        </main>
      </div>
    </ProtectedRoute>
  );
};

export default Community;
