import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Upload, FileText, X, CheckCircle2, AlertCircle } from 'lucide-react';
import { usePdfs } from '@/hooks/usePdfs';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

export function PdfUpload() {
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const { uploadPdf } = usePdfs();
  const { toast } = useToast();

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setIsUploading(true);
    setUploadProgress(0);
    setUploadStatus('idle');

    const result = await uploadPdf(file, setUploadProgress);

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
  }, [uploadPdf, toast]);

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    maxFiles: 1,
    maxSize: 50 * 1024 * 1024, // 50MB
    disabled: isUploading,
  });

  return (
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

        <p className="text-xs text-muted-foreground">
          PDF files only, up to 50MB
        </p>
      </div>
    </div>
  );
}
