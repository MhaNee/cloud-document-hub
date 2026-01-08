import { useAuth } from '@/hooks/useAuth';
import { usePdfs } from '@/hooks/usePdfs';
import { Button } from '@/components/ui/button';
import { PdfUpload } from './PdfUpload';
import { PdfList } from './PdfList';
import { FileText, LogOut, Files, HardDrive } from 'lucide-react';

function formatTotalSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export function Dashboard() {
  const { user, signOut } = useAuth();
  const { pdfs } = usePdfs();

  const totalSize = pdfs.reduce((acc, pdf) => acc + pdf.file_size, 0);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 glass border-b">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
              <FileText className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold">PDF Manager</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground hidden sm:block">
              {user?.email}
            </span>
            <Button variant="outline" size="sm" onClick={signOut}>
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <div className="bg-card rounded-xl p-6 border shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Files className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{pdfs.length}</p>
                <p className="text-sm text-muted-foreground">Total PDFs</p>
              </div>
            </div>
          </div>
          <div className="bg-card rounded-xl p-6 border shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-secondary/50 flex items-center justify-center">
                <HardDrive className="w-6 h-6 text-secondary-foreground" />
              </div>
              <div>
                <p className="text-2xl font-bold">{formatTotalSize(totalSize)}</p>
                <p className="text-sm text-muted-foreground">Storage Used</p>
              </div>
            </div>
          </div>
        </div>

        {/* Upload Section */}
        <section className="mb-8">
          <h2 className="text-lg font-semibold mb-4">Upload PDF</h2>
          <PdfUpload />
        </section>

        {/* PDF List */}
        <section>
          <h2 className="text-lg font-semibold mb-4">Your PDFs</h2>
          <PdfList />
        </section>
      </main>
    </div>
  );
}
