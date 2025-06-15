
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Header } from '@/components/Header';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AIPromptOptimizer } from '@/components/AIPromptOptimizer';
import { AutomationDashboard } from '@/components/AutomationDashboard';
import { Brain, Zap } from 'lucide-react';

const Automation = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('optimizer');

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900">AI Automation</h1>
            <p className="text-gray-600 mt-2">
              Leverage AI to optimize prompts and automate workflows
            </p>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="optimizer" className="flex items-center">
                <Brain className="w-4 h-4 mr-2" />
                AI Optimizer
              </TabsTrigger>
              <TabsTrigger value="automation" className="flex items-center">
                <Zap className="w-4 h-4 mr-2" />
                Automation Rules
              </TabsTrigger>
            </TabsList>

            <TabsContent value="optimizer" className="mt-6">
              <AIPromptOptimizer />
            </TabsContent>

            <TabsContent value="automation" className="mt-6">
              <AutomationDashboard />
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </ProtectedRoute>
  );
};

export default Automation;
