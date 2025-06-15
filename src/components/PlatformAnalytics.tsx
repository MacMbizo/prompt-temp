
import React, { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { TrendingUp, Users, Zap, Star } from 'lucide-react';
import { PlatformBadge } from '@/components/PlatformBadge';
import type { Prompt } from '@/hooks/usePrompts';

interface PlatformAnalyticsProps {
  prompts: Prompt[];
  selectedPlatforms: string[];
}

interface PlatformStats {
  platform: string;
  promptCount: number;
  percentage: number;
  avgRating: number;
  totalCopies: number;
}

const CHART_COLORS = [
  '#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#8dd1e1',
  '#d084d0', '#ffb347', '#87ceeb', '#dda0dd', '#98fb98'
];

export const PlatformAnalytics: React.FC<PlatformAnalyticsProps> = ({
  prompts,
  selectedPlatforms
}) => {
  const analyticsData = useMemo(() => {
    // Get all unique platforms from prompts
    const allPlatforms = new Set<string>();
    prompts.forEach(prompt => {
      prompt.platforms?.forEach(platform => allPlatforms.add(platform));
    });

    // Calculate statistics for each platform
    const platformStats: PlatformStats[] = Array.from(allPlatforms).map(platform => {
      const platformPrompts = prompts.filter(prompt => 
        prompt.platforms?.includes(platform)
      );
      
      const totalPrompts = prompts.length || 1;
      const promptCount = platformPrompts.length;
      const percentage = Math.round((promptCount / totalPrompts) * 100);
      
      // Calculate average rating
      const ratedPrompts = platformPrompts.filter(p => p.average_rating && p.average_rating > 0);
      const avgRating = ratedPrompts.length > 0
        ? ratedPrompts.reduce((sum, p) => sum + (p.average_rating || 0), 0) / ratedPrompts.length
        : 0;
      
      // Calculate total copies
      const totalCopies = platformPrompts.reduce((sum, p) => sum + (p.copy_count || 0), 0);

      return {
        platform,
        promptCount,
        percentage,
        avgRating: Math.round(avgRating * 10) / 10,
        totalCopies
      };
    }).sort((a, b) => b.promptCount - a.promptCount);

    return platformStats;
  }, [prompts]);

  const topPlatforms = analyticsData.slice(0, 5);
  const totalPrompts = prompts.length;
  const totalPlatformAssignments = prompts.reduce((sum, p) => sum + (p.platforms?.length || 0), 0);
  const avgPlatformsPerPrompt = totalPrompts > 0 ? Math.round((totalPlatformAssignments / totalPrompts) * 10) / 10 : 0;

  const chartConfig = {
    promptCount: {
      label: "Prompts",
      color: "#8884d8"
    }
  };

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Platforms</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.length}</div>
            <p className="text-xs text-muted-foreground">
              Across all prompts
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Platforms/Prompt</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgPlatformsPerPrompt}</div>
            <p className="text-xs text-muted-foreground">
              Platform assignments
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Most Popular</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold">
              {topPlatforms[0] ? (
                <PlatformBadge platform={topPlatforms[0].platform} size="sm" />
              ) : (
                'N/A'
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {topPlatforms[0]?.promptCount || 0} prompts
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Top Rated Platform</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold">
              {analyticsData.find(p => p.avgRating > 0) ? (
                <PlatformBadge 
                  platform={analyticsData
                    .filter(p => p.avgRating > 0)
                    .sort((a, b) => b.avgRating - a.avgRating)[0]?.platform || 'N/A'} 
                  size="sm" 
                />
              ) : (
                'N/A'
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {analyticsData
                .filter(p => p.avgRating > 0)
                .sort((a, b) => b.avgRating - a.avgRating)[0]?.avgRating || 0} avg rating
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Platform Usage Bar Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Platform Usage</CardTitle>
            <CardDescription>
              Number of prompts by platform
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topPlatforms} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="platform" 
                    tick={{ fontSize: 12 }}
                    interval={0}
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="promptCount" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Platform Distribution Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Platform Distribution</CardTitle>
            <CardDescription>
              Percentage share of each platform
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={topPlatforms}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="promptCount"
                    label={({ platform, percentage }) => `${platform}: ${percentage}%`}
                  >
                    {topPlatforms.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Platform Details Table */}
      <Card>
        <CardHeader>
          <CardTitle>Platform Statistics</CardTitle>
          <CardDescription>
            Detailed statistics for each platform
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analyticsData.map((platform, index) => (
              <div 
                key={platform.platform}
                className={`flex items-center justify-between p-4 rounded-lg border ${
                  selectedPlatforms.includes(platform.platform) ? 'bg-blue-50 border-blue-200' : 'bg-gray-50'
                }`}
              >
                <div className="flex items-center space-x-4">
                  <span className="text-sm font-medium text-gray-500">#{index + 1}</span>
                  <PlatformBadge platform={platform.platform} size="md" />
                </div>
                
                <div className="flex items-center space-x-6 text-sm">
                  <div className="text-center">
                    <div className="font-medium">{platform.promptCount}</div>
                    <div className="text-gray-500">Prompts</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="font-medium">{platform.percentage}%</div>
                    <div className="text-gray-500">Share</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="font-medium">
                      {platform.avgRating > 0 ? platform.avgRating : 'N/A'}
                    </div>
                    <div className="text-gray-500">Avg Rating</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="font-medium">{platform.totalCopies}</div>
                    <div className="text-gray-500">Copies</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
