
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Copy, Edit, MoreVertical, Trash2, Star, Users, Share2, Eye, Download, TrendingUp, Crown } from 'lucide-react';
import { Prompt } from '@/hooks/usePrompts';
import { TemplateVariableFiller } from '@/components/TemplateVariableFiller';
import { CommunitySubmissionModal } from '@/components/CommunitySubmissionModal';
import { PlatformExportModal } from '@/components/PlatformExportModal';
import { RatingComponent } from '@/components/RatingComponent';
import { PlatformBadge } from '@/components/PlatformBadge';
import { useAuth } from '@/contexts/AuthContext';
import { useRatings } from '@/hooks/useRatings';
import { useReputation } from '@/hooks/useReputation';
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

interface PromptCardProps {
  prompt: Prompt & { createdAt: Date; updatedAt: Date };
  onDelete: (id: string) => void;
  onDuplicate: (prompt: Prompt) => void;
  onUpdate?: () => void;
}

export const PromptCard: React.FC<PromptCardProps> = ({ prompt, onDelete, onDuplicate, onUpdate }) => {
  const { user } = useAuth();
  const { userRating, refetch: refetchRating } = useRatings(prompt.id);
  const { updateReputation } = useReputation();
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isVariableFillerOpen, setIsVariableFillerOpen] = useState(false);
  const [isCommunityModalOpen, setIsCommunityModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
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

        // Award reputation points for using prompts
        await updateReputation(1, 'Used a prompt');
      }
      
      toast.success('Prompt copied to clipboard!');
      setIsPreviewOpen(false);
      setIsVariableFillerOpen(false);
    } catch (error) {
      toast.error('Failed to copy prompt');
    }
  };

  const handlePreview = () => {
    if (prompt.is_template && prompt.variables && prompt.variables.length > 0) {
      setIsVariableFillerOpen(true);
    } else {
      setIsPreviewOpen(true);
    }
  };

  const handleViewPrompt = () => {
    setIsPreviewOpen(true);
  };

  const handleRatingUpdate = () => {
    refetchRating();
    onUpdate?.();
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

  const getUsageBadge = () => {
    const usage = prompt.usage_count || 0;
    if (usage >= 100) return <Badge variant="secondary" className="bg-purple-100 text-purple-800"><TrendingUp className="w-3 h-3 mr-1" />Popular</Badge>;
    if (usage >= 50) return <Badge variant="secondary" className="bg-blue-100 text-blue-800"><TrendingUp className="w-3 h-3 mr-1" />Trending</Badge>;
    return null;
  };

  const isOwner = user && prompt.user_id === user.id;
  const canEdit = isOwner && !prompt.is_community;

  return (
    <>
      <Card className="h-full flex flex-col hover:shadow-lg transition-shadow duration-200">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <CardTitle 
              className="text-lg font-semibold text-gray-800 line-clamp-2 cursor-pointer hover:text-purple-600 transition-colors flex items-center"
              onClick={() => setIsPreviewOpen(true)}
            >
              {prompt.is_featured && (
                <Crown className="w-4 h-4 mr-2 text-yellow-500" />
              )}
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
                <DropdownMenuItem onClick={handleViewPrompt}>
                  <Eye className="w-4 h-4 mr-2" />
                  View Details
                </DropdownMenuItem>
                {canEdit && (
                  <DropdownMenuItem onClick={() => {/* TODO: Add edit functionality */}}>
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={() => onDuplicate(prompt)}>
                  <Copy className="w-4 h-4 mr-2" />
                  Duplicate
                </DropdownMenuItem>
                {prompt.platforms && prompt.platforms.length > 0 && (
                  <DropdownMenuItem onClick={() => setIsExportModalOpen(true)}>
                    <Download className="w-4 h-4 mr-2" />
                    Platform Export
                  </DropdownMenuItem>
                )}
                {!prompt.is_community && isOwner && (
                  <DropdownMenuItem onClick={() => setIsCommunityModalOpen(true)}>
                    <Share2 className="w-4 h-4 mr-2" />
                    Submit to Community
                  </DropdownMenuItem>
                )}
                {isOwner && (
                  <DropdownMenuItem onClick={() => onDelete(prompt.id)}>
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          
          <div className="flex items-center justify-between">
            <Badge variant="outline" className="text-xs">
              {prompt.category}
            </Badge>
            <div className="flex items-center space-x-1">
              {prompt.is_featured && (
                <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 text-xs">
                  <Crown className="w-3 h-3 mr-1" />
                  Featured
                </Badge>
              )}
              {getQualityBadge()}
              {getUsageBadge()}
            </div>
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
              <p className="text-xs text-gray-500 mb-2">Compatible platforms:</p>
              <div className="flex flex-wrap gap-1">
                {prompt.platforms.slice(0, 3).map((platform) => (
                  <PlatformBadge key={platform} platform={platform} size="sm" />
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

          {/* Rating Component */}
          <div className="mb-3">
            <RatingComponent
              promptId={prompt.id}
              currentUserRating={userRating}
              averageRating={prompt.average_rating}
              ratingCount={prompt.rating_count}
              onRatingUpdate={handleRatingUpdate}
            />
          </div>

          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>{prompt.createdAt.toLocaleDateString()}</span>
            <div className="flex items-center space-x-3">
              {(prompt.usage_count || 0) > 0 && (
                <span className="flex items-center">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  {prompt.usage_count} uses
                </span>
              )}
              {(prompt.copy_count || 0) > 0 && (
                <span className="flex items-center">
                  <Copy className="w-3 h-3 mr-1" />
                  {prompt.copy_count}
                </span>
              )}
            </div>
          </div>
        </CardContent>

        <CardFooter className="pt-3">
          <Button 
            onClick={() => {
              if (prompt.is_template && prompt.variables && prompt.variables.length > 0) {
                setIsVariableFillerOpen(true);
              } else {
                setIsPreviewOpen(true);
              }
            }}
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
          >
            {prompt.is_template ? 'Use Template' : 'Copy Prompt'}
          </Button>
        </CardFooter>
      </Card>

      {/* Template Variable Filler Modal */}
      <TemplateVariableFiller
        isOpen={isVariableFillerOpen}
        onClose={() => setIsVariableFillerOpen(false)}
        prompt={prompt}
      />

      {/* Community Submission Modal */}
      <CommunitySubmissionModal
        isOpen={isCommunityModalOpen}
        onClose={() => setIsCommunityModalOpen(false)}
        prompt={prompt}
      />

      {/* Platform Export Modal */}
      <PlatformExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        prompt={prompt}
      />

      {/* Prompt Preview/View Modal */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>{prompt.title}</span>
              {prompt.is_community && (
                <Badge variant="outline" className="text-xs">
                  <Users className="w-3 h-3 mr-1" />
                  Community
                </Badge>
              )}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {prompt.description && (
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-2">Description:</label>
                <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-md">{prompt.description}</p>
              </div>
            )}

            <div>
              <label className="text-sm font-medium text-gray-700 block mb-2">Prompt Content:</label>
              <Textarea
                value={prompt.content}
                readOnly
                className="min-h-[200px]"
              />
            </div>

            {prompt.platforms && prompt.platforms.length > 0 && (
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-2">Compatible Platforms:</label>
                <div className="flex flex-wrap gap-2">
                  {prompt.platforms.map((platform) => (
                    <PlatformBadge key={platform} platform={platform} size="md" />
                  ))}
                </div>
              </div>
            )}

            {prompt.tags && prompt.tags.length > 0 && (
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-2">Tags:</label>
                <div className="flex flex-wrap gap-2">
                  {prompt.tags.map((tag) => (
                    <Badge key={tag} variant="outline">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
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
                      <PlatformBadge platform={platform} size="sm" />
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button 
              onClick={() => handleCopy(prompt.content)}
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
