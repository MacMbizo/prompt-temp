
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Lightbulb, TrendingUp, Users, Star } from 'lucide-react';
import type { Prompt } from '@/hooks/usePrompts';

interface SmartRecommendationsProps {
  prompts: Prompt[];
  userActivity: {
    recentCategories: string[];
    recentPlatforms: string[];
    favoriteTypes: string[];
  };
  onPromptSelect: (prompt: Prompt) => void;
}

export const SmartRecommendations: React.FC<SmartRecommendationsProps> = ({
  prompts,
  userActivity,
  onPromptSelect
}) => {
  const [recommendations, setRecommendations] = useState<{
    trending: Prompt[];
    similar: Prompt[];
    highRated: Prompt[];
    suggested: Prompt[];
  }>({
    trending: [],
    similar: [],
    highRated: [],
    suggested: []
  });

  useEffect(() => {
    generateRecommendations();
  }, [prompts, userActivity]);

  const generateRecommendations = () => {
    // Trending prompts (high usage recently)
    const trending = prompts
      .filter(p => (p.usage_count || 0) > 10)
      .sort((a, b) => (b.usage_count || 0) - (a.usage_count || 0))
      .slice(0, 3);

    // Similar to user's recent activity
    const similar = prompts
      .filter(p => 
        userActivity.recentCategories.includes(p.category) ||
        (p.platforms || []).some(platform => userActivity.recentPlatforms.includes(platform))
      )
      .slice(0, 3);

    // High-rated prompts
    const highRated = prompts
      .filter(p => (p.average_rating || 0) >= 4.0 && (p.rating_count || 0) >= 3)
      .sort((a, b) => (b.average_rating || 0) - (a.average_rating || 0))
      .slice(0, 3);

    // AI-suggested (templates and community favorites)
    const suggested = prompts
      .filter(p => p.is_template || p.is_community)
      .sort((a, b) => (b.copy_count || 0) - (a.copy_count || 0))
      .slice(0, 3);

    setRecommendations({
      trending,
      similar,
      highRated,
      suggested
    });
  };

  const RecommendationSection = ({ 
    title, 
    icon, 
    prompts: sectionPrompts, 
    description 
  }: {
    title: string;
    icon: React.ReactNode;
    prompts: Prompt[];
    description: string;
  }) => (
    <div className="mb-6">
      <div className="flex items-center mb-3">
        {icon}
        <h4 className="font-medium ml-2">{title}</h4>
      </div>
      <p className="text-sm text-gray-600 mb-4">{description}</p>
      
      <div className="space-y-3">
        {sectionPrompts.map((prompt) => (
          <div
            key={prompt.id}
            className="p-3 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
            onClick={() => onPromptSelect(prompt)}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h5 className="font-medium text-sm line-clamp-1">{prompt.title}</h5>
                <p className="text-xs text-gray-600 line-clamp-2 mt-1">
                  {prompt.description}
                </p>
                <div className="flex items-center mt-2 space-x-2">
                  <Badge variant="outline" className="text-xs">
                    {prompt.category}
                  </Badge>
                  {prompt.average_rating && (
                    <div className="flex items-center">
                      <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                      <span className="text-xs ml-1">{prompt.average_rating.toFixed(1)}</span>
                    </div>
                  )}
                  {prompt.usage_count && prompt.usage_count > 0 && (
                    <div className="flex items-center">
                      <TrendingUp className="w-3 h-3 text-blue-500" />
                      <span className="text-xs ml-1">{prompt.usage_count}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
        
        {sectionPrompts.length === 0 && (
          <p className="text-sm text-gray-500 text-center py-4">
            No recommendations available yet
          </p>
        )}
      </div>
    </div>
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Lightbulb className="w-5 h-5 mr-2" />
          Smart Recommendations
        </CardTitle>
      </CardHeader>
      <CardContent className="max-h-96 overflow-y-auto">
        <RecommendationSection
          title="Trending Now"
          icon={<TrendingUp className="w-4 h-4 text-green-500" />}
          prompts={recommendations.trending}
          description="Popular prompts with high recent usage"
        />

        <RecommendationSection
          title="Similar to Your Activity"
          icon={<Users className="w-4 h-4 text-blue-500" />}
          prompts={recommendations.similar}
          description="Based on your recent categories and platforms"
        />

        <RecommendationSection
          title="Highly Rated"
          icon={<Star className="w-4 h-4 text-yellow-500" />}
          prompts={recommendations.highRated}
          description="Top-rated prompts by the community"
        />

        <RecommendationSection
          title="AI Suggested"
          icon={<Lightbulb className="w-4 h-4 text-purple-500" />}
          prompts={recommendations.suggested}
          description="Templates and community favorites"
        />
      </CardContent>
    </Card>
  );
};
