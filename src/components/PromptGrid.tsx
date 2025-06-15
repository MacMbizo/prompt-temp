
import React from 'react';
import { PromptCard } from '@/components/PromptCard';
import type { Prompt } from '@/hooks/usePrompts';

interface PromptGridProps {
  prompts: Prompt[];
  onDelete: (id: string) => void;
  onDuplicate: (prompt: Prompt) => void;
  onUpdate: () => void;
}

export const PromptGrid: React.FC<PromptGridProps> = ({
  prompts,
  onDelete,
  onDuplicate,
  onUpdate
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {prompts.map((prompt) => (
        <div key={prompt.id} id={`prompt-${prompt.id}`} className="transition-all duration-200">
          <PromptCard
            prompt={{
              ...prompt,
              createdAt: new Date(prompt.created_at),
              updatedAt: new Date(prompt.updated_at)
            }}
            onDelete={onDelete}
            onDuplicate={onDuplicate}
            onUpdate={onUpdate}
          />
        </div>
      ))}
    </div>
  );
};
