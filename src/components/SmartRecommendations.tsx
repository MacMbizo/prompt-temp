
import React, { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Lightbulb, ArrowRight, Star, Copy } from 'lucide-react';
import { PlatformBadge } from '@/components/PlatformBadge';
import type { Prompt } from '@/hooks/usePrompts';

interface SmartRecommendationsProps {
  prompts: Prompt[];
  selectedPlatforms: string[];
  onPromptSelect?: (prompt: Prompt) => void;
}

interface RecommendationGroup {
  title: string;
  description: string;
  prompts: Prompt[];
  reason: string;
}

export const SmartRecommendations: React.FC<SmartRecommendationsProps> = ({
  prompts,
  selectedPlatforms,
  onPromptSelect
}) => {
  const recommendations = useMemo(() => {
    const groups: RecommendationGroup[] = [];

    if (selectedPlatforms.length === 0) {
      // Show popular prompts when no platforms selected
      const popularPrompts = prompts
        .filter(p => (p.copy_count || 0) > 0)
        .sort((a, b) => (b.copy_count || 0) - (a.copy_count || 0))
        .slice(0, 3);

      if (popularPrompts.length > 0) {
        groups.push({
          title: "Most Popular Prompts",
          description: "These prompts are frequently used by other users",
          prompts: popularPrompts,
          reason: "Based on copy count"
        });
      }

      // Show highly rated prompts
      const topRated = prompts
        .filter(p => (p.average_rating || 0) >= 4 && (p.rating_count || 0) > 0)
        .sort((a, b) => (b.average_rating || 0) - (a.average_rating || 0))
        .slice(0, 3);

      if (topRated.length > 0) {
        groups.push({
          title: "Highly Rated Prompts",
          description: "Top-rated prompts from the community",
          prompts: topRated,
          reason: "4+ star rating"
        });
      }
    } else {
      // Platform-specific recommendations
      const platformCompatible = prompts.filter(prompt =>
        prompt.platforms?.some(platform => selectedPlatforms.includes(platform))
      );

      if (platformCompatible.length > 0) {
        // Sort by relevance (more matching platforms = higher relevance)
        const sortedByRelevance = platformCompatible
          .map(prompt => ({
            prompt,
            matchCount: prompt.platforms?.filter(p => selectedPlatforms.includes(p)).length || 0
          }))
          .sort((a, b) => b.matchCount - a.matchCount)
          .slice(0, 4)
          .map(item => item.prompt);

        groups.push({
          title: "Perfect Platform Match",
          description: `Prompts optimized for ${selectedPlatforms.join(', ')}`,
          prompts: sortedByRelevance,
          reason: "Platform compatibility"
        });
      }

      // Find prompts that work well with similar platforms
      const relatedPlatforms = getRelatedPlatforms(selectedPlatforms);
      const relatedPrompts = prompts
        .filter(prompt => 
          prompt.platforms?.some(platform => relatedPlatforms.includes(platform)) &&
          !prompt.platforms?.some(platform => selectedPlatforms.includes(platform))
        )
        .slice(0, 3);

      if (relatedPrompts.length > 0) {
        groups.push({
          title: "You Might Also Like",
          description: "Prompts for related platforms",
          prompts: relatedPrompts,
          reason: "Similar platform family"
        });
      }
    }

    // Template suggestions
    const templates = prompts
      .filter(p => p.is_template)
      .slice(0, 3);

    if (templates.length > 0) {
      groups.push({
        title: "Template Suggestions",
        description: "Reusable templates you can customize",
        prompts: templates,
        reason: "Template prompts"
      });
    }

    return groups;
  }, [prompts, selectedPlatforms]);

  const getRelatedPlatforms = (platforms: string[]): string[] => {
    const platformFamilies = {
      'ChatGPT': ['GPT-4', 'Claude', 'Gemini'],
      'GPT-4': ['ChatGPT', 'Claude', 'Gemini'],
      'Claude': ['ChatGPT', 'GPT-4', 'Gemini'],
      'Gemini': ['ChatGPT', 'GPT-4', 'Claude'],
      'Midjourney': ['DALL-E', 'Stable Diffusion'],
      'DALL-E': ['Midjourney', 'Stable Diffusion'],
      'Stable Diffusion': ['Midjourney', 'DALL-E'],
      'GitHub Copilot': ['Notion AI'],
      'Notion AI': ['GitHub Copilot'],
      'Perplexity': ['ChatGPT', 'Claude']
    };

    const related = new Set<string>();
    platforms.forEach(platform => {
      const family = platformFamilies[platform as keyof typeof platformFamilies];
      if (family) {
        family.forEach(p => related.add(p));
      }
    });

    return Array.from(related);
  };

  if (recommendations.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Lightbulb className="w-5 h-5 mr-2" />
            Smart Recommendations
          </CardTitle>
          <CardDescription>
            No recommendations available. Try adding more prompts or selecting platforms.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {recommendations.map((group, groupIndex) => (
        <Card key={groupIndex}>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Lightbulb className="w-5 h-5 mr-2" />
              {group.title}
            </CardTitle>
            <CardDescription>
              {group.description}
            </CardDescription>
            <Badge variant="outline" className="w-fit">
              {group.reason}
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {group.prompts.map((prompt) => (
                <div
                  key={prompt.id}
                  className="flex items-start justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex-1 space-y-2">
                    <div className="flex items-start justify-between">
                      <h4 className="font-medium text-sm">{prompt.title}</h4>
                      <div className="flex items-center space-x-2 ml-4">
                        {prompt.average_rating && prompt.average_rating > 0 && (
                          <div className="flex items-center text-xs text-gray-500">
                            <Star className="w-3 h-3 mr-1 fill-yellow-400 text-yellow-400" />
                            {prompt.average_rating}
                          </div>
                        )}
                        {prompt.copy_count && prompt.copy_count > 0 && (
                          <div className="flex items-center text-xs text-gray-500">
                            <Copy className="w-3 h-3 mr-1" />
                            {prompt.copy_count}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {prompt.description || prompt.content.slice(0, 100) + '...'}
                    </p>
                    
                    <div className="flex items-center space-x-2">
                      <Badge variant="secondary" className="text-xs">
                        {prompt.category}
                      </Badge>
                      <div className="flex space-x-1">
                        {prompt.platforms?.slice(0, 3).map((platform) => (
                          <PlatformBadge
                            key={platform}
                            platform={platform}
                            size="sm"
                            variant="outline"
                          />
                        ))}
                        {prompt.platforms && prompt.platforms.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{prompt.platforms.length - 3}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    className="ml-4"
                    onClick={() => onPromptSelect?.(prompt)}
                  >
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
