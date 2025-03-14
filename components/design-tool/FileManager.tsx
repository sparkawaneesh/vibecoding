'use client';

import { useState, useEffect } from 'react';
import { 
  FileText, 
  Image, 
  Table, 
  Presentation, 
  FileSpreadsheet, 
  Folder, 
  FolderOpen, 
  Star, 
  Clock, 
  Trash2, 
  MoreVertical,
  Download,
  Share2,
  Copy,
  Edit,
  Search,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileTypeSelector, FileType } from './FileTypeSelector';
import { useFiles, File } from '@/lib/hooks/useFiles';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface FileManagerProps {
  onFileOpen: (file: File) => void;
  onFileCreate: (file: File) => void;
}

export function FileManager({ onFileOpen, onFileCreate }: FileManagerProps) {
  const { 
    files, 
    loading, 
    error, 
    createFile, 
    deleteFile, 
    toggleStarFile, 
    duplicateFile,
    refreshFiles
  } = useFiles();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('recent');

  useEffect(() => {
    refreshFiles();
  }, [refreshFiles]);

  const handleFileTypeSelect = async (type: FileType, name: string) => {
    const newFile = await createFile(name, type);
    if (newFile) {
      onFileCreate(newFile);
    }
  };

  const handleStarFile = async (id: string) => {
    await toggleStarFile(id);
  };

  const handleDeleteFile = async (id: string) => {
    await deleteFile(id);
  };

  const handleDuplicateFile = async (id: string) => {
    await duplicateFile(id);
  };

  const getFileIcon = (type: FileType) => {
    switch (type) {
      case 'slide':
        return <Presentation className="h-5 w-5 text-blue-500" />;
      case 'doc':
        return <FileText className="h-5 w-5 text-green-500" />;
      case 'spreadsheet':
        return <FileSpreadsheet className="h-5 w-5 text-purple-500" />;
      case 'csv':
      case 'tsv':
        return <Table className="h-5 w-5 text-amber-500" />;
      case 'image':
        return <Image className="h-5 w-5 text-pink-500" />;
      default:
        return <FileText className="h-5 w-5 text-gray-500" />;
    }
  };

  const filteredFiles = files.filter(file => {
    const matchesSearch = file.name.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (activeTab === 'recent') {
      return matchesSearch;
    } else if (activeTab === 'starred') {
      return matchesSearch && file.starred;
    } else if (activeTab === 'slides') {
      return matchesSearch && file.type === 'slide';
    } else if (activeTab === 'docs') {
      return matchesSearch && file.type === 'doc';
    } else if (activeTab === 'sheets') {
      return matchesSearch && (file.type === 'spreadsheet' || file.type === 'csv' || file.type === 'tsv');
    } else if (activeTab === 'images') {
      return matchesSearch && file.type === 'image';
    }
    
    return matchesSearch;
  });

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  if (loading) {
    return (
      <div className="flex flex-col h-full border rounded-lg overflow-hidden bg-white dark:bg-gray-950 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="mt-2 text-sm text-gray-500">Loading files...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col h-full border rounded-lg overflow-hidden bg-white dark:bg-gray-950 p-4">
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <Button onClick={refreshFiles} className="mt-4">
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full border rounded-lg overflow-hidden bg-white dark:bg-gray-950">
      <div className="p-4 border-b flex items-center justify-between">
        <h2 className="text-lg font-semibold">Files</h2>
        <FileTypeSelector onFileTypeSelect={handleFileTypeSelect} />
      </div>
      
      <div className="p-4 border-b">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Search files..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>
      
      <Tabs defaultValue="recent" className="flex-1 flex flex-col" onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-6 px-4 py-2">
          <TabsTrigger value="recent">Recent</TabsTrigger>
          <TabsTrigger value="starred">Starred</TabsTrigger>
          <TabsTrigger value="slides">Slides</TabsTrigger>
          <TabsTrigger value="docs">Docs</TabsTrigger>
          <TabsTrigger value="sheets">Sheets</TabsTrigger>
          <TabsTrigger value="images">Images</TabsTrigger>
        </TabsList>
        
        <TabsContent value={activeTab} className="flex-1 p-0">
          <ScrollArea className="h-[calc(100vh-250px)]">
            <div className="p-4 space-y-2">
              {filteredFiles.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>No files found</p>
                </div>
              ) : (
                filteredFiles.map(file => (
                  <div 
                    key={file.id}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
                    onClick={() => onFileOpen(file)}
                  >
                    <div className="flex items-center gap-3">
                      {getFileIcon(file.type)}
                      <div>
                        <h3 className="font-medium">{file.name}</h3>
                        <p className="text-xs text-gray-500">
                          {formatDate(file.updatedAt)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStarFile(file.id);
                        }}
                      >
                        <Star 
                          className={`h-4 w-4 ${file.starred ? 'fill-yellow-400 text-yellow-400' : 'text-gray-400'}`} 
                        />
                      </Button>
                      
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={(e) => {
                            e.stopPropagation();
                            onFileOpen(file);
                          }}>
                            <Edit className="h-4 w-4 mr-2" />
                            Open
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={(e) => {
                            e.stopPropagation();
                            handleDuplicateFile(file.id);
                          }}>
                            <Copy className="h-4 w-4 mr-2" />
                            Duplicate
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Download className="h-4 w-4 mr-2" />
                            Download
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Share2 className="h-4 w-4 mr-2" />
                            Share
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            className="text-red-600"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteFile(file.id);
                            }}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
} 