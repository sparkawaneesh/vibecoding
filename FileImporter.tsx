'use client';

import { useState, useRef } from 'react';
import { Upload, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { importFile } from '@/lib/services/importService';

interface FileImporterProps {
  onFileImported?: (fileId: string) => void;
}

export function FileImporter({ onFileImported }: FileImporterProps) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [importing, setImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setImporting(true);

    try {
      await importFile(
        file,
        (fileId) => {
          setImporting(false);
          if (onFileImported) {
            onFileImported(fileId);
          }
          setOpen(false);
          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }
        },
        (errorMessage) => {
          setImporting(false);
          setError(errorMessage);
        }
      );
    } catch (err) {
      setImporting(false);
      setError('An error occurred while importing the file. Please try again.');
      console.error('Import error:', err);
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon">
          <Upload className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Import File</DialogTitle>
          <DialogDescription>
            Choose a file from your computer. Supported formats: PPTX, DOCX, XLSX, CSV, TSV, JSON, PNG, JPG, SVG
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            accept=".pptx,.docx,.xlsx,.csv,.tsv,.json,.png,.jpg,.jpeg,.svg"
          />
          
          <Button 
            onClick={handleButtonClick}
            className="w-full h-32 border-dashed border-2 flex flex-col items-center justify-center gap-2"
            variant="outline"
            disabled={importing}
          >
            <Upload className="h-8 w-8 text-gray-400" />
            <span>Select a file or drag it here</span>
          </Button>
          
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </div>
        
        <DialogFooter>
          <Button 
            onClick={() => setOpen(false)} 
            variant="outline"
            disabled={importing}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleButtonClick}
            disabled={importing}
          >
            {importing ? (
              <>
                <span className="animate-spin mr-2">⏳</span>
                Importing...
              </>
            ) : (
              'Import'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 