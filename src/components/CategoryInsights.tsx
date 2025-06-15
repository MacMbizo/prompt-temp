
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Star, Copy, Users } from 'lucide-react';

interface CategoryInsightsProps {
  selectedCategory: string;
  prompts: any[];
  isLoading?: boolean;
}

export const CategoryInsights: React.FC<CategoryInsightsProps> = ({
  selectedCategory,
  prompts,
  isLoading = false
}) => {
  if (isLoading) {
    return (
      <Card className="bg-white/80 backdrop-blur-sm border-gray-200">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold text-gray-900">Category Insights</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const categoryPrompts = selectedCategory === 'All' 
    ? prompts 
    : prompts.filter(p => p.category === selectedCategory);

  const totalPrompts = categoryPrompts.length;
  const avgRating = categoryPrompts.reduce((sum, p) => sum + (p.average_rating || 0), 0) / Math.max(totalPrompts, 1);
  const totalCopies = categoryPrompts.reduce((sum, p) => sum + (p.copy_count || 0), 0);
  const communityPrompts = categoryPrompts.filter(p => p.is_community).length;

  const topPrompts = categoryPrompts
    .filter(p => p.average_rating && p.rating_count >= 2)
    .sort((a, b) => (b.average_rating || 0) - (a.average_rating || 0))
    .slice(0, 3);

  const getCategoryIcon = (category: string) => {
    const icons = {
      'All': '📋',
      'Writing & Content': '✍️',
      'Programming & Development': '💻',
      'System Prompts': '⚙️',
      'Data Science & Analytics': '📊',
      'Image Generation': '🎨',
      'Marketing & Sales': '📢',
      'Business Strategy': '💼',
      'Education & Learning': '🎓',
      'Creative & Storytelling': '🎭',
      'Code Review & Debugging': '🔍',
      'API Documentation': '📚',
      'Research & Analysis': '🔬',
      'Customer Support': '🎧',
      'Social Media': '📱',
    };
    return icons[category as keyof typeof icons] || '📝';
  };

  return (
    <Card className="bg-white/80 backdrop-blur-sm border-gray-200">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold text-gray-900 flex items-center">
          <span className="mr-2 text-xl">{getCategoryIcon(selectedCategory)}</span>
          {selectedCategory} Insights
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Statistics */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-purple-50 p-3 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">{totalPrompts}</div>
            <div className="text-xs text-purple-600">Total Prompts</div>
          </div>
          <div className="bg-yellow-50 p-3 rounded-lg">
            <div className="text-2xl font-bold text-yellow-600 flex items-center">
              {avgRating.toFixed(1)}
              <Star className="w-4 h-4 ml-1" />
            </div>
            <div className="text-xs text-yellow-600">Avg Rating</div>
          </div>
          <div className="bg-blue-50 p-3 rounded-lg">
            <div className="text-2xl font-bold text-blue-600 flex items-center">
              {totalCopies}
              <Copy className="w-4 h-4 ml-1" />
            </div>
            <div className="text-xs text-blue-600">Total Copies</div>
          </div>
          <div className="bg-green-50 p-3 rounded-lg">
            <div className="text-2xl font-bold text-green-600 flex items-center">
              {communityPrompts}
              <Users className="w-4 h-4 ml-1" />
            </div>
            <div className="text-xs text-green-600">Community</div>
          </div>
        </div>

        {/* Top Rated in Category */}
        {topPrompts.length > 0 && (
          <div>
            <h4 className="font-medium text-gray-700 mb-2 flex items-center">
              <TrendingUp className="w-4 h-4 mr-1" />
              Top Rated
            </h4>
            <div className="space-y-2">
              {topPrompts.map((prompt, index) => (
                <div key={prompt.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-900 truncate">
                      {prompt.title}
                    </div>
                    <div className="flex items-center text-xs text-gray-500">
                      <Star className="w-3 h-3 text-yellow-400 fill-yellow-400 mr-1" />
                      {prompt.average_rating?.toFixed(1)} ({prompt.rating_count})
                    </div>
                  </div>
                  <Badge variant="outline" className="text-xs ml-2">
                    #{index + 1}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}

        {totalPrompts === 0 && (
          <div className="text-center py-4">
            <div className="text-gray-400 text-3xl mb-2">📝</div>
            <p className="text-sm text-gray-500">No prompts in this category yet</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
