
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { TagsInput } from '@/components/TagsInput';
import { TemplateVariableManager } from '@/components/TemplateVariableManager';
import type { PromptVariable } from '@/hooks/usePrompts';

interface AddPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (prompt: any) => void;
  categories: string[];
}

const AVAILABLE_PLATFORMS = [
  'ChatGPT',
  'Claude',
  'Gemini',
  'GPT-4',
  'Midjourney',
  'DALL-E',
  'Stable Diffusion',
  'Perplexity',
  'GitHub Copilot',
  'Notion AI'
];

const getPlatformIcon = (platform: string) => {
  const icons = {
    'ChatGPT': '🤖',
    'Claude': '🧠',
    'Gemini': '♊',
    'Midjourney': '🎨',
    'DALL-E': '🖼️',
    'Stable Diffusion': '🌈',
    'GPT-4': '⚡',
    'Perplexity': '🔍',
    'GitHub Copilot': '💻',
    'Notion AI': '📝',
  };
  return icons[platform as keyof typeof icons] || '🔧';
};

export const AddPromptModal: React.FC<AddPromptModalProps> = ({
  isOpen,
  onClose,
  onAdd,
  categories
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [platforms, setPlatforms] = useState<string[]>([]);
  const [isTemplate, setIsTemplate] = useState(false);
  const [variables, setVariables] = useState<PromptVariable[]>([]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !content.trim() || !category) {
      return;
    }

    onAdd({
      title: title.trim(),
      description: description.trim(),
      content: content.trim(),
      category,
      tags: tags.filter(tag => tag.trim()),
      platforms: platforms,
      is_template: isTemplate,
      variables: isTemplate ? variables : []
    });

    // Reset form
    setTitle('');
    setDescription('');
    setContent('');
    setCategory('');
    setTags([]);
    setPlatforms([]);
    setIsTemplate(false);
    setVariables([]);
  };

  const handleClose = () => {
    onClose();
    // Reset form when closing
    setTitle('');
    setDescription('');
    setContent('');
    setCategory('');
    setTags([]);
    setPlatforms([]);
    setIsTemplate(false);
    setVariables([]);
  };

  const handlePlatformToggle = (platform: string) => {
    setPlatforms(prev => 
      prev.includes(platform) 
        ? prev.filter(p => p !== platform)
        : [...prev, platform]
    );
  };

  const handleSelectAllPlatforms = () => {
    setPlatforms(AVAILABLE_PLATFORMS);
  };

  const handleClearAllPlatforms = () => {
    setPlatforms([]);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Prompt</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter prompt title"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of what this prompt does"
              className="min-h-[80px]"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">Prompt Content *</Label>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Enter your prompt content here..."
              className="min-h-[120px]"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category *</Label>
            <Select value={category} onValueChange={setCategory} required>
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Tags</Label>
            <TagsInput
              tags={tags}
              onChange={setTags}
              placeholder="Type to add tags..."
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Compatible AI Platforms</Label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleSelectAllPlatforms}
                  className="text-xs text-purple-600 hover:text-purple-700"
                >
                  Select All
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleClearAllPlatforms}
                  className="text-xs text-gray-500 hover:text-gray-700"
                >
                  Clear All
                </Button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 p-3 border rounded-lg bg-gray-50">
              {AVAILABLE_PLATFORMS.map((platform) => (
                <div key={platform} className="flex items-center space-x-2">
                  <Checkbox
                    id={platform}
                    checked={platforms.includes(platform)}
                    onCheckedChange={() => handlePlatformToggle(platform)}
                  />
                  <Label htmlFor={platform} className="text-sm font-normal cursor-pointer">
                    <span className="mr-1">{getPlatformIcon(platform)}</span>
                    {platform}
                  </Label>
                </div>
              ))}
            </div>
            {platforms.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {platforms.map((platform) => (
                  <Badge key={platform} variant="secondary" className="text-xs">
                    {getPlatformIcon(platform)} {platform}
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="isTemplate"
                checked={isTemplate}
                onCheckedChange={setIsTemplate}
              />
              <Label htmlFor="isTemplate">Make this a template with variables</Label>
            </div>

            {isTemplate && (
              <div className="space-y-2">
                <Label>Template Variables</Label>
                <TemplateVariableManager
                  variables={variables}
                  onChange={setVariables}
                />
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit">Add Prompt</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
