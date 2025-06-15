
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Brain, Wand2, TrendingUp, CheckCircle, AlertCircle, Lightbulb } from 'lucide-react';
import { toast } from 'sonner';

interface OptimizationSuggestion {
  type: 'clarity' | 'specificity' | 'structure' | 'keywords';
  severity: 'low' | 'medium' | 'high';
  title: string;
  description: string;
  example?: string;
}

interface PerformanceMetrics {
  clarity: number;
  specificity: number;
  structure: number;
  effectiveness: number;
}

export const AIPromptOptimizer: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [suggestions, setSuggestions] = useState<OptimizationSuggestion[]>([]);
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [optimizedPrompt, setOptimizedPrompt] = useState('');

  const analyzePrompt = async () => {
    if (!prompt.trim()) {
      toast.error('Please enter a prompt to analyze');
      return;
    }

    setIsAnalyzing(true);
    
    try {
      // Simulate AI analysis with mock data
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const mockSuggestions: OptimizationSuggestion[] = [
        {
          type: 'clarity',
          severity: 'medium',
          title: 'Improve Clarity',
          description: 'Consider adding more specific context about the desired output format.',
          example: 'Add: "Please provide the response in a structured format with bullet points."'
        },
        {
          type: 'specificity',
          severity: 'high',
          title: 'Increase Specificity',
          description: 'The prompt could be more specific about the target audience and tone.',
          example: 'Specify: "Write for marketing professionals in a professional but engaging tone."'
        },
        {
          type: 'structure',
          severity: 'low',
          title: 'Better Structure',
          description: 'Consider organizing the prompt with clear sections: context, task, and output format.',
        }
      ];

      const mockMetrics: PerformanceMetrics = {
        clarity: 75,
        specificity: 60,
        structure: 85,
        effectiveness: 73
      };

      const mockOptimized = `Optimized version of your prompt:\n\n${prompt}\n\n[Additional context and structure improvements would be applied here based on AI analysis]`;

      setSuggestions(mockSuggestions);
      setMetrics(mockMetrics);
      setOptimizedPrompt(mockOptimized);
      toast.success('Prompt analysis completed!');
    } catch (error) {
      toast.error('Failed to analyze prompt');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const applySuggestion = (suggestion: OptimizationSuggestion) => {
    // Mock implementation - would integrate with actual AI service
    toast.success(`Applied suggestion: ${suggestion.title}`);
    
    // Update metrics to show improvement
    if (metrics) {
      const updatedMetrics = { ...metrics };
      switch (suggestion.type) {
        case 'clarity':
          updatedMetrics.clarity = Math.min(100, updatedMetrics.clarity + 15);
          break;
        case 'specificity':
          updatedMetrics.specificity = Math.min(100, updatedMetrics.specificity + 20);
          break;
        case 'structure':
          updatedMetrics.structure = Math.min(100, updatedMetrics.structure + 10);
          break;
      }
      updatedMetrics.effectiveness = Math.round(
        (updatedMetrics.clarity + updatedMetrics.specificity + updatedMetrics.structure) / 3
      );
      setMetrics(updatedMetrics);
    }

    // Remove applied suggestion
    setSuggestions(prev => prev.filter(s => s !== suggestion));
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getMetricColor = (value: number) => {
    if (value >= 80) return 'text-green-600';
    if (value >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Brain className="w-5 h-5 mr-2" />
            AI Prompt Optimizer
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Enter your prompt:</label>
              <Textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Paste your prompt here for AI analysis and optimization..."
                className="min-h-[120px]"
              />
            </div>
            
            <Button 
              onClick={analyzePrompt} 
              disabled={isAnalyzing || !prompt.trim()}
              className="w-full"
            >
              {isAnalyzing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Analyzing Prompt...
                </>
              ) : (
                <>
                  <Wand2 className="w-4 h-4 mr-2" />
                  Analyze & Optimize
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {metrics && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="w-5 h-5 mr-2" />
              Performance Metrics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Clarity</span>
                  <span className={`text-sm font-bold ${getMetricColor(metrics.clarity)}`}>
                    {metrics.clarity}%
                  </span>
                </div>
                <Progress value={metrics.clarity} className="h-2" />
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Specificity</span>
                  <span className={`text-sm font-bold ${getMetricColor(metrics.specificity)}`}>
                    {metrics.specificity}%
                  </span>
                </div>
                <Progress value={metrics.specificity} className="h-2" />
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Structure</span>
                  <span className={`text-sm font-bold ${getMetricColor(metrics.structure)}`}>
                    {metrics.structure}%
                  </span>
                </div>
                <Progress value={metrics.structure} className="h-2" />
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Overall</span>
                  <span className={`text-sm font-bold ${getMetricColor(metrics.effectiveness)}`}>
                    {metrics.effectiveness}%
                  </span>
                </div>
                <Progress value={metrics.effectiveness} className="h-2" />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {suggestions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Lightbulb className="w-5 h-5 mr-2" />
              Optimization Suggestions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {suggestions.map((suggestion, index) => (
                <div key={index} className="p-4 border rounded-lg">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-yellow-600" />
                      <h4 className="font-medium">{suggestion.title}</h4>
                      <Badge className={getSeverityColor(suggestion.severity)}>
                        {suggestion.severity}
                      </Badge>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => applySuggestion(suggestion)}
                    >
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Apply
                    </Button>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{suggestion.description}</p>
                  {suggestion.example && (
                    <div className="text-xs bg-gray-50 p-2 rounded border-l-2 border-blue-400">
                      <strong>Example:</strong> {suggestion.example}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {optimizedPrompt && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Wand2 className="w-5 h-5 mr-2" />
              Optimized Prompt
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Textarea
                value={optimizedPrompt}
                onChange={(e) => setOptimizedPrompt(e.target.value)}
                className="min-h-[150px]"
              />
              <div className="flex gap-2">
                <Button
                  onClick={() => {
                    navigator.clipboard.writeText(optimizedPrompt);
                    toast.success('Optimized prompt copied to clipboard!');
                  }}
                >
                  Copy Optimized Prompt
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setPrompt(optimizedPrompt)}
                >
                  Use as New Input
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
