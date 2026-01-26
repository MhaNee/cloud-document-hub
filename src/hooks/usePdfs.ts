import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface PdfFile {
  id: string;
  filename: string;
  original_filename: string;
  file_size: number;
  file_url: string;
  folder_id: string | null;
  summary: string | null;
  created_at: string;
  updated_at: string;
}

export function usePdfs() {
  const { user } = useAuth();
  const [pdfs, setPdfs] = useState<PdfFile[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPdfs = useCallback(async () => {
    if (!user) {
      setPdfs([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const { data, error } = await supabase
      .from('pdfs')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching PDFs:', error);
    } else {
      setPdfs(data || []);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchPdfs();
  }, [fetchPdfs]);

  const uploadPdf = async (
    file: File,
    onProgress?: (progress: number) => void,
    folderId?: string | null
  ): Promise<{ success: boolean; error?: string }> => {
    if (!user) return { success: false, error: 'Not authenticated' };

    // Validate file type
    if (file.type !== 'application/pdf') {
      return { success: false, error: 'Only PDF files are allowed' };
    }

    // Validate file size (50MB max)
    const maxSize = 50 * 1024 * 1024;
    if (file.size > maxSize) {
      return { success: false, error: 'File size must be under 50MB' };
    }

    const filename = `${user.id}/${Date.now()}-${file.name}`;

    // Upload to storage
    onProgress?.(10);
    const { error: uploadError } = await supabase.storage
      .from('pdfs')
      .upload(filename, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      return { success: false, error: uploadError.message };
    }

    onProgress?.(70);

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('pdfs')
      .getPublicUrl(filename);

    // Save metadata to database
    const { error: dbError } = await supabase.from('pdfs').insert({
      user_id: user.id,
      filename,
      original_filename: file.name,
      file_size: file.size,
      file_url: urlData.publicUrl,
      folder_id: folderId || null,
    });

    if (dbError) {
      console.error('Database error:', dbError);
      // Clean up uploaded file
      await supabase.storage.from('pdfs').remove([filename]);
      return { success: false, error: dbError.message };
    }

    onProgress?.(100);
    await fetchPdfs();
    return { success: true };
  };

  const deletePdf = async (pdf: PdfFile): Promise<{ success: boolean; error?: string }> => {
    // Delete from storage
    const { error: storageError } = await supabase.storage
      .from('pdfs')
      .remove([pdf.filename]);

    if (storageError) {
      console.error('Storage delete error:', storageError);
      return { success: false, error: storageError.message };
    }

    // Delete from database
    const { error: dbError } = await supabase
      .from('pdfs')
      .delete()
      .eq('id', pdf.id);

    if (dbError) {
      console.error('Database delete error:', dbError);
      return { success: false, error: dbError.message };
    }

    await fetchPdfs();
    return { success: true };
  };

  const getSignedUrl = async (pdf: PdfFile): Promise<string | null> => {
    const { data, error } = await supabase.storage
      .from('pdfs')
      .createSignedUrl(pdf.filename, 3600); // 1 hour

    if (error) {
      console.error('Error getting signed URL:', error);
      return null;
    }

    return data.signedUrl;
  };

  const updatePdfFolder = async (
    pdfId: string,
    folderId: string | null
  ): Promise<{ success: boolean; error?: string }> => {
    const { error } = await supabase
      .from('pdfs')
      .update({ folder_id: folderId })
      .eq('id', pdfId);

    if (error) {
      console.error('Error updating PDF folder:', error);
      return { success: false, error: error.message };
    }

    await fetchPdfs();
    return { success: true };
  };

  return { pdfs, loading, uploadPdf, deletePdf, getSignedUrl, updatePdfFolder, refetch: fetchPdfs };
}
