
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { 
  Plug, 
  Key, 
  Globe, 
  Zap, 
  CheckCircle, 
  AlertCircle, 
  ExternalLink,
  Code,
  Database,
  Cloud
} from 'lucide-react';
import { PlatformBadge } from '@/components/PlatformBadge';
import { toast } from 'sonner';

interface APIIntegration {
  id: string;
  name: string;
  platform: string;
  status: 'not_configured' | 'configured' | 'connected' | 'error';
  description: string;
  docUrl: string;
  requiredFields: string[];
  endpoints: string[];
}

const AVAILABLE_INTEGRATIONS: APIIntegration[] = [
  {
    id: 'openai',
    name: 'OpenAI API',
    platform: 'ChatGPT',
    status: 'not_configured',
    description: 'Direct integration with OpenAI GPT models for real-time prompt execution',
    docUrl: 'https://platform.openai.com/docs/api-reference',
    requiredFields: ['API Key', 'Organization ID (optional)'],
    endpoints: ['/v1/chat/completions', '/v1/completions', '/v1/models']
  },
  {
    id: 'anthropic',
    name: 'Anthropic API',
    platform: 'Claude',
    status: 'not_configured', 
    description: 'Integration with Claude AI for advanced reasoning and analysis',
    docUrl: 'https://docs.anthropic.com/claude/reference',
    requiredFields: ['API Key'],
    endpoints: ['/v1/messages', '/v1/models']
  },
  {
    id: 'google-ai',
    name: 'Google AI API',
    platform: 'Gemini',
    status: 'not_configured',
    description: 'Access to Google Gemini models for multimodal AI capabilities',
    docUrl: 'https://ai.google.dev/docs',
    requiredFields: ['API Key', 'Project ID'],
    endpoints: ['/v1/models', '/v1/generateContent']
  },
  {
    id: 'midjourney',
    name: 'Midjourney API',
    platform: 'Midjourney',
    status: 'not_configured',
    description: 'Unofficial API for Midjourney image generation (via third-party services)',
    docUrl: 'https://docs.midjourney.com/',
    requiredFields: ['API Key', 'Server ID', 'Channel ID'],
    endpoints: ['/imagine', '/upscale', '/variation']
  }
];

export const IntegrationPreparation: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [integrations, setIntegrations] = useState<APIIntegration[]>(AVAILABLE_INTEGRATIONS);
  const [selectedIntegration, setSelectedIntegration] = useState<APIIntegration | null>(null);
  const [configData, setConfigData] = useState<Record<string, string>>({});
  const [testingConnection, setTestingConnection] = useState(false);

  const handleConfigurationSave = (integrationId: string) => {
    setIntegrations(prev => prev.map(integration => 
      integration.id === integrationId 
        ? { ...integration, status: 'configured' }
        : integration
    ));
    toast.success('Configuration saved! Ready for future API integration.');
    setSelectedIntegration(null);
    setConfigData({});
  };

  const handleConnectionTest = async (integration: APIIntegration) => {
    setTestingConnection(true);
    
    // Simulate API connection test
    setTimeout(() => {
      const success = Math.random() > 0.3; // 70% success rate for demo
      
      setIntegrations(prev => prev.map(int => 
        int.id === integration.id 
          ? { ...int, status: success ? 'connected' : 'error' }
          : int
      ));
      
      toast[success ? 'success' : 'error'](
        success 
          ? `Successfully connected to ${integration.name}!` 
          : `Failed to connect to ${integration.name}. Please check your configuration.`
      );
      
      setTestingConnection(false);
    }, 2000);
  };

  const getStatusIcon = (status: APIIntegration['status']) => {
    switch (status) {
      case 'connected':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'configured':
        return <Zap className="w-4 h-4 text-blue-500" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Plug className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: APIIntegration['status']) => {
    const variants = {
      'connected': { label: 'Connected', className: 'bg-green-100 text-green-800' },
      'configured': { label: 'Configured', className: 'bg-blue-100 text-blue-800' },
      'error': { label: 'Error', className: 'bg-red-100 text-red-800' },
      'not_configured': { label: 'Not Configured', className: 'bg-gray-100 text-gray-800' }
    };
    
    const variant = variants[status];
    return (
      <Badge variant="secondary" className={variant.className}>
        {variant.label}
      </Badge>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="flex items-center">
          <Plug className="w-4 h-4 mr-2" />
          API Integrations
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Cloud className="w-5 h-5 mr-2" />
            API Integration Preparation
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="integrations" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="integrations">Available Integrations</TabsTrigger>
            <TabsTrigger value="configuration">Configuration</TabsTrigger>
            <TabsTrigger value="webhooks">Webhooks & Events</TabsTrigger>
          </TabsList>

          <TabsContent value="integrations" className="space-y-4">
            <div className="grid gap-4">
              {integrations.map(integration => (
                <Card key={integration.id} className="relative">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <CardTitle className="text-lg">{integration.name}</CardTitle>
                          <PlatformBadge platform={integration.platform} size="sm" />
                          {getStatusBadge(integration.status)}
                        </div>
                        <CardDescription>{integration.description}</CardDescription>
                      </div>
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(integration.status)}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-1">Required Fields:</p>
                        <div className="flex flex-wrap gap-1">
                          {integration.requiredFields.map(field => (
                            <Badge key={field} variant="outline" className="text-xs">
                              {field}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-1">Endpoints:</p>
                        <div className="flex flex-wrap gap-1">
                          {integration.endpoints.map(endpoint => (
                            <Badge key={endpoint} variant="secondary" className="text-xs font-mono">
                              {endpoint}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(integration.docUrl, '_blank')}
                        >
                          <ExternalLink className="w-3 h-3 mr-1" />
                          Documentation
                        </Button>
                        
                        <div className="space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedIntegration(integration)}
                          >
                            <Key className="w-3 h-3 mr-1" />
                            Configure
                          </Button>
                          
                          {integration.status === 'configured' && (
                            <Button
                              size="sm"
                              onClick={() => handleConnectionTest(integration)}
                              disabled={testingConnection}
                            >
                              {testingConnection ? (
                                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-1"></div>
                              ) : (
                                <Zap className="w-3 h-3 mr-1" />
                              )}
                              Test Connection
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="configuration" className="space-y-4">
            {selectedIntegration ? (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Key className="w-4 h-4 mr-2" />
                    Configure {selectedIntegration.name}
                  </CardTitle>
                  <CardDescription>
                    Set up the required credentials and settings for this integration
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {selectedIntegration.requiredFields.map(field => (
                    <div key={field}>
                      <label className="text-sm font-medium text-gray-700 block mb-2">
                        {field}:
                      </label>
                      <Input
                        type={field.toLowerCase().includes('key') ? 'password' : 'text'}
                        placeholder={`Enter your ${field.toLowerCase()}`}
                        value={configData[field] || ''}
                        onChange={(e) => setConfigData(prev => ({
                          ...prev,
                          [field]: e.target.value
                        }))}
                      />
                    </div>
                  ))}
                  
                  <div className="flex justify-end space-x-2 pt-4">
                    <Button 
                      variant="outline" 
                      onClick={() => setSelectedIntegration(null)}
                    >
                      Cancel
                    </Button>
                    <Button 
                      onClick={() => handleConfigurationSave(selectedIntegration.id)}
                    >
                      Save Configuration
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="text-center py-8">
                <Key className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <p className="text-gray-500">Select an integration to configure</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="webhooks" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Globe className="w-4 h-4 mr-2" />
                  Webhook Configuration
                </CardTitle>
                <CardDescription>
                  Set up webhooks for real-time notifications and events
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-2">
                    Webhook URL:
                  </label>
                  <Input 
                    placeholder="https://your-app.com/api/webhooks"
                    className="font-mono"
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-2">
                    Secret Key:
                  </label>
                  <Input 
                    type="password"
                    placeholder="Webhook secret for verification"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-2">
                    Events to Subscribe:
                  </label>
                  <div className="space-y-2">
                    {[
                      'prompt.executed',
                      'prompt.optimized', 
                      'integration.connected',
                      'integration.error'
                    ].map(event => (
                      <div key={event} className="flex items-center space-x-2">
                        <Switch />
                        <span className="text-sm font-mono">{event}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-2">
                    Sample Payload:
                  </label>
                  <Textarea
                    readOnly
                    value={JSON.stringify({
                      event: 'prompt.executed',
                      data: {
                        promptId: 'prompt_123',
                        platform: 'ChatGPT',
                        executedAt: new Date().toISOString(),
                        response: 'AI response...'
                      }
                    }, null, 2)}
                    className="font-mono text-xs"
                    rows={8}
                  />
                </div>

                <Button className="w-full">
                  <Code className="w-4 h-4 mr-2" />
                  Save Webhook Configuration
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
