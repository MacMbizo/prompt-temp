
import React from 'react';

interface EmptyStateProps {
  searchQuery: string;
  currentFolderName: string;
  selectedCategory: string;
  selectedFolder: string | null;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  searchQuery,
  currentFolderName,
  selectedCategory,
  selectedFolder
}) => {
  return (
    <div className="text-center py-12">
      <div className="text-gray-400 text-6xl mb-4">📝</div>
      <h3 className="text-xl font-semibold text-gray-600 mb-2">No prompts found</h3>
      <p className="text-gray-500">
        {searchQuery 
          ? `No prompts match "${searchQuery}" in ${currentFolderName}`
          : selectedCategory !== 'All' || selectedFolder
          ? 'Try adjusting your search, filter, or folder selection'
          : 'Start by adding your first AI prompt'
        }
      </p>
    </div>
  );
};
