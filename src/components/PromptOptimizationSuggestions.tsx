
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Lightbulb, Wand2, Copy, CheckCircle } from 'lucide-react';
import { PlatformBadge } from '@/components/PlatformBadge';
import { toast } from 'sonner';
import type { Prompt } from '@/hooks/usePrompts';

interface OptimizationSuggestion {
  platform: string;
  originalPrompt: string;
  optimizedPrompt: string;
  improvements: string[];
  confidence: number;
}

interface PromptOptimizationSuggestionsProps {
  prompt: Prompt;
  selectedPlatforms: string[];
}

const OPTIMIZATION_RULES = {
  'ChatGPT': {
    prefix: 'You are an expert assistant. ',
    suffix: '\n\nPlease provide a detailed and helpful response.',
    improvements: ['Add role definition', 'Structure with clear instructions', 'Include response format guidance']
  },
  'Claude': {
    prefix: '<thinking>\nLet me analyze this request carefully.\n</thinking>\n\n',
    suffix: '\n\nI\'ll provide a thorough response with clear reasoning.',
    improvements: ['Add thinking tags', 'Structure reasoning process', 'Include step-by-step approach']
  },
  'Gemini': {
    prefix: 'Context: ',
    suffix: '\n\nPlease consider multiple perspectives in your response.',
    improvements: ['Add context framing', 'Encourage multi-perspective thinking', 'Include examples']
  },
  'GPT-4': {
    prefix: 'Role: Expert Assistant\nTask: ',
    suffix: '\n\nConstraints: Provide accurate, detailed information.',
    improvements: ['Define clear role and task', 'Add constraints', 'Structure with sections']
  },
  'Midjourney': {
    prefix: '',
    suffix: ' --ar 16:9 --style raw --quality 2 --v 6',
    improvements: ['Add aspect ratio', 'Include style parameters', 'Specify quality settings']
  },
  'DALL-E': {
    prefix: 'High-quality digital art: ',
    suffix: ', professional photography style, 4K resolution',
    improvements: ['Add quality descriptors', 'Specify art style', 'Include resolution']
  },
  'Stable Diffusion': {
    prefix: '',
    suffix: '\n\nNegative prompt: blurry, low quality, distorted, amateur',
    improvements: ['Add negative prompts', 'Include quality keywords', 'Specify technical parameters']
  }
};

export const PromptOptimizationSuggestions: React.FC<PromptOptimizationSuggestionsProps> = ({
  prompt,
  selectedPlatforms
}) => {
  const [suggestions, setSuggestions] = useState<OptimizationSuggestion[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const generateOptimizations = () => {
    setIsGenerating(true);
    
    // Simulate AI processing time
    setTimeout(() => {
      const newSuggestions = selectedPlatforms.map(platform => {
        const rules = OPTIMIZATION_RULES[platform as keyof typeof OPTIMIZATION_RULES];
        if (!rules) {
          return {
            platform,
            originalPrompt: prompt.content,
            optimizedPrompt: prompt.content,
            improvements: ['Platform-specific optimization not available'],
            confidence: 0.5
          };
        }

        const optimizedPrompt = `${rules.prefix}${prompt.content}${rules.suffix}`;
        return {
          platform,
          originalPrompt: prompt.content,
          optimizedPrompt,
          improvements: rules.improvements,
          confidence: Math.random() * 0.3 + 0.7 // 70-100% confidence
        };
      });

      setSuggestions(newSuggestions);
      setIsGenerating(false);
    }, 2000);
  };

  const copyOptimizedPrompt = async (suggestion: OptimizationSuggestion, index: number) => {
    try {
      await navigator.clipboard.writeText(suggestion.optimizedPrompt);
      setCopiedIndex(index);
      toast.success(`Optimized prompt for ${suggestion.platform} copied!`);
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch (error) {
      toast.error('Failed to copy prompt');
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600';
    if (confidence >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getConfidenceLabel = (confidence: number) => {
    if (confidence >= 0.8) return 'High';
    if (confidence >= 0.6) return 'Medium';
    return 'Low';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Wand2 className="w-5 h-5 mr-2" />
          Platform Optimization Suggestions
        </CardTitle>
        <CardDescription>
          Get AI-powered suggestions to optimize your prompt for specific platforms
        </CardDescription>
      </CardHeader>
      <CardContent>
        {selectedPlatforms.length === 0 ? (
          <div className="text-center py-8">
            <Lightbulb className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-500">Select platforms to get optimization suggestions</p>
          </div>
        ) : suggestions.length === 0 ? (
          <div className="text-center py-8">
            <Button 
              onClick={generateOptimizations}
              disabled={isGenerating}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            >
              {isGenerating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Generating Optimizations...
                </>
              ) : (
                <>
                  <Wand2 className="w-4 h-4 mr-2" />
                  Generate Platform Optimizations
                </>
              )}
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {suggestions.map((suggestion, index) => (
              <div key={suggestion.platform} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <PlatformBadge platform={suggestion.platform} size="md" />
                    <Badge 
                      variant="outline" 
                      className={getConfidenceColor(suggestion.confidence)}
                    >
                      {getConfidenceLabel(suggestion.confidence)} confidence
                    </Badge>
                  </div>
                  <Button
                    onClick={() => copyOptimizedPrompt(suggestion, index)}
                    variant="outline"
                    size="sm"
                    className="flex items-center"
                  >
                    {copiedIndex === index ? (
                      <CheckCircle className="w-4 h-4 mr-1 text-green-500" />
                    ) : (
                      <Copy className="w-4 h-4 mr-1" />
                    )}
                    {copiedIndex === index ? 'Copied!' : 'Copy'}
                  </Button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-2">
                      Optimized Prompt:
                    </label>
                    <Textarea
                      value={suggestion.optimizedPrompt}
                      readOnly
                      className="min-h-[100px] bg-green-50 border-green-200"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-2">
                      Improvements Applied:
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {suggestion.improvements.map((improvement, improvementIndex) => (
                        <Badge key={improvementIndex} variant="secondary" className="text-xs">
                          {improvement}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}

            <Button 
              onClick={generateOptimizations}
              variant="outline"
              className="w-full"
              disabled={isGenerating}
            >
              <Wand2 className="w-4 h-4 mr-2" />
              Regenerate Optimizations
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
