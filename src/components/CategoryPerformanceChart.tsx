
import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { BarChart3 } from 'lucide-react';
import type { Prompt } from '@/hooks/usePrompts';

interface CategoryPerformanceChartProps {
  prompts: Prompt[];
}

export const CategoryPerformanceChart: React.FC<CategoryPerformanceChartProps> = ({ prompts }) => {
  const chartData = useMemo(() => {
    const categoryStats = prompts.reduce((acc, prompt) => {
      const category = prompt.category;
      if (!acc[category]) {
        acc[category] = {
          category,
          count: 0,
          totalCopies: 0,
          totalRating: 0,
          ratedCount: 0
        };
      }
      
      acc[category].count += 1;
      acc[category].totalCopies += prompt.copy_count || 0;
      
      if (prompt.average_rating && prompt.average_rating > 0) {
        acc[category].totalRating += prompt.average_rating;
        acc[category].ratedCount += 1;
      }
      
      return acc;
    }, {} as Record<string, any>);

    return Object.values(categoryStats).map((stats: any) => ({
      category: stats.category,
      prompts: stats.count,
      copies: stats.totalCopies,
      avgRating: stats.ratedCount > 0 ? (stats.totalRating / stats.ratedCount).toFixed(1) : 0
    })).sort((a, b) => b.prompts - a.prompts);
  }, [prompts]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <BarChart3 className="w-5 h-5 mr-2" />
          Category Performance
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData} margin={{ bottom: 60 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="category" 
              angle={-45}
              textAnchor="end"
              height={80}
              tick={{ fontSize: 11 }}
            />
            <YAxis />
            <Tooltip />
            <Bar dataKey="prompts" fill="#8884d8" name="Prompts" />
            <Bar dataKey="copies" fill="#82ca9d" name="Copies" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
