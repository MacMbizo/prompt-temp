
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart3, Lightbulb, TrendingUp } from 'lucide-react';
import { PlatformAnalytics } from '@/components/PlatformAnalytics';
import { SmartRecommendations } from '@/components/SmartRecommendations';
import type { Prompt } from '@/hooks/usePrompts';

interface PlatformInsightsDashboardProps {
  prompts: Prompt[];
  selectedPlatforms: string[];
  isLoading?: boolean;
  onPromptSelect?: (prompt: Prompt) => void;
}

export const PlatformInsightsDashboard: React.FC<PlatformInsightsDashboardProps> = ({
  prompts,
  selectedPlatforms,
  isLoading = false,
  onPromptSelect
}) => {
  const [activeTab, setActiveTab] = useState('analytics');

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Platform Insights</CardTitle>
          <CardDescription>Loading platform analytics...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (prompts.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Platform Insights</CardTitle>
          <CardDescription>
            Add some prompts with platform assignments to see analytics and recommendations.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <TrendingUp className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-500">No data available yet</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <TrendingUp className="w-5 h-5 mr-2" />
          Platform Insights
        </CardTitle>
        <CardDescription>
          Analytics and smart recommendations based on your prompt collection
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="analytics" className="flex items-center">
              <BarChart3 className="w-4 h-4 mr-2" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="recommendations" className="flex items-center">
              <Lightbulb className="w-4 h-4 mr-2" />
              Recommendations
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="analytics" className="mt-6">
            <PlatformAnalytics 
              prompts={prompts} 
              selectedPlatforms={selectedPlatforms}
            />
          </TabsContent>
          
          <TabsContent value="recommendations" className="mt-6">
            <SmartRecommendations 
              prompts={prompts} 
              selectedPlatforms={selectedPlatforms}
              onPromptSelect={onPromptSelect}
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
