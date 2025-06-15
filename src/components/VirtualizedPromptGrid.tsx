
import React, { useMemo } from 'react';
import { FixedSizeList as List } from 'react-window';
import { PromptCard } from '@/components/PromptCard';
import type { Prompt } from '@/hooks/usePrompts';

interface VirtualizedPromptGridProps {
  prompts: Prompt[];
  onDelete: (id: string) => void;
  onDuplicate: (prompt: Prompt) => void;
  onUpdate: () => void;
  height?: number;
  itemsPerRow?: number;
}

export const VirtualizedPromptGrid: React.FC<VirtualizedPromptGridProps> = ({
  prompts,
  onDelete,
  onDuplicate,
  onUpdate,
  height = 600,
  itemsPerRow = 3
}) => {
  const rows = useMemo(() => {
    const result = [];
    for (let i = 0; i < prompts.length; i += itemsPerRow) {
      result.push(prompts.slice(i, i + itemsPerRow));
    }
    return result;
  }, [prompts, itemsPerRow]);

  const Row = ({ index, style }: { index: number; style: React.CSSProperties }) => {
    const rowPrompts = rows[index];
    
    return (
      <div style={style} className="flex gap-6 px-6">
        {rowPrompts.map((prompt) => (
          <div key={prompt.id} className="flex-1 min-w-0">
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
        {/* Fill remaining slots with empty divs to maintain layout */}
        {Array.from({ length: itemsPerRow - rowPrompts.length }).map((_, idx) => (
          <div key={`empty-${idx}`} className="flex-1 min-w-0" />
        ))}
      </div>
    );
  };

  if (prompts.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No prompts to display</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <List
        height={height}
        width="100%"
        itemCount={rows.length}
        itemSize={400}
        overscanCount={2}
      >
        {Row}
      </List>
    </div>
  );
};
