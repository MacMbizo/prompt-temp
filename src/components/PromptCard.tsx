
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Copy, Edit, MoreVertical, Trash2, Star, Users } from 'lucide-react';
import { Prompt } from '@/hooks/usePrompts';
import { TemplateVariableFiller } from '@/components/TemplateVariableFiller';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

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

interface PromptCardProps {
  prompt: Prompt & { createdAt: Date; updatedAt: Date };
  onDelete: (id: string) => void;
  onDuplicate: (prompt: Prompt) => void;
}

export const PromptCard: React.FC<PromptCardProps> = ({ prompt, onDelete, onDuplicate }) => {
  const { user } = useAuth();
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [filledContent, setFilledContent] = useState('');
  const [selectedPlatform, setSelectedPlatform] = useState<string>('');

  const handleCopy = async (content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      
      // Track copy history if user is logged in
      if (user && selectedPlatform) {
        await supabase
          .from('copy_history')
          .insert({
            user_id: user.id,
            prompt_id: prompt.id,
            platform_used: selectedPlatform
          });
      }
      
      toast.success('Prompt copied to clipboard!');
      setIsPreviewOpen(false);
    } catch (error) {
      toast.error('Failed to copy prompt');
    }
  };

  const handlePreview = () => {
    if (prompt.is_template) {
      setFilledContent(prompt.content);
    }
    setIsPreviewOpen(true);
  };

  const getQualityBadge = () => {
    const rating = prompt.average_rating || 0;
    const count = prompt.rating_count || 0;
    
    if (count < 3) return null;
    
    if (rating >= 4.5) return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">⭐ Premium</Badge>;
    if (rating >= 4.0) return <Badge variant="secondary" className="bg-green-100 text-green-800">✓ Verified</Badge>;
    if (rating >= 3.5) return <Badge variant="secondary" className="bg-blue-100 text-blue-800">👍 Good</Badge>;
    
    return null;
  };

  return (
    <>
      <Card className="h-full flex flex-col hover:shadow-lg transition-shadow duration-200">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <CardTitle className="text-lg font-semibold text-gray-800 line-clamp-2">
              {prompt.title}
              {prompt.is_community && (
                <Badge variant="outline" className="ml-2 text-xs">
                  <Users className="w-3 h-3 mr-1" />
                  Community
                </Badge>
              )}
            </CardTitle>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onDuplicate(prompt)}>
                  <Copy className="w-4 h-4 mr-2" />
                  Duplicate
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onDelete(prompt.id)}>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          
          <div className="flex items-center justify-between">
            <Badge variant="outline" className="text-xs">
              {prompt.category}
            </Badge>
            {getQualityBadge()}
          </div>
        </CardHeader>

        <CardContent className="flex-1 pb-3">
          {prompt.description && (
            <p className="text-sm text-gray-600 mb-3 line-clamp-2">
              {prompt.description}
            </p>
          )}

          <p className="text-sm text-gray-700 mb-3 line-clamp-3">
            {prompt.content}
          </p>

          {prompt.platforms && prompt.platforms.length > 0 && (
            <div className="mb-3">
              <p className="text-xs text-gray-500 mb-1">Compatible with:</p>
              <div className="flex flex-wrap gap-1">
                {prompt.platforms.slice(0, 3).map((platform) => (
                  <Badge key={platform} variant="secondary" className="text-xs">
                    {getPlatformIcon(platform)} {platform}
                  </Badge>
                ))}
                {prompt.platforms.length > 3 && (
                  <Badge variant="secondary" className="text-xs">
                    +{prompt.platforms.length - 3} more
                  </Badge>
                )}
              </div>
            </div>
          )}

          {prompt.tags && prompt.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {prompt.tags.slice(0, 3).map((tag) => (
                <Badge key={tag} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
              {prompt.tags.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{prompt.tags.length - 3}
                </Badge>
              )}
            </div>
          )}

          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>{prompt.createdAt.toLocaleDateString()}</span>
            <div className="flex items-center space-x-3">
              {prompt.copy_count > 0 && (
                <span className="flex items-center">
                  <Copy className="w-3 h-3 mr-1" />
                  {prompt.copy_count}
                </span>
              )}
              {prompt.rating_count > 0 && (
                <span className="flex items-center">
                  <Star className="w-3 h-3 mr-1" />
                  {prompt.average_rating?.toFixed(1)} ({prompt.rating_count})
                </span>
              )}
            </div>
          </div>
        </CardContent>

        <CardFooter className="pt-3">
          <Button 
            onClick={handlePreview}
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
          >
            {prompt.is_template ? 'Use Template' : 'Copy Prompt'}
          </Button>
        </CardFooter>
      </Card>

      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{prompt.title}</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {prompt.is_template && prompt.variables && prompt.variables.length > 0 ? (
              <TemplateVariableFiller
                content={prompt.content}
                variables={prompt.variables}
                onContentChange={setFilledContent}
              />
            ) : (
              <Textarea
                value={prompt.content}
                readOnly
                className="min-h-[200px]"
              />
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium">Select AI Platform:</label>
              <Select value={selectedPlatform} onValueChange={setSelectedPlatform}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose the AI platform you'll use this with" />
                </SelectTrigger>
                <SelectContent>
                  {AVAILABLE_PLATFORMS.map((platform) => (
                    <SelectItem key={platform} value={platform}>
                      {getPlatformIcon(platform)} {platform}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button 
              onClick={() => handleCopy(prompt.is_template ? filledContent : prompt.content)}
              className="w-full"
              disabled={!selectedPlatform}
            >
              <Copy className="w-4 h-4 mr-2" />
              Copy to Clipboard
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
