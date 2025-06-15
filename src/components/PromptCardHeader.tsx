
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { CardTitle } from '@/components/ui/card';
import { Crown, Users } from 'lucide-react';
import type { Prompt } from '@/hooks/usePrompts';

interface PromptCardHeaderProps {
  prompt: Prompt;
  onViewPrompt: () => void;
}

export const PromptCardHeader: React.FC<PromptCardHeaderProps> = ({ prompt, onViewPrompt }) => {
  return (
    <CardTitle 
      className="text-lg font-semibold text-gray-800 line-clamp-2 cursor-pointer hover:text-purple-600 transition-colors flex items-center"
      onClick={onViewPrompt}
    >
      {prompt.is_featured && (
        <Crown className="w-4 h-4 mr-2 text-yellow-500" />
      )}
      {prompt.title}
      {prompt.is_community && (
        <Badge variant="outline" className="ml-2 text-xs">
          <Users className="w-3 h-3 mr-1" />
          Community
        </Badge>
      )}
    </CardTitle>
  );
};
