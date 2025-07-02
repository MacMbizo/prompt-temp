
import { usePromptsCore } from './usePromptsCore';
import { usePromptsMutations } from './usePromptsMutations';
import { usePromptsUpdate } from './usePromptsUpdate';
import { usePromptsImport } from './usePromptsImport';
import { Prompt, PromptVariable } from '@/integrations/supabase/types';



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
