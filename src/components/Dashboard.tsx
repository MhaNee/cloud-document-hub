import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { usePdfs } from '@/hooks/usePdfs';
import { useUserRole } from '@/hooks/useUserRole';
import { Button } from '@/components/ui/button';
import { PdfUpload } from './PdfUpload';
import { PdfList } from './PdfList';
import { FolderManager } from './FolderManager';
import { AdminPanel } from './AdminPanel';
import { FileText, LogOut, Files, HardDrive, Shield } from 'lucide-react';

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
  const { isAdmin } = useUserRole();
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [showAdmin, setShowAdmin] = useState(false);

  const totalSize = pdfs.reduce((acc, pdf) => acc + pdf.file_size, 0);

  if (showAdmin && isAdmin) {
    return (
      <div className="min-h-screen bg-background">
        <header className="sticky top-0 z-50 glass border-b">
          <div className="container mx-auto px-4 h-16 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
                <FileText className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold">PDF Manager</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground hidden sm:block">{user?.email}</span>
              <Button variant="outline" size="sm" onClick={signOut}>
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </header>
        <main className="container mx-auto px-4 py-8">
          <AdminPanel onBack={() => setShowAdmin(false)} />
        </main>
      </div>
    );
  }

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
            <span className="text-sm text-muted-foreground hidden sm:block">{user?.email}</span>
            {isAdmin && (
              <Button variant="outline" size="sm" onClick={() => setShowAdmin(true)}>
                <Shield className="w-4 h-4 mr-2" />
                Admin
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={signOut}>
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="flex gap-8">
          {/* Sidebar */}
          <aside className="w-64 flex-shrink-0 hidden lg:block">
            <div className="sticky top-24 space-y-6">
              {/* Stats */}
              <div className="space-y-3">
                <div className="bg-card rounded-xl p-4 border shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Files className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-xl font-bold">{pdfs.length}</p>
                      <p className="text-xs text-muted-foreground">Total PDFs</p>
                    </div>
                  </div>
                </div>
                <div className="bg-card rounded-xl p-4 border shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-secondary/50 flex items-center justify-center">
                      <HardDrive className="w-5 h-5 text-secondary-foreground" />
                    </div>
                    <div>
                      <p className="text-xl font-bold">{formatTotalSize(totalSize)}</p>
                      <p className="text-xs text-muted-foreground">Storage Used</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Folders */}
              <FolderManager
                selectedFolderId={selectedFolderId}
                onSelectFolder={setSelectedFolderId}
              />
            </div>
          </aside>

          {/* Main Area */}
          <div className="flex-1 min-w-0 space-y-8">
            {/* Mobile Stats */}
            <div className="grid gap-4 grid-cols-2 lg:hidden">
              <div className="bg-card rounded-xl p-4 border shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Files className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xl font-bold">{pdfs.length}</p>
                    <p className="text-xs text-muted-foreground">Total PDFs</p>
                  </div>
                </div>
              </div>
              <div className="bg-card rounded-xl p-4 border shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-secondary/50 flex items-center justify-center">
                    <HardDrive className="w-5 h-5 text-secondary-foreground" />
                  </div>
                  <div>
                    <p className="text-xl font-bold">{formatTotalSize(totalSize)}</p>
                    <p className="text-xs text-muted-foreground">Storage</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Upload Section */}
            <section>
              <h2 className="text-lg font-semibold mb-4">Upload PDF</h2>
              <PdfUpload selectedFolderId={selectedFolderId} />
            </section>

            {/* PDF List */}
            <section>
              <h2 className="text-lg font-semibold mb-4">Your PDFs</h2>
              <PdfList selectedFolderId={selectedFolderId} />
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
