
import { useMemo } from 'react';
import { usePrompts } from './usePrompts';

export const useTagSuggestions = () => {
  const { prompts } = usePrompts();

  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    prompts.forEach(prompt => {
      prompt.tags.forEach(tag => {
        if (tag.trim()) {
          tagSet.add(tag.trim());
        }
      });
    });
    return Array.from(tagSet).sort();
  }, [prompts]);

  const getSuggestions = (input: string) => {
    if (!input.trim()) return [];
    
    const query = input.toLowerCase().trim();
    return allTags
      .filter(tag => tag.toLowerCase().includes(query))
      .slice(0, 10); // Limit to 10 suggestions
  };

  return {
    allTags,
    getSuggestions
  };
};
