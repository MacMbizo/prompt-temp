
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Settings, Code, FileText, Download, Upload, Plus, Edit, Trash2, Copy } from 'lucide-react';
import { toast } from 'sonner';

interface IDERule {
  id: string;
  name: string;
  description: string;
  type: 'eslint' | 'prettier' | 'tsconfig' | 'gitignore' | 'docker' | 'package' | 'custom';
  language: string;
  framework: string;
  content: string;
  tags: string[];
  created_at: string;
}

interface IDERulesVaultProps {
  onApplyRule: (rule: IDERule) => void;
}

const DEFAULT_RULES: IDERule[] = [
  {
    id: 'react-eslint',
    name: 'React + TypeScript ESLint',
    description: 'Comprehensive ESLint rules for React with TypeScript',
    type: 'eslint',
    language: 'TypeScript',
    framework: 'React',
    content: `{
  "extends": [
    "@typescript-eslint/recommended",
    "plugin:react/recommended",
    "plugin:react-hooks/recommended"
  ],
  "rules": {
    "react/react-in-jsx-scope": "off",
    "@typescript-eslint/no-unused-vars": "error",
    "react-hooks/exhaustive-deps": "warn",
    "prefer-const": "error",
    "no-var": "error"
  }
}`,
    tags: ['react', 'typescript', 'eslint', 'frontend'],
    created_at: new Date().toISOString()
  },
  {
    id: 'prettier-config',
    name: 'Standard Prettier Config',
    description: 'Prettier configuration for consistent code formatting',
    type: 'prettier',
    language: 'JavaScript',
    framework: 'Universal',
    content: `{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 80,
  "bracketSpacing": true,
  "arrowParens": "avoid"
}`,
    tags: ['prettier', 'formatting', 'universal'],
    created_at: new Date().toISOString()
  },
  {
    id: 'tsconfig-strict',
    name: 'Strict TypeScript Config',
    description: 'Strict TypeScript configuration for maximum type safety',
    type: 'tsconfig',
    language: 'TypeScript',
    framework: 'Universal',
    content: `{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}`,
    tags: ['typescript', 'strict', 'configuration'],
    created_at: new Date().toISOString()
  },
  {
    id: 'docker-node',
    name: 'Node.js Docker Setup',
    description: 'Docker configuration for Node.js applications',
    type: 'docker',
    language: 'JavaScript',
    framework: 'Node.js',
    content: `FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 3000

USER node

CMD ["npm", "start"]`,
    tags: ['docker', 'nodejs', 'deployment'],
    created_at: new Date().toISOString()
  },
  {
    id: 'gitignore-node',
    name: 'Node.js .gitignore',
    description: 'Comprehensive .gitignore for Node.js projects',
    type: 'gitignore',
    language: 'JavaScript',
    framework: 'Node.js',
    content: `# Dependencies
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Runtime data
pids
*.pid
*.seed
*.pid.lock

# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Build outputs
dist/
build/
.next/
out/

# IDE files
.vscode/
.idea/
*.swp
*.swo

# OS generated files
.DS_Store
.DS_Store?
._*
.Spotlight-V100
.Trashes
ehthumbs.db
Thumbs.db`,
    tags: ['gitignore', 'nodejs', 'version-control'],
    created_at: new Date().toISOString()
  }
];

export const IDERulesVault: React.FC<IDERulesVaultProps> = ({ onApplyRule }) => {
  const [rules, setRules] = useState<IDERule[]>(DEFAULT_RULES);
  const [selectedRule, setSelectedRule] = useState<IDERule | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [newRule, setNewRule] = useState<Partial<IDERule>>({
    name: '',
    description: '',
    type: 'custom',
    language: '',
    framework: '',
    content: '',
    tags: []
  });

  const filteredRules = rules.filter(rule => {
    const matchesSearch = !searchQuery || 
      rule.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rule.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rule.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesType = filterType === 'all' || rule.type === filterType;
    
    return matchesSearch && matchesType;
  });

  const handleCreateRule = () => {
    if (!newRule.name || !newRule.content) {
      toast.error('Please fill in the required fields');
      return;
    }

    const rule: IDERule = {
      id: `rule-${Date.now()}`,
      name: newRule.name,
      description: newRule.description || '',
      type: newRule.type as IDERule['type'],
      language: newRule.language || '',
      framework: newRule.framework || '',
      content: newRule.content,
      tags: newRule.tags || [],
      created_at: new Date().toISOString()
    };

    setRules(prev => [...prev, rule]);
    setNewRule({
      name: '',
      description: '',
      type: 'custom',
      language: '',
      framework: '',
      content: '',
      tags: []
    });
    setIsCreating(false);
    toast.success('IDE rule created successfully!');
  };

  const getTypeIcon = (type: IDERule['type']) => {
    switch (type) {
      case 'eslint': return <Code className="w-4 h-4" />;
      case 'prettier': return <FileText className="w-4 h-4" />;
      case 'tsconfig': return <Settings className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const getTypeColor = (type: IDERule['type']) => {
    switch (type) {
      case 'eslint': return 'bg-red-100 text-red-800';
      case 'prettier': return 'bg-purple-100 text-purple-800';
      case 'tsconfig': return 'bg-blue-100 text-blue-800';
      case 'docker': return 'bg-cyan-100 text-cyan-800';
      case 'gitignore': return 'bg-gray-100 text-gray-800';
      case 'package': return 'bg-green-100 text-green-800';
      default: return 'bg-orange-100 text-orange-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">IDE Rules Vault</h3>
          <p className="text-sm text-gray-600">Store and manage coding standards, configurations, and development rules</p>
        </div>
        <Dialog open={isCreating} onOpenChange={setIsCreating}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Add Rule
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New IDE Rule</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Name</label>
                  <Input
                    value={newRule.name}
                    onChange={(e) => setNewRule(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g., React ESLint Config"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Type</label>
                  <Select 
                    value={newRule.type} 
                    onValueChange={(value) => setNewRule(prev => ({ ...prev, type: value as IDERule['type'] }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="eslint">ESLint</SelectItem>
                      <SelectItem value="prettier">Prettier</SelectItem>
                      <SelectItem value="tsconfig">TypeScript Config</SelectItem>
                      <SelectItem value="gitignore">.gitignore</SelectItem>
                      <SelectItem value="docker">Docker</SelectItem>
                      <SelectItem value="package">Package.json</SelectItem>
                      <SelectItem value="custom">Custom</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Language</label>
                  <Input
                    value={newRule.language}
                    onChange={(e) => setNewRule(prev => ({ ...prev, language: e.target.value }))}
                    placeholder="e.g., TypeScript, JavaScript"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Framework</label>
                  <Input
                    value={newRule.framework}
                    onChange={(e) => setNewRule(prev => ({ ...prev, framework: e.target.value }))}
                    placeholder="e.g., React, Node.js, Vue"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Description</label>
                <Input
                  value={newRule.description}
                  onChange={(e) => setNewRule(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Brief description of what this rule does"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Configuration Content</label>
                <Textarea
                  value={newRule.content}
                  onChange={(e) => setNewRule(prev => ({ ...prev, content: e.target.value }))}
                  placeholder="Paste your configuration file content here..."
                  className="min-h-[200px] font-mono text-sm"
                />
              </div>

              <Button onClick={handleCreateRule} className="w-full">
                Create IDE Rule
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search and Filter */}
      <div className="flex gap-4">
        <div className="flex-1">
          <Input
            placeholder="Search rules..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="eslint">ESLint</SelectItem>
            <SelectItem value="prettier">Prettier</SelectItem>
            <SelectItem value="tsconfig">TypeScript</SelectItem>
            <SelectItem value="docker">Docker</SelectItem>
            <SelectItem value="gitignore">.gitignore</SelectItem>
            <SelectItem value="custom">Custom</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Rules Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredRules.map((rule) => (
          <Card key={rule.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getTypeIcon(rule.type)}
                  <span className="text-sm font-medium truncate">{rule.name}</span>
                </div>
                <Badge className={`text-xs ${getTypeColor(rule.type)}`}>
                  {rule.type}
                </Badge>
              </CardTitle>
              <p className="text-xs text-gray-600 line-clamp-2">{rule.description}</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <span>{rule.language}</span>
                  {rule.framework && (
                    <>
                      <span>•</span>
                      <span>{rule.framework}</span>
                    </>
                  )}
                </div>

                <div className="flex flex-wrap gap-1">
                  {rule.tags.slice(0, 3).map((tag, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>

                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    onClick={() => onApplyRule(rule)}
                    className="flex items-center gap-1"
                  >
                    <Download className="w-3 h-3" />
                    Apply
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => setSelectedRule(rule)}
                    className="flex items-center gap-1"
                  >
                    <Edit className="w-3 h-3" />
                    View
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Rule Detail Dialog */}
      <Dialog open={!!selectedRule} onOpenChange={() => setSelectedRule(null)}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedRule && getTypeIcon(selectedRule.type)}
              {selectedRule?.name}
            </DialogTitle>
          </DialogHeader>
          {selectedRule && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <Badge className={getTypeColor(selectedRule.type)}>
                  {selectedRule.type}
                </Badge>
                <span className="text-sm text-gray-600">
                  {selectedRule.language} • {selectedRule.framework}
                </span>
              </div>
              
              <p className="text-sm text-gray-600">{selectedRule.description}</p>
              
              <div>
                <label className="text-sm font-medium">Configuration:</label>
                <Textarea
                  value={selectedRule.content}
                  readOnly
                  className="mt-2 min-h-[300px] font-mono text-sm bg-gray-50"
                />
              </div>

              <div className="flex gap-2">
                <Button onClick={() => onApplyRule(selectedRule)}>
                  Apply Rule
                </Button>
                <Button variant="outline" onClick={() => navigator.clipboard.writeText(selectedRule.content)}>
                  <Copy className="w-4 h-4 mr-2" />
                  Copy
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
