
import { useState, useMemo } from 'react';
import { Header } from '@/components/Header';
import { PromptCard } from '@/components/PromptCard';
import { AddPromptModal } from '@/components/AddPromptModal';
import { ImportExportModal } from '@/components/ImportExportModal';
import { CategoryFilter } from '@/components/CategoryFilter';
import { CategoryInsights } from '@/components/CategoryInsights';
import { PlatformFilter } from '@/components/PlatformFilter';
import { SearchBar } from '@/components/SearchBar';
import { FolderSidebar } from '@/components/FolderSidebar';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { usePrompts, type Prompt } from '@/hooks/usePrompts';
import { useFolders } from '@/hooks/useFolders';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { PlatformInsightsDashboard } from '@/components/PlatformInsightsDashboard';

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

const Index = () => {
  const { prompts, loading, addPrompt, duplicatePrompt, deletePrompt, importPrompts, refetch } = usePrompts();
  const { folders } = useFolders();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isImportExportModalOpen, setIsImportExportModalOpen] = useState(false);

  const filteredPrompts = useMemo(() => {
    let filtered = prompts;

    // Filter by folder first
    if (selectedFolderId === 'uncategorized') {
      filtered = filtered.filter(prompt => !prompt.folder_id);
    } else if (selectedFolderId && selectedFolderId !== null) {
      filtered = filtered.filter(prompt => prompt.folder_id === selectedFolderId);
    }

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
        prompt.description.toLowerCase().includes(query) ||
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
  }, [prompts, selectedCategory, selectedPlatforms, selectedFolderId, searchQuery]);

  // Get prompts for insights (without folder filter for better insights)
  const insightPrompts = useMemo(() => {
    let filtered = prompts;

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
        prompt.description.toLowerCase().includes(query) ||
        prompt.content.toLowerCase().includes(query) ||
        prompt.tags.some(tag => tag.toLowerCase().includes(query)) ||
        (prompt.platforms && prompt.platforms.some(platform => platform.toLowerCase().includes(query)))
      );
    }

    return filtered;
  }, [prompts, selectedPlatforms, searchQuery]);

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

  const handleAddPrompt = (newPrompt: any) => {
    // Add folder_id to the prompt if a folder is selected
    const promptWithFolder = {
      ...newPrompt,
      folder_id: selectedFolderId === 'uncategorized' ? null : selectedFolderId
    };
    addPrompt(promptWithFolder);
    setIsAddModalOpen(false);
  };

  const handlePromptUpdate = () => {
    refetch();
  };

  const handlePromptSelect = (selectedPrompt: Prompt) => {
    // Scroll to the prompt in the list
    const promptElement = document.getElementById(`prompt-${selectedPrompt.id}`);
    if (promptElement) {
      promptElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      // Add a brief highlight effect
      promptElement.classList.add('ring-2', 'ring-purple-500', 'ring-opacity-50');
      setTimeout(() => {
        promptElement.classList.remove('ring-2', 'ring-purple-500', 'ring-opacity-50');
      }, 2000);
    }
  };

  const getCurrentFolderName = () => {
    if (selectedFolderId === null) return 'All Prompts';
    if (selectedFolderId === 'uncategorized') return 'Uncategorized';
    const folder = folders.find(f => f.id === selectedFolderId);
    return folder ? folder.name : 'Unknown Folder';
  };

  const getSearchPlaceholder = () => {
    const folderName = getCurrentFolderName();
    if (selectedFolderId === null) {
      return "Search all prompts, tags, or descriptions...";
    }
    return `Search in ${folderName}...`;
  };

  const getPromptCountText = () => {
    const totalInFolder = selectedFolderId === null 
      ? prompts.length 
      : selectedFolderId === 'uncategorized'
      ? prompts.filter(p => !p.folder_id).length
      : prompts.filter(p => p.folder_id === selectedFolderId).length;
    
    const filteredCount = filteredPrompts.length;
    
    if (searchQuery || selectedCategory !== 'All' || selectedPlatforms.length > 0) {
      return `Showing ${filteredCount} of ${totalInFolder} prompts`;
    }
    return `${totalInFolder} prompts`;
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg flex items-center justify-center mx-auto mb-4 animate-pulse">
            </div>
            <p className="text-gray-600">Loading your prompts...</p>
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
          <div className="flex gap-6">
            {/* Sidebar */}
            <div className="flex-shrink-0">
              <FolderSidebar
                selectedFolderId={selectedFolderId}
                onFolderSelect={setSelectedFolderId}
              />
            </div>

            {/* Main Content */}
            <div className="flex-1">
              <div className="flex flex-col lg:flex-row gap-6 mb-8">
                <div className="flex-1">
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-2">
                    {getCurrentFolderName()}
                  </h1>
                  <p className="text-gray-600 text-lg">
                    {selectedFolderId === null 
                      ? 'Organize and manage your AI prompts by category and use case'
                      : `Prompts in ${getCurrentFolderName()}`
                    }
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    {getPromptCountText()}
                  </p>
                </div>
                
                <div className="flex items-center gap-4">
                  <Button
                    onClick={() => setIsImportExportModalOpen(true)}
                    variant="outline"
                    className="border-purple-300 text-purple-600 hover:bg-purple-50"
                  >
                    Import/Export
                  </Button>
                  <Button
                    onClick={() => setIsAddModalOpen(true)}
                    className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-6 py-2 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Prompt
                  </Button>
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
                      placeholder={getSearchPlaceholder()}
                    />
                    <CategoryInsights
                      selectedCategory={selectedCategory}
                      prompts={insightPrompts}
                      isLoading={loading}
                    />
                  </div>
                </div>
              </div>

              {/* New Platform Insights Dashboard */}
              <div className="mb-8">
                <PlatformInsightsDashboard
                  prompts={insightPrompts}
                  selectedPlatforms={selectedPlatforms}
                  isLoading={loading}
                  onPromptSelect={handlePromptSelect}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredPrompts.map((prompt) => (
                  <div key={prompt.id} id={`prompt-${prompt.id}`} className="transition-all duration-200">
                    <PromptCard
                      prompt={{
                        ...prompt,
                        createdAt: new Date(prompt.created_at),
                        updatedAt: new Date(prompt.updated_at)
                      }}
                      onDelete={deletePrompt}
                      onDuplicate={duplicatePrompt}
                      onUpdate={handlePromptUpdate}
                    />
                  </div>
                ))}
              </div>

              {filteredPrompts.length === 0 && !loading && (
                <div className="text-center py-12">
                  <div className="text-gray-400 text-6xl mb-4">📝</div>
                  <h3 className="text-xl font-semibold text-gray-600 mb-2">No prompts found</h3>
                  <p className="text-gray-500">
                    {searchQuery 
                      ? `No prompts match "${searchQuery}" in ${getCurrentFolderName()}`
                      : selectedCategory !== 'All' || selectedFolderId
                      ? 'Try adjusting your search, filter, or folder selection'
                      : 'Start by adding your first AI prompt'
                    }
                  </p>
                </div>
              )}
            </div>
          </div>
        </main>

        <AddPromptModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onAdd={handleAddPrompt}
          categories={CATEGORIES.filter(cat => cat !== 'All')}
        />

        <ImportExportModal
          isOpen={isImportExportModalOpen}
          onClose={() => setIsImportExportModalOpen(false)}
          prompts={prompts}
          onImport={importPrompts}
        />
      </div>
    </ProtectedRoute>
  );
};

export default Index;
