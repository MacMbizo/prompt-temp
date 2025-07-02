
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Copy, TrendingUp } from 'lucide-react';
import { Prompt } from '@/integrations/supabase/types';
import { usePromptCopy, AVAILABLE_PLATFORMS } from '@/hooks/usePromptCopy';
import { PromptCardHeader } from '@/components/PromptCardHeader';
import { PromptCardBadges } from '@/components/PromptCardBadges';
import { PromptCardDropdown } from '@/components/PromptCardDropdown';
import { TemplateVariableFiller } from '@/components/TemplateVariableFiller';
import { CommunitySubmissionModal } from '@/components/CommunitySubmissionModal';
import { PlatformExportModal } from '@/components/PlatformExportModal';
import { RatingComponent } from '@/components/RatingComponent';
import { PlatformBadge } from '@/components/PlatformBadge';
import { useAuth } from '@/contexts/AuthContext';
import { useRatings } from '@/hooks/useRatings';

interface PromptCardProps {
  prompt: Prompt & { createdAt: Date; updatedAt: Date };
  onDelete: (id: string) => void;
  onDuplicate: (prompt: Prompt) => void;
  onUpdate?: () => void;
}

export const PromptCard: React.FC<PromptCardProps> = ({ prompt, onDelete, onDuplicate, onUpdate }) => {
  const { user } = useAuth();
  const { userRating, refetch: refetchRating } = useRatings(prompt.id);
  const { selectedPlatform, setSelectedPlatform, handleCopy } = usePromptCopy();
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isVariableFillerOpen, setIsVariableFillerOpen] = useState(false);
  const [isCommunityModalOpen, setIsCommunityModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  const isOwner = user && prompt.user_id === user.id;
  const canEdit = isOwner && !prompt.is_community;

  const handleViewPrompt = () => {
    setIsPreviewOpen(true);
  };

  const handleRatingUpdate = () => {
    refetchRating();
    onUpdate?.();
  };

  return (
    <>
      <Card className="h-full flex flex-col hover:shadow-lg transition-shadow duration-200">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <PromptCardHeader prompt={prompt} onViewPrompt={handleViewPrompt} />
            <PromptCardDropdown
              prompt={prompt}
              isOwner={!!isOwner}
              canEdit={canEdit}
              onViewPrompt={handleViewPrompt}
              onEdit={() => {/* TODO: Add edit functionality */}}
              onDuplicate={() => onDuplicate(prompt)}
              onExport={() => setIsExportModalOpen(true)}
              onCommunitySubmit={() => setIsCommunityModalOpen(true)}
              onDelete={() => onDelete(prompt.id)}
            />
          </div>
          
          <PromptCardBadges prompt={prompt} />
        </CardHeader>

        <CardContent className="flex-1 pb-3">
          {prompt.description && (
            <p className="text-sm text-gray-600 mb-3 line-clamp-2">
              {prompt.description}
            </p>
          )}

          <p className="text-sm text-gray-700 mb-3 line-clamp-3">
            {prompt.prompt_text}
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

      <TemplateVariableFiller
        isOpen={isVariableFillerOpen}
        onClose={() => setIsVariableFillerOpen(false)}
        prompt={prompt}
        onCopy={(content) => handleCopy(prompt, content, () => setIsVariableFillerOpen(false))}
      />

      <CommunitySubmissionModal
        isOpen={isCommunityModalOpen}
        onClose={() => setIsCommunityModalOpen(false)}
        prompt={prompt}
      />

      <PlatformExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        prompt={prompt}
      />

      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>{prompt.title}</span>
              {prompt.is_community && (
                <Badge variant="outline" className="text-xs">
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
                value={prompt.prompt_text}
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

            <Button onClick={() => handleCopy(prompt, prompt.prompt_text, () => setIsPreviewOpen(false))}>
              <Copy className="mr-2 h-4 w-4" /> Copy Prompt
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
