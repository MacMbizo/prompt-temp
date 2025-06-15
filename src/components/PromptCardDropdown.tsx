
import React from 'react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Copy, Edit, MoreVertical, Trash2, Eye, Download, Share2 } from 'lucide-react';
import type { Prompt } from '@/hooks/usePrompts';

interface PromptCardDropdownProps {
  prompt: Prompt;
  isOwner: boolean;
  canEdit: boolean;
  onViewPrompt: () => void;
  onEdit: () => void;
  onDuplicate: () => void;
  onExport: () => void;
  onCommunitySubmit: () => void;
  onDelete: () => void;
}

export const PromptCardDropdown: React.FC<PromptCardDropdownProps> = ({
  prompt,
  isOwner,
  canEdit,
  onViewPrompt,
  onEdit,
  onDuplicate,
  onExport,
  onCommunitySubmit,
  onDelete
}) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm">
          <MoreVertical className="w-4 h-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={onViewPrompt}>
          <Eye className="w-4 h-4 mr-2" />
          View Details
        </DropdownMenuItem>
        {canEdit && (
          <DropdownMenuItem onClick={onEdit}>
            <Edit className="w-4 h-4 mr-2" />
            Edit
          </DropdownMenuItem>
        )}
        <DropdownMenuItem onClick={onDuplicate}>
          <Copy className="w-4 h-4 mr-2" />
          Duplicate
        </DropdownMenuItem>
        {prompt.platforms && prompt.platforms.length > 0 && (
          <DropdownMenuItem onClick={onExport}>
            <Download className="w-4 h-4 mr-2" />
            Platform Export
          </DropdownMenuItem>
        )}
        {!prompt.is_community && isOwner && (
          <DropdownMenuItem onClick={onCommunitySubmit}>
            <Share2 className="w-4 h-4 mr-2" />
            Submit to Community
          </DropdownMenuItem>
        )}
        {isOwner && (
          <DropdownMenuItem onClick={onDelete}>
            <Trash2 className="w-4 h-4 mr-2" />
            Delete
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
