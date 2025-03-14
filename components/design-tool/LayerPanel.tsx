'use client';

import React from 'react';
import { useDesignToolStore } from '@/store/useDesignToolStore';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Eye, EyeOff, Lock, Unlock, Trash2, ChevronUp, ChevronDown } from 'lucide-react';

export const LayerPanel: React.FC = () => {
  const {
    elements,
    selectedElement,
    setSelectedElement,
    deleteElement,
    updateElement,
    hiddenLayers,
    lockedLayers,
    toggleLayerVisibility,
    toggleLayerLock,
    moveLayerUp,
    moveLayerDown
  } = useDesignToolStore();

  return (
    <div className="w-64 bg-background border-l">
      <div className="p-4 border-b">
        <h2 className="font-semibold">Layers</h2>
      </div>
      <ScrollArea className="h-[calc(100vh-10rem)]">
        <div className="p-4 space-y-2">
          {elements.map((element, index) => (
            <div
              key={element.id}
              className={`
                flex items-center justify-between p-2 rounded-md
                ${selectedElement === element.id ? 'bg-accent' : 'hover:bg-accent/50'}
                ${hiddenLayers[element.id] ? 'opacity-50' : ''}
              `}
              onClick={() => setSelectedElement(element.id)}
            >
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleLayerVisibility(element.id);
                  }}
                >
                  {hiddenLayers[element.id] ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleLayerLock(element.id);
                  }}
                >
                  {lockedLayers[element.id] ? (
                    <Lock className="h-4 w-4" />
                  ) : (
                    <Unlock className="h-4 w-4" />
                  )}
                </Button>
                <span className="text-sm truncate">
                  {element.name || `${element.type} ${index + 1}`}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={(e) => {
                    e.stopPropagation();
                    moveLayerUp(element.id);
                  }}
                  disabled={index === 0}
                >
                  <ChevronUp className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={(e) => {
                    e.stopPropagation();
                    moveLayerDown(element.id);
                  }}
                  disabled={index === elements.length - 1}
                >
                  <ChevronDown className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 text-destructive"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteElement(element.id);
                  }}
                  disabled={lockedLayers[element.id]}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}; 