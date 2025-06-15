
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { usePrompts } from '@/hooks/usePrompts';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Header } from '@/components/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { BarChart3, TrendingUp, Users, Download } from 'lucide-react';
import { MetricsOverview } from '@/components/MetricsOverview';
import { UsageTrendsChart } from '@/components/UsageTrendsChart';
import { CategoryPerformanceChart } from '@/components/CategoryPerformanceChart';
import { TopPerformingPrompts } from '@/components/TopPerformingPrompts';
import { PlatformInsightsDashboard } from '@/components/PlatformInsightsDashboard';
import { AnalyticsDashboard } from '@/components/AnalyticsDashboard';

const Analytics = () => {
  const { user } = useAuth();
  const { prompts, isLoading } = usePrompts();
  const [activeTab, setActiveTab] = useState('overview');

  const handleExportData = () => {
    const analyticsData = {
      totalPrompts: prompts.length,
      totalCopies: prompts.reduce((sum, p) => sum + (p.copy_count || 0), 0),
      exportDate: new Date().toISOString(),
      prompts: prompts.map(p => ({
        id: p.id,
        title: p.title,
        category: p.category,
        platforms: p.platforms,
        copyCount: p.copy_count,
        rating: p.average_rating,
        createdAt: p.created_at
      }))
    };

    const blob = new Blob([JSON.stringify(analyticsData, null, 2)], {
      type: 'application/json'
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `promptvault-analytics-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50">
          <Header />
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
            </div>
          </main>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
                <p className="text-gray-600 mt-2">
                  Track your prompt performance, usage patterns, and insights
                </p>
              </div>
              <Button onClick={handleExportData} variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Export Data
              </Button>
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview" className="flex items-center">
                <BarChart3 className="w-4 h-4 mr-2" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="trends" className="flex items-center">
                <TrendingUp className="w-4 h-4 mr-2" />
                Trends
              </TabsTrigger>
              <TabsTrigger value="performance" className="flex items-center">
                <Users className="w-4 h-4 mr-2" />
                Performance
              </TabsTrigger>
              <TabsTrigger value="platforms" className="flex items-center">
                <BarChart3 className="w-4 h-4 mr-2" />
                Platforms
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <MetricsOverview prompts={prompts} />
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <UsageTrendsChart prompts={prompts} />
                <TopPerformingPrompts prompts={prompts} />
              </div>
            </TabsContent>

            <TabsContent value="trends" className="space-y-6">
              <div className="grid grid-cols-1 gap-6">
                <UsageTrendsChart prompts={prompts} />
                <CategoryPerformanceChart prompts={prompts} />
              </div>
            </TabsContent>

            <TabsContent value="performance" className="space-y-6">
              <AnalyticsDashboard prompts={prompts} />
            </TabsContent>

            <TabsContent value="platforms" className="space-y-6">
              <PlatformInsightsDashboard 
                prompts={prompts}
                selectedPlatforms={[]}
                isLoading={isLoading}
              />
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </ProtectedRoute>
  );
};

export default Analytics;
