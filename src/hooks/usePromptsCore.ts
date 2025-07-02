
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import type { Prompt, PromptVariable } from '@/integrations/supabase/types';

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

export const usePromptsCore = () => {
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
        .eq('status', 'active')
        .order('updated_at', { ascending: false });

      if (error) {
        console.error('Error fetching prompts:', error);
        toast.error('Failed to load prompts');
      } else {
        const transformedData: Prompt[] = (data || []).map(item => ({
          ...item,
          platforms: item.platforms || [],
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

  useEffect(() => {
    fetchPrompts();
  }, [user]);

  return {
    prompts,
    setPrompts,
    loading,
    fetchPrompts,
    parseVariables,
    serializeVariables
  };
};
