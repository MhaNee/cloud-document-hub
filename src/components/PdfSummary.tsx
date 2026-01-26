import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Sparkles, Loader2 } from 'lucide-react';
import { PdfFile } from '@/hooks/usePdfs';

interface PdfSummaryProps {
  pdf: PdfFile;
  signedUrl: string | null;
  onSummaryGenerated: () => void;
}

export function PdfSummary({ pdf, signedUrl, onSummaryGenerated }: PdfSummaryProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState<string | null>(pdf.summary || null);
  const { toast } = useToast();

  const extractTextFromPdf = async (url: string): Promise<string> => {
    // Fetch PDF and extract text using basic method
    // Note: For better results, a proper PDF parsing library would be needed
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const text = await blob.text();
      
      // Basic text extraction - remove binary garbage
      const cleanText = text
        .replace(/[^\x20-\x7E\n\r\t]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
      
      return cleanText.length > 100 ? cleanText : 'PDF content could not be extracted. The document may be image-based or encrypted.';
    } catch (error) {
      console.error('Error extracting PDF text:', error);
      return 'Unable to extract PDF content for summarization.';
    }
  };

  const handleSummarize = async () => {
    if (!signedUrl) {
      toast({
        title: 'Error',
        description: 'Could not access PDF for summarization.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    setSummary(null);

    try {
      const pdfContent = await extractTextFromPdf(signedUrl);

      const { data, error } = await supabase.functions.invoke('summarize-pdf', {
        body: { pdfId: pdf.id, pdfContent },
      });

      if (error) {
        throw error;
      }

      if (data.error) {
        throw new Error(data.error);
      }

      setSummary(data.summary);
      onSummaryGenerated();
      toast({
        title: 'Summary Generated',
        description: 'Your PDF has been summarized successfully.',
      });
    } catch (error) {
      console.error('Summarization error:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to generate summary.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(true)}
        className="gap-2"
      >
        <Sparkles className="h-4 w-4" />
        {summary ? 'View Summary' : 'Summarize'}
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              AI Summary
            </DialogTitle>
            <DialogDescription>{pdf.original_filename}</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {summary ? (
              <div className="prose prose-sm max-w-none">
                <div className="bg-muted/50 rounded-lg p-4 whitespace-pre-wrap">{summary}</div>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">
                  Generate an AI-powered summary of this PDF document.
                </p>
              </div>
            )}

            <div className="flex justify-end gap-2">
              {summary && (
                <Button variant="outline" onClick={handleSummarize} disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Regenerating...
                    </>
                  ) : (
                    'Regenerate'
                  )}
                </Button>
              )}
              {!summary && (
                <Button onClick={handleSummarize} disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Generating Summary...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" />
                      Generate Summary
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
