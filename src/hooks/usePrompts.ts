
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
  created_at: string;
  updated_at: string;
  user_id: string;
  variables: PromptVariable[];
  is_template: boolean;
}

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
        .order('updated_at', { ascending: false });

      if (error) {
        console.error('Error fetching prompts:', error);
        toast.error('Failed to load prompts');
      } else {
        setPrompts(data || []);
      }
    } catch (error) {
      console.error('Error fetching prompts:', error);
      toast.error('Failed to load prompts');
    } finally {
      setLoading(false);
    }
  };

  const addPrompt = async (promptData: Omit<Prompt, 'id' | 'created_at' | 'updated_at' | 'user_id'>) => {
    if (!user) {
      toast.error('You must be logged in to add prompts');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('prompts')
        .insert([{
          ...promptData,
          user_id: user.id
        }])
        .select()
        .single();

      if (error) {
        console.error('Error adding prompt:', error);
        toast.error('Failed to add prompt');
      } else {
        setPrompts(prev => [data, ...prev]);
        toast.success('Prompt added successfully!');
      }
    } catch (error) {
      console.error('Error adding prompt:', error);
      toast.error('Failed to add prompt');
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

  useEffect(() => {
    fetchPrompts();
  }, [user]);

  return {
    prompts,
    loading,
    addPrompt,
    deletePrompt,
    refetch: fetchPrompts
  };
};
