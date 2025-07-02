import { useState } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useReputation } from '@/hooks/useReputation';
import { Prompt } from '@/integrations/supabase/types';

export const AVAILABLE_PLATFORMS = [
  'ChatGPT',
  'Claude', 
  'Gemini',
  'GPT-4',
  'Midjourney',
  'DALL-E',
  'Stable Diffusion',
  'Perplexity',
  'GitHub Copilot',
  'Notion AI'
];

export const usePromptCopy = () => {
  const { user } = useAuth();
  const { updateReputation } = useReputation();
  const [selectedPlatform, setSelectedPlatform] = useState<string>('');

  const handleCopy = async (prompt: Prompt, content: string, onCopySuccess?: () => void) => {
    try {
      await navigator.clipboard.writeText(content);
      
      if (user && selectedPlatform) {
        await supabase
          .from('copy_history')
          .insert({
            user_id: user.id,
            prompt_id: prompt.id,
            platform_used: selectedPlatform
          });

        await updateReputation(1, 'Used a prompt');
      }
      
      toast.success('Prompt copied to clipboard!');
      onCopySuccess?.();
    } catch (error) {
      toast.error('Failed to copy prompt');
    }
  };

  return {
    selectedPlatform,
    setSelectedPlatform,
    handleCopy,
  };
};