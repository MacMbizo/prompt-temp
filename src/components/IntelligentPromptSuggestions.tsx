import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Lightbulb, Sparkles, TrendingUp, Brain } from 'lucide-react';
import type { Prompt } from '@/hooks/usePrompts';

interface IntelligentPromptSuggestionsProps {
  userPrompts: Prompt[];
  onCreateSuggestion: (suggestion: Partial<Prompt>) => void;
}

interface PromptSuggestion {
  id: string;
  title: string;
  description: string;
  suggestedContent: string;
  category: string;
  platforms: string[];
  reasoning: string;
  confidence: number;
  type: 'improvement' | 'variant' | 'complement' | 'trending';
}

export const IntelligentPromptSuggestions: React.FC<IntelligentPromptSuggestionsProps> = ({
  userPrompts,
  onCreateSuggestion
}) => {
  const [suggestions, setSuggestions] = useState<PromptSuggestion[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    generateSuggestions();
  }, [userPrompts]);

  const generateSuggestions = async () => {
    setLoading(true);
    
    // Analyze user's prompt patterns
    const categoryFrequency = analyzeCategories();
    const platformUsage = analyzePlatforms();
    const contentPatterns = analyzeContentPatterns();
    
    const newSuggestions: PromptSuggestion[] = [];

    // Generate improvement suggestions
    const improvementSuggestions = generateImprovementSuggestions();
    newSuggestions.push(...improvementSuggestions);

    // Generate variant suggestions
    const variantSuggestions = generateVariantSuggestions(categoryFrequency);
    newSuggestions.push(...variantSuggestions);

    // Generate complementary suggestions
    const complementSuggestions = generateComplementSuggestions(platformUsage);
    newSuggestions.push(...complementSuggestions);

    // Generate trending suggestions
    const trendingSuggestions = generateTrendingSuggestions();
    newSuggestions.push(...trendingSuggestions);

    setSuggestions(newSuggestions.slice(0, 6)); // Limit to 6 suggestions
    setLoading(false);
  };

  const analyzeCategories = () => {
    const frequency: Record<string, number> = {};
    userPrompts.forEach(prompt => {
      frequency[prompt.category] = (frequency[prompt.category] || 0) + 1;
    });
    return frequency;
  };

  const analyzePlatforms = () => {
    const usage: Record<string, number> = {};
    userPrompts.forEach(prompt => {
      prompt.platforms?.forEach(platform => {
        usage[platform] = (usage[platform] || 0) + 1;
      });
    });
    return usage;
  };

  const analyzeContentPatterns = () => {
    return {
      avgLength: userPrompts.reduce((sum, p) => sum + p.content.length, 0) / userPrompts.length,
      commonWords: extractCommonWords(),
      complexityLevel: calculateComplexityLevel()
    };
  };

  const extractCommonWords = () => {
    const allWords = userPrompts.flatMap(p => 
      p.content.toLowerCase().split(/\s+/).filter(word => word.length > 3)
    );
    const frequency: Record<string, number> = {};
    allWords.forEach(word => {
      frequency[word] = (frequency[word] || 0) + 1;
    });
    return Object.entries(frequency)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([word]) => word);
  };

  const calculateComplexityLevel = () => {
    const avgSentences = userPrompts.reduce((sum, p) => 
      sum + p.content.split(/[.!?]+/).length, 0
    ) / userPrompts.length;
    
    if (avgSentences < 2) return 'simple';
    if (avgSentences < 4) return 'moderate';
    return 'complex';
  };

  const generateImprovementSuggestions = (): PromptSuggestion[] => {
    const suggestions: PromptSuggestion[] = [];
    
    // Analyze prompts that could be improved
    userPrompts.forEach(prompt => {
      if (prompt.content.length < 100) {
        suggestions.push({
          id: `improve-${prompt.id}`,
          title: `Enhanced ${prompt.title}`,
          description: `More detailed version of "${prompt.title}" with better context and examples`,
          suggestedContent: generateEnhancedContent(prompt),
          category: prompt.category,
          platforms: prompt.platforms || [],
          reasoning: 'This prompt could benefit from more detailed instructions and examples',
          confidence: 0.8,
          type: 'improvement' as const
        });
      }
    });

    return suggestions.slice(0, 2);
  };

  const generateEnhancedContent = (prompt: Prompt) => {
    return `${prompt.content}

Additional context:
- Provide specific examples for better results
- Include tone and style preferences
- Add constraints or requirements
- Specify desired output format

Example usage:
[Provide a concrete example of how to use this prompt effectively]`;
  };

  const generateVariantSuggestions = (categoryFrequency: Record<string, number>): PromptSuggestion[] => {
    const topCategory = Object.entries(categoryFrequency)
      .sort(([,a], [,b]) => b - a)[0]?.[0];

    if (!topCategory) return [];

    const variants: PromptSuggestion[] = [
      {
        id: 'variant-creative',
        title: `Creative ${topCategory} Assistant`,
        description: `A creative approach to ${topCategory.toLowerCase()} tasks with innovative solutions`,
        suggestedContent: `You are a creative ${topCategory.toLowerCase()} expert. Approach every task with innovative thinking and original solutions. Think outside the box and provide unique perspectives that others might miss.

When given a ${topCategory.toLowerCase()} challenge:
1. First, analyze the conventional approach
2. Then, brainstorm 3 creative alternatives
3. Combine the best elements for a unique solution
4. Explain your creative reasoning

Always prioritize originality while maintaining practicality.`,
        category: topCategory,
        platforms: ['ChatGPT', 'Claude', 'Gemini'],
        reasoning: `Based on your frequent use of ${topCategory} prompts, this creative variant could provide fresh perspectives`,
        confidence: 0.9,
        type: 'variant' as const
      },
      {
        id: 'variant-analytical',
        title: `Analytical ${topCategory} Expert`,
        description: `A data-driven, analytical approach to ${topCategory.toLowerCase()} tasks`,
        suggestedContent: `You are an analytical ${topCategory.toLowerCase()} expert who approaches every problem with systematic thinking and data-driven insights.

For every ${topCategory.toLowerCase()} task:
1. Break down the problem into components
2. Analyze each component methodically
3. Provide evidence-based recommendations
4. Include metrics and measurable outcomes
5. Offer implementation steps with timelines

Focus on logical reasoning and quantifiable results.`,
        category: topCategory,
        platforms: ['GPT-4', 'Claude', 'Perplexity'],
        reasoning: `Complements your existing ${topCategory} prompts with a more analytical perspective`,
        confidence: 0.85,
        type: 'variant' as const
      }
    ];

    return variants;
  };

  const generateComplementSuggestions = (platformUsage: Record<string, number>): PromptSuggestion[] => {
    const topPlatform = Object.entries(platformUsage)
      .sort(([,a], [,b]) => b - a)[0]?.[0];

    if (!topPlatform) return [];

    return [
      {
        id: 'complement-review',
        title: 'AI Output Review & Refinement',
        description: 'A prompt to review and improve AI-generated content from any platform',
        suggestedContent: `Please review the following AI-generated content and provide improvements:

[CONTENT TO REVIEW]

Evaluate and improve based on:
1. Clarity and coherence
2. Accuracy and completeness
3. Tone and style appropriateness
4. Structure and organization
5. Actionability of suggestions

Provide:
- A refined version of the content
- Specific improvements made
- Additional suggestions for enhancement
- Overall quality assessment (1-10)`,
        category: 'System Prompts',
        platforms: [topPlatform],
        reasoning: `Since you frequently use ${topPlatform}, this review prompt can help refine outputs`,
        confidence: 0.9,
        type: 'complement' as const
      }
    ];
  };

  const generateTrendingSuggestions = (): PromptSuggestion[] => {
    return [
      {
        id: 'trending-ai-ethics',
        title: 'AI Ethics Consultant',
        description: 'A prompt for evaluating ethical implications of AI implementations',
        suggestedContent: `You are an AI Ethics Consultant. Help evaluate the ethical implications of AI implementations and provide guidance on responsible AI practices.

For any AI project or implementation:
1. Identify potential ethical concerns
2. Assess bias and fairness implications
3. Evaluate privacy and data protection
4. Consider transparency and explainability
5. Recommend ethical guidelines and safeguards

Provide practical recommendations for ethical AI development and deployment.`,
        category: 'Business Strategy',
        platforms: ['ChatGPT', 'Claude'],
        reasoning: 'AI ethics is becoming increasingly important in AI development',
        confidence: 0.7,
        type: 'trending' as const
      },
      {
        id: 'trending-sustainability',
        title: 'Sustainability Impact Analyzer',
        description: 'Analyze and improve the environmental impact of business decisions',
        suggestedContent: `You are a Sustainability Impact Analyzer. Help evaluate and improve the environmental impact of business decisions, products, and processes.

For any business initiative:
1. Assess current environmental impact
2. Identify sustainability opportunities
3. Calculate potential carbon footprint reduction
4. Suggest eco-friendly alternatives
5. Provide implementation roadmap with ROI

Focus on practical, measurable sustainability improvements that align with business goals.`,
        category: 'Business Strategy',
        platforms: ['ChatGPT', 'Claude', 'Perplexity'],
        reasoning: 'Sustainability is a growing concern for businesses worldwide',
        confidence: 0.75,
        type: 'trending' as const
      }
    ];
  };

  const getSuggestionIcon = (type: string) => {
    switch (type) {
      case 'improvement': return <TrendingUp className="w-4 h-4" />;
      case 'variant': return <Sparkles className="w-4 h-4" />;
      case 'complement': return <Brain className="w-4 h-4" />;
      case 'trending': return <Lightbulb className="w-4 h-4" />;
      default: return <Lightbulb className="w-4 h-4" />;
    }
  };

  const getSuggestionColor = (type: string) => {
    switch (type) {
      case 'improvement': return 'bg-green-100 text-green-800';
      case 'variant': return 'bg-purple-100 text-purple-800';
      case 'complement': return 'bg-blue-100 text-blue-800';
      case 'trending': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Brain className="w-5 h-5 mr-2" />
            Intelligent Suggestions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="animate-pulse">Analyzing your prompts and generating suggestions...</div>
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
            Intelligent Suggestions
          </div>
          <Button
            onClick={generateSuggestions}
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
                  <h4 className="font-medium text-sm">{suggestion.title}</h4>
                  <Badge className={`text-xs ${getSuggestionColor(suggestion.type)}`}>
                    {suggestion.type}
                  </Badge>
                </div>
                <div className="text-xs text-gray-500">
                  {Math.round(suggestion.confidence * 100)}% match
                </div>
              </div>
              
              <p className="text-xs text-gray-600 mb-2">
                {suggestion.description}
              </p>
              
              <p className="text-xs text-gray-500 mb-3 italic">
                {suggestion.reasoning}
              </p>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Badge variant="outline" className="text-xs">
                    {suggestion.category}
                  </Badge>
                  <div className="flex space-x-1">
                    {suggestion.platforms.slice(0, 2).map(platform => (
                      <Badge key={platform} variant="secondary" className="text-xs">
                        {platform}
                      </Badge>
                    ))}
                  </div>
                </div>
                <Button
                  size="sm"
                  onClick={() => onCreateSuggestion({
                    title: suggestion.title,
                    description: suggestion.description,
                    content: suggestion.suggestedContent,
                    category: suggestion.category,
                    platforms: suggestion.platforms,
                    tags: [suggestion.type, 'ai-suggested']
                  })}
                >
                  Use Suggestion
                </Button>
              </div>
            </div>
          ))}
          
          {suggestions.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <Brain className="w-8 h-8 mx-auto mb-2 text-gray-300" />
              <p>No suggestions available yet</p>
              <p className="text-xs">Add more prompts to get intelligent suggestions</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
