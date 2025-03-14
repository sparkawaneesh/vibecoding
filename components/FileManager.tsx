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
  Loader2,
  Upload,
  SortAsc,
  SortDesc,
  CheckSquare,
  Square,
  Filter,
  Grid,
  List,
  Settings,
  Info,
  HelpCircle,
  ArrowUpDown,
  Plus
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuLabel,
  DropdownMenuCheckboxItem
} from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileTypeSelector, FileType } from '@/components/FileTypeSelector';
import { useFiles, File } from '@/lib/hooks/useFiles';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { FileImporter } from '@/components/FileImporter';
import { exportFile } from '@/lib/services/exportService';
import { getFileById } from '@/lib/services/fileStorage';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface FileManagerProps {
  onFileOpen: (file: File) => void;
  onFileCreate: (file: File) => void;
}

type SortOption = 'name-asc' | 'name-desc' | 'date-asc' | 'date-desc';
type ViewMode = 'list' | 'grid';

interface File {
  id: string;
  name: string;
  type: FileType;
  content: unknown;
  starred: boolean;
  updatedAt: Date;
  isDeleted?: boolean;
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
    refreshFiles,
    getFile
  } = useFiles();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('recent');
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [sortOption, setSortOption] = useState<SortOption>('date-desc');
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [showQuickActions, setShowQuickActions] = useState(false);
  const [showHelpDialog, setShowHelpDialog] = useState(false);
  const [showInfoDialog, setShowInfoDialog] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);

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

  const handleExportFile = async (id: string) => {
    const storedFile = getFileById(id);
    if (storedFile) {
      exportFile(storedFile);
    }
  };

  const handleFileImported = (fileId: string) => {
    const file = getFile(fileId);
    if (file) {
      onFileOpen(file);
    }
  };

  const handleSelectFile = (id: string, isSelected: boolean) => {
    if (isSelected) {
      setSelectedFiles(prev => [...prev, id]);
    } else {
      setSelectedFiles(prev => prev.filter(fileId => fileId !== id));
    }
  };

  const handleSelectAll = (isSelected: boolean) => {
    if (isSelected) {
      setSelectedFiles(filteredFiles.map(file => file.id));
    } else {
      setSelectedFiles([]);
    }
  };

  const handleBatchDelete = async () => {
    for (const id of selectedFiles) {
      await deleteFile(id);
    }
    setSelectedFiles([]);
  };

  const handleBatchExport = async () => {
    for (const id of selectedFiles) {
      const storedFile = getFileById(id);
      if (storedFile) {
        exportFile(storedFile);
      }
    }
  };

  const handleBatchStar = async () => {
    for (const id of selectedFiles) {
      await toggleStarFile(id);
    }
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

  const sortedFiles = [...filteredFiles].sort((a, b) => {
    switch (sortOption) {
      case 'name-asc':
        return a.name.localeCompare(b.name);
      case 'name-desc':
        return b.name.localeCompare(a.name);
      case 'date-asc':
        return a.updatedAt.getTime() - b.updatedAt.getTime();
      case 'date-desc':
        return b.updatedAt.getTime() - a.updatedAt.getTime();
      default:
        return 0;
    }
  });

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const isAllSelected = filteredFiles.length > 0 && selectedFiles.length === filteredFiles.length;
  const isSomeSelected = selectedFiles.length > 0 && !isAllSelected;

  const handleFilterChange = (value: string) => {
    setActiveTab(value);
  };

  const renderFileList = () => {
    return sortedFiles
      .filter(file => !file.isDeleted)
      .map(file => (
        <div
          key={file.id}
          className={`flex items-center p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg cursor-pointer ${
            selectedFiles.includes(file.id) ? 'bg-gray-100 dark:bg-gray-800' : ''
          }`}
          onClick={() => onFileOpen(file)}
        >
          <Checkbox
            checked={selectedFiles.includes(file.id)}
            onCheckedChange={(checked) => handleSelectFile(file.id, checked as boolean)}
            onClick={(e) => e.stopPropagation()}
            className="mr-2"
          />
          {getFileIcon(file.type)}
          <div className="flex-1 ml-3">
            <div className="flex items-center">
              <span className="font-medium">{file.name}</span>
              {file.starred && (
                <Star className="h-4 w-4 text-yellow-400 ml-2 fill-current" />
              )}
            </div>
            <div className="text-sm text-gray-500">
              {formatDate(file.updatedAt)}
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleStarFile(file.id)}>
                <Star className="h-4 w-4 mr-2" />
                {file.starred ? 'Unstar' : 'Star'}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleDuplicateFile(file.id)}>
                <Copy className="h-4 w-4 mr-2" />
                Duplicate
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExportFile(file.id)}>
                <Download className="h-4 w-4 mr-2" />
                Export
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => handleDeleteFile(file.id)}
                className="text-red-500 focus:text-red-500"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ));
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
    <div className="h-full flex flex-col border-r animate-in slide-in-from-left duration-300">
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Files</h2>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="icon" 
              onClick={() => setIsCreateDialogOpen(true)}
              className="transition-all hover:scale-110"
            >
              <FileText className="h-4 w-4" />
            </Button>
            <FileImporter onFileImported={handleFileImported} />
          </div>
        </div>
        
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search files..." 
            className="pl-9 transition-all focus:ring-2 focus:ring-primary/20" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>
      
      <Tabs defaultValue="all" className="flex-1 flex flex-col">
        <div className="border-b px-4">
          <TabsList className="grid grid-cols-4">
            <TabsTrigger value="all" className="transition-all data-[state=active]:scale-105 data-[state=active]:font-medium">All</TabsTrigger>
            <TabsTrigger value="recent" className="transition-all data-[state=active]:scale-105 data-[state=active]:font-medium">Recent</TabsTrigger>
            <TabsTrigger value="starred" className="transition-all data-[state=active]:scale-105 data-[state=active]:font-medium">Starred</TabsTrigger>
            <TabsTrigger value="trash" className="transition-all data-[state=active]:scale-105 data-[state=active]:font-medium">Trash</TabsTrigger>
          </TabsList>
        </div>
        
        <div className="p-4 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {selectedFiles.length > 0 ? (
                <>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => handleBatchDelete()}
                    className="transition-all hover:bg-destructive/10 hover:text-destructive"
                  >
                    <Trash2 className="h-3.5 w-3.5 mr-1" />
                    Delete
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => handleBatchExport()}
                    className="transition-all hover:bg-primary/10"
                  >
                    <Download className="h-3.5 w-3.5 mr-1" />
                    Export
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => handleBatchStar()}
                    className="transition-all hover:bg-primary/10"
                  >
                    <Star className="h-3.5 w-3.5 mr-1" />
                    Star
                  </Button>
                </>
              ) : (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="transition-all hover:bg-secondary/80"
                    >
                      <SortAsc className="h-3.5 w-3.5 mr-1" />
                      Sort
                      <ArrowUpDown className="h-3.5 w-3.5 ml-1" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="animate-in fade-in-50 zoom-in-95 duration-100">
                    <DropdownMenuRadioGroup value={sortOption} onValueChange={(value) => setSortOption(value as SortOption)}>
                      <DropdownMenuRadioItem value="name-asc" className="transition-colors hover:bg-primary/10 cursor-pointer">Name (A-Z)</DropdownMenuRadioItem>
                      <DropdownMenuRadioItem value="name-desc" className="transition-colors hover:bg-primary/10 cursor-pointer">Name (Z-A)</DropdownMenuRadioItem>
                      <DropdownMenuRadioItem value="date-asc" className="transition-colors hover:bg-primary/10 cursor-pointer">Date (Oldest)</DropdownMenuRadioItem>
                      <DropdownMenuRadioItem value="date-desc" className="transition-colors hover:bg-primary/10 cursor-pointer">Date (Newest)</DropdownMenuRadioItem>
                    </DropdownMenuRadioGroup>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              <Button 
                variant={viewMode === 'list' ? 'secondary' : 'ghost'} 
                size="icon" 
                className="h-8 w-8 transition-all hover:scale-110"
                onClick={() => setViewMode('list')}
              >
                <List className="h-4 w-4" />
              </Button>
              <Button 
                variant={viewMode === 'grid' ? 'secondary' : 'ghost'} 
                size="icon" 
                className="h-8 w-8 transition-all hover:scale-110"
                onClick={() => setViewMode('grid')}
              >
                <Grid className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
        
        <ScrollArea className="flex-1">
          <TabsContent value="all" className="p-0 m-0 h-full">
            {loading ? (
              <div className="flex items-center justify-center h-40">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : filteredFiles.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-40 text-center text-muted-foreground animate-in fade-in zoom-in-50 duration-300">
                <FileText className="h-12 w-12 mb-2 opacity-20" />
                <p>No files found</p>
                <Button 
                  variant="link" 
                  onClick={() => setIsCreateDialogOpen(true)}
                  className="mt-2 transition-all hover:scale-105"
                >
                  Create your first file
                </Button>
              </div>
            ) : (
              <div className={viewMode === 'grid' ? 'grid grid-cols-2 gap-4 p-4' : 'flex flex-col'}>
                {viewMode === 'list' && (
                  <div className="flex items-center px-4 py-2 border-b text-sm text-muted-foreground">
                    <div className="w-8 flex-shrink-0">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-6 w-6 transition-all hover:scale-110"
                        onClick={() => handleSelectAll(selectedFiles.length !== filteredFiles.length)}
                      >
                        {selectedFiles.length === filteredFiles.length ? (
                          <CheckSquare className="h-4 w-4" />
                        ) : (
                          <Square className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    <div className="flex-1 font-medium">Name</div>
                    <div className="w-32 text-right">Modified</div>
                    <div className="w-8"></div>
                  </div>
                )}
                
                {renderFileList()}
              </div>
            )}
          </TabsContent>
          
          {/* Similar animations for other tabs */}
          {/* ... existing code ... */}
        </ScrollArea>
      </Tabs>
      
      {/* Create File Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="animate-in fade-in-50 zoom-in-90 slide-in-from-bottom-10 duration-300">
          {/* ... existing code ... */}
        </DialogContent>
      </Dialog>
      
      {/* Floating Action Buttons */}
      <div className="fixed bottom-6 right-6 flex flex-col gap-2">
        <Button 
          size="icon" 
          onClick={() => setIsCreateDialogOpen(true)}
          className="rounded-full h-12 w-12 shadow-lg transition-all hover:scale-110 animate-in fade-in slide-in-from-bottom-5 duration-300"
        >
          <Plus className="h-5 w-5" />
        </Button>
        <Button 
          variant="outline" 
          size="icon" 
          onClick={() => setIsImportDialogOpen(true)}
          className="rounded-full h-12 w-12 shadow-lg transition-all hover:scale-110 animate-in fade-in slide-in-from-bottom-5 duration-300"
          style={{ animationDelay: '100ms' }}
        >
          <Upload className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
} 