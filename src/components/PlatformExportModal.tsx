
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Copy, Download, Share2 } from 'lucide-react';
import { PlatformBadge } from '@/components/PlatformBadge';
import { toast } from 'sonner';
import type { Prompt } from '@/hooks/usePrompts';

const PLATFORM_FORMATS = {
  'ChatGPT': 'Standard format with clear instructions',
  'Claude': 'Structured format with reasoning steps',
  'Gemini': 'Conversational format with context',
  'GPT-4': 'Advanced format with role definitions',
  'Midjourney': 'Image generation with parameters',
  'DALL-E': 'Image description with style notes',
  'Stable Diffusion': 'Detailed prompt with negative prompts',
  'Perplexity': 'Research-focused with sources',
  'GitHub Copilot': 'Code comments and specifications',
  'Notion AI': 'Document-ready with formatting'
};

interface PlatformExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  prompt: Prompt;
}

export const PlatformExportModal: React.FC<PlatformExportModalProps> = ({
  isOpen,
  onClose,
  prompt
}) => {
  const [selectedPlatform, setSelectedPlatform] = useState<string>('');
  const [optimizedPrompt, setOptimizedPrompt] = useState('');

  const generateOptimizedPrompt = (platform: string) => {
    let optimized = prompt.content;
    
    // Basic optimization based on platform
    switch (platform) {
      case 'Claude':
        optimized = `<thinking>\nI need to provide a clear, structured response.\n</thinking>\n\n${optimized}`;
        break;
      case 'Midjourney':
        optimized = `${optimized} --ar 16:9 --style raw --v 6`;
        break;
      case 'Stable Diffusion':
        optimized = `${optimized}\n\nNegative prompt: blurry, low quality, distorted`;
        break;
      case 'GitHub Copilot':
        optimized = `// ${prompt.title}\n// ${prompt.description}\n\n${optimized}`;
        break;
      case 'GPT-4':
        optimized = `Role: You are an expert assistant.\n\nTask: ${optimized}\n\nPlease provide a detailed response.`;
        break;
    }
    
    setOptimizedPrompt(optimized);
  };

  const handlePlatformSelect = (platform: string) => {
    setSelectedPlatform(platform);
    generateOptimizedPrompt(platform);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(optimizedPrompt);
      toast.success(`Prompt copied for ${selectedPlatform}!`);
    } catch (error) {
      toast.error('Failed to copy prompt');
    }
  };

  const handleExport = () => {
    const blob = new Blob([optimizedPrompt], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${prompt.title}-${selectedPlatform}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success(`Exported for ${selectedPlatform}!`);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Share2 className="w-5 h-5 mr-2" />
            Platform-Specific Export
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-2">
              Select Platform:
            </label>
            <Select value={selectedPlatform} onValueChange={handlePlatformSelect}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a platform to optimize for" />
              </SelectTrigger>
              <SelectContent>
                {prompt.platforms?.map((platform) => (
                  <SelectItem key={platform} value={platform}>
                    <div className="flex items-center">
                      <PlatformBadge platform={platform} size="sm" />
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedPlatform && (
            <>
              <div className="bg-blue-50 p-3 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Platform Info:</strong> {PLATFORM_FORMATS[selectedPlatform as keyof typeof PLATFORM_FORMATS]}
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 block mb-2">
                  Optimized Prompt for {selectedPlatform}:
                </label>
                <Textarea
                  value={optimizedPrompt}
                  onChange={(e) => setOptimizedPrompt(e.target.value)}
                  className="min-h-[200px]"
                  placeholder="Optimized prompt will appear here..."
                />
              </div>

              <div className="flex gap-2">
                <Button onClick={handleCopy} className="flex-1">
                  <Copy className="w-4 h-4 mr-2" />
                  Copy to Clipboard
                </Button>
                <Button onClick={handleExport} variant="outline" className="flex-1">
                  <Download className="w-4 h-4 mr-2" />
                  Export as File
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
