
import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Calendar } from 'lucide-react';
import type { Prompt } from '@/hooks/usePrompts';

interface UsageTrendsChartProps {
  prompts: Prompt[];
}

export const UsageTrendsChart: React.FC<UsageTrendsChartProps> = ({ prompts }) => {
  const chartData = useMemo(() => {
    const last30Days = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      const dayPrompts = prompts.filter(p => {
        const createdDate = new Date(p.created_at);
        return createdDate.toDateString() === date.toDateString();
      });
      
      last30Days.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        prompts: dayPrompts.length,
        usage: dayPrompts.reduce((sum, p) => sum + (p.usage_count || 0), 0),
        copies: dayPrompts.reduce((sum, p) => sum + (p.copy_count || 0), 0)
      });
    }
    return last30Days;
  }, [prompts]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Calendar className="w-5 h-5 mr-2" />
          Usage Trends (Last 30 Days)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="date" 
              tick={{ fontSize: 12 }}
              interval="preserveStartEnd"
            />
            <YAxis />
            <Tooltip />
            <Line 
              type="monotone" 
              dataKey="prompts" 
              stroke="#8884d8" 
              name="New Prompts"
              strokeWidth={2}
            />
            <Line 
              type="monotone" 
              dataKey="usage" 
              stroke="#82ca9d" 
              name="Usage Count"
              strokeWidth={2}
            />
            <Line 
              type="monotone" 
              dataKey="copies" 
              stroke="#ffc658" 
              name="Copies"
              strokeWidth={2}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
