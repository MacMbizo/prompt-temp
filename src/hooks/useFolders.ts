
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface Folder {
  id: string;
  name: string;
  description?: string;
  color: string;
  created_at: string;
  updated_at: string;
  user_id: string;
}

export const useFolders = () => {
  const [folders, setFolders] = useState<Folder[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchFolders = async () => {
    if (!user) {
      setFolders([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('folders')
        .select('*')
        .order('updated_at', { ascending: false });

      if (error) {
        console.error('Error fetching folders:', error);
        toast.error('Failed to load folders');
      } else {
        setFolders(data || []);
      }
    } catch (error) {
      console.error('Error fetching folders:', error);
      toast.error('Failed to load folders');
    } finally {
      setLoading(false);
    }
  };

  const addFolder = async (folderData: Omit<Folder, 'id' | 'created_at' | 'updated_at' | 'user_id'>) => {
    if (!user) {
      toast.error('You must be logged in to add folders');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('folders')
        .insert([{
          ...folderData,
          user_id: user.id
        }])
        .select()
        .single();

      if (error) {
        console.error('Error adding folder:', error);
        toast.error('Failed to add folder');
      } else {
        setFolders(prev => [data, ...prev]);
        toast.success('Folder created successfully!');
        return data;
      }
    } catch (error) {
      console.error('Error adding folder:', error);
      toast.error('Failed to add folder');
    }
  };

  const updateFolder = async (id: string, updates: Partial<Pick<Folder, 'name' | 'description' | 'color'>>) => {
    if (!user) {
      toast.error('You must be logged in to update folders');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('folders')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating folder:', error);
        toast.error('Failed to update folder');
      } else {
        setFolders(prev => prev.map(folder => folder.id === id ? data : folder));
        toast.success('Folder updated successfully!');
      }
    } catch (error) {
      console.error('Error updating folder:', error);
      toast.error('Failed to update folder');
    }
  };

  const deleteFolder = async (id: string) => {
    if (!user) {
      toast.error('You must be logged in to delete folders');
      return;
    }

    try {
      const { error } = await supabase
        .from('folders')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting folder:', error);
        toast.error('Failed to delete folder');
      } else {
        setFolders(prev => prev.filter(folder => folder.id !== id));
        toast.success('Folder deleted successfully');
      }
    } catch (error) {
      console.error('Error deleting folder:', error);
      toast.error('Failed to delete folder');
    }
  };

  useEffect(() => {
    fetchFolders();
  }, [user]);

  return {
    folders,
    loading,
    addFolder,
    updateFolder,
    deleteFolder,
    refetch: fetchFolders
  };
};
