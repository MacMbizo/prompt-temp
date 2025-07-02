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
  Upload,
  Split,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { toast } from 'sonner';
import type { Prompt } from '@/hooks/usePrompts';

interface ConditionalRule {
  id: string;
  type: 'variable' | 'step_result' | 'user_input' | 'external_api';
  operator: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than' | 'exists' | 'not_exists';
  value: string;
  targetVariable?: string;
  targetStepId?: string;
}

interface ConditionalBranch {
  id: string;
  name: string;
  condition: ConditionalRule;
  nextStepId: string;
  isDefault?: boolean;
}

interface WorkflowStep {
  id: string;
  title: string;
  description: string;
  promptId?: string;
  prompt?: Prompt;
  category: 'planning' | 'backend' | 'frontend' | 'integration' | 'testing' | 'deployment' | 'custom' | 'conditional';
  dependencies: string[];
  variables: Record<string, string>;
  order: number;
  isActive?: boolean;
  isCompleted?: boolean;
  // Conditional logic properties
  isConditional?: boolean;
  conditionalBranches?: ConditionalBranch[];
  defaultNextStepId?: string;
  // Execution results
  executionResult?: 'success' | 'failure' | 'skipped';
  outputVariables?: Record<string, string>;
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
  },
  {
    id: 'template-api-only',
    name: 'REST API Development',
    description: 'Focused workflow for building robust REST APIs with documentation and testing',
    type: 'api',
    estimatedTime: '1-2 hours',
    isTemplate: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    steps: [
      {
        id: 'api-planning',
        title: 'API Design & Specification',
        description: 'Define API endpoints, request/response schemas, and OpenAPI specification',
        category: 'planning',
        dependencies: [],
        variables: { apiVersion: 'v1', authRequired: 'true' },
        order: 1
      },
      {
        id: 'api-models',
        title: 'Data Models & Validation',
        description: 'Create data models, validation schemas, and database entities',
        category: 'backend',
        dependencies: ['api-planning'],
        variables: { validationLibrary: 'joi', dbORM: 'prisma' },
        order: 2
      },
      {
        id: 'api-auth',
        title: 'Authentication & Authorization',
        description: 'Implement JWT authentication, role-based access control',
        category: 'backend',
        dependencies: ['api-models'],
        variables: { authStrategy: 'jwt', roles: 'admin,user' },
        order: 3
      },
      {
        id: 'api-endpoints',
        title: 'API Endpoints Implementation',
        description: 'Build CRUD endpoints with proper error handling and status codes',
        category: 'backend',
        dependencies: ['api-auth'],
        variables: { framework: 'express', errorHandling: 'middleware' },
        order: 4
      },
      {
        id: 'api-testing',
        title: 'API Testing Suite',
        description: 'Create unit tests, integration tests, and API documentation',
        category: 'testing',
        dependencies: ['api-endpoints'],
        variables: { testFramework: 'jest', apiDocs: 'swagger' },
        order: 5
      },
      {
        id: 'api-deployment',
        title: 'API Deployment & Monitoring',
        description: 'Deploy API with monitoring, logging, and rate limiting',
        category: 'deployment',
        dependencies: ['api-testing'],
        variables: { platform: 'railway', monitoring: 'sentry' },
        order: 6
      }
    ]
  },
  {
    id: 'template-frontend-spa',
    name: 'Frontend Single Page Application',
    description: 'Modern frontend development workflow with state management and testing',
    type: 'frontend',
    estimatedTime: '1.5-3 hours',
    isTemplate: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    steps: [
      {
        id: 'spa-setup',
        title: 'Project Setup & Configuration',
        description: 'Initialize project with build tools, linting, and development environment',
        category: 'planning',
        dependencies: [],
        variables: { framework: 'react', bundler: 'vite', linter: 'eslint' },
        order: 1
      },
      {
        id: 'spa-routing',
        title: 'Routing & Navigation',
        description: 'Set up client-side routing with protected routes and navigation',
        category: 'frontend',
        dependencies: ['spa-setup'],
        variables: { router: 'react-router', authGuards: 'true' },
        order: 2
      },
      {
        id: 'spa-state',
        title: 'State Management',
        description: 'Implement global state management and data fetching patterns',
        category: 'frontend',
        dependencies: ['spa-routing'],
        variables: { stateManager: 'zustand', dataFetching: 'react-query' },
        order: 3
      },
      {
        id: 'spa-components',
        title: 'UI Components & Styling',
        description: 'Build reusable components with consistent styling and theming',
        category: 'frontend',
        dependencies: ['spa-state'],
        variables: { uiLibrary: 'shadcn', styling: 'tailwind' },
        order: 4
      },
      {
        id: 'spa-integration',
        title: 'API Integration & Error Handling',
        description: 'Connect to backend APIs with proper error boundaries and loading states',
        category: 'integration',
        dependencies: ['spa-components'],
        variables: { httpClient: 'axios', errorBoundary: 'react-error-boundary' },
        order: 5
      },
      {
        id: 'spa-testing',
        title: 'Frontend Testing',
        description: 'Add unit tests, component tests, and end-to-end testing',
        category: 'testing',
        dependencies: ['spa-integration'],
        variables: { unitTests: 'vitest', e2eTests: 'playwright' },
        order: 6
      },
      {
        id: 'spa-optimization',
        title: 'Performance Optimization',
        description: 'Implement code splitting, lazy loading, and performance monitoring',
        category: 'deployment',
        dependencies: ['spa-testing'],
        variables: { bundleAnalyzer: 'true', lazyLoading: 'true' },
        order: 7
      }
    ]
  },
  {
    id: 'template-testing-qa',
    name: 'Comprehensive Testing & QA',
    description: 'Complete testing workflow covering all aspects of quality assurance',
    type: 'custom',
    estimatedTime: '2-3 hours',
    isTemplate: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    steps: [
      {
        id: 'test-strategy',
        title: 'Test Strategy & Planning',
        description: 'Define testing approach, coverage goals, and test environments',
        category: 'planning',
        dependencies: [],
        variables: { testPyramid: 'unit-integration-e2e', coverage: '90%' },
        order: 1
      },
      {
        id: 'unit-tests',
        title: 'Unit Testing Implementation',
        description: 'Create comprehensive unit tests for all components and functions',
        category: 'testing',
        dependencies: ['test-strategy'],
        variables: { framework: 'jest', mocking: 'jest.mock' },
        order: 2
      },
      {
        id: 'integration-tests',
        title: 'Integration Testing',
        description: 'Test component interactions and API integrations',
        category: 'testing',
        dependencies: ['unit-tests'],
        variables: { testingLibrary: 'react-testing-library', apiMocking: 'msw' },
        order: 3
      },
      {
        id: 'e2e-tests',
        title: 'End-to-End Testing',
        description: 'Implement user journey tests and critical path validation',
        category: 'testing',
        dependencies: ['integration-tests'],
        variables: { e2eFramework: 'playwright', browsers: 'chrome,firefox,safari' },
        order: 4
      },
      {
        id: 'performance-tests',
        title: 'Performance Testing',
        description: 'Load testing, stress testing, and performance benchmarking',
        category: 'testing',
        dependencies: ['e2e-tests'],
        variables: { loadTesting: 'k6', metrics: 'lighthouse' },
        order: 5
      },
      {
        id: 'security-tests',
        title: 'Security Testing',
        description: 'Vulnerability scanning, penetration testing, and security audits',
        category: 'testing',
        dependencies: ['performance-tests'],
        variables: { securityScan: 'snyk', penTest: 'owasp-zap' },
        order: 6
      },
      {
        id: 'test-automation',
        title: 'Test Automation & CI/CD',
        description: 'Set up automated testing pipeline and continuous quality gates',
        category: 'deployment',
        dependencies: ['security-tests'],
        variables: { cicd: 'github-actions', qualityGates: 'sonarqube' },
        order: 7
      }
    ]
  },
  {
    id: 'template-devops-cicd',
    name: 'DevOps & CI/CD Pipeline',
    description: 'Complete DevOps workflow for automated deployment and infrastructure',
    type: 'custom',
    estimatedTime: '2-4 hours',
    isTemplate: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    steps: [
      {
        id: 'infra-planning',
        title: 'Infrastructure Planning',
        description: 'Design cloud architecture, resource requirements, and scaling strategy',
        category: 'planning',
        dependencies: [],
        variables: { cloudProvider: 'aws', architecture: 'microservices' },
        order: 1
      },
      {
        id: 'iac-setup',
        title: 'Infrastructure as Code',
        description: 'Create infrastructure templates using Terraform or CloudFormation',
        category: 'deployment',
        dependencies: ['infra-planning'],
        variables: { iacTool: 'terraform', stateManagement: 's3' },
        order: 2
      },
      {
        id: 'containerization',
        title: 'Containerization & Orchestration',
        description: 'Create Docker containers and Kubernetes manifests',
        category: 'deployment',
        dependencies: ['iac-setup'],
        variables: { containerRuntime: 'docker', orchestration: 'kubernetes' },
        order: 3
      },
      {
        id: 'cicd-pipeline',
        title: 'CI/CD Pipeline Setup',
        description: 'Build automated pipeline for testing, building, and deployment',
        category: 'deployment',
        dependencies: ['containerization'],
        variables: { cicdTool: 'github-actions', registry: 'docker-hub' },
        order: 4
      },
      {
        id: 'monitoring-setup',
        title: 'Monitoring & Observability',
        description: 'Set up logging, metrics, tracing, and alerting systems',
        category: 'deployment',
        dependencies: ['cicd-pipeline'],
        variables: { monitoring: 'prometheus', logging: 'elk-stack' },
        order: 5
      },
      {
        id: 'security-hardening',
        title: 'Security & Compliance',
        description: 'Implement security best practices and compliance requirements',
        category: 'deployment',
        dependencies: ['monitoring-setup'],
        variables: { secretsManager: 'vault', compliance: 'soc2' },
        order: 6
      },
      {
        id: 'disaster-recovery',
        title: 'Backup & Disaster Recovery',
        description: 'Set up backup strategies and disaster recovery procedures',
        category: 'deployment',
        dependencies: ['security-hardening'],
        variables: { backupStrategy: 'automated', rto: '4hours', rpo: '1hour' },
        order: 7
      }
    ]
  },
  {
    id: 'template-mobile-app',
    name: 'Mobile App Development',
    description: 'Cross-platform mobile application development workflow',
    type: 'custom',
    estimatedTime: '3-5 hours',
    isTemplate: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    steps: [
      {
        id: 'mobile-planning',
        title: 'Mobile App Planning',
        description: 'Define app requirements, target platforms, and user experience',
        category: 'planning',
        dependencies: [],
        variables: { platforms: 'ios,android', framework: 'react-native' },
        order: 1
      },
      {
        id: 'mobile-setup',
        title: 'Development Environment Setup',
        description: 'Configure development tools, emulators, and build systems',
        category: 'planning',
        dependencies: ['mobile-planning'],
        variables: { ide: 'vscode', emulator: 'android-studio' },
        order: 2
      },
      {
        id: 'mobile-navigation',
        title: 'Navigation & Screen Structure',
        description: 'Implement navigation patterns and screen hierarchy',
        category: 'frontend',
        dependencies: ['mobile-setup'],
        variables: { navigation: 'react-navigation', patterns: 'tab,stack,drawer' },
        order: 3
      },
      {
        id: 'mobile-ui',
        title: 'UI Components & Styling',
        description: 'Build responsive UI components with platform-specific styling',
        category: 'frontend',
        dependencies: ['mobile-navigation'],
        variables: { uiLibrary: 'native-base', styling: 'styled-components' },
        order: 4
      },
      {
        id: 'mobile-features',
        title: 'Native Features Integration',
        description: 'Integrate camera, GPS, push notifications, and device APIs',
        category: 'integration',
        dependencies: ['mobile-ui'],
        variables: { camera: 'expo-camera', location: 'expo-location' },
        order: 5
      },
      {
        id: 'mobile-data',
        title: 'Data Management & Offline Support',
        description: 'Implement local storage, caching, and offline functionality',
        category: 'backend',
        dependencies: ['mobile-features'],
        variables: { localStorage: 'async-storage', offline: 'redux-persist' },
        order: 6
      },
      {
        id: 'mobile-testing',
        title: 'Mobile Testing & Debugging',
        description: 'Test on multiple devices, screen sizes, and operating systems',
        category: 'testing',
        dependencies: ['mobile-data'],
        variables: { testing: 'detox', debugging: 'flipper' },
        order: 7
      },
      {
        id: 'mobile-deployment',
        title: 'App Store Deployment',
        description: 'Build release versions and deploy to app stores',
        category: 'deployment',
        dependencies: ['mobile-testing'],
        variables: { buildTool: 'eas-build', stores: 'app-store,play-store' },
        order: 8
      }
    ]
  },
  {
    id: 'template-data-processing',
    name: 'Data Processing & Analytics',
    description: 'End-to-end data pipeline for processing and analytics',
    type: 'custom',
    estimatedTime: '2-4 hours',
    isTemplate: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    steps: [
      {
        id: 'data-requirements',
        title: 'Data Requirements Analysis',
        description: 'Define data sources, processing requirements, and output formats',
        category: 'planning',
        dependencies: [],
        variables: { dataSources: 'api,csv,database', outputFormat: 'json,parquet' },
        order: 1
      },
      {
        id: 'data-ingestion',
        title: 'Data Ingestion Pipeline',
        description: 'Set up data collection from various sources with validation',
        category: 'backend',
        dependencies: ['data-requirements'],
        variables: { ingestionTool: 'apache-kafka', validation: 'json-schema' },
        order: 2
      },
      {
        id: 'data-processing',
        title: 'Data Processing & Transformation',
        description: 'Clean, transform, and enrich data using processing frameworks',
        category: 'backend',
        dependencies: ['data-ingestion'],
        variables: { processingFramework: 'apache-spark', language: 'python' },
        order: 3
      },
      {
        id: 'data-storage',
        title: 'Data Storage & Warehousing',
        description: 'Store processed data in appropriate storage solutions',
        category: 'backend',
        dependencies: ['data-processing'],
        variables: { warehouse: 'snowflake', storage: 's3,postgresql' },
        order: 4
      },
      {
        id: 'data-analytics',
        title: 'Analytics & Visualization',
        description: 'Create dashboards, reports, and analytical insights',
        category: 'frontend',
        dependencies: ['data-storage'],
        variables: { visualization: 'tableau', dashboards: 'grafana' },
        order: 5
      },
      {
        id: 'data-ml',
        title: 'Machine Learning Integration',
        description: 'Implement ML models for predictive analytics and insights',
        category: 'integration',
        dependencies: ['data-analytics'],
        variables: { mlFramework: 'scikit-learn', deployment: 'mlflow' },
        order: 6
      },
      {
        id: 'data-monitoring',
        title: 'Data Quality & Monitoring',
        description: 'Set up data quality checks, monitoring, and alerting',
        category: 'testing',
        dependencies: ['data-ml'],
        variables: { qualityTool: 'great-expectations', monitoring: 'datadog' },
        order: 7
      }
    ]
  },
  {
    id: 'template-conditional',
    name: 'Conditional Development Workflow',
    description: 'Demonstrates conditional logic in workflows based on project complexity',
    type: 'custom',
    estimatedTime: '1-3 hours',
    isTemplate: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    steps: [
      {
        id: 'step-assessment',
        title: 'Project Assessment',
        description: 'Evaluate project requirements and complexity',
        category: 'planning',
        dependencies: [],
        variables: { complexity: 'medium', projectType: '' },
        order: 1
      },
      {
        id: 'step-tech-decision',
        title: 'Technology Decision Point',
        description: 'Choose development approach based on complexity assessment',
        category: 'conditional',
        dependencies: ['step-assessment'],
        variables: {},
        order: 2,
        isConditional: true,
        conditionalBranches: [
          {
            id: 'branch-simple',
            name: 'Simple Project Path',
            condition: {
              id: 'cond-simple',
              type: 'variable',
              operator: 'equals',
              value: 'simple',
              targetVariable: 'complexity'
            },
            nextStepId: 'step-simple-impl'
          },
          {
            id: 'branch-complex',
            name: 'Complex Project Path',
            condition: {
              id: 'cond-complex',
              type: 'variable',
              operator: 'equals',
              value: 'complex',
              targetVariable: 'complexity'
            },
            nextStepId: 'step-complex-impl'
          }
        ],
        defaultNextStepId: 'step-standard-impl'
      },
      {
        id: 'step-simple-impl',
        title: 'Simple Implementation',
        description: 'Quick implementation for simple projects using minimal setup',
        category: 'frontend',
        dependencies: ['step-tech-decision'],
        variables: { approach: 'minimal', framework: 'vanilla' },
        order: 3
      },
      {
        id: 'step-complex-impl',
        title: 'Complex Implementation',
        description: 'Comprehensive implementation with full architecture',
        category: 'backend',
        dependencies: ['step-tech-decision'],
        variables: { approach: 'comprehensive', architecture: 'microservices' },
        order: 4
      },
      {
        id: 'step-standard-impl',
        title: 'Standard Implementation',
        description: 'Balanced implementation approach for medium complexity',
        category: 'integration',
        dependencies: ['step-tech-decision'],
        variables: { approach: 'standard', architecture: 'monolith' },
        order: 5
      },
      {
        id: 'step-final-testing',
        title: 'Final Testing & Validation',
        description: 'Test the implemented solution regardless of chosen path',
        category: 'testing',
        dependencies: ['step-simple-impl', 'step-complex-impl', 'step-standard-impl'],
        variables: { testCoverage: '90%' },
        order: 6
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
    case 'conditional': return <Split className="w-4 h-4" />;
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
    case 'conditional': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'custom': return 'bg-indigo-100 text-indigo-800 border-indigo-200';
    default: return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

const getExecutionResultIcon = (result?: 'success' | 'failure' | 'skipped') => {
  switch (result) {
    case 'success': return <CheckCircle className="w-4 h-4 text-green-600" />;
    case 'failure': return <XCircle className="w-4 h-4 text-red-600" />;
    case 'skipped': return <AlertCircle className="w-4 h-4 text-yellow-600" />;
    default: return null;
  }
};

const evaluateCondition = (condition: ConditionalRule, variables: Record<string, string>, stepResults: Record<string, any>): boolean => {
  let actualValue: string;
  
  switch (condition.type) {
    case 'variable':
      actualValue = variables[condition.targetVariable || ''] || '';
      break;
    case 'step_result':
      actualValue = stepResults[condition.targetStepId || '']?.result || '';
      break;
    case 'user_input':
      // This would be handled during execution with user prompts
      actualValue = condition.value;
      break;
    case 'external_api':
      // This would be handled with actual API calls during execution
      actualValue = condition.value;
      break;
    default:
      actualValue = '';
  }
  
  switch (condition.operator) {
    case 'equals':
      return actualValue === condition.value;
    case 'not_equals':
      return actualValue !== condition.value;
    case 'contains':
      return actualValue.includes(condition.value);
    case 'greater_than':
      return parseFloat(actualValue) > parseFloat(condition.value);
    case 'less_than':
      return parseFloat(actualValue) < parseFloat(condition.value);
    case 'exists':
      return actualValue !== undefined && actualValue !== '';
    case 'not_exists':
      return actualValue === undefined || actualValue === '';
    default:
      return false;
  }
}

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
  const [editingBranch, setEditingBranch] = useState<{ stepId: string; branch: ConditionalBranch } | null>(null);
  const [executingWorkflow, setExecutingWorkflow] = useState<Workflow | null>(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [templateFilter, setTemplateFilter] = useState<string>('all');

  // Filter workflows based on selected template filter
  const filteredWorkflows = workflows.filter(workflow => {
    if (templateFilter === 'all') return true;
    return workflow.type === templateFilter;
  });

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

  const addStep = (isConditional = false) => {
    if (!currentWorkflow) return;
    
    const newStep: WorkflowStep = {
      id: `step-${Date.now()}`,
      title: isConditional ? 'Conditional Step' : 'New Step',
      description: isConditional ? 'Add conditional logic' : 'Enter step description',
      category: isConditional ? 'conditional' : 'custom',
      dependencies: [],
      variables: {},
      order: currentWorkflow.steps.length,
      isConditional,
      conditionalBranches: isConditional ? [] : undefined
    };
    
    setCurrentWorkflow(prev => ({
      ...prev!,
      steps: [...prev!.steps, newStep]
    }));
  };

  const addConditionalBranch = (stepId: string) => {
    const newBranch: ConditionalBranch = {
      id: `branch-${Date.now()}`,
      name: 'New Branch',
      condition: {
        id: `condition-${Date.now()}`,
        type: 'variable',
        operator: 'equals',
        value: '',
        targetVariable: ''
      },
      nextStepId: ''
    };

    setCurrentWorkflow(prev => ({
      ...prev,
      steps: prev.steps.map(step => 
        step.id === stepId && step.isConditional
          ? {
              ...step,
              conditionalBranches: [...(step.conditionalBranches || []), newBranch]
            }
          : step
      )
    }));
  };

  const updateConditionalBranch = (stepId: string, branchId: string, updates: Partial<ConditionalBranch>) => {
    setCurrentWorkflow(prev => ({
      ...prev,
      steps: prev.steps.map(step => 
        step.id === stepId && step.isConditional
          ? {
              ...step,
              conditionalBranches: step.conditionalBranches?.map(branch =>
                branch.id === branchId ? { ...branch, ...updates } : branch
              )
            }
          : step
      )
    }));
  };

  const removeConditionalBranch = (stepId: string, branchId: string) => {
    setCurrentWorkflow(prev => ({
      ...prev,
      steps: prev.steps.map(step => 
        step.id === stepId && step.isConditional
          ? {
              ...step,
              conditionalBranches: step.conditionalBranches?.filter(branch => branch.id !== branchId)
            }
          : step
      )
    }));
  };

  const getNextStepInFlow = (currentStepId: string, variables: Record<string, string>, stepResults: Record<string, any>): string | null => {
    const currentStep = currentWorkflow.steps.find(step => step.id === currentStepId);
    if (!currentStep) return null;

    if (currentStep.isConditional && currentStep.conditionalBranches) {
      // Evaluate conditions in order
      for (const branch of currentStep.conditionalBranches) {
        if (evaluateCondition(branch.condition, variables, stepResults)) {
          return branch.nextStepId;
        }
      }
      // If no conditions match, use default next step
      return currentStep.defaultNextStepId || null;
    }

    // For non-conditional steps, find the next step in order
    const sortedSteps = [...currentWorkflow.steps].sort((a, b) => a.order - b.order);
    const currentIndex = sortedSteps.findIndex(step => step.id === currentStepId);
    return currentIndex < sortedSteps.length - 1 ? sortedSteps[currentIndex + 1].id : null;
  };

  const handleNextStep = () => {
    if (!executingWorkflow) return;
    
    const currentStep = executingWorkflow.steps[currentStepIndex];
    if (!currentStep) return;
    
    // For conditional steps, determine next step based on conditions
    if (currentStep.isConditional) {
      const nextStepId = getNextStepInFlow(currentStep.id, {}, {});
      if (nextStepId) {
        const nextStepIndex = executingWorkflow.steps.findIndex(step => step.id === nextStepId);
        if (nextStepIndex !== -1) {
          setCurrentStepIndex(nextStepIndex);
          return;
        }
      }
    }
    
    // For regular steps, proceed to next step in order
    if (currentStepIndex < executingWorkflow.steps.length - 1) {
      setCurrentStepIndex(prev => prev + 1);
    } else {
      toast.success('Workflow completed! 🎉');
      setExecutingWorkflow(null);
      setCurrentStepIndex(0);
    }
  };
  
  const executeConditionalStep = (step: WorkflowStep, variables: Record<string, string>) => {
    if (!step.isConditional || !step.conditionalBranches) {
      return null;
    }
    
    // Simulate condition evaluation (in real implementation, this would use actual data)
    for (const branch of step.conditionalBranches) {
      // For demo purposes, we'll randomly evaluate conditions
      const conditionMet = Math.random() > 0.5;
      if (conditionMet) {
        return branch.nextStepId;
      }
    }
    
    return step.defaultNextStepId || null;
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
                      <div className="flex gap-2">
                        <Button onClick={handleAddStep} className="flex-1">
                          <Plus className="w-4 h-4 mr-2" />
                          Add Step
                        </Button>
                        <Button onClick={() => {
                          setNewStep(prev => ({ ...prev, category: 'conditional', isConditional: true }));
                          handleAddStep();
                        }} variant="outline" className="flex-1">
                          <Split className="w-4 h-4 mr-2" />
                          Add Conditional
                        </Button>
                      </div>
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
                                  {step.executionResult && (
                                    <div className="flex items-center gap-1">
                                      {getExecutionResultIcon(step.executionResult)}
                                      <span className="text-xs capitalize">{step.executionResult}</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                {step.isConditional && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => addConditionalBranch(step.id)}
                                    title="Add Branch"
                                  >
                                    <GitBranch className="w-3 h-3" />
                                  </Button>
                                )}
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
                            
                            {step.isConditional && step.conditionalBranches && step.conditionalBranches.length > 0 && (
                              <div className="mt-4 pl-4 border-l-2 border-yellow-200">
                                <h5 className="text-sm font-medium text-gray-700 mb-2">Conditional Branches:</h5>
                                {step.conditionalBranches.map((branch) => (
                                  <div key={branch.id} className="mb-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                                    <div className="flex items-center justify-between mb-2">
                                       <span className="text-sm font-medium cursor-pointer hover:text-blue-600" 
                                             onClick={() => setEditingBranch({ stepId: step.id, branch })}>
                                         {branch.name}
                                       </span>
                                       <div className="flex gap-1">
                                         <Button
                                           size="sm"
                                           variant="ghost"
                                           onClick={() => setEditingBranch({ stepId: step.id, branch })}
                                         >
                                           <Edit className="w-3 h-3" />
                                         </Button>
                                         <Button
                                           size="sm"
                                           variant="ghost"
                                           onClick={() => removeConditionalBranch(step.id, branch.id)}
                                         >
                                           <Trash2 className="w-3 h-3" />
                                         </Button>
                                       </div>
                                     </div>
                                    <div className="text-xs text-gray-600">
                                      <span className="font-medium">Condition:</span> {branch.condition.type} {branch.condition.operator} "{branch.condition.value}"
                                      {branch.condition.targetVariable && (
                                        <span> (variable: {branch.condition.targetVariable})</span>
                                      )}
                                      {branch.condition.targetStepId && (
                                        <span> (step: {currentWorkflow?.steps.find(s => s.id === branch.condition.targetStepId)?.title || 'Unknown'})</span>
                                      )}
                                    </div>
                                    <div className="text-xs text-gray-600 mt-1">
                                      <span className="font-medium">Next Step:</span> {currentWorkflow?.steps.find(s => s.id === branch.nextStepId)?.title || 'Not set'}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
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

      {/* Template Statistics */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{workflows.filter(w => w.isTemplate).length}</div>
              <div className="text-sm text-gray-600">Templates Available</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{workflows.reduce((acc, w) => acc + w.steps.length, 0)}</div>
              <div className="text-sm text-gray-600">Total Steps</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{new Set(workflows.flatMap(w => w.steps.map(s => s.category))).size}</div>
              <div className="text-sm text-gray-600">Categories</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{workflows.filter(w => !w.isTemplate).length}</div>
              <div className="text-sm text-gray-600">Custom Workflows</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Start Templates */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Rocket className="w-5 h-5" />
            Quick Start Templates
          </CardTitle>
          <p className="text-sm text-gray-600">Popular workflow templates to get you started quickly</p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {workflows.filter(w => w.isTemplate).slice(0, 3).map((template) => (
              <div key={template.id} className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                   onClick={() => handleExecuteWorkflow(template)}>
                <div className="flex items-center justify-between mb-2">
                  <Badge variant="secondary" className="text-xs">{template.type}</Badge>
                  <span className="text-xs text-gray-500">{template.steps.length} steps</span>
                </div>
                <h5 className="font-medium mb-1">{template.name}</h5>
                <p className="text-sm text-gray-600 line-clamp-2">{template.description}</p>
                <div className="mt-3 flex items-center gap-2">
                  <Play className="w-4 h-4 text-blue-600" />
                  <span className="text-sm text-blue-600 font-medium">Start Workflow</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Workflow Templates Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-lg font-semibold">All Workflow Templates</h4>
          <div className="flex gap-2">
            <Select value={templateFilter} onValueChange={setTemplateFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Templates</SelectItem>
                <SelectItem value="fullstack">Full-Stack</SelectItem>
                <SelectItem value="frontend">Frontend</SelectItem>
                <SelectItem value="backend">Backend</SelectItem>
                <SelectItem value="api">API</SelectItem>
                <SelectItem value="mobile">Mobile</SelectItem>
                <SelectItem value="devops">DevOps</SelectItem>
                <SelectItem value="testing">Testing</SelectItem>
                <SelectItem value="data">Data Processing</SelectItem>
                <SelectItem value="custom">Custom</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredWorkflows.map((workflow) => (
            <Card key={workflow.id} className={`hover:shadow-md transition-shadow ${
              workflow.isTemplate ? 'border-blue-200 bg-blue-50/30' : ''
            }`}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <GitBranch className="w-5 h-5" />
                    <span className="truncate">{workflow.name}</span>
                  </div>
                  <div className="flex gap-1 flex-shrink-0">
                    <Badge variant="secondary" className="text-xs">{workflow.type}</Badge>
                    {workflow.isTemplate && (
                      <Badge variant="outline" className="text-xs bg-blue-100 text-blue-700 border-blue-300">
                        Template
                      </Badge>
                    )}
                  </div>
                </CardTitle>
                <p className="text-sm text-gray-600 line-clamp-2">{workflow.description}</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500">{workflow.steps.length} steps</span>
                      <span className="text-gray-400">•</span>
                      <span className="text-gray-500">~{workflow.estimatedTime}</span>
                    </div>
                    {workflow.isTemplate && (
                      <Badge variant="outline" className="text-xs bg-green-100 text-green-700 border-green-300">
                        Ready to Use
                      </Badge>
                    )}
                  </div>
                  
                  <div className="flex flex-wrap gap-1">
                    {workflow.steps.slice(0, 3).map((step, index) => (
                      <Badge key={index} variant="outline" className={`text-xs ${getCategoryColor(step.category)}`}>
                        {step.category}
                      </Badge>
                    ))}
                    {workflow.steps.length > 3 && (
                      <Badge variant="outline" className="text-xs text-gray-500">
                        +{workflow.steps.length - 3}
                      </Badge>
                    )}
                  </div>

                  <Separator />

                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      onClick={() => handleExecuteWorkflow(workflow)}
                      className="flex items-center gap-1 flex-1"
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
        
        {filteredWorkflows.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <GitBranch className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No workflows found for the selected filter.</p>
          </div>
        )}
      </div>

      {/* Conditional Branch Editor Dialog */}
      <Dialog open={!!editingBranch} onOpenChange={() => setEditingBranch(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Conditional Branch</DialogTitle>
          </DialogHeader>
          {editingBranch && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="branch-name">Branch Name</Label>
                <Input
                  id="branch-name"
                  value={editingBranch.branch.name}
                  onChange={(e) => setEditingBranch(prev => prev ? {
                    ...prev,
                    branch: { ...prev.branch, name: e.target.value }
                  } : null)}
                  placeholder="Enter branch name"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="condition-type">Condition Type</Label>
                  <Select
                    value={editingBranch.branch.condition.type}
                    onValueChange={(value: ConditionalRule['type']) => 
                      setEditingBranch(prev => prev ? {
                        ...prev,
                        branch: {
                          ...prev.branch,
                          condition: { ...prev.branch.condition, type: value }
                        }
                      } : null)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="variable">Variable</SelectItem>
                      <SelectItem value="step_result">Step Result</SelectItem>
                      <SelectItem value="user_input">User Input</SelectItem>
                      <SelectItem value="external_api">External API</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="condition-operator">Operator</Label>
                  <Select
                    value={editingBranch.branch.condition.operator}
                    onValueChange={(value: ConditionalRule['operator']) => 
                      setEditingBranch(prev => prev ? {
                        ...prev,
                        branch: {
                          ...prev.branch,
                          condition: { ...prev.branch.condition, operator: value }
                        }
                      } : null)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="equals">Equals</SelectItem>
                      <SelectItem value="not_equals">Not Equals</SelectItem>
                      <SelectItem value="contains">Contains</SelectItem>
                      <SelectItem value="greater_than">Greater Than</SelectItem>
                      <SelectItem value="less_than">Less Than</SelectItem>
                      <SelectItem value="exists">Exists</SelectItem>
                      <SelectItem value="not_exists">Not Exists</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <Label htmlFor="condition-value">Condition Value</Label>
                <Input
                  id="condition-value"
                  value={editingBranch.branch.condition.value}
                  onChange={(e) => setEditingBranch(prev => prev ? {
                    ...prev,
                    branch: {
                      ...prev.branch,
                      condition: { ...prev.branch.condition, value: e.target.value }
                    }
                  } : null)}
                  placeholder="Enter condition value"
                />
              </div>
              
              {editingBranch.branch.condition.type === 'variable' && (
                <div>
                  <Label htmlFor="target-variable">Target Variable</Label>
                  <Input
                    id="target-variable"
                    value={editingBranch.branch.condition.targetVariable || ''}
                    onChange={(e) => setEditingBranch(prev => prev ? {
                      ...prev,
                      branch: {
                        ...prev.branch,
                        condition: { ...prev.branch.condition, targetVariable: e.target.value }
                      }
                    } : null)}
                    placeholder="Enter variable name"
                  />
                </div>
              )}
              
              {editingBranch.branch.condition.type === 'step_result' && (
                <div>
                  <Label htmlFor="target-step">Target Step</Label>
                  <Select
                    value={editingBranch.branch.condition.targetStepId || ''}
                    onValueChange={(value) => 
                      setEditingBranch(prev => prev ? {
                        ...prev,
                        branch: {
                          ...prev.branch,
                          condition: { ...prev.branch.condition, targetStepId: value }
                        }
                      } : null)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select target step" />
                    </SelectTrigger>
                    <SelectContent>
                      {currentWorkflow?.steps.filter(step => step.id !== editingBranch.stepId).map(step => (
                        <SelectItem key={step.id} value={step.id}>{step.title}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              
              <div>
                <Label htmlFor="next-step">Next Step</Label>
                <Select
                  value={editingBranch.branch.nextStepId}
                  onValueChange={(value) => 
                    setEditingBranch(prev => prev ? {
                      ...prev,
                      branch: { ...prev.branch, nextStepId: value }
                    } : null)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select next step" />
                  </SelectTrigger>
                  <SelectContent>
                    {currentWorkflow?.steps.filter(step => step.id !== editingBranch.stepId).map(step => (
                      <SelectItem key={step.id} value={step.id}>{step.title}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setEditingBranch(null)}>
                  Cancel
                </Button>
                <Button onClick={() => {
                  if (editingBranch) {
                    updateConditionalBranch(editingBranch.stepId, editingBranch.branch.id, editingBranch.branch);
                    setEditingBranch(null);
                  }
                }}>
                  Save Branch
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};