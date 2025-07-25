import { useState, useMemo } from 'react';
import { Header } from '@/components/Header';
import { AddPromptModal } from '@/components/AddPromptModal';
import { ImportExportModal } from '@/components/ImportExportModal';
import { FolderSidebar } from '@/components/FolderSidebar';
import { MainContentHeader } from '@/components/MainContent';
import { FilterSection } from '@/components/FilterSection';
import { PromptGrid } from '@/components/PromptGrid';
import { VirtualizedPromptGrid } from '@/components/VirtualizedPromptGrid';
import { PerformanceMonitor } from '@/components/PerformanceMonitor';
import { EmptyState } from '@/components/EmptyState';
import { usePrompts } from '@/hooks/usePrompts';
import type { Prompt } from '@/integrations/supabase/types';
import { useFolders } from '@/hooks/useFolders';
import { useOptimizedSearch } from '@/hooks/useOptimizedSearch';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { PlatformInsightsDashboard } from '@/components/PlatformInsightsDashboard';
import { PromptOptimizationSuggestions } from '@/components/PromptOptimizationSuggestions';
import { supabase } from '@/integrations/supabase/client';
import { FeaturedPrompts } from '@/components/FeaturedPrompts';

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
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isImportExportModalOpen, setIsImportExportModalOpen] = useState(false);
  const [useVirtualization, setUseVirtualization] = useState(false);

  // Pre-filter prompts before search optimization
  const preFilteredPrompts = useMemo(() => {
    let filtered = prompts;

    // Filter by folder first
    if (selectedFolder === 'uncategorized') {
      filtered = filtered.filter(prompt => !prompt.folder_id);
    } else if (selectedFolder && selectedFolder !== null) {
      filtered = filtered.filter(prompt => prompt.folder_id === selectedFolder);
    }

    // Filter by platforms
    if (selectedPlatforms.length > 0) {
      filtered = filtered.filter(prompt => 
        prompt.platforms && prompt.platforms.some(platform => selectedPlatforms.includes(platform))
      );
    }

    // Filter by category
    if (selectedCategory !== 'All') {
      filtered = filtered.filter(prompt => prompt.category === selectedCategory);
    }

    return filtered;
  }, [prompts, selectedCategory, selectedPlatforms, selectedFolder]);

  // Use optimized search
  const {
    searchQuery,
    setSearchQuery,
    filteredPrompts,
    isSearching,
    searchSuggestions,
    searchError,
    resultCount
  } = useOptimizedSearch({
    prompts: preFilteredPrompts,
    searchFields: ['title', 'description', 'content', 'tags', 'platforms'],
    debounceMs: 300
  });

  // Auto-enable virtualization for large datasets
  const shouldUseVirtualization = filteredPrompts.length > 50 || useVirtualization;

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
      folder_id: selectedFolder === 'uncategorized' ? null : selectedFolder
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
    if (selectedFolder === null) return 'All Prompts';
    if (selectedFolder === 'uncategorized') return 'Uncategorized';
    const folder = folders.find(f => f.id === selectedFolder);
    return folder ? folder.name : 'Unknown Folder';
  };

  const getSearchPlaceholder = () => {
    const folderName = getCurrentFolderName();
    if (selectedFolder === null) {
      return "Search all prompts, tags, or descriptions...";
    }
    return `Search in ${folderName}...`;
  };

  const getPromptCountText = () => {
    const totalInFolder = selectedFolder === null 
      ? prompts.length 
      : selectedFolder === 'uncategorized'
      ? prompts.filter(p => !p.folder_id).length
      : prompts.filter(p => p.folder_id === selectedFolder).length;
    
    if (searchQuery || selectedCategory !== 'All' || selectedPlatforms.length > 0) {
      return `Showing ${resultCount} of ${totalInFolder} prompts`;
    }
    return `${totalInFolder} prompts`;
  };

  const handleBulkPlatformUpdate = async (promptIds: string[], platforms: string[]) => {
    for (const promptId of promptIds) {
      const prompt = prompts.find(p => p.id === promptId);
      if (prompt) {
        // Merge new platforms with existing ones, avoiding duplicates
        const existingPlatforms = prompt.platforms || [];
        const updatedPlatforms = Array.from(new Set([...existingPlatforms, ...platforms]));
        
        try {
          const { error } = await supabase
            .from('prompts')
            .update({ platforms: updatedPlatforms })
            .eq('id', promptId);
            
          if (error) throw error;
        } catch (error) {
          console.error('Error updating prompt platforms:', error);
          throw error;
        }
      }
    }
    // Refresh prompts after bulk update
    refetch();
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
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100">
        <Header />
        
        <main className="container mx-auto px-4 py-8">
          <div className="flex gap-6">
            {/* Sidebar */}
            <div className="flex-shrink-0">
              <FolderSidebar 
                selectedFolderId={selectedFolder}
                onFolderSelect={setSelectedFolder}
              />
            </div>

            {/* Main Content */}
            <div className="flex-1">
              <MainContentHeader
                currentFolderName={getCurrentFolderName()}
                promptCountText={getPromptCountText()}
                prompts={prompts}
                availablePlatforms={AVAILABLE_PLATFORMS}
                onBulkPlatformUpdate={handleBulkPlatformUpdate}
                onImportExportClick={() => setIsImportExportModalOpen(true)}
                onAddPromptClick={() => setIsAddModalOpen(true)}
              />

              <FilterSection
                categories={CATEGORIES}
                selectedCategory={selectedCategory}
                onCategoryChange={setSelectedCategory}
                platforms={AVAILABLE_PLATFORMS}
                selectedPlatforms={selectedPlatforms}
                onPlatformToggle={handlePlatformToggle}
                onClearAllPlatforms={handleClearAllPlatforms}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                searchPlaceholder={getSearchPlaceholder()}
                prompts={preFilteredPrompts}
                isLoading={loading || isSearching}
                searchSuggestions={searchSuggestions}
                isSearching={isSearching}
                searchError={searchError}
                onSuggestionSelect={setSearchQuery}
              />

              {/* Performance toggle */}
              {filteredPrompts.length > 20 && (
                <div className="mb-4 flex items-center justify-between">
                  <div className="text-sm text-gray-600">
                    {filteredPrompts.length} prompts found
                    {isSearching && <span className="ml-2 text-blue-600">Searching...</span>}
                  </div>
                  <button
                    onClick={() => setUseVirtualization(!useVirtualization)}
                    className="text-sm text-blue-600 hover:underline"
                  >
                    {shouldUseVirtualization ? 'Disable' : 'Enable'} Virtualization
                  </button>
                </div>
              )}

              {/* Platform Insights Dashboard */}
              <div className="mb-8">
                <PlatformInsightsDashboard
                  prompts={preFilteredPrompts}
                  selectedPlatforms={selectedPlatforms}
                  isLoading={loading}
                  onPromptSelect={handlePromptSelect}
                />
              </div>

              {/* Platform Optimization Suggestions */}
              {filteredPrompts.length > 0 && selectedPlatforms.length > 0 && (
                <div className="mb-8">
                  <PromptOptimizationSuggestions
                    prompt={filteredPrompts[0]}
                    selectedPlatforms={selectedPlatforms}
                  />
                </div>
              )}

              {/* Prompt Grid - Virtualized or Regular */}
              {shouldUseVirtualization ? (
                <VirtualizedPromptGrid
                  prompts={filteredPrompts}
                  onDelete={deletePrompt}
                  onDuplicate={duplicatePrompt}
                  onUpdate={handlePromptUpdate}
                  height={600}
                />
              ) : (
                <PromptGrid
                  prompts={filteredPrompts}
                  onDelete={deletePrompt}
                  onDuplicate={duplicatePrompt}
                  onUpdate={handlePromptUpdate}
                />
              )}

              {/* Featured Prompts Section */}
              <FeaturedPrompts prompts={prompts} />

              {filteredPrompts.length === 0 && !loading && (
                <EmptyState
                  searchQuery={searchQuery}
                  currentFolderName={getCurrentFolderName()}
                  selectedCategory={selectedCategory}
                  selectedFolder={selectedFolder}
                />
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

        {/* Performance Monitor */}
        <PerformanceMonitor />
      </div>
    </ProtectedRoute>
  );
};

export default Index;
