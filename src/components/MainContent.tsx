
import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { IntegrationPreparation } from '@/components/IntegrationPreparation';
import { BulkPlatformAssignment } from '@/components/BulkPlatformAssignment';
import type { Prompt } from '@/hooks/usePrompts';

interface MainContentHeaderProps {
  currentFolderName: string;
  promptCountText: string;
  prompts: Prompt[];
  availablePlatforms: string[];
  onBulkPlatformUpdate: (promptIds: string[], platforms: string[]) => Promise<void>;
  onImportExportClick: () => void;
  onAddPromptClick: () => void;
}

export const MainContentHeader: React.FC<MainContentHeaderProps> = ({
  currentFolderName,
  promptCountText,
  prompts,
  availablePlatforms,
  onBulkPlatformUpdate,
  onImportExportClick,
  onAddPromptClick
}) => {
  return (
    <div className="flex flex-col lg:flex-row gap-6 mb-8">
      <div className="flex-1">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-2">
          {currentFolderName}
        </h1>
        <p className="text-gray-600 text-lg">
          {currentFolderName === 'All Prompts' 
            ? 'Organize and manage your AI prompts by category and use case'
            : `Prompts in ${currentFolderName}`
          }
        </p>
        <p className="text-sm text-gray-500 mt-1">
          {promptCountText}
        </p>
      </div>
      
      <div className="flex items-center gap-4">
        <IntegrationPreparation />
        <BulkPlatformAssignment
          prompts={prompts}
          availablePlatforms={availablePlatforms}
          onUpdatePrompts={onBulkPlatformUpdate}
        />
        <Button
          onClick={onImportExportClick}
          variant="outline"
          className="border-purple-300 text-purple-600 hover:bg-purple-50"
        >
          Import/Export
        </Button>
        <Button
          onClick={onAddPromptClick}
          className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-6 py-2 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Prompt
        </Button>
      </div>
    </div>
  );
};
