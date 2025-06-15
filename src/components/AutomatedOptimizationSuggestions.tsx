
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Settings, Zap, Target, AlertTriangle, CheckCircle } from 'lucide-react';
import type { Prompt } from '@/hooks/usePrompts';

interface AutomatedOptimizationSuggestionsProps {
  prompt: Prompt;
  onApplyOptimization: (optimizedPrompt: Partial<Prompt>) => void;
}

interface OptimizationSuggestion {
  id: string;
  type: 'structure' | 'clarity' | 'specificity' | 'platform' | 'variables';
  title: string;
  description: string;
  impact: 'low' | 'medium' | 'high';
  effort: 'easy' | 'moderate' | 'complex';
  currentIssue: string;
  suggestedFix: string;
  optimizedContent?: string;
  confidence: number;
}

export const AutomatedOptimizationSuggestions: React.FC<AutomatedOptimizationSuggestionsProps> = ({
  prompt,
  onApplyOptimization
}) => {
  const [suggestions, setSuggestions] = useState<OptimizationSuggestion[]>([]);
  const [overallScore, setOverallScore] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    analyzePrompt();
  }, [prompt]);

  const analyzePrompt = async () => {
    setLoading(true);
    
    const newSuggestions: OptimizationSuggestion[] = [];
    let score = 100;

    // Analyze structure
    const structureSuggestions = analyzeStructure();
    newSuggestions.push(...structureSuggestions);
    score -= structureSuggestions.length * 10;

    // Analyze clarity
    const claritySuggestions = analyzeClarity();
    newSuggestions.push(...claritySuggestions);
    score -= claritySuggestions.length * 8;

    // Analyze specificity
    const specificitySuggestions = analyzeSpecificity();
    newSuggestions.push(...specificitySuggestions);
    score -= specificitySuggestions.length * 12;

    // Analyze platform optimization
    const platformSuggestions = analyzePlatformOptimization();
    newSuggestions.push(...platformSuggestions);
    score -= platformSuggestions.length * 6;

    // Analyze variables
    const variableSuggestions = analyzeVariables();
    newSuggestions.push(...variableSuggestions);
    score -= variableSuggestions.length * 5;

    setSuggestions(newSuggestions);
    setOverallScore(Math.max(score, 0));
    setLoading(false);
  };

  const analyzeStructure = (): OptimizationSuggestion[] => {
    const suggestions: OptimizationSuggestion[] = [];
    const content = prompt.content;

    // Check for clear role definition
    if (!content.toLowerCase().includes('you are') && !content.toLowerCase().includes('act as')) {
      suggestions.push({
        id: 'structure-role',
        type: 'structure',
        title: 'Add Clear Role Definition',
        description: 'Define a clear role for the AI to improve response quality',
        impact: 'high',
        effort: 'easy',
        currentIssue: 'No clear role definition found',
        suggestedFix: 'Start with "You are a [specific role]" or "Act as a [expert type]"',
        optimizedContent: `You are a professional ${prompt.category.toLowerCase()} expert. ${content}`,
        confidence: 0.9
      });
    }

    // Check for clear instructions
    if (!content.includes('1.') && !content.includes('-') && content.length > 100) {
      suggestions.push({
        id: 'structure-steps',
        type: 'structure',
        title: 'Add Structured Steps',
        description: 'Break down complex instructions into clear, numbered steps',
        impact: 'medium',
        effort: 'moderate',
        currentIssue: 'Instructions lack clear structure',
        suggestedFix: 'Use numbered steps or bullet points for complex tasks',
        confidence: 0.8
      });
    }

    // Check for output format specification
    if (!content.toLowerCase().includes('format') && !content.toLowerCase().includes('output')) {
      suggestions.push({
        id: 'structure-format',
        type: 'structure',
        title: 'Specify Output Format',
        description: 'Define the desired format for AI responses',
        impact: 'medium',
        effort: 'easy',
        currentIssue: 'No output format specified',
        suggestedFix: 'Add "Provide your response in [specific format]" at the end',
        optimizedContent: `${content}\n\nProvide your response in a clear, structured format with specific recommendations.`,
        confidence: 0.85
      });
    }

    return suggestions;
  };

  const analyzeClarity = (): OptimizationSuggestion[] => {
    const suggestions: OptimizationSuggestion[] = [];
    const content = prompt.content;

    // Check for vague language
    const vagueWords = ['good', 'nice', 'better', 'improve', 'enhance', 'optimize'];
    const foundVague = vagueWords.filter(word => 
      content.toLowerCase().includes(word) && 
      !content.toLowerCase().includes(`${word} by`) &&
      !content.toLowerCase().includes(`${word} through`)
    );

    if (foundVague.length > 0) {
      suggestions.push({
        id: 'clarity-vague',
        type: 'clarity',
        title: 'Replace Vague Language',
        description: 'Replace vague terms with specific, actionable language',
        impact: 'high',
        effort: 'moderate',
        currentIssue: `Contains vague words: ${foundVague.join(', ')}`,
        suggestedFix: 'Use specific metrics, criteria, or methods instead of vague terms',
        confidence: 0.7
      });
    }

    // Check sentence length
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const avgLength = sentences.reduce((sum, s) => sum + s.split(' ').length, 0) / sentences.length;
    
    if (avgLength > 25) {
      suggestions.push({
        id: 'clarity-sentences',
        type: 'clarity',
        title: 'Simplify Long Sentences',
        description: 'Break down complex sentences for better comprehension',
        impact: 'medium',
        effort: 'moderate',
        currentIssue: `Average sentence length: ${Math.round(avgLength)} words`,
        suggestedFix: 'Split sentences longer than 20 words into shorter ones',
        confidence: 0.8
      });
    }

    return suggestions;
  };

  const analyzeSpecificity = (): OptimizationSuggestion[] => {
    const suggestions: OptimizationSuggestion[] = [];
    const content = prompt.content;

    // Check for examples
    if (!content.toLowerCase().includes('example') && !content.toLowerCase().includes('for instance')) {
      suggestions.push({
        id: 'specificity-examples',
        type: 'specificity',
        title: 'Add Concrete Examples',
        description: 'Include specific examples to guide AI responses',
        impact: 'high',
        effort: 'moderate',
        currentIssue: 'No examples provided',
        suggestedFix: 'Add 1-2 concrete examples of desired output',
        optimizedContent: `${content}\n\nExample: [Provide a specific example relevant to your use case]`,
        confidence: 0.9
      });
    }

    // Check for constraints
    if (!content.toLowerCase().includes('do not') && !content.toLowerCase().includes('avoid') && !content.toLowerCase().includes('limit')) {
      suggestions.push({
        id: 'specificity-constraints',
        type: 'specificity',
        title: 'Add Clear Constraints',
        description: 'Define what the AI should NOT do or include',
        impact: 'medium',
        effort: 'easy',
        currentIssue: 'No constraints or limitations specified',
        suggestedFix: 'Add constraints to prevent unwanted responses',
        optimizedContent: `${content}\n\nConstraints:\n- Keep responses under [X] words\n- Focus on [specific aspect]\n- Avoid [unwanted elements]`,
        confidence: 0.75
      });
    }

    return suggestions;
  };

  const analyzePlatformOptimization = (): OptimizationSuggestion[] => {
    const suggestions: OptimizationSuggestion[] = [];

    if (!prompt.platforms || prompt.platforms.length === 0) {
      suggestions.push({
        id: 'platform-assignment',
        type: 'platform',
        title: 'Assign Target Platforms',
        description: 'Specify which AI platforms this prompt works best with',
        impact: 'medium',
        effort: 'easy',
        currentIssue: 'No platforms assigned',
        suggestedFix: 'Select 1-3 platforms based on prompt complexity and requirements',
        confidence: 0.8
      });
    }

    // Platform-specific optimizations
    if (prompt.platforms?.includes('Midjourney') || prompt.platforms?.includes('DALL-E')) {
      if (!prompt.content.toLowerCase().includes('style') && !prompt.content.toLowerCase().includes('aspect ratio')) {
        suggestions.push({
          id: 'platform-image',
          type: 'platform',
          title: 'Optimize for Image Generation',
          description: 'Add image-specific parameters for better results',
          impact: 'high',
          effort: 'easy',
          currentIssue: 'Missing image generation parameters',
          suggestedFix: 'Add style, aspect ratio, and quality parameters',
          optimizedContent: `${prompt.content}\n\nStyle: [specific art style]\nAspect ratio: [e.g., 16:9, 1:1]\nQuality: high detail`,
          confidence: 0.85
        });
      }
    }

    return suggestions;
  };

  const analyzeVariables = (): OptimizationSuggestion[] => {
    const suggestions: OptimizationSuggestion[] = [];
    const content = prompt.content;

    // Check for hardcoded values that could be variables
    const patterns = [
      /\b\d{1,3}\s*(words?|characters?|items?|steps?)\b/gi,
      /\b(beginner|intermediate|advanced)\b/gi,
      /\b(formal|casual|professional|friendly)\s*(tone|style)\b/gi
    ];

    let hasHardcodedValues = false;
    patterns.forEach(pattern => {
      if (pattern.test(content)) {
        hasHardcodedValues = true;
      }
    });

    if (hasHardcodedValues) {
      suggestions.push({
        id: 'variables-hardcoded',
        type: 'variables',
        title: 'Add Template Variables',
        description: 'Replace hardcoded values with customizable variables',
        impact: 'medium',
        effort: 'moderate',
        currentIssue: 'Contains hardcoded values that could be variables',
        suggestedFix: 'Replace fixed values with variables like {{word_count}}, {{tone}}, {{expertise_level}}',
        confidence: 0.7
      });
    }

    return suggestions;
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'text-red-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  const getImpactIcon = (impact: string) => {
    switch (impact) {
      case 'high': return <AlertTriangle className="w-4 h-4" />;
      case 'medium': return <Target className="w-4 h-4" />;
      case 'low': return <CheckCircle className="w-4 h-4" />;
      default: return <Settings className="w-4 h-4" />;
    }
  };

  const applyOptimization = (suggestion: OptimizationSuggestion) => {
    const optimizedPrompt: Partial<Prompt> = {
      content: suggestion.optimizedContent || prompt.content,
      // Add suggested improvements to description
      description: `${prompt.description} [Optimized: ${suggestion.title}]`
    };

    onApplyOptimization(optimizedPrompt);
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Zap className="w-5 h-5 mr-2" />
            Optimization Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="animate-pulse">Analyzing prompt for optimization opportunities...</div>
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
            <Zap className="w-5 h-5 mr-2" />
            Optimization Analysis
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">{overallScore}/100</div>
            <div className="text-xs text-gray-500">Optimization Score</div>
          </div>
        </CardTitle>
        <div className="mt-2">
          <Progress value={overallScore} className="w-full" />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>Needs Work</span>
            <span>Good</span>
            <span>Excellent</span>
          </div>
        </div>
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
                  <div className={getImpactColor(suggestion.impact)}>
                    {getImpactIcon(suggestion.impact)}
                  </div>
                  <h4 className="font-medium text-sm">{suggestion.title}</h4>
                  <Badge variant="outline" className="text-xs">
                    {suggestion.type}
                  </Badge>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge className={`text-xs ${getImpactColor(suggestion.impact)}`}>
                    {suggestion.impact} impact
                  </Badge>
                  <Badge variant="secondary" className="text-xs">
                    {suggestion.effort}
                  </Badge>
                </div>
              </div>
              
              <p className="text-xs text-gray-600 mb-2">
                {suggestion.description}
              </p>
              
              <div className="bg-red-50 p-2 rounded text-xs mb-2">
                <strong>Issue:</strong> {suggestion.currentIssue}
              </div>
              
              <div className="bg-green-50 p-2 rounded text-xs mb-3">
                <strong>Suggested Fix:</strong> {suggestion.suggestedFix}
              </div>
              
              <div className="flex items-center justify-between">
                <div className="text-xs text-gray-500">
                  Confidence: {Math.round(suggestion.confidence * 100)}%
                </div>
                {suggestion.optimizedContent && (
                  <Button
                    size="sm"
                    onClick={() => applyOptimization(suggestion)}
                  >
                    Apply Fix
                  </Button>
                )}
              </div>
            </div>
          ))}
          
          {suggestions.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <CheckCircle className="w-8 h-8 mx-auto mb-2 text-green-500" />
              <p className="font-medium">Great job! No optimization issues found.</p>
              <p className="text-xs">Your prompt is well-structured and clear.</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
