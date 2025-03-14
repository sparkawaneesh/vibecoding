'use client';

import { useState } from 'react';
import { 
  FileText, 
  Image, 
  Table, 
  Presentation, 
  FileSpreadsheet, 
  FileCode, 
  FilePlus, 
  X 
} from 'lucide-react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export type FileType = 'slide' | 'doc' | 'spreadsheet' | 'csv' | 'tsv' | 'image' | 'custom';

interface FileOption {
  type: FileType;
  label: string;
  icon: React.ReactNode;
  description: string;
}

interface FileTypeSelectorProps {
  onFileTypeSelect: (type: FileType, name: string) => void;
}

export function FileTypeSelector({ onFileTypeSelect }: FileTypeSelectorProps) {
  const [open, setOpen] = useState(false);
  const [fileName, setFileName] = useState('');
  const [selectedType, setSelectedType] = useState<FileType | null>(null);

  const fileOptions: FileOption[] = [
    {
      type: 'slide',
      label: 'Presentation',
      icon: <Presentation className="h-8 w-8 text-blue-500" />,
      description: 'Create slides for presentations'
    },
    {
      type: 'doc',
      label: 'Document',
      icon: <FileText className="h-8 w-8 text-green-500" />,
      description: 'Write and format text documents'
    },
    {
      type: 'spreadsheet',
      label: 'Spreadsheet',
      icon: <FileSpreadsheet className="h-8 w-8 text-purple-500" />,
      description: 'Work with data in rows and columns'
    },
    {
      type: 'csv',
      label: 'CSV File',
      icon: <Table className="h-8 w-8 text-amber-500" />,
      description: 'Comma-separated values data file'
    },
    {
      type: 'tsv',
      label: 'TSV File',
      icon: <Table className="h-8 w-8 text-orange-500" />,
      description: 'Tab-separated values data file'
    },
    {
      type: 'image',
      label: 'Image Editor',
      icon: <Image className="h-8 w-8 text-pink-500" />,
      description: 'Edit and enhance images'
    },
    {
      type: 'custom',
      label: 'Custom Design',
      icon: <FilePlus className="h-8 w-8 text-cyan-500" />,
      description: 'Start with a blank canvas'
    }
  ];

  const handleSelect = (type: FileType) => {
    setSelectedType(type);
  };

  const handleCreate = () => {
    if (selectedType && fileName.trim()) {
      onFileTypeSelect(selectedType, fileName.trim());
      setOpen(false);
      setFileName('');
      setSelectedType(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <FilePlus className="h-4 w-4" />
          New File
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Create New File</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 py-4">
          {fileOptions.map((option) => (
            <div
              key={option.type}
              className={`p-4 rounded-lg border cursor-pointer transition-all hover:border-blue-500 hover:shadow-md ${
                selectedType === option.type ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-200 dark:border-gray-700'
              }`}
              onClick={() => handleSelect(option.type)}
            >
              <div className="flex flex-col items-center text-center gap-2">
                {option.icon}
                <h3 className="font-medium">{option.label}</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">{option.description}</p>
              </div>
            </div>
          ))}
        </div>
        {selectedType && (
          <div className="space-y-4 pt-4 border-t">
            <div className="space-y-2">
              <Label htmlFor="fileName">File Name</Label>
              <Input
                id="fileName"
                value={fileName}
                onChange={(e) => setFileName(e.target.value)}
                placeholder="Enter file name"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setSelectedType(null);
                  setFileName('');
                }}
              >
                Cancel
              </Button>
              <Button onClick={handleCreate} disabled={!fileName.trim()}>
                Create
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
} 