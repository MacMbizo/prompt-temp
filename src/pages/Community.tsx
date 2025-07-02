
import React, { useState } from 'react';
import { Header } from '@/components/Header';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { CommunityHub } from '@/components/CommunityHub';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Users, Star, TrendingUp, Award, Share, Plus } from 'lucide-react';
import { usePrompts } from '@/hooks/usePrompts';
import type { Prompt } from '@/integrations/supabase/types';
import { CommunitySubmissionModal } from '@/components/CommunitySubmissionModal';
import { toast } from 'sonner';

const Community = () => {
  const { prompts } = usePrompts();
  const [selectedPrompt, setSelectedPrompt] = useState<Prompt | null>(null);
  const [isSubmissionModalOpen, setIsSubmissionModalOpen] = useState(false);

  const handlePromptSelect = (prompt: Prompt) => {
    // Create a copy of the prompt for the user
    const promptCopy = {
      ...prompt,
      id: `copy-${Date.now()}`, // Generate new ID for the copy
      title: `${prompt.title} (Community Copy)`,
      is_community: false, // Mark as personal copy
      user_id: '' // Will be set to current user
    };
    
    toast.success(`"${prompt.title}" has been copied to your prompts!`);
    console.log('Copied prompt:', promptCopy);
  };

  const handleContributePrompt = (prompt: Prompt) => {
    setSelectedPrompt(prompt);
    setIsSubmissionModalOpen(true);
  };

  const userPrompts = prompts.filter(p => !p.is_community);
  const featuredPrompts = prompts.filter(p => p.is_community && p.is_featured);

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100">
        <Header />
        
        <main className="container mx-auto px-4 py-8">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-4">
              Community Hub
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              Discover, share, and collaborate on the best AI prompts with our global community of creators
            </p>
            <div className="flex justify-center gap-4 text-sm text-gray-500">
              <div className="flex items-center">
                <Users className="w-4 h-4 mr-1" />
                <span>10,000+ Members</span>
              </div>
              <div className="flex items-center">
                <Star className="w-4 h-4 mr-1" />
                <span>5,000+ Prompts</span>
              </div>
              <div className="flex items-center">
                <TrendingUp className="w-4 h-4 mr-1" />
                <span>Growing Daily</span>
              </div>
            </div>
          </div>

          <Tabs defaultValue="discover" className="space-y-8">
            <TabsList className="grid w-full grid-cols-3 max-w-md mx-auto">
              <TabsTrigger value="discover">Discover</TabsTrigger>
              <TabsTrigger value="contribute">Contribute</TabsTrigger>
              <TabsTrigger value="featured">Featured</TabsTrigger>
            </TabsList>

            {/* Discover Tab */}
            <TabsContent value="discover">
              <CommunityHub onPromptSelect={handlePromptSelect} />
            </TabsContent>

            {/* Contribute Tab */}
            <TabsContent value="contribute">
              <div className="grid gap-8">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Share className="w-5 h-5 mr-2" />
                      Share Your Prompts
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-6">
                      <h3 className="font-semibold text-purple-900 mb-2">Why Contribute?</h3>
                      <ul className="text-purple-800 space-y-2 text-sm">
                        <li>• Help others solve problems with effective prompts</li>
                        <li>• Build your reputation in the AI community</li>
                        <li>• Get feedback and improvements from other users</li>
                        <li>• Discover new use cases for your prompts</li>
                      </ul>
                    </div>

                    {userPrompts.length > 0 ? (
                      <div>
                        <h3 className="font-medium mb-4">Your Prompts Available for Contribution</h3>
                        <div className="grid gap-4 max-h-96 overflow-y-auto">
                          {userPrompts.map((prompt) => (
                            <div
                              key={prompt.id}
                              className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                            >
                              <div className="flex-1">
                                <h4 className="font-medium text-sm">{prompt.title}</h4>
                                <p className="text-xs text-gray-600 mt-1 line-clamp-1">
                                  {prompt.description}
                                </p>
                                <div className="flex items-center gap-2 mt-2">
                                  <Badge variant="outline" className="text-xs">
                                    {prompt.category}
                                  </Badge>
                                  {prompt.platforms && prompt.platforms.map(platform => (
                                    <Badge key={platform} variant="secondary" className="text-xs">
                                      {platform}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                              <Button
                                onClick={() => handleContributePrompt(prompt)}
                                size="sm"
                                className="ml-4"
                              >
                                <Plus className="w-4 h-4 mr-1" />
                                Contribute
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Users className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                        <p className="text-gray-500">Create some prompts first to contribute to the community!</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Featured Tab */}
            <TabsContent value="featured">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Award className="w-5 h-5 mr-2" />
                    Featured Community Prompts
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {featuredPrompts.length > 0 ? (
                    <div className="grid gap-4">
                      {featuredPrompts.map((prompt) => (
                        <div
                          key={prompt.id}
                          className="p-6 border-2 border-yellow-200 bg-yellow-50 rounded-lg cursor-pointer hover:bg-yellow-100 transition-colors"
                          onClick={() => handlePromptSelect(prompt)}
                        >
                          <div className="flex items-start justify-between mb-3">
                            <h3 className="font-semibold text-yellow-900">{prompt.title}</h3>
                            <Badge className="bg-yellow-500 text-white">Featured</Badge>
                          </div>
                          <p className="text-yellow-800 text-sm mb-3">{prompt.description}</p>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline">{prompt.category}</Badge>
                              {prompt.average_rating && (
                                <div className="flex items-center">
                                  <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                                  <span className="text-xs ml-1">{prompt.average_rating.toFixed(1)}</span>
                                </div>
                              )}
                            </div>
                            <Button size="sm" variant="outline">
                              Use This Prompt
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Award className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                      <p className="text-gray-500">No featured prompts available yet.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>

        {/* Community Submission Modal */}
        {selectedPrompt && (
          <CommunitySubmissionModal
            isOpen={isSubmissionModalOpen}
            onClose={() => {
              setIsSubmissionModalOpen(false);
              setSelectedPrompt(null);
            }}
            prompt={selectedPrompt}
          />
        )}
      </div>
    </ProtectedRoute>
  );
};

export default Community;
