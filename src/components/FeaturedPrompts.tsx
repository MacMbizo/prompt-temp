
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Crown, TrendingUp } from 'lucide-react';
import { Prompt } from '@/hooks/usePrompts';
import { PlatformBadge } from '@/components/PlatformBadge';

interface FeaturedPromptsProps {
  prompts: Prompt[];
}

export const FeaturedPrompts: React.FC<FeaturedPromptsProps> = ({ prompts }) => {
  const featuredPrompts = prompts
    .filter(prompt => prompt.is_featured)
    .slice(0, 3);

  if (featuredPrompts.length === 0) {
    return null;
  }

  return (
    <div className="mb-8">
      <div className="flex items-center mb-4">
        <Crown className="w-5 h-5 mr-2 text-yellow-500" />
        <h2 className="text-xl font-semibold">Featured Prompts</h2>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {featuredPrompts.map((prompt) => (
          <Card key={prompt.id} className="border-yellow-200 bg-gradient-to-br from-yellow-50 to-orange-50">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center">
                <Crown className="w-4 h-4 mr-2 text-yellow-500" />
                {prompt.title}
              </CardTitle>
              <div className="flex items-center space-x-2">
                <Badge variant="outline" className="text-xs">
                  {prompt.category}
                </Badge>
                {(prompt.usage_count || 0) > 0 && (
                  <Badge variant="secondary" className="text-xs">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    {prompt.usage_count} uses
                  </Badge>
                )}
              </div>
            </CardHeader>
            
            <CardContent>
              <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                {prompt.description || prompt.content}
              </p>
              
              {prompt.platforms && prompt.platforms.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {prompt.platforms.slice(0, 3).map((platform) => (
                    <PlatformBadge key={platform} platform={platform} size="sm" />
                  ))}
                  {prompt.platforms.length > 3 && (
                    <Badge variant="secondary" className="text-xs">
                      +{prompt.platforms.length - 3}
                    </Badge>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
