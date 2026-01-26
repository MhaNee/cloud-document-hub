import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useUserRole } from './useUserRole';

export interface UserProfile {
  id: string;
  user_id: string;
  email: string;
  created_at: string;
  role?: string;
}

export interface AdminPdf {
  id: string;
  filename: string;
  original_filename: string;
  file_size: number;
  created_at: string;
  user_id: string;
  user_email?: string;
}

export function useAdminData() {
  const { isAdmin } = useUserRole();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [pdfs, setPdfs] = useState<AdminPdf[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    if (!isAdmin) {
      setUsers([]);
      setPdfs([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    // Fetch all profiles with roles
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (profilesError) {
      console.error('Error fetching profiles:', profilesError);
    } else {
      // Fetch roles for each user
      const { data: roles } = await supabase
        .from('user_roles')
        .select('user_id, role');

      const roleMap = new Map(roles?.map(r => [r.user_id, r.role]) || []);
      
      setUsers(
        (profiles || []).map(p => ({
          ...p,
          role: roleMap.get(p.user_id) || 'user',
        }))
      );
    }

    // Fetch all PDFs with user info
    const { data: allPdfs, error: pdfsError } = await supabase
      .from('pdfs')
      .select('*')
      .order('created_at', { ascending: false });

    if (pdfsError) {
      console.error('Error fetching PDFs:', pdfsError);
    } else {
      // Get user emails for PDFs
      const { data: pdfProfiles } = await supabase
        .from('profiles')
        .select('user_id, email');

      const emailMap = new Map(pdfProfiles?.map(p => [p.user_id, p.email]) || []);

      setPdfs(
        (allPdfs || []).map(pdf => ({
          ...pdf,
          user_email: emailMap.get(pdf.user_id) || 'Unknown',
        }))
      );
    }

    setLoading(false);
  }, [isAdmin]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const updateUserRole = async (
    userId: string,
    newRole: 'admin' | 'user'
  ): Promise<{ success: boolean; error?: string }> => {
    const { error } = await supabase
      .from('user_roles')
      .update({ role: newRole })
      .eq('user_id', userId);

    if (error) {
      console.error('Error updating role:', error);
      return { success: false, error: error.message };
    }

    await fetchData();
    return { success: true };
  };

  const deleteUser = async (userId: string): Promise<{ success: boolean; error?: string }> => {
    // Delete profile (cascades to roles due to FK)
    const { error } = await supabase
      .from('profiles')
      .delete()
      .eq('user_id', userId);

    if (error) {
      console.error('Error deleting user:', error);
      return { success: false, error: error.message };
    }

    await fetchData();
    return { success: true };
  };

  const deletePdf = async (pdfId: string, filename: string): Promise<{ success: boolean; error?: string }> => {
    // Delete from storage
    const { error: storageError } = await supabase.storage
      .from('pdfs')
      .remove([filename]);

    if (storageError) {
      console.error('Storage delete error:', storageError);
    }

    // Delete from database
    const { error: dbError } = await supabase
      .from('pdfs')
      .delete()
      .eq('id', pdfId);

    if (dbError) {
      console.error('Error deleting PDF:', dbError);
      return { success: false, error: dbError.message };
    }

    await fetchData();
    return { success: true };
  };

  return {
    users,
    pdfs,
    loading,
    updateUserRole,
    deleteUser,
    deletePdf,
    refetch: fetchData,
  };
}
