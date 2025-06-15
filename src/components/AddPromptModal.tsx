
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { TemplateVariableManager } from '@/components/TemplateVariableManager';
import type { Prompt, PromptVariable } from '@/hooks/usePrompts';

interface AddPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (prompt: Omit<Prompt, 'id' | 'created_at' | 'updated_at' | 'user_id'>) => void;
  categories: string[];
}

export const AddPromptModal = ({ isOpen, onClose, onAdd, categories }: AddPromptModalProps) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    content: '',
    category: '',
    tags: '',
    is_template: false,
    variables: [] as PromptVariable[]
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.content.trim() || !formData.category) {
      toast.error('Please fill in all required fields');
      return;
    }

    // If it's a template, validate that variables mentioned in content exist
    if (formData.is_template) {
      const variablePattern = /\{(\w+)\}/g;
      const mentionedVariables = [...formData.content.matchAll(variablePattern)].map(match => match[1]);
      const definedVariables = formData.variables.map(v => v.name);
      
      const missingVariables = mentionedVariables.filter(v => !definedVariables.includes(v));
      if (missingVariables.length > 0) {
        toast.error(`Please define these variables: ${missingVariables.join(', ')}`);
        return;
      }
    }

    const newPrompt = {
      title: formData.title.trim(),
      description: formData.description.trim(),
      content: formData.content.trim(),
      category: formData.category,
      tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
      is_template: formData.is_template,
      variables: formData.variables
    };

    onAdd(newPrompt);
    toast.success('Prompt added successfully!');
    
    // Reset form
    setFormData({
      title: '',
      description: '',
      content: '',
      category: '',
      tags: '',
      is_template: false,
      variables: []
    });
    
    onClose();
  };

  const handleInputChange = (field: string, value: string | boolean | PromptVariable[]) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-gray-900">
            Add New AI Prompt
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title" className="text-sm font-medium text-gray-700">
                Title *
              </Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="Enter prompt title"
                className="border-gray-300 focus:border-purple-500"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="category" className="text-sm font-medium text-gray-700">
                Category *
              </Label>
              <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                <SelectTrigger className="border-gray-300 focus:border-purple-500">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium text-gray-700">
              Description
            </Label>
            <Input
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Brief description of the prompt's purpose"
              className="border-gray-300 focus:border-purple-500"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="is_template"
              checked={formData.is_template}
              onCheckedChange={(checked) => handleInputChange('is_template', !!checked)}
            />
            <Label htmlFor="is_template" className="text-sm font-medium text-gray-700">
              This is a template prompt with variables
            </Label>
          </div>

          {formData.is_template && (
            <TemplateVariableManager
              variables={formData.variables}
              onChange={(variables) => handleInputChange('variables', variables)}
            />
          )}

          <div className="space-y-2">
            <Label htmlFor="content" className="text-sm font-medium text-gray-700">
              Prompt Content *
            </Label>
            <Textarea
              id="content"
              value={formData.content}
              onChange={(e) => handleInputChange('content', e.target.value)}
              placeholder={
                formData.is_template 
                  ? "Enter your AI prompt here with variables like {topic}, {tone}, {audience}..."
                  : "Enter your AI prompt here..."
              }
              className="min-h-[150px] border-gray-300 focus:border-purple-500"
            />
            {formData.is_template && (
              <p className="text-xs text-blue-600">
                💡 Use curly braces to define variables: {'{variable_name}'}. Define each variable below.
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="tags" className="text-sm font-medium text-gray-700">
              Tags
            </Label>
            <Input
              id="tags"
              value={formData.tags}
              onChange={(e) => handleInputChange('tags', e.target.value)}
              placeholder="Enter tags separated by commas (e.g., creative, writing, story)"
              className="border-gray-300 focus:border-purple-500"
            />
            <p className="text-xs text-gray-500">Separate multiple tags with commas</p>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
            >
              Add {formData.is_template ? 'Template' : 'Prompt'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
