
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Plus, Folder as FolderIcon, MoreVertical, Edit, Trash2, FolderOpen } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useFolders, type Folder } from '@/hooks/useFolders';
import { usePrompts } from '@/hooks/usePrompts';

interface FolderSidebarProps {
  selectedFolderId: string | null;
  onFolderSelect: (folderId: string | null) => void;
}

const FOLDER_COLORS = [
  '#6366f1', '#8b5cf6', '#ec4899', '#ef4444', '#f59e0b', 
  '#10b981', '#06b6d4', '#6b7280', '#84cc16', '#f97316'
];

export const FolderSidebar = ({ selectedFolderId, onFolderSelect }: FolderSidebarProps) => {
  const { folders, loading, addFolder, updateFolder, deleteFolder } = useFolders();
  const { prompts } = usePrompts();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingFolder, setEditingFolder] = useState<Folder | null>(null);
  const [folderForm, setFolderForm] = useState({
    name: '',
    description: '',
    color: '#6366f1'
  });

  const getFolderPromptCount = (folderId: string | null) => {
    return prompts.filter(prompt => prompt.folder_id === folderId).length;
  };

  const handleCreateFolder = async () => {
    if (!folderForm.name.trim()) return;
    
    const result = await addFolder(folderForm);
    if (result) {
      setIsCreateModalOpen(false);
      setFolderForm({ name: '', description: '', color: '#6366f1' });
    }
  };

  const handleUpdateFolder = async () => {
    if (!editingFolder || !folderForm.name.trim()) return;
    
    await updateFolder(editingFolder.id, {
      name: folderForm.name,
      description: folderForm.description,
      color: folderForm.color
    });
    setEditingFolder(null);
    setFolderForm({ name: '', description: '', color: '#6366f1' });
  };

  const handleDeleteFolder = async (folderId: string) => {
    if (window.confirm('Are you sure you want to delete this folder? Prompts in this folder will be moved to uncategorized.')) {
      await deleteFolder(folderId);
      if (selectedFolderId === folderId) {
        onFolderSelect(null);
      }
    }
  };

  const openEditModal = (folder: Folder) => {
    setEditingFolder(folder);
    setFolderForm({
      name: folder.name,
      description: folder.description || '',
      color: folder.color
    });
  };

  if (loading) {
    return (
      <Card className="w-80 h-fit">
        <CardContent className="p-4">
          <div className="animate-pulse space-y-2">
            <div className="h-4 bg-gray-300 rounded w-3/4"></div>
            <div className="h-4 bg-gray-300 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-80 h-fit">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900">Folders</h3>
          <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
            <DialogTrigger asChild>
              <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                <Plus className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Folder</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={folderForm.name}
                    onChange={(e) => setFolderForm(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Folder name"
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={folderForm.description}
                    onChange={(e) => setFolderForm(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Optional description"
                    rows={3}
                  />
                </div>
                <div>
                  <Label>Color</Label>
                  <div className="flex gap-2 mt-2">
                    {FOLDER_COLORS.map((color) => (
                      <button
                        key={color}
                        className={`w-6 h-6 rounded-full border-2 ${
                          folderForm.color === color ? 'border-gray-900' : 'border-gray-300'
                        }`}
                        style={{ backgroundColor: color }}
                        onClick={() => setFolderForm(prev => ({ ...prev, color }))}
                      />
                    ))}
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateFolder}>Create Folder</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="space-y-2">
          {/* All Prompts */}
          <button
            onClick={() => onFolderSelect(null)}
            className={`w-full flex items-center justify-between p-2 rounded-lg text-left hover:bg-gray-50 transition-colors ${
              selectedFolderId === null ? 'bg-purple-50 border-purple-200 border' : ''
            }`}
          >
            <div className="flex items-center gap-2">
              <FolderOpen className="h-4 w-4 text-gray-500" />
              <span className="text-sm">All Prompts</span>
            </div>
            <Badge variant="secondary" className="text-xs">
              {prompts.length}
            </Badge>
          </button>

          {/* Uncategorized */}
          <button
            onClick={() => onFolderSelect('uncategorized')}
            className={`w-full flex items-center justify-between p-2 rounded-lg text-left hover:bg-gray-50 transition-colors ${
              selectedFolderId === 'uncategorized' ? 'bg-purple-50 border-purple-200 border' : ''
            }`}
          >
            <div className="flex items-center gap-2">
              <FolderIcon className="h-4 w-4 text-gray-500" />
              <span className="text-sm">Uncategorized</span>
            </div>
            <Badge variant="secondary" className="text-xs">
              {getFolderPromptCount(null)}
            </Badge>
          </button>

          {/* User Folders */}
          {folders.map((folder) => (
            <div
              key={folder.id}
              className={`flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 transition-colors ${
                selectedFolderId === folder.id ? 'bg-purple-50 border-purple-200 border' : ''
              }`}
            >
              <button
                onClick={() => onFolderSelect(folder.id)}
                className="flex items-center gap-2 flex-1 text-left"
              >
                <FolderIcon className="h-4 w-4" style={{ color: folder.color }} />
                <span className="text-sm truncate">{folder.name}</span>
              </button>
              
              <div className="flex items-center gap-1">
                <Badge variant="secondary" className="text-xs">
                  {getFolderPromptCount(folder.id)}
                </Badge>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                      <MoreVertical className="h-3 w-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="bg-white border shadow-lg z-50">
                    <DropdownMenuItem onClick={() => openEditModal(folder)}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => handleDeleteFolder(folder.id)}
                      className="text-red-600"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          ))}
        </div>

        {/* Edit Folder Modal */}
        <Dialog open={!!editingFolder} onOpenChange={() => setEditingFolder(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Folder</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-name">Name</Label>
                <Input
                  id="edit-name"
                  value={folderForm.name}
                  onChange={(e) => setFolderForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Folder name"
                />
              </div>
              <div>
                <Label htmlFor="edit-description">Description</Label>
                <Textarea
                  id="edit-description"
                  value={folderForm.description}
                  onChange={(e) => setFolderForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Optional description"
                  rows={3}
                />
              </div>
              <div>
                <Label>Color</Label>
                <div className="flex gap-2 mt-2">
                  {FOLDER_COLORS.map((color) => (
                    <button
                      key={color}
                      className={`w-6 h-6 rounded-full border-2 ${
                        folderForm.color === color ? 'border-gray-900' : 'border-gray-300'
                      }`}
                      style={{ backgroundColor: color }}
                      onClick={() => setFolderForm(prev => ({ ...prev, color }))}
                    />
                  ))}
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setEditingFolder(null)}>
                  Cancel
                </Button>
                <Button onClick={handleUpdateFolder}>Update Folder</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};
