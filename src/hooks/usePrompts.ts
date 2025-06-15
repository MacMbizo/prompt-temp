
import { usePromptsCore } from './usePromptsCore';
import { usePromptsMutations } from './usePromptsMutations';
import { usePromptsUpdate } from './usePromptsUpdate';
import { usePromptsImport } from './usePromptsImport';

export interface PromptVariable {
  name: string;
  description: string;
  type: 'text' | 'select' | 'number';
  defaultValue?: string;
  options?: string[];
}

export interface Prompt {
  id: string;
  title: string;
  description: string;
  content: string;
  category: string;
  tags: string[];
  platforms: string[];
  created_at: string;
  updated_at: string;
  user_id: string;
  variables: PromptVariable[];
  is_template: boolean;
  folder_id: string | null;
  is_community: boolean;
  copy_count: number;
  average_rating: number | null;
  rating_count: number;
  is_featured: boolean;
  status: string;
  usage_count: number;
}

export const usePrompts = () => {
  const {
    prompts,
    setPrompts,
    loading,
    fetchPrompts,
    parseVariables,
    serializeVariables
  } = usePromptsCore();

  const {
    addPrompt,
    duplicatePrompt,
    deletePrompt
  } = usePromptsMutations(prompts, setPrompts, parseVariables, serializeVariables);

  const {
    updatePrompt,
    updatePromptPlatforms,
    markAsFeatured,
    updatePromptStatus
  } = usePromptsUpdate(setPrompts, parseVariables, serializeVariables);

  const { importPrompts } = usePromptsImport(setPrompts, parseVariables, serializeVariables);

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
