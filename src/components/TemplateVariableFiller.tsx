
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Copy, Wand2 } from 'lucide-react';
import { toast } from 'sonner';
import type { Prompt, PromptVariable } from '@/hooks/usePrompts';

interface TemplateVariableFillerProps {
  isOpen: boolean;
  onClose: () => void;
  promptText: string;
  variables: PromptVariable[];
  onCopy: (text: string) => void;
}

export const TemplateVariableFiller = ({ isOpen, onClose, promptText, variables, onCopy }: TemplateVariableFillerProps) => {
  const [variableValues, setVariableValues] = useState<Record<string, string>>({});
  const [generatedPrompt, setGeneratedPrompt] = useState('');

  useEffect(() => {
    // Initialize with default values
    const defaults: Record<string, string> = {};
    variables.forEach(variable => {
      defaults[variable.name] = variable.defaultValue || '';
    });
    setVariableValues(defaults);
  }, [variables]);

  useEffect(() => {
    // Generate the prompt with current variable values
    let generated = promptText;
    variables.forEach(variable => {
      const value = variableValues[variable.name] || `{${variable.name}}`;
      const regex = new RegExp(`\{${variable.name}\}`, 'g');
      generated = generated.replace(regex, value);
    });
    setGeneratedPrompt(generated);
  }, [promptText, variables, variableValues]);

  const handleVariableChange = (variableName: string, value: string) => {
    setVariableValues(prev => ({
      ...prev,
      [variableName]: value
    }));
  };

  const handleCopyPrompt = () => {
    onCopy(generatedPrompt);
    toast.success('Generated prompt copied to clipboard!');
    onClose();
  };

  const renderVariableInput = (variable: PromptVariable) => {
    const value = variableValues[variable.name] || '';

    switch (variable.type) {
      case 'select':
        return (
          <Select value={value} onValueChange={(val) => handleVariableChange(variable.name, val)}>
            <SelectTrigger>
              <SelectValue placeholder="Select an option" />
            </SelectTrigger>
            <SelectContent>
              {variable.options?.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      case 'number':
        return (
          <Input
            type="number"
            value={value}
            onChange={(e) => handleVariableChange(variable.name, e.target.value)}
            placeholder={variable.defaultValue || 'Enter a number'}
          />
        );
      default:
        return (
          <Input
            value={value}
            onChange={(e) => handleVariableChange(variable.name, e.target.value)}
            placeholder={variable.defaultValue || `Enter ${variable.name}`}
          />
        );
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wand2 className="w-5 h-5 text-purple-600" />
            Fill Template Variables
          </DialogTitle>
          <div className="flex items-center gap-2 mt-2">
            <Badge className="bg-purple-100 text-purple-800 text-xs">Template</Badge>
            <span className="text-sm text-gray-600">Template Variable Filler</span>
          </div>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4">
          {/* Variables Form */}
          <div className="space-y-4">
            <h3 className="font-medium text-gray-900">Template Variables</h3>
            {variables.length === 0 && (
              <p className="text-gray-500">This prompt doesn't have any variables to fill.</p>
            )}
            {variables.map((variable) => (
              <div key={variable.name} className="space-y-2">
                <div className="flex items-center gap-2">
                  <Label className="text-sm font-medium">{variable.name}</Label>
                  <Badge variant="outline" className="text-xs">
                    {variable.type}
                  </Badge>
                </div>
                {variable.description && (
                  <p className="text-xs text-gray-600">{variable.description}</p>
                )}
                {renderVariableInput(variable)}
              </div>
            ))}
          </div>

          {/* Generated Prompt Preview */}
          <div className="space-y-4">
            <h3 className="font-medium text-gray-900">Generated Prompt</h3>
            <Textarea
              value={generatedPrompt}
              readOnly
              className="min-h-[300px] bg-gray-50 border-gray-200 text-sm"
            />
            <Button
              onClick={handleCopyPrompt}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
            >
              <Copy className="w-4 h-4 mr-2" />
              Copy Generated Prompt
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
