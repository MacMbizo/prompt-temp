
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Zap, Settings, Clock, TrendingUp, Bot, PlayCircle, PauseCircle } from 'lucide-react';
import { toast } from 'sonner';

interface AutomationRule {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  trigger: string;
  action: string;
  lastRun?: string;
  executionCount: number;
  successRate: number;
}

export const AutomationDashboard: React.FC = () => {
  const [automationRules, setAutomationRules] = useState<AutomationRule[]>([
    {
      id: '1',
      name: 'Auto-categorize New Prompts',
      description: 'Automatically categorize prompts based on content analysis',
      enabled: true,
      trigger: 'new_prompt_created',
      action: 'auto_categorize',
      lastRun: '2 minutes ago',
      executionCount: 247,
      successRate: 94
    },
    {
      id: '2',
      name: 'Quality Score Optimization',
      description: 'Suggest improvements for prompts with low engagement',
      enabled: true,
      trigger: 'low_engagement_detected',
      action: 'suggest_improvements',
      lastRun: '1 hour ago',
      executionCount: 89,
      successRate: 87
    },
    {
      id: '3',
      name: 'Duplicate Detection',
      description: 'Flag potential duplicate prompts for review',
      enabled: false,
      trigger: 'prompt_similarity_high',
      action: 'flag_for_review',
      lastRun: '1 day ago',
      executionCount: 23,
      successRate: 76
    },
    {
      id: '4',
      name: 'Trending Topic Alerts',
      description: 'Notify about emerging prompt categories and trends',
      enabled: true,
      trigger: 'trend_detected',
      action: 'send_notification',
      lastRun: '3 hours ago',
      executionCount: 156,
      successRate: 92
    }
  ]);

  const [newRuleTrigger, setNewRuleTrigger] = useState('');
  const [newRuleAction, setNewRuleAction] = useState('');

  const toggleRule = (ruleId: string) => {
    setAutomationRules(prev => 
      prev.map(rule => 
        rule.id === ruleId 
          ? { ...rule, enabled: !rule.enabled }
          : rule
      )
    );
    
    const rule = automationRules.find(r => r.id === ruleId);
    toast.success(`${rule?.name} ${rule?.enabled ? 'disabled' : 'enabled'}`);
  };

  const createNewRule = () => {
    if (!newRuleTrigger || !newRuleAction) {
      toast.error('Please select both trigger and action');
      return;
    }

    const newRule: AutomationRule = {
      id: Date.now().toString(),
      name: `Custom Rule ${automationRules.length + 1}`,
      description: `Trigger: ${newRuleTrigger}, Action: ${newRuleAction}`,
      enabled: false,
      trigger: newRuleTrigger,
      action: newRuleAction,
      executionCount: 0,
      successRate: 0
    };

    setAutomationRules(prev => [...prev, newRule]);
    setNewRuleTrigger('');
    setNewRuleAction('');
    toast.success('New automation rule created!');
  };

  const runRule = (ruleId: string) => {
    const rule = automationRules.find(r => r.id === ruleId);
    if (rule) {
      // Simulate rule execution
      setAutomationRules(prev =>
        prev.map(r =>
          r.id === ruleId
            ? {
                ...r,
                lastRun: 'Just now',
                executionCount: r.executionCount + 1,
                successRate: Math.min(100, r.successRate + Math.random() * 5)
              }
            : r
        )
      );
      toast.success(`Executed: ${rule.name}`);
    }
  };

  const getStatusColor = (enabled: boolean) => {
    return enabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800';
  };

  const getSuccessRateColor = (rate: number) => {
    if (rate >= 90) return 'text-green-600';
    if (rate >= 75) return 'text-yellow-600';
    return 'text-red-600';
  };

  const overallStats = {
    activeRules: automationRules.filter(r => r.enabled).length,
    totalExecutions: automationRules.reduce((sum, r) => sum + r.executionCount, 0),
    averageSuccessRate: Math.round(
      automationRules.reduce((sum, r) => sum + r.successRate, 0) / automationRules.length
    )
  };

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Rules</p>
                <p className="text-2xl font-bold text-green-600">{overallStats.activeRules}</p>
              </div>
              <Zap className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Executions</p>
                <p className="text-2xl font-bold text-blue-600">{overallStats.totalExecutions}</p>
              </div>
              <Bot className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Success Rate</p>
                <p className="text-2xl font-bold text-purple-600">{overallStats.averageSuccessRate}%</p>
              </div>
              <TrendingUp className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Create New Rule */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Settings className="w-5 h-5 mr-2" />
            Create New Automation Rule
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <label className="block text-sm font-medium mb-2">Trigger</label>
              <Select value={newRuleTrigger} onValueChange={setNewRuleTrigger}>
                <SelectTrigger>
                  <SelectValue placeholder="Select trigger" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="new_prompt_created">New Prompt Created</SelectItem>
                  <SelectItem value="low_engagement_detected">Low Engagement Detected</SelectItem>
                  <SelectItem value="prompt_similarity_high">High Similarity Detected</SelectItem>
                  <SelectItem value="trend_detected">Trend Detected</SelectItem>
                  <SelectItem value="user_inactive">User Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex-1">
              <label className="block text-sm font-medium mb-2">Action</label>
              <Select value={newRuleAction} onValueChange={setNewRuleAction}>
                <SelectTrigger>
                  <SelectValue placeholder="Select action" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="auto_categorize">Auto Categorize</SelectItem>
                  <SelectItem value="suggest_improvements">Suggest Improvements</SelectItem>
                  <SelectItem value="flag_for_review">Flag for Review</SelectItem>
                  <SelectItem value="send_notification">Send Notification</SelectItem>
                  <SelectItem value="auto_tag">Auto Tag</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button onClick={createNewRule}>
              Create Rule
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Automation Rules */}
      <Card>
        <CardHeader>
          <CardTitle>Automation Rules</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {automationRules.map((rule) => (
              <div key={rule.id} className="p-4 border rounded-lg">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium">{rule.name}</h3>
                      <Badge className={getStatusColor(rule.enabled)}>
                        {rule.enabled ? 'Active' : 'Disabled'}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{rule.description}</p>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      {rule.lastRun && (
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          Last run: {rule.lastRun}
                        </div>
                      )}
                      <span>Executions: {rule.executionCount}</span>
                      <span className={getSuccessRateColor(rule.successRate)}>
                        Success: {rule.successRate}%
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => runRule(rule.id)}
                      disabled={!rule.enabled}
                    >
                      <PlayCircle className="w-4 h-4" />
                    </Button>
                    <Switch
                      checked={rule.enabled}
                      onCheckedChange={() => toggleRule(rule.id)}
                    />
                  </div>
                </div>
                
                {rule.successRate > 0 && (
                  <div className="mt-2">
                    <div className="flex justify-between text-xs mb-1">
                      <span>Success Rate</span>
                      <span className={getSuccessRateColor(rule.successRate)}>
                        {rule.successRate}%
                      </span>
                    </div>
                    <Progress value={rule.successRate} className="h-2" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
