
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { Prompt } from '@/integrations/supabase/types';

export const usePromptsMutations = (
  prompts: Prompt[],
  setPrompts: React.Dispatch<React.SetStateAction<Prompt[]>>,
  parseVariables: (variables: any) => any[],
  serializeVariables: (variables: any[]) => any
) => {
  const { user } = useAuth();

  const addPrompt = async (promptData: Omit<Prompt, 'id' | 'created_at' | 'updated_at' | 'user_id' | 'copy_count' | 'average_rating' | 'rating_count' | 'usage_count'>) => {
    if (!user) {
      toast.error('You must be logged in to add prompts');
      return;
    }

    try {
      const dataForInsert = {
        title: promptData.title,
        description: promptData.description,
        prompt_text: promptData.prompt_text,
        category: promptData.category,
        tags: promptData.tags,
        platforms: promptData.platforms || [],
        variables: serializeVariables(promptData.variables),
        is_template: promptData.is_template,
        folder_id: promptData.folder_id,
        is_featured: promptData.is_featured || false,
        status: promptData.status || 'active',
        user_id: user.id
      };

      const { data, error } = await supabase
        .from('prompts')
        .insert([dataForInsert])
        .select()
        .single();

      if (error) {
        console.error('Error adding prompt:', error);
        toast.error('Failed to add prompt');
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
        setPrompts(prev => [transformedPrompt, ...prev]);
        toast.success('Prompt added successfully!');
      }
    } catch (error) {
      console.error('Error adding prompt:', error);
      toast.error('Failed to add prompt');
    }
  };

  const duplicatePrompt = async (originalPrompt: Prompt) => {
    if (!user) {
      toast.error('You must be logged in to duplicate prompts');
      return;
    }

    try {
      const duplicatedData = {
        title: `${originalPrompt.title} (Copy)`,
        description: originalPrompt.description,
        prompt_text: originalPrompt.prompt_text,
        category: originalPrompt.category,
        tags: originalPrompt.tags,
        platforms: originalPrompt.platforms || [],
        variables: serializeVariables(originalPrompt.variables),
        is_template: originalPrompt.is_template,
        folder_id: originalPrompt.folder_id,
        user_id: user.id
      };

      const { data, error } = await supabase
        .from('prompts')
        .insert([duplicatedData])
        .select()
        .single();

      if (error) {
        console.error('Error duplicating prompt:', error);
        toast.error('Failed to duplicate prompt');
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
        setPrompts(prev => [transformedPrompt, ...prev]);
        toast.success('Prompt duplicated successfully!');
      }
    } catch (error) {
      console.error('Error duplicating prompt:', error);
      toast.error('Failed to duplicate prompt');
    }
  };

  const deletePrompt = async (id: string) => {
    if (!user) {
      toast.error('You must be logged in to delete prompts');
      return;
    }

    try {
      const { error } = await supabase
        .from('prompts')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting prompt:', error);
        toast.error('Failed to delete prompt');
      } else {
        setPrompts(prev => prev.filter(prompt => prompt.id !== id));
        toast.success('Prompt deleted successfully');
      }
    } catch (error) {
      console.error('Error deleting prompt:', error);
      toast.error('Failed to delete prompt');
    }
  };

  return {
    addPrompt,
    duplicatePrompt,
    deletePrompt
  };
};
