
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Play, ArrowDown, Edit, Trash2, Copy, GitBranch, Code, Database, Palette, TestTube, Rocket } from 'lucide-react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { toast } from 'sonner';
import type { Prompt } from '@/hooks/usePrompts';

interface FlowStep {
  id: string;
  title: string;
  description: string;
  promptId?: string;
  prompt?: Prompt;
  category: 'planning' | 'backend' | 'frontend' | 'integration' | 'testing' | 'deployment';
  dependencies: string[];
  variables: Record<string, string>;
  order: number;
}

interface PromptFlowTemplate {
  id: string;
  name: string;
  description: string;
  type: 'fullstack' | 'frontend' | 'backend' | 'api' | 'custom';
  steps: FlowStep[];
  estimatedTime: string;
}

interface PromptFlowProps {
  prompts: Prompt[];
  onCreateFlow: (flow: PromptFlowTemplate) => void;
}

const DEFAULT_TEMPLATES: PromptFlowTemplate[] = [
  {
    id: 'fullstack-app',
    name: 'Full-Stack Web App',
    description: 'Complete workflow for building a full-stack application from planning to deployment',
    type: 'fullstack',
    estimatedTime: '2-4 hours',
    steps: [
      {
        id: 'step-1',
        title: 'Project Planning & Architecture',
        description: 'Analyze requirements and design system architecture',
        category: 'planning',
        dependencies: [],
        variables: {},
        order: 1
      },
      {
        id: 'step-2',
        title: 'Database Schema Design',
        description: 'Create database tables, relationships, and migrations',
        category: 'backend',
        dependencies: ['step-1'],
        variables: {},
        order: 2
      },
      {
        id: 'step-3',
        title: 'API Endpoints Setup',
        description: 'Build REST API endpoints and authentication',
        category: 'backend',
        dependencies: ['step-2'],
        variables: {},
        order: 3
      },
      {
        id: 'step-4',
        title: 'Frontend Component Structure',
        description: 'Create React components and routing structure',
        category: 'frontend',
        dependencies: ['step-1'],
        variables: {},
        order: 4
      },
      {
        id: 'step-5',
        title: 'API Integration',
        description: 'Connect frontend to backend APIs with proper error handling',
        category: 'integration',
        dependencies: ['step-3', 'step-4'],
        variables: {},
        order: 5
      },
      {
        id: 'step-6',
        title: 'Testing & Validation',
        description: 'Add unit tests, integration tests, and validation',
        category: 'testing',
        dependencies: ['step-5'],
        variables: {},
        order: 6
      },
      {
        id: 'step-7',
        title: 'Deployment & DevOps',
        description: 'Set up CI/CD pipeline and deploy to production',
        category: 'deployment',
        dependencies: ['step-6'],
        variables: {},
        order: 7
      }
    ]
  },
  {
    id: 'react-component',
    name: 'React Component Development',
    description: 'Systematic approach to building reusable React components',
    type: 'frontend',
    estimatedTime: '1-2 hours',
    steps: [
      {
        id: 'comp-1',
        title: 'Component Design & Props',
        description: 'Define component interface and prop types',
        category: 'planning',
        dependencies: [],
        variables: {},
        order: 1
      },
      {
        id: 'comp-2',
        title: 'Component Implementation',
        description: 'Build the React component with proper TypeScript types',
        category: 'frontend',
        dependencies: ['comp-1'],
        variables: {},
        order: 2
      },
      {
        id: 'comp-3',
        title: 'Styling & Responsiveness',
        description: 'Add Tailwind CSS styling and responsive design',
        category: 'frontend',
        dependencies: ['comp-2'],
        variables: {},
        order: 3
      },
      {
        id: 'comp-4',
        title: 'Component Testing',
        description: 'Write unit tests and integration tests',
        category: 'testing',
        dependencies: ['comp-3'],
        variables: {},
        order: 4
      }
    ]
  }
];

const getCategoryIcon = (category: FlowStep['category']) => {
  switch (category) {
    case 'planning': return <GitBranch className="w-4 h-4" />;
    case 'backend': return <Database className="w-4 h-4" />;
    case 'frontend': return <Palette className="w-4 h-4" />;
    case 'integration': return <Code className="w-4 h-4" />;
    case 'testing': return <TestTube className="w-4 h-4" />;
    case 'deployment': return <Rocket className="w-4 h-4" />;
    default: return <Code className="w-4 h-4" />;
  }
};

const getCategoryColor = (category: FlowStep['category']) => {
  switch (category) {
    case 'planning': return 'bg-purple-100 text-purple-800 border-purple-200';
    case 'backend': return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'frontend': return 'bg-green-100 text-green-800 border-green-200';
    case 'integration': return 'bg-orange-100 text-orange-800 border-orange-200';
    case 'testing': return 'bg-red-100 text-red-800 border-red-200';
    case 'deployment': return 'bg-gray-100 text-gray-800 border-gray-200';
    default: return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

export const PromptFlow: React.FC<PromptFlowProps> = ({ prompts, onCreateFlow }) => {
  const [flows, setFlows] = useState<PromptFlowTemplate[]>(DEFAULT_TEMPLATES);
  const [selectedFlow, setSelectedFlow] = useState<PromptFlowTemplate | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [newFlowName, setNewFlowName] = useState('');
  const [newFlowDescription, setNewFlowDescription] = useState('');
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  const handleCreateNewFlow = () => {
    if (!newFlowName.trim()) {
      toast.error('Please enter a flow name');
      return;
    }

    const newFlow: PromptFlowTemplate = {
      id: `flow-${Date.now()}`,
      name: newFlowName,
      description: newFlowDescription,
      type: 'custom',
      estimatedTime: '1-2 hours',
      steps: []
    };

    setFlows(prev => [...prev, newFlow]);
    setSelectedFlow(newFlow);
    setIsCreating(false);
    setNewFlowName('');
    setNewFlowDescription('');
    toast.success('New PromptFlow created!');
  };

  const handleRunFlow = (flow: PromptFlowTemplate) => {
    setSelectedFlow(flow);
    setCurrentStepIndex(0);
    toast.success(`Starting PromptFlow: ${flow.name}`);
  };

  const handleNextStep = () => {
    if (selectedFlow && currentStepIndex < selectedFlow.steps.length - 1) {
      setCurrentStepIndex(prev => prev + 1);
    } else if (selectedFlow) {
      toast.success('PromptFlow completed! 🎉');
      setSelectedFlow(null);
      setCurrentStepIndex(0);
    }
  };

  const currentStep = selectedFlow?.steps[currentStepIndex];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">PromptFlow Templates</h3>
          <p className="text-sm text-gray-600">Chain prompts in sequence for systematic development workflows</p>
        </div>
        <Dialog open={isCreating} onOpenChange={setIsCreating}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Create Flow
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New PromptFlow</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Flow Name</label>
                <Input
                  value={newFlowName}
                  onChange={(e) => setNewFlowName(e.target.value)}
                  placeholder="e.g., Custom API Development"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Description</label>
                <Textarea
                  value={newFlowDescription}
                  onChange={(e) => setNewFlowDescription(e.target.value)}
                  placeholder="Describe what this flow accomplishes..."
                />
              </div>
              <Button onClick={handleCreateNewFlow} className="w-full">
                Create PromptFlow
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Active Flow Runner */}
      {selectedFlow && (
        <Card className="border-2 border-blue-500 bg-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Play className="w-5 h-5" />
                Running: {selectedFlow.name}
              </div>
              <Badge variant="outline">
                Step {currentStepIndex + 1} of {selectedFlow.steps.length}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {currentStep && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  {getCategoryIcon(currentStep.category)}
                  <h4 className="font-medium">{currentStep.title}</h4>
                  <Badge className={getCategoryColor(currentStep.category)}>
                    {currentStep.category}
                  </Badge>
                </div>
                <p className="text-sm text-gray-600">{currentStep.description}</p>
                
                {currentStep.dependencies.length > 0 && (
                  <div className="text-xs text-gray-500">
                    Dependencies: {currentStep.dependencies.join(', ')}
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <Button onClick={handleNextStep} className="flex items-center gap-2">
                    {currentStepIndex < selectedFlow.steps.length - 1 ? (
                      <>
                        Next Step
                        <ArrowDown className="w-4 h-4" />
                      </>
                    ) : (
                      <>
                        Complete Flow
                        <Rocket className="w-4 h-4" />
                      </>
                    )}
                  </Button>
                  <Button variant="outline" onClick={() => setSelectedFlow(null)}>
                    Stop Flow
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Flow Templates Grid */}
      <div className="grid gap-4 md:grid-cols-2">
        {flows.map((flow) => (
          <Card key={flow.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <GitBranch className="w-5 h-5" />
                  {flow.name}
                </div>
                <Badge variant="secondary">{flow.type}</Badge>
              </CardTitle>
              <p className="text-sm text-gray-600">{flow.description}</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">{flow.steps.length} steps</span>
                  <span className="text-gray-500">~{flow.estimatedTime}</span>
                </div>
                
                <div className="flex flex-wrap gap-1">
                  {flow.steps.slice(0, 4).map((step, index) => (
                    <Badge key={index} variant="outline" className={`text-xs ${getCategoryColor(step.category)}`}>
                      {step.category}
                    </Badge>
                  ))}
                  {flow.steps.length > 4 && (
                    <Badge variant="outline" className="text-xs">
                      +{flow.steps.length - 4} more
                    </Badge>
                  )}
                </div>

                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    onClick={() => handleRunFlow(flow)}
                    className="flex items-center gap-1"
                  >
                    <Play className="w-3 h-3" />
                    Run Flow
                  </Button>
                  <Button size="sm" variant="outline" className="flex items-center gap-1">
                    <Copy className="w-3 h-3" />
                    Clone
                  </Button>
                  <Button size="sm" variant="outline" className="flex items-center gap-1">
                    <Edit className="w-3 h-3" />
                    Edit
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
