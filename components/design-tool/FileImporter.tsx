'use client';

import { useState, useRef } from 'react';
import { Upload, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter,
  DialogClose
} from '@/components/ui/dialog';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { importFile } from '@/lib/services/importService';
import { useFiles } from '@/lib/hooks/useFiles';

interface FileImporterProps {
  onFileImported: (fileId: string) => void;
  onClose?: () => void;
}

export const FileImporter: React.FC<FileImporterProps> = ({ onFileImported, onClose }) => {
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setError(null);
      const fileId = await importFile(file);
      onFileImported(fileId);
      if (onClose) onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to import file');
    }
  };

  return (
    <div className="space-y-4">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept=".pptx,.docx,.xlsx,.csv,.tsv,.json,.png,.jpg,.jpeg,.svg"
      />
      
      <div 
        className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
        onClick={() => fileInputRef.current?.click()}
      >
        <Upload className="h-8 w-8 mx-auto mb-4 text-muted-foreground" />
        <p className="text-sm text-muted-foreground mb-2">
          Click to upload or drag and drop
        </p>
        <p className="text-xs text-muted-foreground">
          Supported formats: PPTX, DOCX, XLSX, CSV, TSV, JSON, PNG, JPG, JPEG, SVG
        </p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  );
}; 