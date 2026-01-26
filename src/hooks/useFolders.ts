import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface Folder {
  id: string;
  name: string;
  color: string;
  created_at: string;
  updated_at: string;
}

export function useFolders() {
  const { user } = useAuth();
  const [folders, setFolders] = useState<Folder[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchFolders = useCallback(async () => {
    if (!user) {
      setFolders([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const { data, error } = await supabase
      .from('folders')
      .select('*')
      .order('name', { ascending: true });

    if (error) {
      console.error('Error fetching folders:', error);
    } else {
      setFolders(data || []);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchFolders();
  }, [fetchFolders]);

  const createFolder = async (
    name: string,
    color: string = '#6366f1'
  ): Promise<{ success: boolean; error?: string; folder?: Folder }> => {
    if (!user) return { success: false, error: 'Not authenticated' };

    const { data, error } = await supabase
      .from('folders')
      .insert({ user_id: user.id, name, color })
      .select()
      .single();

    if (error) {
      console.error('Error creating folder:', error);
      return { success: false, error: error.message };
    }

    await fetchFolders();
    return { success: true, folder: data };
  };

  const updateFolder = async (
    id: string,
    updates: { name?: string; color?: string }
  ): Promise<{ success: boolean; error?: string }> => {
    const { error } = await supabase
      .from('folders')
      .update(updates)
      .eq('id', id);

    if (error) {
      console.error('Error updating folder:', error);
      return { success: false, error: error.message };
    }

    await fetchFolders();
    return { success: true };
  };

  const deleteFolder = async (id: string): Promise<{ success: boolean; error?: string }> => {
    const { error } = await supabase
      .from('folders')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting folder:', error);
      return { success: false, error: error.message };
    }

    await fetchFolders();
    return { success: true };
  };

  return { folders, loading, createFolder, updateFolder, deleteFolder, refetch: fetchFolders };
}
