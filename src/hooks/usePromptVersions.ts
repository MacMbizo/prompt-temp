import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { PromptVersion, Prompt } from '@/integrations/supabase/types';
import { toast } from 'sonner';

interface UsePromptVersionsReturn {
  versions: PromptVersion[];
  isLoading: boolean;
  error: string | null;
  fetchVersions: (promptId: string) => Promise<void>;
  restoreVersion: (promptId: string, versionNumber: number) => Promise<boolean>;
  createManualVersion: (promptId: string, changeSummary: string) => Promise<boolean>;
  compareVersions: (version1: PromptVersion, version2: PromptVersion) => VersionComparison;
}

interface VersionComparison {
  titleChanged: boolean;
  descriptionChanged: boolean;
  contentChanged: boolean;
  categoryChanged: boolean;
  tagsChanged: boolean;
  platformsChanged: boolean;
  variablesChanged: boolean;
  changes: string[];
}

export const usePromptVersions = (): UsePromptVersionsReturn => {
  const [versions, setVersions] = useState<PromptVersion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchVersions = useCallback(async (promptId: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from('prompt_versions')
        .select('*')
        .eq('prompt_id', promptId)
        .order('version_number', { ascending: false });

      if (fetchError) {
        throw fetchError;
      }

      setVersions(data || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch versions';
      setError(errorMessage);
      toast.error('Failed to load version history');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const restoreVersion = useCallback(async (promptId: string, versionNumber: number): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) {
        throw new Error('User not authenticated');
      }

      const { data, error: restoreError } = await supabase
        .rpc('restore_prompt_version', {
          p_prompt_id: promptId,
          p_version_number: versionNumber,
          p_user_id: user.user.id
        });

      if (restoreError) {
        throw restoreError;
      }

      if (!data) {
        throw new Error('Version not found or unauthorized');
      }

      toast.success(`Restored to version ${versionNumber}`);
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to restore version';
      setError(errorMessage);
      toast.error(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createManualVersion = useCallback(async (promptId: string, changeSummary: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) {
        throw new Error('User not authenticated');
      }

      // Get current prompt data
      const { data: prompt, error: promptError } = await supabase
        .from('prompts')
        .select('*')
        .eq('id', promptId)
        .eq('user_id', user.user.id)
        .single();

      if (promptError || !prompt) {
        throw new Error('Prompt not found or unauthorized');
      }

      // Create manual version
      const { error: versionError } = await supabase
        .from('prompt_versions')
        .insert({
          prompt_id: promptId,
          version_number: prompt.current_version,
          title: prompt.title,
          description: prompt.description,
          prompt_text: prompt.prompt_text,
          category: prompt.category,
          tags: prompt.tags,
          platforms: prompt.platforms,
          variables: prompt.variables,
          change_summary: changeSummary,
          created_by: user.user.id
        });

      if (versionError) {
        throw versionError;
      }

      // Update prompt version count
      const { error: updateError } = await supabase
        .from('prompts')
        .update({ 
          current_version: prompt.current_version + 1,
          version_count: prompt.version_count + 1
        })
        .eq('id', promptId);

      if (updateError) {
        throw updateError;
      }

      toast.success('Version saved successfully');
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create version';
      setError(errorMessage);
      toast.error(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const compareVersions = useCallback((version1: PromptVersion, version2: PromptVersion): VersionComparison => {
    const changes: string[] = [];
    
    const titleChanged = version1.title !== version2.title;
    const descriptionChanged = version1.description !== version2.description;
    const contentChanged = version1.prompt_text !== version2.prompt_text;
    const categoryChanged = version1.category !== version2.category;
    const tagsChanged = JSON.stringify(version1.tags) !== JSON.stringify(version2.tags);
    const platformsChanged = JSON.stringify(version1.platforms) !== JSON.stringify(version2.platforms);
    const variablesChanged = JSON.stringify(version1.variables) !== JSON.stringify(version2.variables);

    if (titleChanged) changes.push('Title');
    if (descriptionChanged) changes.push('Description');
    if (contentChanged) changes.push('Content');
    if (categoryChanged) changes.push('Category');
    if (tagsChanged) changes.push('Tags');
    if (platformsChanged) changes.push('Platforms');
    if (variablesChanged) changes.push('Variables');

    return {
      titleChanged,
      descriptionChanged,
      contentChanged,
      categoryChanged,
      tagsChanged,
      platformsChanged,
      variablesChanged,
      changes
    };
  }, []);

  return {
    versions,
    isLoading,
    error,
    fetchVersions,
    restoreVersion,
    createManualVersion,
    compareVersions
  };
};