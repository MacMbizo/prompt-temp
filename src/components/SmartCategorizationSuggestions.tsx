
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FolderOpen, Tag, Brain, Sparkles } from 'lucide-react';
import type { Prompt } from '@/hooks/usePrompts';

interface SmartCategorizationSuggestionsProps {
  prompts: Prompt[];
  onApplyCategorization: (promptId: string, updates: Partial<Prompt>) => void;
}

interface CategorizationSuggestion {
  id: string;
  promptId: string;
  promptTitle: string;
  type: 'category' | 'tags' | 'platforms' | 'folder';
  currentValue: string | string[];
  suggestedValue: string | string[];
  reasoning: string;
  confidence: number;
}

const CATEGORY_PATTERNS = {
  'Writing & Content': [
    'write', 'content', 'article', 'blog', 'copy', 'email', 'letter', 'story', 'narrative', 'text'
  ],
  'Programming & Development': [
    'code', 'function', 'script', 'debug', 'program', 'software', 'api', 'algorithm', 'database'
  ],
  'System Prompts': [
    'you are', 'act as', 'role', 'persona', 'assistant', 'expert', 'professional', 'specialist'
  ],
  'Data Science & Analytics': [
    'data', 'analysis', 'statistics', 'metrics', 'dashboard', 'visualization', 'insights', 'trends'
  ],
  'Image Generation': [
    'image', 'picture', 'visual', 'art', 'design', 'illustration', 'photo', 'graphic', 'style'
  ],
  'Marketing & Sales': [
    'marketing', 'sales', 'customer', 'campaign', 'brand', 'advertising', 'promotion', 'lead'
  ],
  'Business Strategy': [
    'strategy', 'business', 'plan', 'growth', 'market', 'competitive', 'analysis', 'revenue'
  ],
  'Education & Learning': [
    'teach', 'learn', 'explain', 'tutorial', 'lesson', 'course', 'education', 'training'
  ],
  'Research & Analysis': [
    'research', 'study', 'investigate', 'analyze', 'evaluate', 'assess', 'review', 'examine'
  ]
};

const PLATFORM_PATTERNS = {
  'ChatGPT': ['conversation', 'chat', 'dialogue', 'interactive', 'general purpose'],
  'Claude': ['analysis', 'reasoning', 'long form', 'detailed', 'thoughtful'],
  'Gemini': ['multimodal', 'google', 'search', 'real-time', 'integration'],
  'GPT-4': ['complex', 'advanced', 'reasoning', 'analysis', 'professional'],
  'Midjourney': ['art', 'artistic', 'creative', 'visual', 'aesthetic', 'style'],
  'DALL-E': ['image', 'picture', 'visual', 'generate', 'create', 'design'],
  'Stable Diffusion': ['image', 'art', 'creative', 'custom', 'fine-tuned'],
  'Perplexity': ['research', 'search', 'information', 'facts', 'current'],
  'GitHub Copilot': ['code', 'programming', 'development', 'function', 'script'],
  'Notion AI': ['document', 'note', 'organization', 'writing', 'productivity']
};

export const SmartCategorizationSuggestions: React.FC<SmartCategorizationSuggestionsProps> = ({
  prompts,
  onApplyCategorization
}) => {
  const [suggestions, setSuggestions] = useState<CategorizationSuggestion[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    analyzeCategorization();
  }, [prompts]);

  const analyzeCategorization = async () => {
    setLoading(true);
    
    const newSuggestions: CategorizationSuggestion[] = [];

    prompts.forEach(prompt => {
      // Analyze category
      const categorySuggestion = analyzeCategoryMatch(prompt);
      if (categorySuggestion) {
        newSuggestions.push(categorySuggestion);
      }

      // Analyze tags
      const tagSuggestions = analyzeTagSuggestions(prompt);
      newSuggestions.push(...tagSuggestions);

      // Analyze platform recommendations
      const platformSuggestions = analyzePlatformRecommendations(prompt);
      newSuggestions.push(...platformSuggestions);
    });

    // Sort by confidence and limit results
    const sortedSuggestions = newSuggestions
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, 10);

    setSuggestions(sortedSuggestions);
    setLoading(false);
  };

  const analyzeCategoryMatch = (prompt: Prompt): CategorizationSuggestion | null => {
    const content = `${prompt.title} ${prompt.description} ${prompt.prompt_text}`.toLowerCase();
    
    let bestMatch = '';
    let bestScore = 0;
    let matchedWords: string[] = [];

    Object.entries(CATEGORY_PATTERNS).forEach(([category, patterns]) => {
      const matches = patterns.filter(pattern => content.includes(pattern));
      const score = matches.length / patterns.length;
      
      if (score > bestScore && score > 0.1 && category !== prompt.category) {
        bestMatch = category;
        bestScore = score;
        matchedWords = matches;
      }
    });

    if (bestMatch && bestScore > 0.2) {
      return {
        id: `category-${prompt.id}`,
        promptId: prompt.id,
        promptTitle: prompt.title,
        type: 'category',
        currentValue: prompt.category,
        suggestedValue: bestMatch,
        reasoning: `Content matches "${bestMatch}" patterns: ${matchedWords.slice(0, 3).join(', ')}`,
        confidence: Math.min(bestScore * 2, 0.95)
      };
    }

    return null;
  };

  const analyzeTagSuggestions = (prompt: Prompt): CategorizationSuggestion[] => {
    const suggestions: CategorizationSuggestion[] = [];
    const content = `${prompt.title} ${prompt.description} ${prompt.prompt_text}`.toLowerCase();
    const currentTags = prompt.tags || [];
    
    // Extract potential tags from content
    const suggestedTags: string[] = [];
    
    // Technical terms
    const techTerms = ['api', 'json', 'html', 'css', 'javascript', 'python', 'sql', 'react', 'node'];
    techTerms.forEach(term => {
      if (content.includes(term) && !currentTags.includes(term)) {
        suggestedTags.push(term);
      }
    });

    // Business terms
    const businessTerms = ['strategy', 'marketing', 'sales', 'customer', 'revenue', 'growth', 'analysis'];
    businessTerms.forEach(term => {
      if (content.includes(term) && !currentTags.includes(term)) {
        suggestedTags.push(term);
      }
    });

    // Creative terms
    const creativeTerms = ['creative', 'design', 'art', 'visual', 'story', 'narrative', 'style'];
    creativeTerms.forEach(term => {
      if (content.includes(term) && !currentTags.includes(term)) {
        suggestedTags.push(term);
      }
    });

    // Complexity indicators
    if (content.includes('step by step') || content.includes('detailed') || content.includes('comprehensive')) {
      if (!currentTags.includes('detailed')) suggestedTags.push('detailed');
    }
    if (content.includes('quick') || content.includes('brief') || content.includes('simple')) {
      if (!currentTags.includes('quick')) suggestedTags.push('quick');
    }
    if (content.includes('template') || content.includes('framework') || content.includes('structure')) {
      if (!currentTags.includes('template')) suggestedTags.push('template');
    }

    if (suggestedTags.length > 0) {
      suggestions.push({
        id: `tags-${prompt.id}`,
        promptId: prompt.id,
        promptTitle: prompt.title,
        type: 'tags',
        currentValue: currentTags,
        suggestedValue: [...currentTags, ...suggestedTags.slice(0, 3)],
        reasoning: `Found relevant terms: ${suggestedTags.slice(0, 3).join(', ')}`,
        confidence: Math.min(suggestedTags.length * 0.2, 0.8)
      });
    }

    return suggestions;
  };

  const analyzePlatformRecommendations = (prompt: Prompt): CategorizationSuggestion[] => {
    const suggestions: CategorizationSuggestion[] = [];
    const content = `${prompt.title} ${prompt.description} ${prompt.prompt_text}`.toLowerCase();
    const currentPlatforms = prompt.platforms || [];
    
    const recommendedPlatforms: string[] = [];
    
    Object.entries(PLATFORM_PATTERNS).forEach(([platform, patterns]) => {
      if (!currentPlatforms.includes(platform)) {
        const matches = patterns.filter(pattern => content.includes(pattern));
        if (matches.length > 0) {
          recommendedPlatforms.push(platform);
        }
      }
    });

    // Content-based recommendations
    if (content.includes('image') || content.includes('visual') || content.includes('art')) {
      ['Midjourney', 'DALL-E', 'Stable Diffusion'].forEach(platform => {
        if (!currentPlatforms.includes(platform) && !recommendedPlatforms.includes(platform)) {
          recommendedPlatforms.push(platform);
        }
      });
    }

    if (content.includes('code') || content.includes('programming') || content.includes('function')) {
      if (!currentPlatforms.includes('GitHub Copilot') && !recommendedPlatforms.includes('GitHub Copilot')) {
        recommendedPlatforms.push('GitHub Copilot');
      }
    }

    if (content.includes('research') || content.includes('current') || content.includes('latest')) {
      if (!currentPlatforms.includes('Perplexity') && !recommendedPlatforms.includes('Perplexity')) {
        recommendedPlatforms.push('Perplexity');
      }
    }

    if (recommendedPlatforms.length > 0) {
      suggestions.push({
        id: `platforms-${prompt.id}`,
        promptId: prompt.id,
        promptTitle: prompt.title,
        type: 'platforms',
        currentValue: currentPlatforms,
        suggestedValue: [...currentPlatforms, ...recommendedPlatforms.slice(0, 2)],
        reasoning: `Content suggests compatibility with: ${recommendedPlatforms.slice(0, 2).join(', ')}`,
        confidence: Math.min(recommendedPlatforms.length * 0.25, 0.85)
      });
    }

    return suggestions;
  };

  const applySuggestion = (suggestion: CategorizationSuggestion) => {
    const updates: Partial<Prompt> = {};
    
    switch (suggestion.type) {
      case 'category':
        updates.category = suggestion.suggestedValue as string;
        break;
      case 'tags':
        updates.tags = suggestion.suggestedValue as string[];
        break;
      case 'platforms':
        updates.platforms = suggestion.suggestedValue as string[];
        break;
    }

    onApplyCategorization(suggestion.promptId, updates);
  };

  const getSuggestionIcon = (type: string) => {
    switch (type) {
      case 'category': return <FolderOpen className="w-4 h-4" />;
      case 'tags': return <Tag className="w-4 h-4" />;
      case 'platforms': return <Sparkles className="w-4 h-4" />;
      default: return <Brain className="w-4 h-4" />;
    }
  };

  const getSuggestionColor = (type: string) => {
    switch (type) {
      case 'category': return 'bg-blue-100 text-blue-800';
      case 'tags': return 'bg-green-100 text-green-800';
      case 'platforms': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Brain className="w-5 h-5 mr-2" />
            Smart Categorization
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="animate-pulse">Analyzing prompt categorization...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center">
            <Brain className="w-5 h-5 mr-2" />
            Smart Categorization
          </div>
          <Button
            onClick={analyzeCategorization}
            variant="outline"
            size="sm"
          >
            Refresh
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {suggestions.map((suggestion) => (
            <div
              key={suggestion.id}
              className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center space-x-2">
                  {getSuggestionIcon(suggestion.type)}
                  <h4 className="font-medium text-sm">{suggestion.promptTitle}</h4>
                  <Badge className={`text-xs ${getSuggestionColor(suggestion.type)}`}>
                    {suggestion.type}
                  </Badge>
                </div>
                <div className="text-xs text-gray-500">
                  {Math.round(suggestion.confidence * 100)}% confidence
                </div>
              </div>
              
              <div className="space-y-2 text-xs">
                <div>
                  <span className="font-medium">Current:</span> {
                    Array.isArray(suggestion.currentValue) 
                      ? suggestion.currentValue.join(', ') || 'None'
                      : suggestion.currentValue || 'None'
                  }
                </div>
                <div>
                  <span className="font-medium">Suggested:</span> {
                    Array.isArray(suggestion.suggestedValue)
                      ? suggestion.suggestedValue.join(', ')
                      : suggestion.suggestedValue
                  }
                </div>
                <div className="text-gray-600">
                  <span className="font-medium">Reasoning:</span> {suggestion.reasoning}
                </div>
              </div>
              
              <div className="flex justify-end mt-3">
                <Button
                  size="sm"
                  onClick={() => applySuggestion(suggestion)}
                >
                  Apply Suggestion
                </Button>
              </div>
            </div>
          ))}
          
          {suggestions.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <Brain className="w-8 h-8 mx-auto mb-2 text-gray-300" />
              <p>No categorization improvements found</p>
              <p className="text-xs">Your prompts are well-categorized!</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
