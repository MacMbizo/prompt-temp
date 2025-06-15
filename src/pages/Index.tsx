
import { useState, useMemo } from 'react';
import { Header } from '@/components/Header';
import { PromptCard } from '@/components/PromptCard';
import { AddPromptModal } from '@/components/AddPromptModal';
import { CategoryFilter } from '@/components/CategoryFilter';
import { SearchBar } from '@/components/SearchBar';
import { FolderSidebar } from '@/components/FolderSidebar';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { usePrompts } from '@/hooks/usePrompts';
import { useFolders } from '@/hooks/useFolders';
import { ProtectedRoute } from '@/components/ProtectedRoute';

const CATEGORIES = [
  'All',
  'Writing',
  'Image Generation',
  'Programming',
  'Marketing',
  'Data Science',
  'Education',
  'Business',
  'Creative'
];

const Index = () => {
  const { prompts, loading, addPrompt, deletePrompt } = usePrompts();
  const { folders } = useFolders();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const filteredPrompts = useMemo(() => {
    let filtered = prompts;

    // Filter by folder
    if (selectedFolderId === 'uncategorized') {
      filtered = filtered.filter(prompt => !prompt.folder_id);
    } else if (selectedFolderId && selectedFolderId !== null) {
      filtered = filtered.filter(prompt => prompt.folder_id === selectedFolderId);
    }

    // Filter by category
    if (selectedCategory !== 'All') {
      filtered = filtered.filter(prompt => prompt.category === selectedCategory);
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(prompt =>
        prompt.title.toLowerCase().includes(query) ||
        prompt.description.toLowerCase().includes(query) ||
        prompt.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }

    return filtered;
  }, [prompts, selectedCategory, selectedFolderId, searchQuery]);

  const handleAddPrompt = (newPrompt: any) => {
    // Add folder_id to the prompt if a folder is selected
    const promptWithFolder = {
      ...newPrompt,
      folder_id: selectedFolderId === 'uncategorized' ? null : selectedFolderId
    };
    addPrompt(promptWithFolder);
    setIsAddModalOpen(false);
  };

  const getCurrentFolderName = () => {
    if (selectedFolderId === null) return 'All Prompts';
    if (selectedFolderId === 'uncategorized') return 'Uncategorized';
    const folder = folders.find(f => f.id === selectedFolderId);
    return folder ? folder.name : 'Unknown Folder';
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
                </div>
                
                <div className="flex items-center gap-4">
                  <Button
                    onClick={() => setIsAddModalOpen(true)}
                    className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-6 py-2 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Prompt
                  </Button>
                </div>
              </div>

              <div className="flex flex-col lg:flex-row gap-6 mb-8">
                <div className="lg:w-1/4">
                  <CategoryFilter
                    categories={CATEGORIES}
                    selectedCategory={selectedCategory}
                    onCategoryChange={setSelectedCategory}
                  />
                </div>
                
                <div className="lg:w-3/4">
                  <SearchBar
                    searchQuery={searchQuery}
                    onSearchChange={setSearchQuery}
                    placeholder="Search prompts, tags, or descriptions..."
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
                    onDelete={deletePrompt}
                  />
                ))}
              </div>

              {filteredPrompts.length === 0 && !loading && (
                <div className="text-center py-12">
                  <div className="text-gray-400 text-6xl mb-4">📝</div>
                  <h3 className="text-xl font-semibold text-gray-600 mb-2">No prompts found</h3>
                  <p className="text-gray-500">
                    {searchQuery || selectedCategory !== 'All' || selectedFolderId
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
      </div>
    </ProtectedRoute>
  );
};

export default Index;
