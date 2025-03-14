'use client';

import { useState, useEffect } from 'react';
import { 
  PlusCircle, 
  Trash2, 
  Edit, 
  Save, 
  X, 
  Search,
  StickyNote,
  Pin,
  Download,
  Clock,
  MoreVertical,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  isPinned: boolean;
  tags: string[];
}

export function NotesPanel() {
  const [notes, setNotes] = useState<Note[]>(() => {
    if (typeof window !== 'undefined') {
      const savedNotes = localStorage.getItem('notes');
      if (savedNotes) {
        try {
          const parsedNotes = JSON.parse(savedNotes);
          return parsedNotes.map((note: any) => ({
            ...note,
            createdAt: new Date(note.createdAt),
            updatedAt: new Date(note.updatedAt)
          }));
        } catch (error) {
          console.error('Failed to parse notes from localStorage', error);
        }
      }
    }
    return [];
  });
  
  const [searchQuery, setSearchQuery] = useState('');
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newNoteTitle, setNewNoteTitle] = useState('');
  const [newNoteContent, setNewNoteContent] = useState('');
  const [newNoteTags, setNewNoteTags] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  useEffect(() => {
    localStorage.setItem('notes', JSON.stringify(notes));
  }, [notes]);
  
  const handleCreateNote = () => {
    if (!newNoteTitle.trim()) return;
    
    setIsLoading(true);
    
    setTimeout(() => {
      const newNote: Note = {
        id: Date.now().toString(),
        title: newNoteTitle,
        content: newNoteContent,
        createdAt: new Date(),
        updatedAt: new Date(),
        isPinned: false,
        tags: newNoteTags.split(',').map(tag => tag.trim()).filter(Boolean)
      };
      
      setNotes(prev => [newNote, ...prev]);
      setNewNoteTitle('');
      setNewNoteContent('');
      setNewNoteTags('');
      setIsCreateDialogOpen(false);
      setIsLoading(false);
    }, 500);
  };
  
  const handleUpdateNote = () => {
    if (!editingNote || !editingNote.title.trim()) return;
    
    setIsLoading(true);
    
    setTimeout(() => {
      setNotes(prev => 
        prev.map(note => 
          note.id === editingNote.id 
            ? { ...editingNote, updatedAt: new Date() } 
            : note
        )
      );
      setEditingNote(null);
      setIsLoading(false);
    }, 500);
  };
  
  const handleDeleteNote = (id: string) => {
    setNotes(prev => prev.filter(note => note.id !== id));
  };
  
  const handlePinNote = (id: string) => {
    setNotes(prev => 
      prev.map(note => 
        note.id === id 
          ? { ...note, isPinned: !note.isPinned } 
          : note
      )
    );
  };
  
  const handleExportNote = (note: Note) => {
    const noteText = `# ${note.title}\n\n${note.content}\n\nTags: ${note.tags.join(', ')}\nCreated: ${note.createdAt.toLocaleString()}\nUpdated: ${note.updatedAt.toLocaleString()}`;
    
    const blob = new Blob([noteText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${note.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  
  const filteredNotes = notes.filter(note => {
    const matchesSearch = 
      note.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      note.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    return matchesSearch;
  });
  
  const sortedNotes = [...filteredNotes].sort((a, b) => {
    // First sort by pinned status
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    
    // Then sort by updated date
    return b.updatedAt.getTime() - a.updatedAt.getTime();
  });
  
  const formatDate = (date: Date) => {
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) {
      return `Today at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else if (diffInDays === 1) {
      return `Yesterday at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else if (diffInDays < 7) {
      return `${diffInDays} days ago`;
    } else {
      return date.toLocaleDateString();
    }
  };
  
  return (
    <TooltipProvider>
      <div className="flex flex-col h-full border rounded-lg overflow-hidden bg-white dark:bg-gray-950">
        <div className="p-4 border-b flex items-center justify-between">
          <h2 className="text-lg font-semibold flex items-center">
            <StickyNote className="h-5 w-5 mr-2" />
            Notes
          </h2>
          <Button 
            onClick={() => setIsCreateDialogOpen(true)}
            className="transition-all hover:scale-105"
          >
            <PlusCircle className="h-4 w-4 mr-2" />
            New Note
          </Button>
        </div>
        
        <div className="p-4 border-b">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Search notes..."
              className="pl-9 transition-all focus:ring-2 focus:ring-primary/20"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        
        <ScrollArea className="flex-1">
          <div className="p-4 space-y-4">
            {sortedNotes.length === 0 ? (
              <div className="text-center py-8 text-gray-500 animate-in fade-in zoom-in-50 duration-300">
                <StickyNote className="h-12 w-12 mx-auto mb-2 opacity-20" />
                <p>No notes found</p>
                <Button 
                  variant="link" 
                  onClick={() => setIsCreateDialogOpen(true)}
                  className="mt-2"
                >
                  Create your first note
                </Button>
              </div>
            ) : (
              sortedNotes.map((note, index) => (
                <div 
                  key={note.id}
                  className={`p-4 rounded-lg border ${note.isPinned ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800' : 'bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800'} transition-all hover:shadow-md animate-in fade-in slide-in-from-bottom-3 duration-300`}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-medium text-lg">{note.title}</h3>
                    <div className="flex items-center gap-1">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handlePinNote(note.id)}
                            className="transition-transform hover:scale-110"
                          >
                            <Pin className={`h-4 w-4 ${note.isPinned ? 'fill-yellow-500 text-yellow-500' : 'text-gray-400'} transition-colors`} />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          {note.isPinned ? 'Unpin note' : 'Pin note'}
                        </TooltipContent>
                      </Tooltip>
                      
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="transition-transform hover:scale-110"
                          >
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="animate-in zoom-in-90 duration-200">
                          <DropdownMenuItem onClick={() => setEditingNote(note)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleExportNote(note)}>
                            <Download className="h-4 w-4 mr-2" />
                            Export
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            className="text-red-600"
                            onClick={() => handleDeleteNote(note.id)}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                  
                  <div className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap mb-3">
                    {note.content.length > 200 
                      ? `${note.content.substring(0, 200)}...` 
                      : note.content}
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex flex-wrap gap-1">
                      {note.tags.map(tag => (
                        <Badge key={tag} variant="secondary" className="text-xs transition-all hover:bg-primary/20">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    <div className="text-xs text-gray-500 flex items-center">
                      <Clock className="h-3 w-3 mr-1" />
                      {formatDate(note.updatedAt)}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
        
        {/* Create Note Dialog */}
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogContent className="animate-in fade-in-50 zoom-in-90 slide-in-from-bottom-10 duration-300">
            <DialogHeader>
              <DialogTitle>Create New Note</DialogTitle>
              <DialogDescription>
                Add a new note to your collection.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <label htmlFor="title" className="text-sm font-medium">
                  Title
                </label>
                <Input
                  id="title"
                  placeholder="Note title"
                  value={newNoteTitle}
                  onChange={(e) => setNewNoteTitle(e.target.value)}
                  className="transition-all focus:ring-2 focus:ring-primary/20"
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="content" className="text-sm font-medium">
                  Content
                </label>
                <Textarea
                  id="content"
                  placeholder="Write your note here..."
                  rows={8}
                  value={newNoteContent}
                  onChange={(e) => setNewNoteContent(e.target.value)}
                  className="transition-all focus:ring-2 focus:ring-primary/20"
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="tags" className="text-sm font-medium">
                  Tags (comma separated)
                </label>
                <Input
                  id="tags"
                  placeholder="work, ideas, todo"
                  value={newNoteTags}
                  onChange={(e) => setNewNoteTags(e.target.value)}
                  className="transition-all focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleCreateNote} 
                disabled={!newNoteTitle.trim() || isLoading}
                className="transition-all hover:scale-105"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Note
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
        {/* Edit Note Dialog */}
        <Dialog open={!!editingNote} onOpenChange={(open) => !open && setEditingNote(null)}>
          <DialogContent className="animate-in fade-in-50 zoom-in-90 slide-in-from-bottom-10 duration-300">
            <DialogHeader>
              <DialogTitle>Edit Note</DialogTitle>
              <DialogDescription>
                Make changes to your note.
              </DialogDescription>
            </DialogHeader>
            
            {editingNote && (
              <div className="space-y-4 py-2">
                <div className="space-y-2">
                  <label htmlFor="edit-title" className="text-sm font-medium">
                    Title
                  </label>
                  <Input
                    id="edit-title"
                    placeholder="Note title"
                    value={editingNote.title}
                    onChange={(e) => setEditingNote({...editingNote, title: e.target.value})}
                    className="transition-all focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="edit-content" className="text-sm font-medium">
                    Content
                  </label>
                  <Textarea
                    id="edit-content"
                    placeholder="Write your note here..."
                    rows={8}
                    value={editingNote.content}
                    onChange={(e) => setEditingNote({...editingNote, content: e.target.value})}
                    className="transition-all focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="edit-tags" className="text-sm font-medium">
                    Tags (comma separated)
                  </label>
                  <Input
                    id="edit-tags"
                    placeholder="work, ideas, todo"
                    value={editingNote.tags.join(', ')}
                    onChange={(e) => setEditingNote({
                      ...editingNote, 
                      tags: e.target.value.split(',').map(tag => tag.trim()).filter(Boolean)
                    })}
                    className="transition-all focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>
            )}
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditingNote(null)}>
                Cancel
              </Button>
              <Button 
                onClick={handleUpdateNote} 
                disabled={!editingNote?.title.trim() || isLoading}
                className="transition-all hover:scale-105"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Update Note
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  );
} 