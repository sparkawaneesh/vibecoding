'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { 
  PlusCircle, 
  Trash2, 
  Edit, 
  Save, 
  X, 
  Search,
  Lightbulb,
  Move,
  MoreVertical,
  Download,
  Copy
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";

interface Idea {
  id: string;
  title: string;
  content: string;
  color: string;
  createdAt: string;
  category: string;
}

const COLORS = [
  "bg-blue-100 border-blue-300 hover:bg-blue-200",
  "bg-green-100 border-green-300 hover:bg-green-200",
  "bg-yellow-100 border-yellow-300 hover:bg-yellow-200",
  "bg-red-100 border-red-300 hover:bg-red-200",
  "bg-purple-100 border-purple-300 hover:bg-purple-200",
  "bg-pink-100 border-pink-300 hover:bg-pink-200",
  "bg-indigo-100 border-indigo-300 hover:bg-indigo-200",
  "bg-gray-100 border-gray-300 hover:bg-gray-200",
];

const CATEGORIES = [
  "Product",
  "Feature",
  "Design",
  "Marketing",
  "Content",
  "Process",
  "Other",
];

export function IdeaBoard() {
  const { toast } = useToast();
  const [ideas, setIdeas] = useState<Idea[]>(() => {
    if (typeof window !== "undefined") {
      const savedIdeas = localStorage.getItem("ideas");
      return savedIdeas ? JSON.parse(savedIdeas) : [];
    }
    return [];
  });
  
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingIdea, setEditingIdea] = useState<Idea | null>(null);
  const [newIdea, setNewIdea] = useState<Omit<Idea, "id" | "createdAt">>({
    title: "",
    content: "",
    color: COLORS[0],
    category: CATEGORIES[0],
  });
  
  const dragItem = useRef<number | null>(null);
  const dragOverItem = useRef<number | null>(null);

  // Save ideas to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("ideas", JSON.stringify(ideas));
  }, [ideas]);

  // Filter ideas based on search query and selected category
  const filteredIdeas = useMemo(() => {
    return ideas.filter((idea) => {
      const matchesSearch = searchQuery
        ? idea.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          idea.content.toLowerCase().includes(searchQuery.toLowerCase())
        : true;
      
      const matchesCategory = selectedCategory
        ? idea.category === selectedCategory
        : true;
      
      return matchesSearch && matchesCategory;
    });
  }, [ideas, searchQuery, selectedCategory]);

  // Create a new idea
  const handleCreateIdea = useCallback(() => {
    if (!newIdea.title.trim()) {
      toast({
        title: "Title is required",
        description: "Please enter a title for your idea.",
        variant: "destructive",
      });
      return;
    }

    const idea: Idea = {
      id: `idea-${Date.now()}`,
      title: newIdea.title,
      content: newIdea.content,
      color: newIdea.color,
      category: newIdea.category,
      createdAt: new Date().toISOString(),
    };

    setIdeas((prev) => [idea, ...prev]);
    setNewIdea({
      title: "",
      content: "",
      color: COLORS[0],
      category: CATEGORIES[0],
    });
    setIsCreateDialogOpen(false);

    toast({
      title: "Idea created",
      description: "Your idea has been added to the board.",
    });
  }, [newIdea, toast]);

  // Update an existing idea
  const handleUpdateIdea = useCallback(() => {
    if (!editingIdea) return;

    if (!editingIdea.title.trim()) {
      toast({
        title: "Title is required",
        description: "Please enter a title for your idea.",
        variant: "destructive",
      });
      return;
    }

    setIdeas((prev) =>
      prev.map((idea) => (idea.id === editingIdea.id ? editingIdea : idea))
    );
    setEditingIdea(null);
    setIsEditDialogOpen(false);

    toast({
      title: "Idea updated",
      description: "Your idea has been updated.",
    });
  }, [editingIdea, toast]);

  // Delete an idea
  const handleDeleteIdea = useCallback((id: string) => {
    setIdeas((prev) => prev.filter((idea) => idea.id !== id));
    
    toast({
      title: "Idea deleted",
      description: "Your idea has been removed from the board.",
    });
  }, [toast]);

  // Duplicate an idea
  const handleDuplicateIdea = useCallback((idea: Idea) => {
    const duplicatedIdea: Idea = {
      ...idea,
      id: `idea-${Date.now()}`,
      title: `${idea.title} (Copy)`,
      createdAt: new Date().toISOString(),
    };

    setIdeas((prev) => [duplicatedIdea, ...prev]);
    
    toast({
      title: "Idea duplicated",
      description: "A copy of your idea has been created.",
    });
  }, [toast]);

  // Export ideas as JSON
  const handleExportIdeas = useCallback(() => {
    const dataStr = JSON.stringify(ideas, null, 2);
    const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`;
    
    const exportFileDefaultName = `ideas-${new Date().toISOString().slice(0, 10)}.json`;
    
    const linkElement = document.createElement("a");
    linkElement.setAttribute("href", dataUri);
    linkElement.setAttribute("download", exportFileDefaultName);
    linkElement.click();
    
    toast({
      title: "Ideas exported",
      description: "Your ideas have been exported as a JSON file.",
    });
  }, [ideas, toast]);

  // Handle drag and drop to reorder ideas
  const handleDragStart = useCallback((index: number) => {
    dragItem.current = index;
  }, []);

  const handleDragEnter = useCallback((index: number) => {
    dragOverItem.current = index;
  }, []);

  const handleDragEnd = useCallback(() => {
    if (dragItem.current === null || dragOverItem.current === null) return;
    
    const newItems = [...ideas];
    const draggedItem = newItems[dragItem.current];
    newItems.splice(dragItem.current, 1);
    newItems.splice(dragOverItem.current, 0, draggedItem);
    
    setIdeas(newItems);
    dragItem.current = null;
    dragOverItem.current = null;
    
    toast({
      title: "Ideas reordered",
      description: "The order of your ideas has been updated.",
    });
  }, [ideas, toast]);

  // Reset search and filters
  const handleClearFilters = useCallback(() => {
    setSearchQuery("");
    setSelectedCategory(null);
  }, []);

  return (
    <TooltipProvider>
      <div className="flex flex-col h-full border rounded-lg overflow-hidden bg-white dark:bg-gray-950">
        <div className="p-4 border-b flex items-center justify-between">
          <h2 className="text-lg font-semibold flex items-center">
            <Lightbulb className="h-5 w-5 mr-2" />
            Idea Board
          </h2>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleExportIdeas}
              className="transition-all hover:scale-105"
            >
              <Download className="h-3.5 w-3.5 mr-1" />
              Export
            </Button>
            <Button 
              onClick={() => setIsCreateDialogOpen(true)}
              size="sm"
              className="transition-all hover:scale-105 animate-in fade-in duration-200"
            >
              <PlusCircle className="h-3.5 w-3.5 mr-1" />
              New Idea
            </Button>
          </div>
        </div>
        
        <div className="p-4 border-b">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search ideas..."
                className="pl-9 transition-all focus:ring-2 focus:ring-primary/20"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <ScrollArea className="whitespace-nowrap" orientation="horizontal">
              <div className="flex gap-2 pb-1">
                {CATEGORIES.map(category => (
                  <Badge 
                    key={category}
                    variant={selectedCategory === category ? "default" : "outline"}
                    className={cn(
                      "cursor-pointer transition-all hover:scale-105 hover:shadow-sm",
                      selectedCategory === category ? "bg-primary" : "hover:bg-primary/10"
                    )}
                    onClick={() => setSelectedCategory(selectedCategory === category ? null : category)}
                  >
                    {category}
                  </Badge>
                ))}
              </div>
            </ScrollArea>
          </div>
        </div>
        
        <ScrollArea className="flex-1">
          <div className="p-4">
            {filteredIdeas.length === 0 ? (
              <div className="flex flex-col items-center justify-center flex-1 text-center text-muted-foreground animate-in fade-in zoom-in-50 duration-300">
                <Lightbulb className="h-12 w-12 mb-2 opacity-20" />
                <p>No ideas found. Create your first idea!</p>
              </div>
            ) : (
              <div 
                className="grid grid-cols-1 sm:grid-cols-2 gap-4 overflow-y-auto flex-1 pr-1"
              >
                {filteredIdeas.map((idea, index) => (
                  <div
                    key={idea.id}
                    draggable
                    onDragStart={(e) => handleDragStart(index)}
                    onDragEnter={(e) => handleDragEnter(index)}
                    onDragEnd={handleDragEnd}
                    onDragOver={(e) => e.preventDefault()}
                    className={`
                      p-4 rounded-lg shadow-sm border border-border
                      transition-all hover:shadow-md
                      animate-in fade-in slide-in-from-bottom-3 duration-300
                      cursor-grab active:cursor-grabbing
                    `}
                    style={{
                      backgroundColor: idea.color,
                      animationDelay: `${index * 50}ms`
                    }}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-medium text-sm">{idea.title}</h3>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 transition-all hover:scale-110">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="animate-in fade-in-50 zoom-in-95 duration-100">
                          <DropdownMenuItem onClick={() => setEditingIdea(idea)} className="transition-colors hover:bg-primary/10 cursor-pointer">
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDuplicateIdea(idea)} className="transition-colors hover:bg-primary/10 cursor-pointer">
                            <Copy className="h-4 w-4 mr-2" />
                            Duplicate
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            onClick={() => handleDeleteIdea(idea.id)} 
                            className="text-destructive transition-colors hover:bg-destructive/10 cursor-pointer"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <div className="text-sm whitespace-pre-wrap break-words">{idea.content}</div>
                    <div className="flex justify-between items-center mt-3 text-xs text-muted-foreground">
                      <Badge variant="secondary" className="text-xs transition-all hover:bg-secondary/80">
                        {idea.category}
                      </Badge>
                      <span>{new Date(idea.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </ScrollArea>
        
        {/* Create Idea Dialog */}
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogContent className="animate-in fade-in-50 zoom-in-90 slide-in-from-bottom-10 duration-300">
            <DialogHeader>
              <DialogTitle>Create New Idea</DialogTitle>
              <DialogDescription>
                Capture your brilliant idea before it fades away.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <label htmlFor="title" className="text-sm font-medium">
                  Title
                </label>
                <Input
                  id="title"
                  placeholder="Idea title"
                  value={newIdeaTitle}
                  onChange={(e) => setNewIdeaTitle(e.target.value)}
                  className="transition-all focus:ring-2 focus:ring-primary/20"
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="content" className="text-sm font-medium">
                  Description
                </label>
                <Textarea
                  id="content"
                  placeholder="Describe your idea..."
                  rows={5}
                  value={newIdeaContent}
                  onChange={(e) => setNewIdeaContent(e.target.value)}
                  className="min-h-[100px] transition-all focus:ring-2 focus:ring-primary/20"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Category
                </label>
                <Select 
                  value={newIdeaCategory} 
                  onValueChange={setNewIdeaCategory}
                >
                  <SelectTrigger className="transition-all focus:ring-2 focus:ring-primary/20">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent className="animate-in fade-in-50 zoom-in-95 duration-100">
                    {CATEGORIES.filter(cat => cat !== 'All').map(category => (
                      <SelectItem 
                        key={category} 
                        value={category}
                        className="transition-colors hover:bg-primary/10"
                      >
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Color
                </label>
                <div className="flex flex-wrap gap-2">
                  {COLORS.map((color, index) => (
                    <div
                      key={index}
                      className={`
                        w-8 h-8 rounded-full cursor-pointer
                        transition-all hover:scale-110 hover:shadow-md
                        ${newIdeaColor === color ? 'ring-2 ring-primary ring-offset-2' : ''}
                      `}
                      style={{ backgroundColor: color }}
                      onClick={() => setNewIdeaColor(color)}
                    />
                  ))}
                </div>
              </div>
            </div>
            
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => setIsCreateDialogOpen(false)}
                className="transition-all hover:bg-secondary/80"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleCreateIdea}
                className="transition-all hover:scale-105"
                disabled={!newIdeaTitle.trim()}
              >
                Create Idea
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
        {/* Edit Idea Dialog */}
        <Dialog open={!!editingIdea} onOpenChange={(open) => !open && setEditingIdea(null)}>
          <DialogContent className="animate-in fade-in-50 zoom-in-90 slide-in-from-bottom-10 duration-300">
            <DialogHeader>
              <DialogTitle>Edit Idea</DialogTitle>
              <DialogDescription>
                Refine your brilliant idea.
              </DialogDescription>
            </DialogHeader>
            
            {editingIdea && (
              <div className="space-y-4 py-2">
                <div className="space-y-2">
                  <label htmlFor="edit-title" className="text-sm font-medium">
                    Title
                  </label>
                  <Input
                    id="edit-title"
                    placeholder="Idea title"
                    value={editingIdea.title}
                    onChange={(e) => setEditingIdea({...editingIdea, title: e.target.value})}
                    className="transition-all focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="edit-content" className="text-sm font-medium">
                    Description
                  </label>
                  <Textarea
                    id="edit-content"
                    placeholder="Describe your idea..."
                    rows={5}
                    value={editingIdea.content}
                    onChange={(e) => setEditingIdea({...editingIdea, content: e.target.value})}
                    className="min-h-[100px] transition-all focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Category
                  </label>
                  <Select 
                    value={editingIdea.category} 
                    onValueChange={(value) => setEditingIdea({...editingIdea, category: value})}
                  >
                    <SelectTrigger className="transition-all focus:ring-2 focus:ring-primary/20">
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent className="animate-in fade-in-50 zoom-in-95 duration-100">
                      {CATEGORIES.filter(cat => cat !== 'All').map(category => (
                        <SelectItem 
                          key={category} 
                          value={category}
                          className="transition-colors hover:bg-primary/10"
                        >
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Color
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {COLORS.map((color, index) => (
                      <div
                        key={index}
                        className={`
                          w-8 h-8 rounded-full cursor-pointer
                          transition-all hover:scale-110 hover:shadow-md
                          ${editingIdea.color === color ? 'ring-2 ring-primary ring-offset-2' : ''}
                        `}
                        style={{ backgroundColor: color }}
                        onClick={() => setEditingIdea({...editingIdea, color})}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}
            
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => setEditingIdea(null)}
                className="transition-all hover:bg-secondary/80"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleUpdateIdea}
                className="transition-all hover:scale-105"
                disabled={!editingIdea?.title.trim()}
              >
                Update Idea
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  );
} 