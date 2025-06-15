
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { TrendingUp, Users, Copy, Star, Calendar } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import type { Prompt } from '@/hooks/usePrompts';

interface AnalyticsDashboardProps {
  prompts: Prompt[];
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ prompts }) => {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState({
    totalPrompts: 0,
    totalCopies: 0,
    averageRating: 0,
    totalRatings: 0,
    categoryData: [] as any[],
    platformData: [] as any[],
    usageOverTime: [] as any[]
  });

  useEffect(() => {
    calculateAnalytics();
  }, [prompts]);

  const calculateAnalytics = async () => {
    // Basic stats
    const totalPrompts = prompts.length;
    const totalCopies = prompts.reduce((sum, p) => sum + (p.copy_count || 0), 0);
    const totalRatings = prompts.reduce((sum, p) => sum + (p.rating_count || 0), 0);
    const averageRating = prompts.reduce((sum, p) => sum + (p.average_rating || 0), 0) / prompts.length;

    // Category distribution
    const categoryStats = prompts.reduce((acc, prompt) => {
      acc[prompt.category] = (acc[prompt.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const categoryData = Object.entries(categoryStats).map(([name, value]) => ({
      name,
      value,
      percentage: ((value / totalPrompts) * 100).toFixed(1)
    }));

    // Platform distribution
    const platformStats = prompts.reduce((acc, prompt) => {
      (prompt.platforms || []).forEach(platform => {
        acc[platform] = (acc[platform] || 0) + 1;
      });
      return acc;
    }, {} as Record<string, number>);

    const platformData = Object.entries(platformStats).map(([name, value]) => ({
      name,
      value,
      percentage: ((value / totalPrompts) * 100).toFixed(1)
    }));

    // Usage over time (simplified - last 7 days)
    const usageOverTime = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dayPrompts = prompts.filter(p => {
        const createdDate = new Date(p.created_at);
        return createdDate.toDateString() === date.toDateString();
      });
      
      usageOverTime.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        prompts: dayPrompts.length,
        usage: dayPrompts.reduce((sum, p) => sum + (p.usage_count || 0), 0)
      });
    }

    setAnalytics({
      totalPrompts,
      totalCopies,
      averageRating: isNaN(averageRating) ? 0 : averageRating,
      totalRatings,
      categoryData: categoryData.slice(0, 6), // Top 6 categories
      platformData: platformData.slice(0, 8), // Top 8 platforms
      usageOverTime
    });
  };

  const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#0088fe', '#00c49f'];

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Prompts</p>
                <p className="text-2xl font-bold">{analytics.totalPrompts}</p>
              </div>
              <div className="p-2 bg-blue-100 rounded-lg">
                <Copy className="w-5 h-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Usage</p>
                <p className="text-2xl font-bold">{analytics.totalCopies}</p>
              </div>
              <div className="p-2 bg-green-100 rounded-lg">
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg Rating</p>
                <p className="text-2xl font-bold">{analytics.averageRating.toFixed(1)}</p>
              </div>
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Star className="w-5 h-5 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Ratings</p>
                <p className="text-2xl font-bold">{analytics.totalRatings}</p>
              </div>
              <div className="p-2 bg-purple-100 rounded-lg">
                <Users className="w-5 h-5 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Category Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={analytics.categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, percentage }) => `${name}: ${percentage}%`}
                >
                  {analytics.categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Platform Usage */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Platform Usage</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={analytics.platformData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Usage Trends */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            <Calendar className="w-5 h-5 mr-2" />
            Activity Over Time (Last 7 Days)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={analytics.usageOverTime}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="prompts" stroke="#8884d8" name="New Prompts" />
              <Line type="monotone" dataKey="usage" stroke="#82ca9d" name="Usage Count" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};
