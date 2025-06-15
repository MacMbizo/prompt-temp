
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Crown, TrendingUp } from 'lucide-react';
import type { Prompt } from '@/hooks/usePrompts';

interface PromptCardBadgesProps {
  prompt: Prompt;
}

export const PromptCardBadges: React.FC<PromptCardBadgesProps> = ({ prompt }) => {
  const getQualityBadge = () => {
    const rating = prompt.average_rating || 0;
    const count = prompt.rating_count || 0;
    
    if (count < 3) return null;
    
    if (rating >= 4.5) return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">⭐ Premium</Badge>;
    if (rating >= 4.0) return <Badge variant="secondary" className="bg-green-100 text-green-800">✓ Verified</Badge>;
    if (rating >= 3.5) return <Badge variant="secondary" className="bg-blue-100 text-blue-800">👍 Good</Badge>;
    
    return null;
  };

  const getUsageBadge = () => {
    const usage = prompt.usage_count || 0;
    if (usage >= 100) return <Badge variant="secondary" className="bg-purple-100 text-purple-800"><TrendingUp className="w-3 h-3 mr-1" />Popular</Badge>;
    if (usage >= 50) return <Badge variant="secondary" className="bg-blue-100 text-blue-800"><TrendingUp className="w-3 h-3 mr-1" />Trending</Badge>;
    return null;
  };

  return (
    <div className="flex items-center justify-between">
      <Badge variant="outline" className="text-xs">
        {prompt.category}
      </Badge>
      <div className="flex items-center space-x-1">
        {prompt.is_featured && (
          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 text-xs">
            <Crown className="w-3 h-3 mr-1" />
            Featured
          </Badge>
        )}
        {getQualityBadge()}
        {getUsageBadge()}
      </div>
    </div>
  );
};
