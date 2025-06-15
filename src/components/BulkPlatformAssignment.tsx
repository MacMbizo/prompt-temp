
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Settings2, Filter, CheckCircle, X } from 'lucide-react';
import { PlatformBadge } from '@/components/PlatformBadge';
import { toast } from 'sonner';
import type { Prompt } from '@/hooks/usePrompts';

interface BulkPlatformAssignmentProps {
  prompts: Prompt[];
  availablePlatforms: string[];
  onUpdatePrompts: (promptIds: string[], platforms: string[]) => Promise<void>;
}

interface FilterCriteria {
  category: string;
  hasNoPlatforms: boolean;
  searchTerm: string;
}

export const BulkPlatformAssignment: React.FC<BulkPlatformAssignmentProps> = ({
  prompts,
  availablePlatforms,
  onUpdatePrompts
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedPrompts, setSelectedPrompts] = useState<string[]>([]);
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [filterCriteria, setFilterCriteria] = useState<FilterCriteria>({
    category: 'All',
    hasNoPlatforms: false,
    searchTerm: ''
  });
  const [isProcessing, setIsProcessing] = useState(false);

  const categories = useMemo(() => {
    const cats = Array.from(new Set(prompts.map(p => p.category)));
    return ['All', ...cats];
  }, [prompts]);

  const filteredPrompts = useMemo(() => {
    return prompts.filter(prompt => {
      if (filterCriteria.category !== 'All' && prompt.category !== filterCriteria.category) {
        return false;
      }
      
      if (filterCriteria.hasNoPlatforms && prompt.platforms && prompt.platforms.length > 0) {
        return false;
      }
      
      if (filterCriteria.searchTerm) {
        const searchLower = filterCriteria.searchTerm.toLowerCase();
        return (
          prompt.title.toLowerCase().includes(searchLower) ||
          prompt.description.toLowerCase().includes(searchLower) ||
          prompt.tags.some(tag => tag.toLowerCase().includes(searchLower))
        );
      }
      
      return true;
    });
  }, [prompts, filterCriteria]);

  const handlePromptSelect = (promptId: string, checked: boolean) => {
    setSelectedPrompts(prev => 
      checked 
        ? [...prev, promptId]
        : prev.filter(id => id !== promptId)
    );
  };

  const handleSelectAll = () => {
    const allVisible = filteredPrompts.map(p => p.id);
    setSelectedPrompts(allVisible);
  };

  const handleDeselectAll = () => {
    setSelectedPrompts([]);
  };

  const handlePlatformToggle = (platform: string) => {
    setSelectedPlatforms(prev =>
      prev.includes(platform)
        ? prev.filter(p => p !== platform)
        : [...prev, platform]
    );
  };

  const handleBulkAssignment = async () => {
    if (selectedPrompts.length === 0 || selectedPlatforms.length === 0) {
      toast.error('Please select both prompts and platforms');
      return;
    }

    setIsProcessing(true);
    try {
      await onUpdatePrompts(selectedPrompts, selectedPlatforms);
      toast.success(`Updated ${selectedPrompts.length} prompts with ${selectedPlatforms.length} platforms`);
      setSelectedPrompts([]);
      setSelectedPlatforms([]);
      setIsOpen(false);
    } catch (error) {
      toast.error('Failed to update prompts');
    } finally {
      setIsProcessing(false);
    }
  };

  const getPromptPlatformCount = (prompt: Prompt) => {
    return prompt.platforms ? prompt.platforms.length : 0;
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="flex items-center">
          <Settings2 className="w-4 h-4 mr-2" />
          Bulk Platform Assignment
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Settings2 className="w-5 h-5 mr-2" />
            Bulk Platform Assignment
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <Filter className="w-4 h-4 mr-2" />
                Filter Prompts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Category:</label>
                  <Select 
                    value={filterCriteria.category} 
                    onValueChange={(value) => setFilterCriteria(prev => ({ ...prev, category: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(category => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Search:</label>
                  <Input
                    placeholder="Search prompts..."
                    value={filterCriteria.searchTerm}
                    onChange={(e) => setFilterCriteria(prev => ({ ...prev, searchTerm: e.target.value }))}
                  />
                </div>

                <div className="flex items-end">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="no-platforms"
                      checked={filterCriteria.hasNoPlatforms}
                      onCheckedChange={(checked) => 
                        setFilterCriteria(prev => ({ ...prev, hasNoPlatforms: !!checked }))
                      }
                    />
                    <label htmlFor="no-platforms" className="text-sm">
                      Only prompts without platforms
                    </label>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Platform Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Select Platforms to Assign</CardTitle>
              <CardDescription>
                Choose which platforms to assign to selected prompts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {availablePlatforms.map(platform => (
                  <div
                    key={platform}
                    className={`p-3 border-2 rounded-lg cursor-pointer transition-all ${
                      selectedPlatforms.includes(platform)
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => handlePlatformToggle(platform)}
                  >
                    <div className="flex items-center justify-between">
                      <PlatformBadge platform={platform} size="sm" />
                      {selectedPlatforms.includes(platform) && (
                        <CheckCircle className="w-4 h-4 text-purple-600" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
              {selectedPlatforms.length > 0 && (
                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-800">
                    Selected platforms ({selectedPlatforms.length}): {selectedPlatforms.join(', ')}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Prompt Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center justify-between">
                <span>Select Prompts ({filteredPrompts.length} available)</span>
                <div className="space-x-2">
                  <Button onClick={handleSelectAll} variant="outline" size="sm">
                    Select All
                  </Button>
                  <Button onClick={handleDeselectAll} variant="outline" size="sm">
                    <X className="w-4 h-4 mr-1" />
                    Clear
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="max-h-64 overflow-y-auto space-y-2">
                {filteredPrompts.map(prompt => (
                  <div
                    key={prompt.id}
                    className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50"
                  >
                    <Checkbox
                      checked={selectedPrompts.includes(prompt.id)}
                      onCheckedChange={(checked) => handlePromptSelect(prompt.id, !!checked)}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{prompt.title}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          {prompt.category}
                        </Badge>
                        <span className="text-xs text-gray-500">
                          {getPromptPlatformCount(prompt)} platforms assigned
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {selectedPrompts.length > 0 && (
                <div className="mt-4 p-3 bg-green-50 rounded-lg">
                  <p className="text-sm text-green-800">
                    {selectedPrompts.length} prompts selected for platform assignment
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3">
            <Button 
              onClick={() => setIsOpen(false)} 
              variant="outline"
            >
              Cancel
            </Button>
            <Button
              onClick={handleBulkAssignment}
              disabled={selectedPrompts.length === 0 || selectedPlatforms.length === 0 || isProcessing}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            >
              {isProcessing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Processing...
                </>
              ) : (
                <>
                  <Settings2 className="w-4 h-4 mr-2" />
                  Assign Platforms ({selectedPrompts.length} prompts)
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
