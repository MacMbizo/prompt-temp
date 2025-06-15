
import React from 'react';
import { Header } from '@/components/Header';
import { AnalyticsDashboard } from '@/components/AnalyticsDashboard';
import { CommunityHub } from '@/components/CommunityHub';
import { SmartRecommendations } from '@/components/SmartRecommendations';
import { usePrompts } from '@/hooks/usePrompts';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { toast } from 'sonner';

const Analytics = () => {
  const { prompts, loading } = usePrompts();

  // Mock user activity data - in a real app, this would come from tracking
  const userActivity = {
    recentCategories: ['Writing & Content', 'Business & Marketing'],
    recentPlatforms: ['ChatGPT', 'Claude'],
    favoriteTypes: ['template', 'community']
  };

  const handlePromptSelect = (prompt: any) => {
    toast.success(`Selected: ${prompt.title}`);
    // In a real app, this might navigate to the prompt or open a modal
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg flex items-center justify-center mx-auto mb-4 animate-pulse">
            </div>
            <p className="text-gray-600">Loading analytics...</p>
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
          <div className="mb-8">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-2">
              Analytics & Insights
            </h1>
            <p className="text-gray-600 text-lg">
              Track your prompt performance and discover new opportunities
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Analytics Dashboard */}
            <div className="lg:col-span-2">
              <AnalyticsDashboard prompts={prompts} />
            </div>

            {/* Sidebar with Community and Recommendations */}
            <div className="space-y-6">
              <CommunityHub onPromptSelect={handlePromptSelect} />
              
              <SmartRecommendations
                prompts={prompts}
                userActivity={userActivity}
                onPromptSelect={handlePromptSelect}
              />
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
};

export default Analytics;
