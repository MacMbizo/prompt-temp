import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  History,
  RotateCcw,
  GitBranch,
  Clock,
  User,
  FileText,
  Save,
  Eye,
  ArrowLeft
} from 'lucide-react';
import { usePromptVersions } from '@/hooks/usePromptVersions';
import { PromptVersion, Prompt } from '@/integrations/supabase/types';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';

interface VersionHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  prompt: Prompt;
  onPromptUpdated?: () => void;
}

type ViewMode = 'list' | 'compare' | 'preview';

export const VersionHistoryModal: React.FC<VersionHistoryModalProps> = ({
  isOpen,
  onClose,
  prompt,
  onPromptUpdated
}) => {
  const {
    versions,
    isLoading,
    error,
    fetchVersions,
    restoreVersion,
    createManualVersion,
    compareVersions
  } = usePromptVersions();

  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedVersions, setSelectedVersions] = useState<PromptVersion[]>([]);
  const [previewVersion, setPreviewVersion] = useState<PromptVersion | null>(null);
  const [changeSummary, setChangeSummary] = useState('');
  const [isCreatingVersion, setIsCreatingVersion] = useState(false);

  useEffect(() => {
    if (isOpen && prompt.id) {
      fetchVersions(prompt.id);
    }
  }, [isOpen, prompt.id, fetchVersions]);

  const handleRestoreVersion = async (versionNumber: number) => {
    const success = await restoreVersion(prompt.id, versionNumber);
    if (success) {
      onPromptUpdated?.();
      onClose();
    }
  };

  const handleCreateManualVersion = async () => {
    if (!changeSummary.trim()) {
      toast.error('Please provide a change summary');
      return;
    }

    setIsCreatingVersion(true);
    const success = await createManualVersion(prompt.id, changeSummary);
    if (success) {
      setChangeSummary('');
      fetchVersions(prompt.id);
    }
    setIsCreatingVersion(false);
  };

  const handleVersionSelect = (version: PromptVersion) => {
    if (viewMode === 'compare') {
      if (selectedVersions.length < 2) {
        setSelectedVersions([...selectedVersions, version]);
      } else {
        setSelectedVersions([selectedVersions[1], version]);
      }
    } else if (viewMode === 'preview') {
      setPreviewVersion(version);
    }
  };

  const renderVersionList = () => (
    <div className="space-y-4">
      {/* Create Manual Version */}
      <div className="p-4 border rounded-lg bg-muted/50">
        <div className="flex items-center gap-2 mb-3">
          <Save className="h-4 w-4" />
          <Label className="font-medium">Create Version Checkpoint</Label>
        </div>
        <div className="space-y-3">
          <Textarea
            placeholder="Describe the changes you want to save..."
            value={changeSummary}
            onChange={(e) => setChangeSummary(e.target.value)}
            className="min-h-[80px]"
          />
          <Button
            onClick={handleCreateManualVersion}
            disabled={!changeSummary.trim() || isCreatingVersion}
            size="sm"
          >
            <Save className="h-4 w-4 mr-2" />
            {isCreatingVersion ? 'Creating...' : 'Save Current Version'}
          </Button>
        </div>
      </div>

      <Separator />

      {/* Current Version */}
      <div className="p-4 border rounded-lg bg-primary/5 border-primary/20">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <GitBranch className="h-4 w-4 text-primary" />
            <span className="font-medium">Current Version {prompt.current_version}</span>
            <Badge variant="default" className="text-xs">Current</Badge>
          </div>
        </div>
        <p className="text-sm text-muted-foreground mb-3">{prompt.title}</p>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setViewMode('preview');
              setPreviewVersion({
                id: prompt.id,
                prompt_id: prompt.id,
                version_number: prompt.current_version,
                title: prompt.title,
                description: prompt.description,
                prompt_text: prompt.prompt_text,
                category: prompt.category,
                tags: prompt.tags,
                platforms: prompt.platforms,
                variables: prompt.variables,
                change_summary: 'Current version',
                created_at: prompt.updated_at,
                created_by: prompt.user_id
              });
            }}
          >
            <Eye className="h-4 w-4 mr-2" />
            Preview
          </Button>
        </div>
      </div>

      {/* Version History */}
      {versions.map((version) => (
        <div key={version.id} className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <History className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">Version {version.version_number}</span>
              <Badge variant="secondary" className="text-xs">
                {formatDistanceToNow(new Date(version.created_at), { addSuffix: true })}
              </Badge>
            </div>
          </div>
          
          {version.change_summary && (
            <p className="text-sm text-muted-foreground mb-2">{version.change_summary}</p>
          )}
          
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
            <Clock className="h-3 w-3" />
            <span>{new Date(version.created_at).toLocaleString()}</span>
          </div>
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setViewMode('preview');
                setPreviewVersion(version);
              }}
            >
              <Eye className="h-4 w-4 mr-2" />
              Preview
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleVersionSelect(version)}
              disabled={viewMode === 'compare' && selectedVersions.length >= 2}
            >
              {viewMode === 'compare' ? 'Compare' : 'Select'}
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => handleRestoreVersion(version.version_number)}
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Restore
            </Button>
          </div>
        </div>
      ))}
    </div>
  );

  const renderVersionPreview = () => {
    if (!previewVersion) return null;

    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <Button variant="ghost" size="sm" onClick={() => setViewMode('list')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to List
          </Button>
          <Badge variant="outline">
            Version {previewVersion.version_number}
          </Badge>
        </div>

        <div className="space-y-4">
          <div>
            <Label className="text-sm font-medium">Title</Label>
            <Input value={previewVersion.title} readOnly className="mt-1" />
          </div>
          
          <div>
            <Label className="text-sm font-medium">Description</Label>
            <Textarea value={previewVersion.description} readOnly className="mt-1" />
          </div>
          
          <div>
            <Label className="text-sm font-medium">Content</Label>
            <Textarea 
              value={previewVersion.prompt_text} 
              readOnly 
              className="mt-1 min-h-[200px]" 
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium">Category</Label>
              <Input value={previewVersion.category} readOnly className="mt-1" />
            </div>
            <div>
              <Label className="text-sm font-medium">Tags</Label>
              <div className="flex flex-wrap gap-1 mt-1">
                {previewVersion.tags.map((tag, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
          
          <div className="flex gap-2 pt-4">
            <Button
              onClick={() => handleRestoreVersion(previewVersion.version_number)}
              disabled={previewVersion.version_number === prompt.current_version}
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Restore This Version
            </Button>
          </div>
        </div>
      </div>
    );
  };

  const renderVersionComparison = () => {
    if (selectedVersions.length !== 2) {
      return (
        <div className="text-center py-8">
          <p className="text-muted-foreground">
            Select two versions to compare them.
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Selected: {selectedVersions.length}/2
          </p>
        </div>
      );
    }

    const comparison = compareVersions(selectedVersions[0], selectedVersions[1]);
    const [older, newer] = selectedVersions.sort((a, b) => a.version_number - b.version_number);

    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <Button variant="ghost" size="sm" onClick={() => setViewMode('list')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to List
          </Button>
          <Badge variant="outline">
            Comparing v{older.version_number} → v{newer.version_number}
          </Badge>
        </div>

        {comparison.changes.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            No differences found between these versions.
          </p>
        ) : (
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <span className="text-sm font-medium">Changes:</span>
              {comparison.changes.map((change) => (
                <Badge key={change} variant="destructive" className="text-xs">
                  {change}
                </Badge>
              ))}
            </div>

            {comparison.titleChanged && (
              <div className="grid grid-cols-2 gap-4 p-4 border rounded-lg">
                <div>
                  <Label className="text-sm font-medium text-red-600">Title (v{older.version_number})</Label>
                  <Input value={older.title} readOnly className="mt-1" />
                </div>
                <div>
                  <Label className="text-sm font-medium text-green-600">Title (v{newer.version_number})</Label>
                  <Input value={newer.title} readOnly className="mt-1" />
                </div>
              </div>
            )}

            {comparison.contentChanged && (
              <div className="grid grid-cols-2 gap-4 p-4 border rounded-lg">
                <div>
                  <Label className="text-sm font-medium text-red-600">Content (v{older.version_number})</Label>
                  <Textarea value={older.prompt_text} readOnly className="mt-1 min-h-[150px]" />
                </div>
                <div>
                  <Label className="text-sm font-medium text-green-600">Content (v{newer.version_number})</Label>
                  <Textarea value={newer.prompt_text} readOnly className="mt-1 min-h-[150px]" />
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Version History - {prompt.title}
          </DialogTitle>
        </DialogHeader>

        <div className="flex gap-2 mb-4">
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('list')}
          >
            <FileText className="h-4 w-4 mr-2" />
            List
          </Button>
          <Button
            variant={viewMode === 'compare' ? 'default' : 'outline'}
            size="sm"
            onClick={() => {
              setViewMode('compare');
              setSelectedVersions([]);
            }}
          >
            <GitBranch className="h-4 w-4 mr-2" />
            Compare
          </Button>
        </div>

        <ScrollArea className="h-[60vh]">
          {isLoading ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Loading version history...</p>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <p className="text-red-600">Error: {error}</p>
            </div>
          ) : (
            <div className="pr-4">
              {viewMode === 'list' && renderVersionList()}
              {viewMode === 'compare' && renderVersionComparison()}
              {viewMode === 'preview' && renderVersionPreview()}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};