import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface PromptVariable {
  name: string;
  description: string;
  type: 'text' | 'select' | 'number';
  defaultValue?: string;
  options?: string[]; // For select type
}

export interface Prompt {
  id: string;
  title: string;
  description: string;
  content: string;
  category: string;
  tags: string[];
  platforms: string[]; // New field for platform compatibility
  created_at: string;
  updated_at: string;
  user_id: string;
  variables: PromptVariable[];
  is_template: boolean;
  folder_id: string | null;
  is_community: boolean; // New field for community prompts
  copy_count: number; // New field for copy tracking
  average_rating: number | null; // New field for rating average
  rating_count: number; // New field for rating count
  is_featured: boolean; // New field for featured prompts
  status: string; // New field for prompt status
  usage_count: number; // New field for usage tracking
}

// Helper function to convert database Json to PromptVariable[]
const parseVariables = (variables: any): PromptVariable[] => {
  if (!variables) return [];
  if (Array.isArray(variables)) return variables;
  return [];
};

// Helper function to convert PromptVariable[] to Json for database
const serializeVariables = (variables: PromptVariable[]): any => {
  return variables || [];
};

export const usePrompts = () => {
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchPrompts = async () => {
    if (!user) {
      setPrompts([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('prompts')
        .select('*')
        .eq('status', 'active') // Only fetch active prompts
        .order('updated_at', { ascending: false });

      if (error) {
        console.error('Error fetching prompts:', error);
        toast.error('Failed to load prompts');
      } else {
        // Transform the data to match our Prompt interface
        const transformedData: Prompt[] = (data || []).map(item => ({
          ...item,
          platforms: item.platforms || [], // Ensure platforms is always an array
          variables: parseVariables(item.variables),
          is_template: item.is_template || false,
          is_featured: item.is_featured || false,
          status: item.status || 'active',
          usage_count: item.usage_count || 0
        }));
        setPrompts(transformedData);
      }
    } catch (error) {
      console.error('Error fetching prompts:', error);
      toast.error('Failed to load prompts');
    } finally {
      setLoading(false);
    }
  };

  const addPrompt = async (promptData: Omit<Prompt, 'id' | 'created_at' | 'updated_at' | 'user_id' | 'copy_count' | 'average_rating' | 'rating_count' | 'usage_count'>) => {
    if (!user) {
      toast.error('You must be logged in to add prompts');
      return;
    }

    try {
      // Transform the data for database insertion
      const dataForInsert = {
        title: promptData.title,
        description: promptData.description,
        content: promptData.content,
        category: promptData.category,
        tags: promptData.tags,
        platforms: promptData.platforms || [], // Handle new platforms field
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
        // Transform the returned data to match our Prompt interface
        const transformedPrompt: Prompt = {
          ...data,
          platforms: data.platforms || [], // Ensure platforms is always an array
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
      // Create a copy with modified title
      const duplicatedData = {
        title: `${originalPrompt.title} (Copy)`,
        description: originalPrompt.description,
        content: originalPrompt.content,
        category: originalPrompt.category,
        tags: originalPrompt.tags,
        platforms: originalPrompt.platforms || [], // Handle new platforms field
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
        // Transform the returned data to match our Prompt interface
        const transformedPrompt: Prompt = {
          ...data,
          platforms: data.platforms || [], // Ensure platforms is always an array
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

  const updatePrompt = async (id: string, updates: Partial<Pick<Prompt, 'title' | 'description' | 'content' | 'category' | 'tags' | 'platforms' | 'variables' | 'is_template' | 'folder_id'>>) => {
    if (!user) {
      toast.error('You must be logged in to update prompts');
      return;
    }

    try {
      // Transform the data for database update
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
        // Transform the returned data to match our Prompt interface
        const transformedPrompt: Prompt = {
          ...data,
          platforms: data.platforms || [], // Ensure platforms is always an array
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
        // Transform the returned data to match our Prompt interface
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
        platforms: promptData.platforms || [], // Handle new platforms field
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
        // Transform the returned data to match our Prompt interface
        const transformedPrompts: Prompt[] = (data || []).map(item => ({
          ...item,
          platforms: item.platforms || [], // Ensure platforms is always an array
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

  useEffect(() => {
    fetchPrompts();
  }, [user]);

  return {
    prompts,
    loading,
    addPrompt,
    duplicatePrompt,
    updatePrompt,
    updatePromptPlatforms,
    deletePrompt,
    importPrompts,
    markAsFeatured,
    updatePromptStatus,
    refetch: fetchPrompts
  };
};
