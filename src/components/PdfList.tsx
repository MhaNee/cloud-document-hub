import { useState } from 'react';
import { PdfFile, usePdfs } from '@/hooks/usePdfs';
import { useFolders, Folder } from '@/hooks/useFolders';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  FileText,
  Download,
  Eye,
  Trash2,
  Search,
  MoreVertical,
  Calendar,
  HardDrive,
  FolderIcon,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { PdfViewer } from './PdfViewer';
import { PdfSummary } from './PdfSummary';
import { formatDistanceToNow } from 'date-fns';

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

interface PdfListProps {
  selectedFolderId: string | null;
}

export function PdfList({ selectedFolderId }: PdfListProps) {
  const { pdfs, loading, deletePdf, getSignedUrl, updatePdfFolder, refetch } = usePdfs();
  const { folders } = useFolders();
  const [search, setSearch] = useState('');
  const [selectedPdf, setSelectedPdf] = useState<PdfFile | null>(null);
  const [pdfToDelete, setPdfToDelete] = useState<PdfFile | null>(null);
  const [viewerUrl, setViewerUrl] = useState<string | null>(null);
  const [signedUrls, setSignedUrls] = useState<Record<string, string>>({});
  const { toast } = useToast();

  // Filter by folder and search
  const filteredPdfs = pdfs.filter((pdf) => {
    const matchesSearch = pdf.original_filename.toLowerCase().includes(search.toLowerCase());
    const matchesFolder = selectedFolderId === null || pdf.folder_id === selectedFolderId;
    return matchesSearch && matchesFolder;
  });

  const handleView = async (pdf: PdfFile) => {
    let url = signedUrls[pdf.id];
    if (!url) {
      url = (await getSignedUrl(pdf)) || '';
      if (url) {
        setSignedUrls((prev) => ({ ...prev, [pdf.id]: url }));
      }
    }
    if (url) {
      setViewerUrl(url);
      setSelectedPdf(pdf);
    } else {
      toast({
        title: 'Error',
        description: 'Could not load PDF for viewing.',
        variant: 'destructive',
      });
    }
  };

  const handleDownload = async (pdf: PdfFile) => {
    let url = signedUrls[pdf.id];
    if (!url) {
      url = (await getSignedUrl(pdf)) || '';
      if (url) {
        setSignedUrls((prev) => ({ ...prev, [pdf.id]: url }));
      }
    }
    if (url) {
      const link = document.createElement('a');
      link.href = url;
      link.download = pdf.original_filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      toast({
        title: 'Error',
        description: 'Could not download PDF.',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async () => {
    if (!pdfToDelete) return;

    const result = await deletePdf(pdfToDelete);
    if (result.success) {
      toast({
        title: 'Deleted',
        description: `${pdfToDelete.original_filename} has been deleted.`,
      });
    } else {
      toast({
        title: 'Error',
        description: result.error || 'Could not delete PDF.',
        variant: 'destructive',
      });
    }
    setPdfToDelete(null);
  };

  const handleMoveToFolder = async (pdf: PdfFile, folderId: string | null) => {
    const result = await updatePdfFolder(pdf.id, folderId);
    if (result.success) {
      const folderName = folderId
        ? folders.find((f) => f.id === folderId)?.name || 'folder'
        : 'All PDFs';
      toast({
        title: 'Moved',
        description: `${pdf.original_filename} moved to ${folderName}`,
      });
    } else {
      toast({
        title: 'Error',
        description: result.error || 'Could not move PDF.',
        variant: 'destructive',
      });
    }
  };

  const getSignedUrlForPdf = async (pdf: PdfFile): Promise<string | null> => {
    if (signedUrls[pdf.id]) return signedUrls[pdf.id];
    const url = await getSignedUrl(pdf);
    if (url) {
      setSignedUrls((prev) => ({ ...prev, [pdf.id]: url }));
    }
    return url;
  };

  const getFolderForPdf = (pdf: PdfFile): Folder | undefined => {
    return folders.find((f) => f.id === pdf.folder_id);
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full max-w-sm" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        {pdfs.length > 0 && (
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search PDFs..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        )}

        {filteredPdfs.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto rounded-full bg-muted flex items-center justify-center mb-4">
              <FileText className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium">No PDFs yet</h3>
            <p className="text-muted-foreground mt-1">
              {search
                ? 'No PDFs match your search.'
                : selectedFolderId
                ? 'No PDFs in this folder.'
                : 'Upload your first PDF to get started.'}
            </p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredPdfs.map((pdf) => {
              const folder = getFolderForPdf(pdf);
              return (
                <Card
                  key={pdf.id}
                  className="group p-4 hover:shadow-lg transition-all duration-200 border-0 bg-card"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 rounded-xl bg-destructive/10 flex items-center justify-center flex-shrink-0">
                      <FileText className="w-6 h-6 text-destructive" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium truncate" title={pdf.original_filename}>
                        {pdf.original_filename}
                      </h4>
                      <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <HardDrive className="w-3 h-3" />
                          {formatFileSize(pdf.file_size)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {formatDistanceToNow(new Date(pdf.created_at), { addSuffix: true })}
                        </span>
                      </div>
                      {folder && (
                        <div className="flex items-center gap-1 mt-1 text-xs">
                          <FolderIcon className="w-3 h-3" style={{ color: folder.color }} />
                          <span style={{ color: folder.color }}>{folder.name}</span>
                        </div>
                      )}
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleView(pdf)}>
                          <Eye className="w-4 h-4 mr-2" />
                          View
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDownload(pdf)}>
                          <Download className="w-4 h-4 mr-2" />
                          Download
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuSub>
                          <DropdownMenuSubTrigger>
                            <FolderIcon className="w-4 h-4 mr-2" />
                            Move to folder
                          </DropdownMenuSubTrigger>
                          <DropdownMenuSubContent>
                            <DropdownMenuItem
                              onClick={() => handleMoveToFolder(pdf, null)}
                              disabled={pdf.folder_id === null}
                            >
                              <FolderIcon className="w-4 h-4 mr-2" />
                              No folder
                            </DropdownMenuItem>
                            {folders.map((f) => (
                              <DropdownMenuItem
                                key={f.id}
                                onClick={() => handleMoveToFolder(pdf, f.id)}
                                disabled={pdf.folder_id === f.id}
                              >
                                <FolderIcon className="w-4 h-4 mr-2" style={{ color: f.color }} />
                                {f.name}
                              </DropdownMenuItem>
                            ))}
                          </DropdownMenuSubContent>
                        </DropdownMenuSub>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => setPdfToDelete(pdf)}
                          className="text-destructive focus:text-destructive"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => handleView(pdf)}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      View
                    </Button>
                    <PdfSummary
                      pdf={pdf}
                      signedUrl={signedUrls[pdf.id] || null}
                      onSummaryGenerated={refetch}
                    />
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {selectedPdf && viewerUrl && (
        <PdfViewer
          url={viewerUrl}
          filename={selectedPdf.original_filename}
          onClose={() => {
            setSelectedPdf(null);
            setViewerUrl(null);
          }}
        />
      )}

      <AlertDialog open={!!pdfToDelete} onOpenChange={() => setPdfToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete PDF</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{pdfToDelete?.original_filename}"? This action cannot
              be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
