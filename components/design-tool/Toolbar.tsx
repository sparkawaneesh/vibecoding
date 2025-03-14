'use client';

import React from 'react';
import { useDesignToolStore } from '@/store/useDesignToolStore';
import { Button } from '@/components/ui/button';
import { ExportDialog } from './ExportDialog';
import {
  Square,
  Circle,
  Type,
  Image as ImageIcon,
  Pencil,
  Eraser,
  Undo,
  Redo,
  Save,
  MousePointer,
} from 'lucide-react';
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from '@/components/ui/tooltip';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';

const tools = [
  { id: 'select', icon: MousePointer, label: 'Select' },
  { id: 'rect', icon: Square, label: 'Rectangle' },
  { id: 'circle', icon: Circle, label: 'Circle' },
  { id: 'text', icon: Type, label: 'Text' },
  { id: 'image', icon: ImageIcon, label: 'Image' },
  { id: 'pencil', icon: Pencil, label: 'Pencil' },
  { id: 'eraser', icon: Eraser, label: 'Eraser' },
] as const;

export const Toolbar: React.FC = () => {
  const {
    selectedTool,
    setSelectedTool,
    fabricCanvas,
    undo,
    redo,
    history,
    saveDesign
  } = useDesignToolStore();

  return (
    <div className="flex items-center gap-2 p-2 bg-background border rounded-lg">
      {tools.map((tool) => (
        <Button
          key={tool.id}
          variant={selectedTool === tool.id ? 'default' : 'outline'}
          size="icon"
          onClick={() => setSelectedTool(tool.id)}
          title={tool.label}
        >
          <tool.icon className="h-4 w-4" />
        </Button>
      ))}

      <div className="border-l mx-2" />

      <Button
        variant="outline"
        size="icon"
        onClick={() => fabricCanvas && undo(fabricCanvas)}
        disabled={!history.past.length}
        title="Undo"
      >
        <Undo className="h-4 w-4" />
      </Button>

      <Button
        variant="outline"
        size="icon"
        onClick={() => fabricCanvas && redo(fabricCanvas)}
        disabled={!history.future.length}
        title="Redo"
      >
        <Redo className="h-4 w-4" />
      </Button>

      <div className="border-l mx-2" />

      <Button
        variant="outline"
        size="icon"
        onClick={saveDesign}
        title="Save"
      >
        <Save className="h-4 w-4" />
      </Button>

      <ExportDialog />
    </div>
  );
}; 