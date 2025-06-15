
import { useState, useMemo } from 'react';
import { Header } from '@/components/Header';
import { PromptCard } from '@/components/PromptCard';
import { AddPromptModal } from '@/components/AddPromptModal';
import { CategoryFilter } from '@/components/CategoryFilter';
import { SearchBar } from '@/components/SearchBar';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

export interface Prompt {
  id: string;
  title: string;
  description: string;
  content: string;
  category: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

const SAMPLE_PROMPTS: Prompt[] = [
  {
    id: '1',
    title: 'Creative Writing Assistant',
    description: 'Generate engaging story ideas and plot structures',
    content: 'You are a creative writing assistant. Help me develop a compelling story by suggesting plot twists, character development arcs, and engaging dialogue. Focus on creating vivid scenes and emotional depth.',
    category: 'Writing',
    tags: ['storytelling', 'fiction', 'creativity'],
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15')
  },
  {
    id: '2',
    title: 'Professional Image Generation',
    description: 'Create detailed prompts for business and professional imagery',
    content: 'Create a professional, high-quality photograph of [subject]. Studio lighting, clean background, sharp focus, commercial photography style. Shot with a professional camera, 85mm lens, f/2.8 aperture.',
    category: 'Image Generation',
    tags: ['photography', 'professional', 'business'],
    createdAt: new Date('2024-01-14'),
    updatedAt: new Date('2024-01-14')
  },
  {
    id: '3',
    title: 'Code Review Assistant',
    description: 'Thorough code analysis and improvement suggestions',
    content: 'You are an expert software engineer. Review the following code for best practices, potential bugs, performance issues, and security vulnerabilities. Provide specific suggestions for improvement with explanations.',
    category: 'Programming',
    tags: ['code review', 'debugging', 'best practices'],
    createdAt: new Date('2024-01-13'),
    updatedAt: new Date('2024-01-13')
  },
  {
    id: '4',
    title: 'Marketing Copy Generator',
    description: 'Persuasive marketing content for various platforms',
    content: 'Create compelling marketing copy that converts. Focus on benefits over features, use emotional triggers, include social proof, and end with a clear call-to-action. Adapt tone for the target audience.',
    category: 'Marketing',
    tags: ['copywriting', 'conversion', 'social media'],
    createdAt: new Date('2024-01-12'),
    updatedAt: new Date('2024-01-12')
  },
  {
    id: '5',
    title: 'Data Analysis Expert',
    description: 'Comprehensive data interpretation and insights',
    content: 'You are a data scientist. Analyze the provided dataset and identify key patterns, trends, and insights. Present findings in a clear, actionable format with visualizations and recommendations.',
    category: 'Data Science',
    tags: ['analytics', 'insights', 'visualization'],
    createdAt: new Date('2024-01-11'),
    updatedAt: new Date('2024-01-11')
  },
  {
    id: '6',
    title: 'Academic Research Helper',
    description: 'Structured approach to academic writing and research',
    content: 'Assist with academic research by providing structured analysis, proper citations, and clear argumentation. Focus on evidence-based conclusions and maintain academic integrity throughout.',
    category: 'Education',
    tags: ['research', 'academic', 'citations'],
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-10')
  }
];

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
  const [prompts, setPrompts] = useState<Prompt[]>(SAMPLE_PROMPTS);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const filteredPrompts = useMemo(() => {
    let filtered = prompts;

    if (selectedCategory !== 'All') {
      filtered = filtered.filter(prompt => prompt.category === selectedCategory);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(prompt =>
        prompt.title.toLowerCase().includes(query) ||
        prompt.description.toLowerCase().includes(query) ||
        prompt.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }

    return filtered.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
  }, [prompts, selectedCategory, searchQuery]);

  const handleAddPrompt = (newPrompt: Omit<Prompt, 'id' | 'createdAt' | 'updatedAt'>) => {
    const prompt: Prompt = {
      ...newPrompt,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    setPrompts(prev => [prompt, ...prev]);
  };

  const handleDeletePrompt = (id: string) => {
    setPrompts(prev => prev.filter(prompt => prompt.id !== id));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-6 mb-8">
          <div className="flex-1">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-2">
              AI Prompt Library
            </h1>
            <p className="text-gray-600 text-lg">
              Organize and manage your AI prompts by category and use case
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
              prompt={prompt}
              onDelete={handleDeletePrompt}
            />
          ))}
        </div>

        {filteredPrompts.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">📝</div>
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No prompts found</h3>
            <p className="text-gray-500">
              {searchQuery || selectedCategory !== 'All' 
                ? 'Try adjusting your search or filter criteria'
                : 'Start by adding your first AI prompt'
              }
            </p>
          </div>
        )}
      </main>

      <AddPromptModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={handleAddPrompt}
        categories={CATEGORIES.filter(cat => cat !== 'All')}
      />
    </div>
  );
};

export default Index;
