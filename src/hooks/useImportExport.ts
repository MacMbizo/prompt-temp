
import { useState } from 'react';
import { toast } from 'sonner';
import type { Prompt } from '@/integrations/supabase/types';

export interface ExportData {
  version: string;
  exportDate: string;
  prompts: Omit<Prompt, 'id' | 'user_id' | 'created_at' | 'updated_at'>[];
}

export type ExportFormat = 'json' | 'csv';
export type ImportFormat = 'json' | 'csv';

// Helper function to convert prompts to CSV format
const convertToCSV = (prompts: Omit<Prompt, 'id' | 'user_id' | 'created_at' | 'updated_at'>[]): string => {
  if (prompts.length === 0) return '';

  // Define CSV headers
  const headers = [
    'title',
    'description',
    'prompt_text',
    'category',
    'tags',
    'platforms',
    'variables',
    'is_template',
    'folder_id',
    'is_community',
    'copy_count',
    'average_rating',
    'rating_count',
    'is_featured',
    'status',
    'usage_count'
  ];

  // Helper function to escape CSV values
  const escapeCSV = (value: any): string => {
    if (value === null || value === undefined) return '';
    const str = String(value);
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  // Convert prompts to CSV rows
  const rows = prompts.map(prompt => {
    return headers.map(header => {
      const value = prompt[header as keyof typeof prompt];
      if (Array.isArray(value)) {
        return escapeCSV(value.join(';')); // Use semicolon as array separator
      }
      return escapeCSV(value);
    }).join(',');
  });

  return [headers.join(','), ...rows].join('\n');
};

// Helper function to parse CSV content
const parseCSV = (csvContent: string): Omit<Prompt, 'id' | 'user_id' | 'created_at' | 'updated_at'>[] => {
  const lines = csvContent.split('\n').filter(line => line.trim());
  if (lines.length < 2) throw new Error('Invalid CSV format: missing headers or data');

  const headers = lines[0].split(',').map(h => h.trim());
  const prompts: Omit<Prompt, 'id' | 'user_id' | 'created_at' | 'updated_at'>[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim());
    if (values.length !== headers.length) continue;

    const prompt: any = {};
    headers.forEach((header, index) => {
      let value = values[index];
      
      // Remove quotes if present
      if (value.startsWith('"') && value.endsWith('"')) {
        value = value.slice(1, -1).replace(/""/g, '"');
      }

      // Parse specific fields
      if (header === 'tags' || header === 'platforms' || header === 'variables') {
        prompt[header] = value ? value.split(';') : [];
      } else if (header === 'is_template' || header === 'is_community' || header === 'is_featured') {
        prompt[header] = value.toLowerCase() === 'true';
      } else if (header === 'copy_count' || header === 'rating_count' || header === 'usage_count') {
        prompt[header] = parseInt(value) || 0;
      } else if (header === 'average_rating') {
        prompt[header] = value ? parseFloat(value) : null;
      } else {
        prompt[header] = value || null;
      }
    });

    // Validate required fields
    if (prompt.title && prompt.prompt_text && prompt.category) {
      prompts.push(prompt);
    }
  }

  return prompts;
};

export const useImportExport = () => {
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  const exportPrompts = async (prompts: Prompt[], format: ExportFormat = 'json', filename?: string) => {
    setIsExporting(true);
    try {
      const exportData: ExportData = {
        version: '1.0',
        exportDate: new Date().toISOString(),
        prompts: prompts.map(prompt => ({
          title: prompt.title,
          description: prompt.description,
          prompt_text: prompt.prompt_text,
          category: prompt.category,
          tags: prompt.tags,
          platforms: prompt.platforms,
          variables: prompt.variables,
          is_template: prompt.is_template,
          folder_id: prompt.folder_id,
          is_community: prompt.is_community,
          copy_count: prompt.copy_count,
          average_rating: prompt.average_rating,
          rating_count: prompt.rating_count,
          is_featured: prompt.is_featured,
          status: prompt.status,
          usage_count: prompt.usage_count
        }))
      };

      let dataStr: string;
      let mimeType: string;
      let fileExtension: string;

      if (format === 'csv') {
        dataStr = convertToCSV(exportData.prompts);
        mimeType = 'text/csv';
        fileExtension = 'csv';
      } else {
        dataStr = JSON.stringify(exportData, null, 2);
        mimeType = 'application/json';
        fileExtension = 'json';
      }

      const dataBlob = new Blob([dataStr], { type: mimeType });
      
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename || `prompts-export-${new Date().toISOString().split('T')[0]}.${fileExtension}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success(`Exported ${exportData.prompts.length} prompts as ${format.toUpperCase()} successfully!`);
    } catch (error) {
      console.error('Error exporting prompts:', error);
      toast.error('Failed to export prompts');
    } finally {
      setIsExporting(false);
    }
  };

  const importPrompts = async (file: File, format?: ImportFormat): Promise<ExportData | null> => {
    setIsImporting(true);
    try {
      const fileContent = await file.text();
      let prompts: Omit<Prompt, 'id' | 'user_id' | 'created_at' | 'updated_at'>[];
      
      // Determine format from file extension if not provided
      const detectedFormat = format || (file.name.toLowerCase().endsWith('.csv') ? 'csv' : 'json');
      
      if (detectedFormat === 'csv') {
        prompts = parseCSV(fileContent);
      } else {
        const importData: ExportData = JSON.parse(fileContent);
        
        // Validate the import data structure
        if (!importData.version || !importData.prompts || !Array.isArray(importData.prompts)) {
          throw new Error('Invalid JSON file format');
        }
        
        prompts = importData.prompts;
      }

      // Validate and normalize each prompt
      for (const prompt of prompts) {
        if (!prompt.title || !prompt.prompt_text || !prompt.category) {
          throw new Error('Invalid prompt data - missing required fields (title, prompt_text, category)');
        }
        
        // Ensure platforms field exists for backward compatibility
        if (!prompt.platforms) {
          prompt.platforms = [];
        }
        
        // Add defaults for new fields if they don't exist (backward compatibility)
        if (prompt.is_community === undefined) {
          prompt.is_community = false;
        }
        if (prompt.copy_count === undefined) {
          prompt.copy_count = 0;
        }
        if (prompt.average_rating === undefined) {
          prompt.average_rating = null;
        }
        if (prompt.rating_count === undefined) {
          prompt.rating_count = 0;
        }
        if (prompt.is_featured === undefined) {
          prompt.is_featured = false;
        }
        if (prompt.status === undefined) {
          prompt.status = 'active';
        }
        if (prompt.usage_count === undefined) {
          prompt.usage_count = 0;
        }
        if (!prompt.tags) {
          prompt.tags = [];
        }
        if (!prompt.variables) {
          prompt.variables = [];
        }
      }

      const importData: ExportData = {
        version: '1.0',
        exportDate: new Date().toISOString(),
        prompts
      };

      toast.success(`Ready to import ${importData.prompts.length} prompts from ${detectedFormat.toUpperCase()} file`);
      return importData;
    } catch (error) {
      console.error('Error importing prompts:', error);
      toast.error(`Failed to parse import file. Please check the file format. Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
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
