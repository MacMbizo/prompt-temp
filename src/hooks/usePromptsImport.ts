
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { Prompt } from './usePrompts';

export const usePromptsImport = (
  setPrompts: React.Dispatch<React.SetStateAction<Prompt[]>>,
  parseVariables: (variables: any) => any[],
  serializeVariables: (variables: any[]) => any
) => {
  const { user } = useAuth();

  const importPrompts = async (promptsData: Omit<Prompt, 'id' | 'created_at' | 'updated_at' | 'user_id' | 'copy_count' | 'average_rating' | 'rating_count' | 'usage_count'>[]) => {
    if (!user) {
      toast.error('You must be logged in to import prompts');
      return;
    }

    try {
      const promptsToInsert = promptsData.map(promptData => ({
        title: promptData.title,
        description: promptData.description,
        content: promptData.content,
        category: promptData.category,
        tags: promptData.tags,
        platforms: promptData.platforms || [],
        variables: serializeVariables(promptData.variables),
        is_template: promptData.is_template,
        folder_id: promptData.folder_id,
        is_featured: promptData.is_featured || false,
        status: promptData.status || 'active',
        user_id: user.id
      }));

      const { data, error } = await supabase
        .from('prompts')
        .insert(promptsToInsert)
        .select();

      if (error) {
        console.error('Error importing prompts:', error);
        toast.error('Failed to import prompts');
      } else {
        const transformedPrompts: Prompt[] = (data || []).map(item => ({
          ...item,
          platforms: item.platforms || [],
          variables: parseVariables(item.variables),
          is_template: item.is_template || false,
          is_featured: item.is_featured || false,
          status: item.status || 'active',
          usage_count: item.usage_count || 0
        }));
        
        setPrompts(prev => [...transformedPrompts, ...prev]);
        toast.success(`Successfully imported ${transformedPrompts.length} prompts!`);
      }
    } catch (error) {
      console.error('Error importing prompts:', error);
      toast.error('Failed to import prompts');
    }
  };

  return {
    importPrompts
  };
};
