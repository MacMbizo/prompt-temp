
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2 } from 'lucide-react';
import type { PromptVariable } from '@/hooks/usePrompts';

interface TemplateVariableManagerProps {
  variables: PromptVariable[];
  onChange: (variables: PromptVariable[]) => void;
}

export const TemplateVariableManager = ({ variables, onChange }: TemplateVariableManagerProps) => {
  const [newVariable, setNewVariable] = useState<Partial<PromptVariable>>({
    name: '',
    description: '',
    type: 'text',
    defaultValue: ''
  });

  const addVariable = () => {
    if (!newVariable.name?.trim()) return;
    
    const variable: PromptVariable = {
      name: newVariable.name.trim(),
      description: newVariable.description || '',
      type: newVariable.type || 'text',
      defaultValue: newVariable.defaultValue || '',
      options: newVariable.type === 'select' ? newVariable.options : undefined
    };

    onChange([...variables, variable]);
    setNewVariable({ name: '', description: '', type: 'text', defaultValue: '' });
  };

  const removeVariable = (index: number) => {
    onChange(variables.filter((_, i) => i !== index));
  };

  const updateNewVariableOptions = (optionsText: string) => {
    const options = optionsText.split(',').map(opt => opt.trim()).filter(Boolean);
    setNewVariable(prev => ({ ...prev, options }));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium text-gray-700">Template Variables</Label>
        <Badge variant="secondary" className="text-xs">
          {variables.length} variable{variables.length !== 1 ? 's' : ''}
        </Badge>
      </div>

      {variables.length > 0 && (
        <div className="space-y-2">
          {variables.map((variable, index) => (
            <Card key={index} className="border border-gray-200">
              <CardContent className="p-3">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline" className="text-xs">
                        {variable.type}
                      </Badge>
                      <span className="font-medium text-sm">{variable.name}</span>
                    </div>
                    {variable.description && (
                      <p className="text-xs text-gray-600">{variable.description}</p>
                    )}
                    {variable.defaultValue && (
                      <p className="text-xs text-gray-500">Default: {variable.defaultValue}</p>
                    )}
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeVariable(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Card className="border border-dashed border-gray-300">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Add New Variable</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">Variable Name</Label>
              <Input
                value={newVariable.name || ''}
                onChange={(e) => setNewVariable(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., topic, tone, audience"
                className="text-sm"
              />
            </div>
            <div>
              <Label className="text-xs">Type</Label>
              <Select
                value={newVariable.type}
                onValueChange={(value: 'text' | 'select' | 'number') => 
                  setNewVariable(prev => ({ ...prev, type: value }))
                }
              >
                <SelectTrigger className="text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="text">Text</SelectItem>
                  <SelectItem value="select">Select</SelectItem>
                  <SelectItem value="number">Number</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label className="text-xs">Description (optional)</Label>
            <Input
              value={newVariable.description || ''}
              onChange={(e) => setNewVariable(prev => ({ ...prev, description: e.target.value }))}
              placeholder="What this variable is for"
              className="text-sm"
            />
          </div>

          <div>
            <Label className="text-xs">Default Value (optional)</Label>
            <Input
              value={newVariable.defaultValue || ''}
              onChange={(e) => setNewVariable(prev => ({ ...prev, defaultValue: e.target.value }))}
              placeholder="Default value for this variable"
              className="text-sm"
            />
          </div>

          {newVariable.type === 'select' && (
            <div>
              <Label className="text-xs">Options (comma-separated)</Label>
              <Textarea
                value={newVariable.options?.join(', ') || ''}
                onChange={(e) => updateNewVariableOptions(e.target.value)}
                placeholder="Option 1, Option 2, Option 3"
                className="text-sm min-h-[60px]"
              />
            </div>
          )}

          <Button
            type="button"
            onClick={addVariable}
            size="sm"
            className="w-full"
            disabled={!newVariable.name?.trim()}
          >
            <Plus className="w-3 h-3 mr-1" />
            Add Variable
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
