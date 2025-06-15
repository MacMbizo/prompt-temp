
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { Prompt } from './usePrompts';

export const usePromptsUpdate = (
  setPrompts: React.Dispatch<React.SetStateAction<Prompt[]>>,
  parseVariables: (variables: any) => any[],
  serializeVariables: (variables: any[]) => any
) => {
  const { user } = useAuth();

  const updatePrompt = async (id: string, updates: Partial<Pick<Prompt, 'title' | 'description' | 'content' | 'category' | 'tags' | 'platforms' | 'variables' | 'is_template' | 'folder_id'>>) => {
    if (!user) {
      toast.error('You must be logged in to update prompts');
      return;
    }

    try {
      const dataForUpdate: any = { ...updates };
      if (updates.variables) {
        dataForUpdate.variables = serializeVariables(updates.variables);
      }

      const { data, error } = await supabase
        .from('prompts')
        .update(dataForUpdate)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating prompt:', error);
        toast.error('Failed to update prompt');
      } else {
        const transformedPrompt: Prompt = {
          ...data,
          platforms: data.platforms || [],
          variables: parseVariables(data.variables),
          is_template: data.is_template || false,
          is_featured: data.is_featured || false,
          status: data.status || 'active',
          usage_count: data.usage_count || 0
        };
        setPrompts(prev => prev.map(prompt => prompt.id === id ? transformedPrompt : prompt));
        toast.success('Prompt updated successfully!');
      }
    } catch (error) {
      console.error('Error updating prompt:', error);
      toast.error('Failed to update prompt');
    }
  };

  const updatePromptPlatforms = async (promptId: string, platforms: string[]) => {
    if (!user) {
      toast.error('You must be logged in to update prompts');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('prompts')
        .update({ platforms })
        .eq('id', promptId)
        .select()
        .single();

      if (error) {
        console.error('Error updating prompt platforms:', error);
        toast.error('Failed to update prompt platforms');
        throw error;
      } else {
        const transformedPrompt: Prompt = {
          ...data,
          platforms: data.platforms || [],
          variables: parseVariables(data.variables),
          is_template: data.is_template || false,
          is_featured: data.is_featured || false,
          status: data.status || 'active',
          usage_count: data.usage_count || 0
        };
        setPrompts(prev => prev.map(prompt => prompt.id === promptId ? transformedPrompt : prompt));
        return transformedPrompt;
      }
    } catch (error) {
      console.error('Error updating prompt platforms:', error);
      throw error;
    }
  };

  const markAsFeatured = async (promptId: string, featured: boolean) => {
    if (!user) {
      toast.error('You must be logged in to feature prompts');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('prompts')
        .update({ is_featured: featured })
        .eq('id', promptId)
        .select()
        .single();

      if (error) {
        console.error('Error updating featured status:', error);
        toast.error('Failed to update featured status');
      } else {
        const transformedPrompt: Prompt = {
          ...data,
          platforms: data.platforms || [],
          variables: parseVariables(data.variables),
          is_template: data.is_template || false,
          is_featured: data.is_featured || false,
          status: data.status || 'active',
          usage_count: data.usage_count || 0
        };
        setPrompts(prev => prev.map(prompt => prompt.id === promptId ? transformedPrompt : prompt));
        toast.success(`Prompt ${featured ? 'featured' : 'unfeatured'} successfully!`);
      }
    } catch (error) {
      console.error('Error updating featured status:', error);
      toast.error('Failed to update featured status');
    }
  };

  const updatePromptStatus = async (promptId: string, status: string) => {
    if (!user) {
      toast.error('You must be logged in to update prompt status');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('prompts')
        .update({ status })
        .eq('id', promptId)
        .select()
        .single();

      if (error) {
        console.error('Error updating prompt status:', error);
        toast.error('Failed to update prompt status');
      } else {
        const transformedPrompt: Prompt = {
          ...data,
          platforms: data.platforms || [],
          variables: parseVariables(data.variables),
          is_template: data.is_template || false,
          is_featured: data.is_featured || false,
          status: data.status || 'active',
          usage_count: data.usage_count || 0
        };
        setPrompts(prev => prev.map(prompt => prompt.id === promptId ? transformedPrompt : prompt));
        toast.success('Prompt status updated successfully!');
      }
    } catch (error) {
      console.error('Error updating prompt status:', error);
      toast.error('Failed to update prompt status');
    }
  };

  return {
    updatePrompt,
    updatePromptPlatforms,
    markAsFeatured,
    updatePromptStatus
  };
};
