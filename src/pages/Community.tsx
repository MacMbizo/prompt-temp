
import { useState, useMemo } from 'react';
import { Header } from '@/components/Header';
import { PromptCard } from '@/components/PromptCard';
import { CategoryFilter } from '@/components/CategoryFilter';
import { PlatformFilter } from '@/components/PlatformFilter';
import { SearchBar } from '@/components/SearchBar';
import { Button } from '@/components/ui/button';
import { Star, TrendingUp, Clock, Award } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ProtectedRoute } from '@/components/ProtectedRoute';

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

const Community = () => {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'rating' | 'popular'>('rating');

  const { data: communityPrompts = [], isLoading } = useQuery({
    queryKey: ['community-prompts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('prompts')
        .select(`
          *,
          profiles:user_id (
            id
          )
        `)
        .eq('is_community', true)
        .eq('moderation_status', 'approved');

      if (error) throw error;
      return data || [];
    }
  });

  const filteredPrompts = useMemo(() => {
    let filtered = communityPrompts;

    // Filter by category
    if (selectedCategory !== 'All') {
      filtered = filtered.filter(prompt => prompt.category === selectedCategory);
    }

    // Filter by platforms
    if (selectedPlatforms.length > 0) {
      filtered = filtered.filter(prompt => 
        prompt.platforms && prompt.platforms.some((platform: string) => selectedPlatforms.includes(platform))
      );
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(prompt =>
        prompt.title.toLowerCase().includes(query) ||
        prompt.description?.toLowerCase().includes(query) ||
        prompt.content.toLowerCase().includes(query) ||
        (prompt.tags && prompt.tags.some((tag: string) => tag.toLowerCase().includes(query))) ||
        (prompt.platforms && prompt.platforms.some((platform: string) => platform.toLowerCase().includes(query)))
      );
    }

    // Sort prompts
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case 'rating':
          return (b.average_rating || 0) - (a.average_rating || 0);
        case 'popular':
          return (b.copy_count || 0) - (a.copy_count || 0);
        default:
          return 0;
      }
    });

    return filtered;
  }, [communityPrompts, selectedCategory, selectedPlatforms, searchQuery, sortBy]);

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
              <p className="text-gray-600 text-lg">
                Discover and use prompts shared by the community
              </p>
              <p className="text-sm text-gray-500 mt-1">
                {filteredPrompts.length} prompts available
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex gap-2">
                <Button
                  variant={sortBy === 'rating' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSortBy('rating')}
                  className="text-xs"
                >
                  <Star className="w-3 h-3 mr-1" />
                  Top Rated
                </Button>
                <Button
                  variant={sortBy === 'popular' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSortBy('popular')}
                  className="text-xs"
                >
                  <TrendingUp className="w-3 h-3 mr-1" />
                  Popular
                </Button>
                <Button
                  variant={sortBy === 'newest' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSortBy('newest')}
                  className="text-xs"
                >
                  <Clock className="w-3 h-3 mr-1" />
                  Newest
                </Button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
            <div className="lg:col-span-1">
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
              <SearchBar
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                placeholder="Search community prompts..."
              />
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
                onDelete={() => {}}
                onDuplicate={() => {}}
              />
            ))}
          </div>

          {filteredPrompts.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">🌟</div>
              <h3 className="text-xl font-semibold text-gray-600 mb-2">No community prompts found</h3>
              <p className="text-gray-500">
                {searchQuery 
                  ? `No prompts match "${searchQuery}"`
                  : selectedCategory !== 'All' || selectedPlatforms.length > 0
                  ? 'Try adjusting your filters'
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
