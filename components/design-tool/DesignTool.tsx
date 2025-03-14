'use client';

import { useEffect, useState, useCallback, useRef, lazy, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { RoomProvider } from '@/lib/liveblocks';
import { ClientSideSuspense } from '@liveblocks/react';
import { Canvas } from './Canvas';
import { Toolbar } from './Toolbar';
import { LayerPanel } from './LayerPanel';
import { FileManager } from './FileManager';
import { useDesignToolStore } from '@/store/useDesignToolStore';
import { FileType } from './FileTypeSelector';
import { File, useFiles } from '@/lib/hooks/useFiles';
import { Loader2, Download, Upload, Layers, FolderOpen, Save, Moon, Sun, Maximize, Minimize, Clock, BellRing, BellOff, Keyboard, Zap, StickyNote, PanelRight, PanelRightClose, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { exportFile } from '@/lib/services/exportService';
import { getFileById } from '@/lib/services/fileStorage';
import { FileImporter } from './FileImporter';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useToast } from '@/components/ui/use-toast';
import { ProductivityPanel } from './ProductivityPanel';
import { CollaborationPanel } from './CollaborationPanel';

// Lazy load editors to improve initial load time
const SlideEditor = lazy(() => import('./editors/SlideEditor').then(mod => ({ default: mod.SlideEditor })));
const DocumentEditor = lazy(() => import('./editors/DocumentEditor').then(mod => ({ default: mod.DocumentEditor })));
const SpreadsheetEditor = lazy(() => import('./editors/SpreadsheetEditor').then(mod => ({ default: mod.SpreadsheetEditor })));

export const DesignTool = () => {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const { toast } = useToast();
  const [isMounted, setIsMounted] = useState(false);
  const [isLayerPanelOpen, setIsLayerPanelOpen] = useState(true);
  const [isFileManagerOpen, setIsFileManagerOpen] = useState(false);
  const [activeFile, setActiveFile] = useState<File | null>(null);
  const [isImporterOpen, setIsImporterOpen] = useState(false);
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [isAutoSaveEnabled, setIsAutoSaveEnabled] = useState(true);
  const [isKeyboardShortcutsDialogOpen, setIsKeyboardShortcutsDialogOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isProductivityPanelOpen, setIsProductivityPanelOpen] = useState(false);
  const [isCollaborationPanelOpen, setIsCollaborationPanelOpen] = useState(false);
  
  const { updateFile, getFile } = useFiles();
  
  const { 
    selectedTool,
    selectedColor,
    selectedSize,
    isPrototypingMode,
    setSelectedTool,
    setSelectedColor,
    setSelectedSize,
    clearCanvas,
    undo,
    redo,
    togglePrototypingMode
  } = useDesignToolStore();

  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const contentRef = useRef<any>(null);
  
  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in input fields
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }
      
      // Ctrl/Cmd + S: Save
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        if (activeFile && contentRef.current) {
          handleFileSave(contentRef.current);
        }
      }
      
      // Ctrl/Cmd + O: Open file manager
      if ((e.ctrlKey || e.metaKey) && e.key === 'o') {
        e.preventDefault();
        setIsFileManagerOpen(true);
      }
      
      // Ctrl/Cmd + I: Import file
      if ((e.ctrlKey || e.metaKey) && e.key === 'i') {
        e.preventDefault();
        setIsImporterOpen(true);
      }
      
      // Ctrl/Cmd + E: Export file
      if ((e.ctrlKey || e.metaKey) && e.key === 'e') {
        e.preventDefault();
        handleExportFile();
      }
      
      // F11: Toggle fullscreen
      if (e.key === 'F11') {
        e.preventDefault();
        toggleFullscreen();
      }
      
      // Escape: Exit focus mode or fullscreen
      if (e.key === 'Escape') {
        if (isFocusMode) {
          setIsFocusMode(false);
        }
        if (isFullscreen) {
          setIsFullscreen(false);
        }
      }
      
      // F: Toggle focus mode
      if (e.key === 'f' && !e.ctrlKey && !e.metaKey) {
        setIsFocusMode(!isFocusMode);
      }
      
      // L: Toggle layer panel
      if (e.key === 'l' && !e.ctrlKey && !e.metaKey) {
        setIsLayerPanelOpen(!isLayerPanelOpen);
      }
      
      // P: Toggle productivity panel
      if (e.key === 'p' && !e.ctrlKey && !e.metaKey) {
        setIsProductivityPanelOpen(!isProductivityPanelOpen);
      }
      
      // C: Toggle collaboration panel
      if (e.key === 'c' && !e.ctrlKey && !e.metaKey) {
        setIsCollaborationPanelOpen(!isCollaborationPanelOpen);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [activeFile, isFocusMode, isFullscreen, isLayerPanelOpen, isProductivityPanelOpen, isCollaborationPanelOpen]);
  
  // Set up auto-save
  useEffect(() => {
    if (isAutoSaveEnabled && activeFile && contentRef.current) {
      if (autoSaveTimerRef.current) {
        clearInterval(autoSaveTimerRef.current);
      }
      
      autoSaveTimerRef.current = setInterval(() => {
        handleFileSave(contentRef.current);
      }, 30000); // Auto-save every 30 seconds
    }
    
    return () => {
      if (autoSaveTimerRef.current) {
        clearInterval(autoSaveTimerRef.current);
      }
    };
  }, [isAutoSaveEnabled, activeFile]);
  
  // Set dark mode based on system preference
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Check for saved preference
      const savedDarkMode = localStorage.getItem('darkMode');
      if (savedDarkMode !== null) {
        setIsDarkMode(savedDarkMode === 'true');
      } else {
        // Use system preference
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        setIsDarkMode(prefersDark);
      }
      
      setIsMounted(true);
    }
  }, []);
  
  // Apply dark mode class to document
  useEffect(() => {
    if (isMounted) {
      if (isDarkMode) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      
      // Save preference
      localStorage.setItem('darkMode', isDarkMode.toString());
    }
  }, [isDarkMode, isMounted]);
  
  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  }, []);
  
  const handleFileOpen = useCallback((file: File) => {
    setActiveFile(file);
    setIsFileManagerOpen(false);
  }, []);
  
  const handleFileCreate = useCallback((file: File) => {
    setActiveFile(file);
    setIsFileManagerOpen(false);
  }, []);
  
  const handleFileSave = useCallback(async (content: any) => {
    if (!activeFile) return;
    
    try {
      await updateFile(activeFile.id, { content });
      setLastSaved(new Date());
      
      toast({
        title: "File saved",
        description: `${activeFile.name} has been saved.`,
        duration: 2000,
      });
    } catch (error) {
      console.error('Error saving file:', error);
      toast({
        title: "Error saving file",
        description: "There was an error saving your file. Please try again.",
        variant: "destructive",
      });
    }
  }, [activeFile, updateFile, toast]);
  
  const handleExportFile = useCallback(() => {
    if (!activeFile) return;
    
    const file = getFileById(activeFile.id);
    if (file) {
      exportFile(file);
    }
  }, [activeFile]);
  
  const handleFileImported = useCallback((fileId: string) => {
    const file = getFile(fileId);
    if (file) {
      setActiveFile(file);
    }
  }, [getFile]);
  
  const renderEditor = useCallback(() => {
    if (!activeFile) {
      return (
        <div className="flex flex-col items-center justify-center h-full animate-in fade-in duration-300">
          <div className="text-center max-w-md p-6">
            <h2 className="text-2xl font-bold mb-4">Welcome to Vibe Studio</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Create or open a file to get started. You can design presentations, 
              write documents, analyze data, and more.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                onClick={() => setIsFileManagerOpen(true)}
                className="flex items-center gap-2 transition-all hover:scale-105"
              >
                <FolderOpen className="h-4 w-4" />
                Open File
              </Button>
              <Button 
                onClick={() => setIsImporterOpen(true)}
                variant="outline"
                className="flex items-center gap-2 transition-all hover:scale-105"
              >
                <Upload className="h-4 w-4" />
                Import File
              </Button>
            </div>
          </div>
        </div>
      );
    }
    
    // Set content reference for auto-save
    const setContentRef = (content: any) => {
      contentRef.current = content;
    };
    
    // Create a room ID based on the file ID
    const roomId = `file-${activeFile.id}`;
    
    switch (activeFile.type) {
      case 'slide':
        return (
          <Suspense fallback={<div className="flex items-center justify-center h-full"><Loader2 className="h-8 w-8 animate-spin" /></div>}>
            <RoomProvider id={roomId} initialPresence={{ cursor: null, selection: [], isTyping: false }}>
              <ClientSideSuspense fallback={<div className="flex items-center justify-center h-full"><Loader2 className="h-8 w-8 animate-spin" /></div>}>
                {() => <SlideEditor file={activeFile} onSave={handleFileSave} setContentRef={setContentRef} />}
              </ClientSideSuspense>
            </RoomProvider>
          </Suspense>
        );
      case 'doc':
        return (
          <Suspense fallback={<div className="flex items-center justify-center h-full"><Loader2 className="h-8 w-8 animate-spin" /></div>}>
            <RoomProvider id={roomId} initialPresence={{ cursor: null, selection: [], isTyping: false }}>
              <ClientSideSuspense fallback={<div className="flex items-center justify-center h-full"><Loader2 className="h-8 w-8 animate-spin" /></div>}>
                {() => <DocumentEditor file={activeFile} onSave={handleFileSave} setContentRef={setContentRef} />}
              </ClientSideSuspense>
            </RoomProvider>
          </Suspense>
        );
      case 'spreadsheet':
      case 'csv':
      case 'tsv':
        return (
          <Suspense fallback={<div className="flex items-center justify-center h-full"><Loader2 className="h-8 w-8 animate-spin" /></div>}>
            <RoomProvider id={roomId} initialPresence={{ cursor: null, selection: [], isTyping: false }}>
              <ClientSideSuspense fallback={<div className="flex items-center justify-center h-full"><Loader2 className="h-8 w-8 animate-spin" /></div>}>
                {() => <SpreadsheetEditor file={activeFile} onSave={handleFileSave} setContentRef={setContentRef} />}
              </ClientSideSuspense>
            </RoomProvider>
          </Suspense>
        );
      default:
        return (
          <RoomProvider id={roomId} initialPresence={{ cursor: null, selection: [], isTyping: false }}>
            <ClientSideSuspense fallback={<div className="flex items-center justify-center h-full"><Loader2 className="h-8 w-8 animate-spin" /></div>}>
              {() => (
                <Canvas onSave={(content) => {
                  setContentRef(content);
                  if (!isAutoSaveEnabled) {
                    handleFileSave(content);
                  }
                }} />
              )}
            </ClientSideSuspense>
          </RoomProvider>
        );
    }
  }, [activeFile, handleFileSave, isAutoSaveEnabled]);
  
  if (!isMounted) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }
  
  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }
  
  if (!user) {
    router.push('/auth/sign-in');
    return null;
  }
  
  return (
    <div className={`flex flex-col h-screen ${isDarkMode ? 'dark' : ''}`}>
      <div className="flex items-center justify-between p-2 border-b bg-white dark:bg-gray-950 dark:border-gray-800 animate-in fade-in duration-200">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsFileManagerOpen(!isFileManagerOpen)}
            className="transition-all hover:scale-105"
          >
            <FolderOpen className="h-5 w-5" />
          </Button>
          
          <div className="text-sm font-medium">
            {activeFile ? activeFile.name : 'Vibe Studio'}
          </div>
          
          {lastSaved && (
            <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center ml-2">
              <Clock className="h-3 w-3 mr-1" />
              Last saved: {lastSaved.toLocaleTimeString()}
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsCollaborationPanelOpen(!isCollaborationPanelOpen)}
                  className="transition-all hover:scale-105"
                >
                  <Users className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                Toggle collaboration panel
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsAutoSaveEnabled(!isAutoSaveEnabled)}
                  className="transition-all hover:scale-105"
                >
                  {isAutoSaveEnabled ? <BellRing className="h-4 w-4" /> : <BellOff className="h-4 w-4" />}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {isAutoSaveEnabled ? 'Auto-save enabled' : 'Auto-save disabled'}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsDarkMode(!isDarkMode)}
                  className="transition-all hover:scale-105"
                >
                  {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {isDarkMode ? 'Light mode' : 'Dark mode'}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleFullscreen}
                  className="transition-all hover:scale-105"
                >
                  {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsKeyboardShortcutsDialogOpen(true)}
                  className="transition-all hover:scale-105"
                >
                  <Keyboard className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                Keyboard shortcuts
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          {activeFile && (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleFileSave(contentRef.current)}
                className="transition-all hover:scale-105"
              >
                <Save className="h-4 w-4 mr-1" />
                Save
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={handleExportFile}
                className="transition-all hover:scale-105"
              >
                <Download className="h-4 w-4 mr-1" />
                Export
              </Button>
            </>
          )}
        </div>
      </div>
      
      <div className="flex flex-1 overflow-hidden">
        {isFileManagerOpen && (
          <div className="animate-in slide-in-from-left duration-300">
            <FileManager onFileOpen={handleFileOpen} onFileCreate={handleFileCreate} />
          </div>
        )}
        
        <div className="flex flex-col flex-1 overflow-hidden">
          {activeFile && activeFile.type !== 'doc' && activeFile.type !== 'spreadsheet' && activeFile.type !== 'csv' && activeFile.type !== 'tsv' && (
            <Toolbar />
          )}
          
          <div className="flex flex-1 overflow-hidden">
            <div className={`flex-1 transition-all duration-300 ${isFocusMode ? 'bg-gray-100 dark:bg-gray-900' : 'bg-white dark:bg-gray-950'}`}>
              {renderEditor()}
            </div>
            
            {isLayerPanelOpen && activeFile && activeFile.type !== 'doc' && activeFile.type !== 'spreadsheet' && activeFile.type !== 'csv' && activeFile.type !== 'tsv' && !isFocusMode && (
              <div className="animate-in slide-in-from-right duration-300">
                <LayerPanel />
              </div>
            )}
            
            {isProductivityPanelOpen && !isFocusMode && (
              <div className="animate-in slide-in-from-right duration-300">
                <ProductivityPanel />
              </div>
            )}
            
            {isCollaborationPanelOpen && !isFocusMode && (
              <div className="animate-in slide-in-from-right duration-300">
                <CollaborationPanel />
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Floating action buttons */}
      <div className="fixed bottom-4 right-4 flex flex-col gap-2">
        {!isFocusMode && (
          <>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setIsCollaborationPanelOpen(!isCollaborationPanelOpen)}
              className="rounded-full h-10 w-10 shadow-md transition-all hover:scale-110"
            >
              <Users className="h-5 w-5" />
            </Button>
            
            <Button
              variant="outline"
              size="icon"
              onClick={() => setIsProductivityPanelOpen(!isProductivityPanelOpen)}
              className="rounded-full h-10 w-10 shadow-md transition-all hover:scale-110"
            >
              {isProductivityPanelOpen ? <PanelRightClose className="h-5 w-5" /> : <PanelRight className="h-5 w-5" />}
            </Button>
          </>
        )}
        
        <Button
          variant="outline"
          size="icon"
          onClick={() => setIsFocusMode(!isFocusMode)}
          className="rounded-full h-10 w-10 shadow-md transition-all hover:scale-110"
        >
          <Zap className="h-5 w-5" />
        </Button>
      </div>
      
      {/* File importer dialog */}
      <Dialog open={isImporterOpen} onOpenChange={setIsImporterOpen}>
        <DialogContent className="animate-in fade-in-50 zoom-in-90 slide-in-from-bottom-10 duration-300">
          <DialogHeader>
            <DialogTitle>Import File</DialogTitle>
            <DialogDescription>
              Import a file from your computer to start working with it.
            </DialogDescription>
          </DialogHeader>
          <FileImporter onFileImported={(fileId) => {
            handleFileImported(fileId);
            setIsImporterOpen(false);
          }} />
        </DialogContent>
      </Dialog>
      
      {/* Keyboard shortcuts dialog */}
      <Dialog open={isKeyboardShortcutsDialogOpen} onOpenChange={setIsKeyboardShortcutsDialogOpen}>
        <DialogContent className="animate-in fade-in-50 zoom-in-90 slide-in-from-bottom-10 duration-300">
          <DialogHeader>
            <DialogTitle>Keyboard Shortcuts</DialogTitle>
            <DialogDescription>
              Use these keyboard shortcuts to work more efficiently.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="font-medium mb-2">File Operations</h3>
              <ul className="space-y-2">
                <li className="flex justify-between">
                  <span>Save</span>
                  <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded">Ctrl+S</kbd>
                </li>
                <li className="flex justify-between">
                  <span>Open file manager</span>
                  <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded">Ctrl+O</kbd>
                </li>
                <li className="flex justify-between">
                  <span>Import file</span>
                  <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded">Ctrl+I</kbd>
                </li>
                <li className="flex justify-between">
                  <span>Export file</span>
                  <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded">Ctrl+E</kbd>
                </li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-medium mb-2">View Controls</h3>
              <ul className="space-y-2">
                <li className="flex justify-between">
                  <span>Toggle focus mode</span>
                  <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded">F</kbd>
                </li>
                <li className="flex justify-between">
                  <span>Toggle layer panel</span>
                  <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded">L</kbd>
                </li>
                <li className="flex justify-between">
                  <span>Toggle productivity panel</span>
                  <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded">P</kbd>
                </li>
                <li className="flex justify-between">
                  <span>Toggle collaboration panel</span>
                  <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded">C</kbd>
                </li>
                <li className="flex justify-between">
                  <span>Toggle fullscreen</span>
                  <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded">F11</kbd>
                </li>
              </ul>
            </div>
          </div>
          
          <DialogFooter>
            <Button onClick={() => setIsKeyboardShortcutsDialogOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}; 