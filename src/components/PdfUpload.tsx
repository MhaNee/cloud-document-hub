import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { usePdfs } from '@/hooks/usePdfs';
import { useFolders } from '@/hooks/useFolders';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Upload, FileText, CheckCircle2, AlertCircle, Folder } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PdfUploadProps {
  selectedFolderId?: string | null;
}

export function PdfUpload({ selectedFolderId }: PdfUploadProps) {
  const { uploadPdf } = usePdfs();
  const { folders } = useFolders();
  const { toast } = useToast();
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [targetFolder, setTargetFolder] = useState<string>(selectedFolderId || 'none');

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (!file) return;

      setIsUploading(true);
      setUploadProgress(0);
      setUploadStatus('idle');

      const folderId = targetFolder === 'none' ? null : targetFolder;
      const result = await uploadPdf(file, setUploadProgress, folderId);

      if (result.success) {
        setUploadStatus('success');
        toast({
          title: 'Upload successful',
          description: `${file.name} has been uploaded.`,
        });
        setTimeout(() => {
          setUploadStatus('idle');
          setUploadProgress(0);
        }, 2000);
      } else {
        setUploadStatus('error');
        toast({
          title: 'Upload failed',
          description: result.error || 'Something went wrong.',
          variant: 'destructive',
        });
      }

      setIsUploading(false);
    },
    [uploadPdf, toast, targetFolder]
  );

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    maxFiles: 1,
    maxSize: 50 * 1024 * 1024, // 50MB
    disabled: isUploading,
  });

  return (
    <div className="space-y-4">
      {folders.length > 0 && (
        <div className="flex items-center gap-2">
          <Folder className="h-4 w-4 text-muted-foreground" />
          <Select value={targetFolder} onValueChange={setTargetFolder}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select folder" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">No folder</SelectItem>
              {folders.map((folder) => (
                <SelectItem key={folder.id} value={folder.id}>
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: folder.color }}
                    />
                    {folder.name}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <div
        {...getRootProps()}
        className={cn(
          'relative border-2 border-dashed rounded-xl p-8 transition-all duration-200 cursor-pointer',
          'hover:border-primary/50 hover:bg-primary/5',
          isDragActive && 'border-primary bg-primary/10 scale-[1.02]',
          isDragReject && 'border-destructive bg-destructive/10',
          isUploading && 'pointer-events-none opacity-70',
          uploadStatus === 'success' && 'border-primary bg-primary/10',
          uploadStatus === 'error' && 'border-destructive bg-destructive/10'
        )}
      >
        <input {...getInputProps()} />

        <div className="flex flex-col items-center justify-center text-center space-y-4">
          {uploadStatus === 'success' ? (
            <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8 text-primary" />
            </div>
          ) : uploadStatus === 'error' ? (
            <div className="w-16 h-16 rounded-full bg-destructive/20 flex items-center justify-center">
              <AlertCircle className="w-8 h-8 text-destructive" />
            </div>
          ) : (
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
              {isDragActive ? (
                <FileText className="w-8 h-8 text-primary" />
              ) : (
                <Upload className="w-8 h-8 text-muted-foreground" />
              )}
            </div>
          )}

          <div>
            {isDragActive ? (
              <p className="text-lg font-medium text-primary">Drop your PDF here</p>
            ) : uploadStatus === 'success' ? (
              <p className="text-lg font-medium text-primary">Upload complete!</p>
            ) : uploadStatus === 'error' ? (
              <p className="text-lg font-medium text-destructive">Upload failed</p>
            ) : (
              <>
                <p className="text-lg font-medium">Drag & drop your PDF here</p>
                <p className="text-sm text-muted-foreground mt-1">or click to browse</p>
              </>
            )}
          </div>

          {isUploading && (
            <div className="w-full max-w-xs space-y-2">
              <Progress value={uploadProgress} className="h-2" />
              <p className="text-sm text-muted-foreground">{uploadProgress}% uploaded</p>
            </div>
          )}

          {!isUploading && uploadStatus === 'idle' && (
            <Button variant="outline" size="sm" className="mt-2">
              <Upload className="w-4 h-4 mr-2" />
              Select PDF
            </Button>
          )}

          <p className="text-xs text-muted-foreground">PDF files only, up to 50MB</p>
        </div>
      </div>
    </div>
  );
}
