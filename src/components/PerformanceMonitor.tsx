
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Activity, Clock, Database, Zap, RefreshCw } from 'lucide-react';
import { usePromptCache } from '@/hooks/usePromptCache';

interface PerformanceMetrics {
  renderTime: number;
  memoryUsage: number;
  cacheHitRate: number;
  totalPrompts: number;
  lastUpdate: Date;
}

export const PerformanceMonitor: React.FC = () => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    renderTime: 0,
    memoryUsage: 0,
    cacheHitRate: 0,
    totalPrompts: 0,
    lastUpdate: new Date()
  });
  const [isVisible, setIsVisible] = useState(false);
  const { getCacheStats, clearCache } = usePromptCache();

  const updateMetrics = () => {
    const cacheStats = getCacheStats();
    
    // Performance metrics
    const navigation = performance.getEntriesByType('navigation')[0] as any;
    const renderTime = navigation ? navigation.loadEventEnd - navigation.loadEventStart : 0;
    
    // Memory usage (approximate)
    const memoryUsage = (performance as any).memory 
      ? Math.round((performance as any).memory.usedJSHeapSize / 1024 / 1024)
      : 0;

    setMetrics({
      renderTime: Math.round(renderTime),
      memoryUsage,
      cacheHitRate: cacheStats.validEntries > 0 
        ? Math.round((cacheStats.validEntries / cacheStats.totalEntries) * 100)
        : 0,
      totalPrompts: cacheStats.totalEntries,
      lastUpdate: new Date()
    });
  };

  useEffect(() => {
    updateMetrics();
    const interval = setInterval(updateMetrics, 5000); // Update every 5 seconds
    return () => clearInterval(interval);
  }, []);

  const getPerformanceStatus = (renderTime: number) => {
    if (renderTime < 100) return { label: 'Excellent', color: 'bg-green-500' };
    if (renderTime < 300) return { label: 'Good', color: 'bg-yellow-500' };
    return { label: 'Needs Optimization', color: 'bg-red-500' };
  };

  const status = getPerformanceStatus(metrics.renderTime);

  if (!isVisible) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsVisible(true)}
        className="fixed bottom-4 right-4 z-50"
      >
        <Activity className="w-4 h-4 mr-2" />
        Performance
      </Button>
    );
  }

  return (
    <Card className="fixed bottom-4 right-4 w-80 z-50 shadow-lg">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center">
            <Activity className="w-4 h-4 mr-2" />
            Performance Monitor
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsVisible(false)}
          >
            ×
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Status:</span>
          <Badge className={`${status.color} text-white`}>
            {status.label}
          </Badge>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center text-gray-600">
              <Clock className="w-3 h-3 mr-1" />
              Render Time:
            </span>
            <span>{metrics.renderTime}ms</span>
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center text-gray-600">
              <Database className="w-3 h-3 mr-1" />
              Memory Usage:
            </span>
            <span>{metrics.memoryUsage}MB</span>
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center text-gray-600">
              <Zap className="w-3 h-3 mr-1" />
              Cache Hit Rate:
            </span>
            <span>{metrics.cacheHitRate}%</span>
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Cached Prompts:</span>
            <span>{metrics.totalPrompts}</span>
          </div>
        </div>

        <div className="flex gap-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={updateMetrics}
            className="flex-1"
          >
            <RefreshCw className="w-3 h-3 mr-1" />
            Refresh
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={clearCache}
            className="flex-1"
          >
            Clear Cache
          </Button>
        </div>

        <div className="text-xs text-gray-500 text-center">
          Last updated: {metrics.lastUpdate.toLocaleTimeString()}
        </div>
      </CardContent>
    </Card>
  );
};
