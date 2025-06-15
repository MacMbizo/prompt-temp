
import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star, Copy, TrendingUp } from 'lucide-react';
import { PlatformBadge } from '@/components/PlatformBadge';
import type { Prompt } from '@/hooks/usePrompts';

interface TopPerformingPromptsProps {
  prompts: Prompt[];
  onPromptSelect?: (prompt: Prompt) => void;
}

export const TopPerformingPrompts: React.FC<TopPerformingPromptsProps> = ({ 
  prompts, 
  onPromptSelect 
}) => {
  const topPrompts = useMemo(() => {
    return prompts
      .filter(p => (p.copy_count || 0) > 0 || (p.average_rating || 0) > 0)
      .sort((a, b) => {
        const scoreA = (a.copy_count || 0) * 0.7 + (a.average_rating || 0) * 0.3;
        const scoreB = (b.copy_count || 0) * 0.7 + (b.average_rating || 0) * 0.3;
        return scoreB - scoreA;
      })
      .slice(0, 5);
  }, [prompts]);

  if (topPrompts.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <TrendingUp className="w-5 h-5 mr-2" />
            Top Performing Prompts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <TrendingUp className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-500">No performance data available yet</p>
            <p className="text-sm text-gray-400 mt-2">
              Start using your prompts to see performance metrics
            </p>
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
          Top Performing Prompts
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {topPrompts.map((prompt, index) => (
            <div 
              key={prompt.id}
              className={`p-4 rounded-lg border transition-colors ${
                onPromptSelect ? 'cursor-pointer hover:bg-gray-50' : ''
              }`}
              onClick={() => onPromptSelect?.(prompt)}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-gray-500">#{index + 1}</span>
                  <h4 className="font-medium text-gray-900 truncate">{prompt.title}</h4>
                </div>
                <div className="flex items-center space-x-2">
                  {prompt.copy_count && prompt.copy_count > 0 && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Copy className="w-3 h-3 mr-1" />
                      {prompt.copy_count}
                    </div>
                  )}
                  {prompt.average_rating && prompt.average_rating > 0 && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Star className="w-3 h-3 mr-1 fill-current text-yellow-500" />
                      {prompt.average_rating.toFixed(1)}
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Badge variant="secondary" className="text-xs">
                    {prompt.category}
                  </Badge>
                  {prompt.platforms && prompt.platforms.length > 0 && (
                    <PlatformBadge platform={prompt.platforms[0]} size="sm" />
                  )}
                </div>
                
                {prompt.description && (
                  <p className="text-xs text-gray-500 truncate max-w-xs">
                    {prompt.description}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
