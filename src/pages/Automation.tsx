
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Brain, Zap, Settings, Sparkles } from 'lucide-react';
import { Header } from '@/components/Header';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { IntelligentPromptSuggestions } from '@/components/IntelligentPromptSuggestions';
import { AutomatedOptimizationSuggestions } from '@/components/AutomatedOptimizationSuggestions';
import { SmartCategorizationSuggestions } from '@/components/SmartCategorizationSuggestions';
import { usePrompts, type Prompt } from '@/hooks/usePrompts';
import { toast } from 'sonner';

const Automation = () => {
  const { prompts, addPrompt, updatePrompt } = usePrompts();
  const [selectedPromptForOptimization, setSelectedPromptForOptimization] = useState<Prompt | null>(
    prompts.length > 0 ? prompts[0] : null
  );
  const [activeTab, setActiveTab] = useState('suggestions');

  // Update selected prompt when prompts change
  React.useEffect(() => {
    if (!selectedPromptForOptimization && prompts.length > 0) {
      setSelectedPromptForOptimization(prompts[0]);
    }
  }, [prompts, selectedPromptForOptimization]);

  const handleCreateSuggestion = async (suggestion: Partial<Prompt>) => {
    try {
      await addPrompt({
        title: suggestion.title || 'AI Suggested Prompt',
        description: suggestion.description || '',
        content: suggestion.content || '',
        category: suggestion.category || 'System Prompts',
        tags: suggestion.tags || [],
        platforms: suggestion.platforms || [],
        variables: []
      });
      toast.success('AI suggestion added to your prompts!');
    } catch (error) {
      console.error('Error adding suggestion:', error);
      toast.error('Failed to add suggestion');
    }
  };

  const handleApplyOptimization = async (optimizedPrompt: Partial<Prompt>) => {
    if (!selectedPromptForOptimization) return;
    
    try {
      await updatePrompt(selectedPromptForOptimization.id, optimizedPrompt);
      toast.success('Optimization applied successfully!');
      
      // Update the selected prompt with the changes
      setSelectedPromptForOptimization(prev => 
        prev ? { ...prev, ...optimizedPrompt } : null
      );
    } catch (error) {
      console.error('Error applying optimization:', error);
      toast.error('Failed to apply optimization');
    }
  };

  const handleApplyCategorization = async (promptId: string, updates: Partial<Prompt>) => {
    try {
      await updatePrompt(promptId, updates);
      toast.success('Categorization updated successfully!');
    } catch (error) {
      console.error('Error updating categorization:', error);
      toast.error('Failed to update categorization');
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100">
        <Header />
        
        <main className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-2">
              AI Automation Hub
            </h1>
            <p className="text-gray-600 text-lg">
              Let AI help you improve, categorize, and optimize your prompts automatically
            </p>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="suggestions" className="flex items-center">
                <Brain className="w-4 h-4 mr-2" />
                Intelligent Suggestions
              </TabsTrigger>
              <TabsTrigger value="optimization" className="flex items-center">
                <Zap className="w-4 h-4 mr-2" />
                Optimization
              </TabsTrigger>
              <TabsTrigger value="categorization" className="flex items-center">
                <Settings className="w-4 h-4 mr-2" />
                Smart Categorization
              </TabsTrigger>
            </TabsList>

            <TabsContent value="suggestions" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Sparkles className="w-5 h-5 mr-2" />
                    AI-Powered Prompt Suggestions
                  </CardTitle>
                  <p className="text-sm text-gray-600">
                    Get intelligent suggestions for new prompts based on your existing collection and trending patterns.
                  </p>
                </CardHeader>
              </Card>
              
              <IntelligentPromptSuggestions
                userPrompts={prompts}
                onCreateSuggestion={handleCreateSuggestion}
              />
            </TabsContent>

            <TabsContent value="optimization" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Zap className="w-5 h-5 mr-2" />
                    Automated Prompt Optimization
                  </CardTitle>
                  <p className="text-sm text-gray-600">
                    Analyze your prompts for potential improvements in structure, clarity, and effectiveness.
                  </p>
                </CardHeader>
                <CardContent>
                  {prompts.length > 0 ? (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Select a prompt to optimize:
                        </label>
                        <select
                          value={selectedPromptForOptimization?.id || ''}
                          onChange={(e) => {
                            const prompt = prompts.find(p => p.id === e.target.value);
                            setSelectedPromptForOptimization(prompt || null);
                          }}
                          className="w-full p-2 border rounded-md"
                        >
                          {prompts.map(prompt => (
                            <option key={prompt.id} value={prompt.id}>
                              {prompt.title}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-500">Add some prompts to start getting optimization suggestions.</p>
                  )}
                </CardContent>
              </Card>

              {selectedPromptForOptimization && (
                <AutomatedOptimizationSuggestions
                  prompt={selectedPromptForOptimization}
                  onApplyOptimization={handleApplyOptimization}
                />
              )}
            </TabsContent>

            <TabsContent value="categorization" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Settings className="w-5 h-5 mr-2" />
                    Smart Categorization Assistant
                  </CardTitle>
                  <p className="text-sm text-gray-600">
                    Let AI analyze and suggest better categories, tags, and platform assignments for your prompts.
                  </p>
                </CardHeader>
              </Card>
              
              <SmartCategorizationSuggestions
                prompts={prompts}
                onApplyCategorization={handleApplyCategorization}
              />
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </ProtectedRoute>
  );
};

export default Automation;
