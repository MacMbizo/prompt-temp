
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, Users, Copy, Star, Calendar, Zap } from 'lucide-react';
import type { Prompt } from '@/hooks/usePrompts';

interface MetricsOverviewProps {
  prompts: Prompt[];
}

export const MetricsOverview: React.FC<MetricsOverviewProps> = ({ prompts }) => {
  const totalPrompts = prompts.length;
  const totalCopies = prompts.reduce((sum, p) => sum + (p.copy_count || 0), 0);
  const totalRatings = prompts.reduce((sum, p) => sum + (p.rating_count || 0), 0);
  const averageRating = prompts.length > 0 
    ? prompts.reduce((sum, p) => sum + (p.average_rating || 0), 0) / prompts.length 
    : 0;
  const communityPrompts = prompts.filter(p => p.is_community).length;
  const templatePrompts = prompts.filter(p => p.is_template).length;

  const metrics = [
    {
      title: 'Total Prompts',
      value: totalPrompts,
      icon: Copy,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      description: 'Your prompt collection'
    },
    {
      title: 'Total Usage',
      value: totalCopies,
      icon: TrendingUp,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      description: 'Times prompts were copied'
    },
    {
      title: 'Avg Rating',
      value: averageRating.toFixed(1),
      icon: Star,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
      description: 'Community feedback'
    },
    {
      title: 'Total Ratings',
      value: totalRatings,
      icon: Users,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      description: 'Community reviews'
    },
    {
      title: 'Community Shared',
      value: communityPrompts,
      icon: Calendar,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-100',
      description: 'Shared with community'
    },
    {
      title: 'Templates',
      value: templatePrompts,
      icon: Zap,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
      description: 'Reusable templates'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {metrics.map((metric) => (
        <Card key={metric.title}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">{metric.title}</p>
                <p className="text-2xl font-bold">{metric.value}</p>
                <p className="text-xs text-gray-500 mt-1">{metric.description}</p>
              </div>
              <div className={`p-3 rounded-lg ${metric.bgColor}`}>
                <metric.icon className={`w-6 h-6 ${metric.color}`} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
