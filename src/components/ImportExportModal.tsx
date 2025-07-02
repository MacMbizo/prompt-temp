
import { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Download, Upload, FileText, AlertTriangle } from 'lucide-react';
import { useImportExport, type ExportData, type ExportFormat, type ImportFormat } from '@/hooks/useImportExport';
import type { Prompt } from '@/hooks/usePrompts';

interface ImportExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  prompts: Prompt[];
  onImport: (prompts: Omit<Prompt, 'id' | 'created_at' | 'updated_at' | 'user_id'>[]) => void;
}

export const ImportExportModal = ({
  isOpen,
  onClose,
  prompts,
  onImport
}: ImportExportModalProps) => {
  const { exportPrompts, importPrompts, isExporting, isImporting } = useImportExport();
  const [importData, setImportData] = useState<ExportData | null>(null);
  const [exportFormat, setExportFormat] = useState<ExportFormat>('json');
  const [importFormat, setImportFormat] = useState<ImportFormat>('json');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    exportPrompts(prompts, exportFormat);
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const data = await importPrompts(file, importFormat);
      setImportData(data);
    }
  };

  const handleImport = () => {
    if (importData) {
      onImport(importData.prompts);
      setImportData(null);
      onClose();
    }
  };

  const handleModalClose = () => {
    setImportData(null);
    setExportFormat('json');
    setImportFormat('json');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onClose();
  };

  const handleImportFormatChange = (value: ImportFormat) => {
    setImportFormat(value);
    setImportData(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleModalClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Import/Export Prompts</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="export" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="export">Export</TabsTrigger>
            <TabsTrigger value="import">Import</TabsTrigger>
          </TabsList>

          <TabsContent value="export" className="space-y-4">
            <div className="space-y-4">
              <div>
                <Label htmlFor="export-format">Export Format</Label>
                <Select value={exportFormat} onValueChange={(value: ExportFormat) => setExportFormat(value)}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select format" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="json">JSON (.json)</SelectItem>
                    <SelectItem value="csv">CSV (.csv)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="text-center py-6">
                <FileText className="w-12 h-12 mx-auto text-blue-500 mb-4" />
                <h3 className="text-lg font-medium mb-2">Export Your Prompts</h3>
                <p className="text-gray-600 mb-4">
                  Download all your prompts ({prompts.length}) as a {exportFormat.toUpperCase()} file for backup or sharing.
                </p>
                <Button
                  onClick={handleExport}
                  disabled={isExporting || prompts.length === 0}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Download className="w-4 h-4 mr-2" />
                  {isExporting ? 'Exporting...' : `Export as ${exportFormat.toUpperCase()}`}
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="import" className="space-y-4">
            <div className="space-y-4">
              <div>
                <Label htmlFor="import-format">Import Format</Label>
                <Select value={importFormat} onValueChange={handleImportFormatChange}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select format" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="json">JSON (.json)</SelectItem>
                    <SelectItem value="csv">CSV (.csv)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="import-file">Select {importFormat.toUpperCase()} File</Label>
                <Input
                  ref={fileInputRef}
                  id="import-file"
                  type="file"
                  accept={importFormat === 'csv' ? '.csv' : '.json'}
                  onChange={handleFileSelect}
                  disabled={isImporting}
                  className="mt-1"
                />
              </div>

              {importData && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <FileText className="w-5 h-5 text-green-600 mt-0.5" />
                    <div className="flex-1">
                      <h4 className="font-medium text-green-800">File Ready to Import</h4>
                      <p className="text-sm text-green-700 mt-1">
                        Found {importData.prompts.length} prompts exported on{' '}
                        {new Date(importData.exportDate).toLocaleDateString()}
                      </p>
                      
                      <div className="mt-3 flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-amber-500" />
                        <p className="text-xs text-amber-700">
                          Importing will add these prompts to your collection
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={handleModalClose}
                  disabled={isImporting}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleImport}
                  disabled={!importData || isImporting}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  {isImporting ? 'Importing...' : 'Import Prompts'}
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
