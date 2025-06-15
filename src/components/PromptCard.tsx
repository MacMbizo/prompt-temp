
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { pencil, image } from 'lucide-react';
import type { Prompt } from '@/pages/Index';

interface PromptCardProps {
  prompt: Prompt;
  onDelete: (id: string) => void;
}

const getCategoryColor = (category: string) => {
  const colors = {
    'Writing': 'bg-green-100 text-green-800',
    'Image Generation': 'bg-purple-100 text-purple-800',
    'Programming': 'bg-blue-100 text-blue-800',
    'Marketing': 'bg-orange-100 text-orange-800',
    'Data Science': 'bg-indigo-100 text-indigo-800',
    'Education': 'bg-yellow-100 text-yellow-800',
    'Business': 'bg-red-100 text-red-800',
    'Creative': 'bg-pink-100 text-pink-800',
  };
  return colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-800';
};

export const PromptCard = ({ prompt, onDelete }: PromptCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleCopyPrompt = async () => {
    try {
      await navigator.clipboard.writeText(prompt.content);
      toast.success('Prompt copied to clipboard!');
    } catch (error) {
      toast.error('Failed to copy prompt');
    }
  };

  const handleDeleteClick = () => {
    if (window.confirm('Are you sure you want to delete this prompt?')) {
      onDelete(prompt.id);
      toast.success('Prompt deleted successfully');
    }
  };

  return (
    <>
      <Card className="group hover:shadow-lg transition-all duration-200 border-gray-200 hover:border-purple-300 bg-white/80 backdrop-blur-sm">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <CardTitle className="text-lg font-semibold text-gray-900 group-hover:text-purple-700 transition-colors">
              {prompt.title}
            </CardTitle>
            <Badge className={`${getCategoryColor(prompt.category)} text-xs`}>
              {prompt.category}
            </Badge>
          </div>
          <p className="text-gray-600 text-sm leading-relaxed">
            {prompt.description}
          </p>
        </CardHeader>
        
        <CardContent className="pt-0">
          <div className="flex flex-wrap gap-1 mb-4">
            {prompt.tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs bg-gray-100 text-gray-600">
                #{tag}
              </Badge>
            ))}
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              <Button
                onClick={() => setIsExpanded(true)}
                variant="outline"
                size="sm"
                className="hover:bg-purple-50 hover:border-purple-300"
              >
                <pencil className="w-3 h-3 mr-1" />
                View
              </Button>
              <Button
                onClick={handleCopyPrompt}
                variant="outline"
                size="sm"
                className="hover:bg-blue-50 hover:border-blue-300"
              >
                <image className="w-3 h-3 mr-1" />
                Copy
              </Button>
            </div>
            
            <Button
              onClick={handleDeleteClick}
              variant="ghost"
              size="sm"
              className="text-red-500 hover:text-red-700 hover:bg-red-50"
            >
              Delete
            </Button>
          </div>
          
          <div className="mt-3 text-xs text-gray-400">
            Updated {prompt.updatedAt.toLocaleDateString()}
          </div>
        </CardContent>
      </Card>

      <Dialog open={isExpanded} onOpenChange={setIsExpanded}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-gray-900">
              {prompt.title}
            </DialogTitle>
            <div className="flex items-center gap-2 mt-2">
              <Badge className={`${getCategoryColor(prompt.category)} text-xs`}>
                {prompt.category}
              </Badge>
              {prompt.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  #{tag}
                </Badge>
              ))}
            </div>
          </DialogHeader>
          
          <div className="mt-4">
            <p className="text-gray-600 mb-4">{prompt.description}</p>
            <div className="space-y-3">
              <label className="text-sm font-medium text-gray-700">Prompt Content:</label>
              <Textarea
                value={prompt.content}
                readOnly
                className="min-h-[200px] resize-none bg-gray-50 border-gray-200"
              />
            </div>
            
            <div className="flex justify-end gap-2 mt-6">
              <Button
                onClick={handleCopyPrompt}
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
              >
                <image className="w-4 h-4 mr-2" />
                Copy Prompt
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
