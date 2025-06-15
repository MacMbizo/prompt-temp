
import { useState } from 'react';
import { toast } from 'sonner';
import type { Prompt } from '@/hooks/usePrompts';

export interface ExportData {
  version: string;
  exportDate: string;
  prompts: Omit<Prompt, 'id' | 'user_id' | 'created_at' | 'updated_at'>[];
}

export const useImportExport = () => {
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  const exportPrompts = async (prompts: Prompt[], filename?: string) => {
    setIsExporting(true);
    try {
      const exportData: ExportData = {
        version: '1.0',
        exportDate: new Date().toISOString(),
        prompts: prompts.map(prompt => ({
          title: prompt.title,
          description: prompt.description,
          content: prompt.content,
          category: prompt.category,
          tags: prompt.tags,
          variables: prompt.variables,
          is_template: prompt.is_template,
          folder_id: prompt.folder_id
        }))
      };

      const dataStr = JSON.stringify(exportData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename || `prompts-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success(`Exported ${exportData.prompts.length} prompts successfully!`);
    } catch (error) {
      console.error('Error exporting prompts:', error);
      toast.error('Failed to export prompts');
    } finally {
      setIsExporting(false);
    }
  };

  const importPrompts = async (file: File): Promise<ExportData | null> => {
    setIsImporting(true);
    try {
      const fileContent = await file.text();
      const importData: ExportData = JSON.parse(fileContent);

      // Validate the import data structure
      if (!importData.version || !importData.prompts || !Array.isArray(importData.prompts)) {
        throw new Error('Invalid file format');
      }

      // Validate each prompt has required fields
      for (const prompt of importData.prompts) {
        if (!prompt.title || !prompt.content || !prompt.category) {
          throw new Error('Invalid prompt data - missing required fields');
        }
      }

      toast.success(`Ready to import ${importData.prompts.length} prompts`);
      return importData;
    } catch (error) {
      console.error('Error importing prompts:', error);
      toast.error('Failed to parse import file. Please check the file format.');
      return null;
    } finally {
      setIsImporting(false);
    }
  };

  return {
    exportPrompts,
    importPrompts,
    isExporting,
    isImporting
  };
};
