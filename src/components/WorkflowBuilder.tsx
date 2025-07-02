import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { 
  Plus, 
  Play, 
  ArrowDown, 
  Edit, 
  Trash2, 
  Copy, 
  GitBranch, 
  Code, 
  Database, 
  Palette, 
  TestTube, 
  Rocket,
  Settings,
  Save,
  Download,
  Upload
} from 'lucide-react';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { toast } from 'sonner';
import type { Prompt } from '@/hooks/usePrompts';

interface WorkflowStep {
  id: string;
  title: string;
  description: string;
  promptId?: string;
  prompt?: Prompt;
  category: 'planning' | 'backend' | 'frontend' | 'integration' | 'testing' | 'deployment' | 'custom';
  dependencies: string[];
  variables: Record<string, string>;
  order: number;
  isActive?: boolean;
  isCompleted?: boolean;
}

interface Workflow {
  id: string;
  name: string;
  description: string;
  type: 'fullstack' | 'frontend' | 'backend' | 'api' | 'custom';
  steps: WorkflowStep[];
  estimatedTime: string;
  createdAt: Date;
  updatedAt: Date;
  isTemplate?: boolean;
}

interface WorkflowBuilderProps {
  prompts: Prompt[];
  onSaveWorkflow: (workflow: Workflow) => void;
  onExecuteWorkflow: (workflow: Workflow) => void;
}

const DEFAULT_WORKFLOW_TEMPLATES: Workflow[] = [
  {
    id: 'template-fullstack',
    name: 'Full-Stack Web Application',
    description: 'Complete workflow for building a full-stack application from planning to deployment',
    type: 'fullstack',
    estimatedTime: '2-4 hours',
    isTemplate: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    steps: [
      {
        id: 'step-planning',
        title: 'Project Planning & Architecture',
        description: 'Analyze requirements and design system architecture',
        category: 'planning',
        dependencies: [],
        variables: { projectName: '', requirements: '' },
        order: 1
      },
      {
        id: 'step-database',
        title: 'Database Schema Design',
        description: 'Create database tables, relationships, and migrations',
        category: 'backend',
        dependencies: ['step-planning'],
        variables: { dbType: 'postgresql', entities: '' },
        order: 2
      },
      {
        id: 'step-api',
        title: 'API Endpoints Setup',
        description: 'Build REST API endpoints and authentication',
        category: 'backend',
        dependencies: ['step-database'],
        variables: { authType: 'jwt', endpoints: '' },
        order: 3
      },
      {
        id: 'step-frontend',
        title: 'Frontend Component Structure',
        description: 'Create React components and routing structure',
        category: 'frontend',
        dependencies: ['step-planning'],
        variables: { framework: 'react', styling: 'tailwind' },
        order: 4
      },
      {
        id: 'step-integration',
        title: 'API Integration',
        description: 'Connect frontend to backend APIs with proper error handling',
        category: 'integration',
        dependencies: ['step-api', 'step-frontend'],
        variables: { httpClient: 'fetch', errorHandling: 'try-catch' },
        order: 5
      },
      {
        id: 'step-testing',
        title: 'Testing & Validation',
        description: 'Add unit tests, integration tests, and validation',
        category: 'testing',
        dependencies: ['step-integration'],
        variables: { testFramework: 'jest', coverage: '80%' },
        order: 6
      },
      {
        id: 'step-deployment',
        title: 'Deployment & DevOps',
        description: 'Set up CI/CD pipeline and deploy to production',
        category: 'deployment',
        dependencies: ['step-testing'],
        variables: { platform: 'vercel', cicd: 'github-actions' },
        order: 7
      }
    ]
  }
];

const getCategoryIcon = (category: WorkflowStep['category']) => {
  switch (category) {
    case 'planning': return <GitBranch className="w-4 h-4" />;
    case 'backend': return <Database className="w-4 h-4" />;
    case 'frontend': return <Palette className="w-4 h-4" />;
    case 'integration': return <Code className="w-4 h-4" />;
    case 'testing': return <TestTube className="w-4 h-4" />;
    case 'deployment': return <Rocket className="w-4 h-4" />;
    case 'custom': return <Settings className="w-4 h-4" />;
    default: return <Code className="w-4 h-4" />;
  }
};

const getCategoryColor = (category: WorkflowStep['category']) => {
  switch (category) {
    case 'planning': return 'bg-purple-100 text-purple-800 border-purple-200';
    case 'backend': return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'frontend': return 'bg-green-100 text-green-800 border-green-200';
    case 'integration': return 'bg-orange-100 text-orange-800 border-orange-200';
    case 'testing': return 'bg-red-100 text-red-800 border-red-200';
    case 'deployment': return 'bg-gray-100 text-gray-800 border-gray-200';
    case 'custom': return 'bg-indigo-100 text-indigo-800 border-indigo-200';
    default: return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

export const WorkflowBuilder: React.FC<WorkflowBuilderProps> = ({ 
  prompts, 
  onSaveWorkflow, 
  onExecuteWorkflow 
}) => {
  const [workflows, setWorkflows] = useState<Workflow[]>(DEFAULT_WORKFLOW_TEMPLATES);
  const [currentWorkflow, setCurrentWorkflow] = useState<Workflow | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isCreatingStep, setIsCreatingStep] = useState(false);
  const [selectedStep, setSelectedStep] = useState<WorkflowStep | null>(null);
  const [executingWorkflow, setExecutingWorkflow] = useState<Workflow | null>(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  // New step form state
  const [newStep, setNewStep] = useState<Partial<WorkflowStep>>({
    title: '',
    description: '',
    category: 'custom',
    dependencies: [],
    variables: {}
  });

  // New workflow form state
  const [newWorkflow, setNewWorkflow] = useState<Partial<Workflow>>({
    name: '',
    description: '',
    type: 'custom',
    estimatedTime: '1-2 hours'
  });

  const handleDragEnd = useCallback((result: DropResult) => {
    if (!result.destination || !currentWorkflow) return;

    const items = Array.from(currentWorkflow.steps);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    // Update order property
    const updatedSteps = items.map((step, index) => ({
      ...step,
      order: index + 1
    }));

    const updatedWorkflow = {
      ...currentWorkflow,
      steps: updatedSteps,
      updatedAt: new Date()
    };

    setCurrentWorkflow(updatedWorkflow);
    setWorkflows(prev => prev.map(w => w.id === updatedWorkflow.id ? updatedWorkflow : w));
  }, [currentWorkflow]);

  const handleCreateWorkflow = () => {
    if (!newWorkflow.name?.trim()) {
      toast.error('Please enter a workflow name');
      return;
    }

    const workflow: Workflow = {
      id: `workflow-${Date.now()}`,
      name: newWorkflow.name,
      description: newWorkflow.description || '',
      type: newWorkflow.type || 'custom',
      estimatedTime: newWorkflow.estimatedTime || '1-2 hours',
      steps: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    setWorkflows(prev => [...prev, workflow]);
    setCurrentWorkflow(workflow);
    setIsEditing(true);
    setNewWorkflow({ name: '', description: '', type: 'custom', estimatedTime: '1-2 hours' });
    toast.success('New workflow created!');
  };

  const handleAddStep = () => {
    if (!newStep.title?.trim() || !currentWorkflow) {
      toast.error('Please enter a step title');
      return;
    }

    const step: WorkflowStep = {
      id: `step-${Date.now()}`,
      title: newStep.title,
      description: newStep.description || '',
      category: newStep.category || 'custom',
      dependencies: newStep.dependencies || [],
      variables: newStep.variables || {},
      order: currentWorkflow.steps.length + 1
    };

    const updatedWorkflow = {
      ...currentWorkflow,
      steps: [...currentWorkflow.steps, step],
      updatedAt: new Date()
    };

    setCurrentWorkflow(updatedWorkflow);
    setWorkflows(prev => prev.map(w => w.id === updatedWorkflow.id ? updatedWorkflow : w));
    setNewStep({ title: '', description: '', category: 'custom', dependencies: [], variables: {} });
    setIsCreatingStep(false);
    toast.success('Step added to workflow!');
  };

  const handleDeleteStep = (stepId: string) => {
    if (!currentWorkflow) return;

    const updatedSteps = currentWorkflow.steps
      .filter(step => step.id !== stepId)
      .map((step, index) => ({ ...step, order: index + 1 }));

    const updatedWorkflow = {
      ...currentWorkflow,
      steps: updatedSteps,
      updatedAt: new Date()
    };

    setCurrentWorkflow(updatedWorkflow);
    setWorkflows(prev => prev.map(w => w.id === updatedWorkflow.id ? updatedWorkflow : w));
    toast.success('Step removed from workflow');
  };

  const handleExecuteWorkflow = (workflow: Workflow) => {
    setExecutingWorkflow(workflow);
    setCurrentStepIndex(0);
    toast.success(`Starting workflow: ${workflow.name}`);
  };

  const handleNextStep = () => {
    if (executingWorkflow && currentStepIndex < executingWorkflow.steps.length - 1) {
      setCurrentStepIndex(prev => prev + 1);
    } else if (executingWorkflow) {
      toast.success('Workflow completed! 🎉');
      setExecutingWorkflow(null);
      setCurrentStepIndex(0);
    }
  };

  const currentExecutingStep = executingWorkflow?.steps[currentStepIndex];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Workflow Builder</h3>
          <p className="text-sm text-gray-600">
            Create and manage automated workflows for systematic development processes
          </p>
        </div>
        <div className="flex gap-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                New Workflow
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Workflow</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="workflow-name">Workflow Name</Label>
                  <Input
                    id="workflow-name"
                    value={newWorkflow.name || ''}
                    onChange={(e) => setNewWorkflow(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g., Custom API Development"
                  />
                </div>
                <div>
                  <Label htmlFor="workflow-description">Description</Label>
                  <Textarea
                    id="workflow-description"
                    value={newWorkflow.description || ''}
                    onChange={(e) => setNewWorkflow(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe what this workflow accomplishes..."
                  />
                </div>
                <div>
                  <Label htmlFor="workflow-type">Type</Label>
                  <Select
                    value={newWorkflow.type}
                    onValueChange={(value) => setNewWorkflow(prev => ({ ...prev, type: value as Workflow['type'] }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fullstack">Full-Stack</SelectItem>
                      <SelectItem value="frontend">Frontend</SelectItem>
                      <SelectItem value="backend">Backend</SelectItem>
                      <SelectItem value="api">API</SelectItem>
                      <SelectItem value="custom">Custom</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={handleCreateWorkflow} className="w-full">
                  Create Workflow
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Workflow Execution Panel */}
      {executingWorkflow && (
        <Card className="border-2 border-blue-500 bg-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Play className="w-5 h-5" />
                Executing: {executingWorkflow.name}
              </div>
              <Badge variant="outline">
                Step {currentStepIndex + 1} of {executingWorkflow.steps.length}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {currentExecutingStep && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  {getCategoryIcon(currentExecutingStep.category)}
                  <h4 className="font-medium">{currentExecutingStep.title}</h4>
                  <Badge className={getCategoryColor(currentExecutingStep.category)}>
                    {currentExecutingStep.category}
                  </Badge>
                </div>
                <p className="text-sm text-gray-600">{currentExecutingStep.description}</p>
                
                {currentExecutingStep.dependencies.length > 0 && (
                  <div className="text-xs text-gray-500">
                    Dependencies: {currentExecutingStep.dependencies.join(', ')}
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <Button onClick={handleNextStep} className="flex items-center gap-2">
                    {currentStepIndex < executingWorkflow.steps.length - 1 ? (
                      <>
                        Next Step
                        <ArrowDown className="w-4 h-4" />
                      </>
                    ) : (
                      <>
                        Complete Workflow
                        <Rocket className="w-4 h-4" />
                      </>
                    )}
                  </Button>
                  <Button variant="outline" onClick={() => setExecutingWorkflow(null)}>
                    Stop Workflow
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Workflow Editor */}
      {currentWorkflow && isEditing && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Edit className="w-5 h-5" />
                Editing: {currentWorkflow.name}
              </div>
              <div className="flex gap-2">
                <Dialog open={isCreatingStep} onOpenChange={setIsCreatingStep}>
                  <DialogTrigger asChild>
                    <Button size="sm" className="flex items-center gap-2">
                      <Plus className="w-4 h-4" />
                      Add Step
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add New Step</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="step-title">Step Title</Label>
                        <Input
                          id="step-title"
                          value={newStep.title || ''}
                          onChange={(e) => setNewStep(prev => ({ ...prev, title: e.target.value }))}
                          placeholder="e.g., Create API endpoints"
                        />
                      </div>
                      <div>
                        <Label htmlFor="step-description">Description</Label>
                        <Textarea
                          id="step-description"
                          value={newStep.description || ''}
                          onChange={(e) => setNewStep(prev => ({ ...prev, description: e.target.value }))}
                          placeholder="Describe what this step accomplishes..."
                        />
                      </div>
                      <div>
                        <Label htmlFor="step-category">Category</Label>
                        <Select
                          value={newStep.category}
                          onValueChange={(value) => setNewStep(prev => ({ ...prev, category: value as WorkflowStep['category'] }))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="planning">Planning</SelectItem>
                            <SelectItem value="backend">Backend</SelectItem>
                            <SelectItem value="frontend">Frontend</SelectItem>
                            <SelectItem value="integration">Integration</SelectItem>
                            <SelectItem value="testing">Testing</SelectItem>
                            <SelectItem value="deployment">Deployment</SelectItem>
                            <SelectItem value="custom">Custom</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <Button onClick={handleAddStep} className="w-full">
                        Add Step
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => {
                    setIsEditing(false);
                    onSaveWorkflow(currentWorkflow);
                    toast.success('Workflow saved!');
                  }}
                  className="flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  Save
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId="workflow-steps">
                {(provided) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className="space-y-3"
                  >
                    {currentWorkflow.steps.map((step, index) => (
                      <Draggable key={step.id} draggableId={step.id} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={`p-4 border rounded-lg bg-white ${
                              snapshot.isDragging ? 'shadow-lg' : 'shadow-sm'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className="flex items-center gap-2">
                                  {getCategoryIcon(step.category)}
                                  <span className="font-medium">{step.title}</span>
                                  <Badge className={getCategoryColor(step.category)}>
                                    {step.category}
                                  </Badge>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => setSelectedStep(step)}
                                >
                                  <Edit className="w-3 h-3" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleDeleteStep(step.id)}
                                >
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              </div>
                            </div>
                            <p className="text-sm text-gray-600 mt-2">{step.description}</p>
                            {step.dependencies.length > 0 && (
                              <div className="text-xs text-gray-500 mt-2">
                                Dependencies: {step.dependencies.join(', ')}
                              </div>
                            )}
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          </CardContent>
        </Card>
      )}

      {/* Workflow Templates Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {workflows.map((workflow) => (
          <Card key={workflow.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <GitBranch className="w-5 h-5" />
                  {workflow.name}
                </div>
                <div className="flex gap-1">
                  <Badge variant="secondary">{workflow.type}</Badge>
                  {workflow.isTemplate && (
                    <Badge variant="outline">Template</Badge>
                  )}
                </div>
              </CardTitle>
              <p className="text-sm text-gray-600">{workflow.description}</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">{workflow.steps.length} steps</span>
                  <span className="text-gray-500">~{workflow.estimatedTime}</span>
                </div>
                
                <div className="flex flex-wrap gap-1">
                  {workflow.steps.slice(0, 4).map((step, index) => (
                    <Badge key={index} variant="outline" className={`text-xs ${getCategoryColor(step.category)}`}>
                      {step.category}
                    </Badge>
                  ))}
                  {workflow.steps.length > 4 && (
                    <Badge variant="outline" className="text-xs">
                      +{workflow.steps.length - 4} more
                    </Badge>
                  )}
                </div>

                <Separator />

                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    onClick={() => handleExecuteWorkflow(workflow)}
                    className="flex items-center gap-1"
                  >
                    <Play className="w-3 h-3" />
                    Run
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => {
                      setCurrentWorkflow(workflow);
                      setIsEditing(true);
                    }}
                    className="flex items-center gap-1"
                  >
                    <Edit className="w-3 h-3" />
                    Edit
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => {
                      const clonedWorkflow = {
                        ...workflow,
                        id: `workflow-${Date.now()}`,
                        name: `${workflow.name} (Copy)`,
                        isTemplate: false,
                        createdAt: new Date(),
                        updatedAt: new Date()
                      };
                      setWorkflows(prev => [...prev, clonedWorkflow]);
                      toast.success('Workflow cloned!');
                    }}
                    className="flex items-center gap-1"
                  >
                    <Copy className="w-3 h-3" />
                    Clone
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