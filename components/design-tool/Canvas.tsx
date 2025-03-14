'use client';

import React, { useRef, useEffect, useState, MouseEvent, ChangeEvent, useCallback, useMemo } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useDesignToolStore, Element, Tool, Connection, Frame } from '@/lib/store/useDesignToolStore';
import { useStorage, useMutation } from '@liveblocks/react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Lock, Loader2 } from 'lucide-react';
import { cn } from "@/lib/utils";
import { renderElement } from "@/lib/utils/renderElement";
import { findElementAtPosition } from "@/lib/utils/findElementAtPosition";
import { calculateConnectionPath } from "@/lib/utils/calculateConnectionPath";
import { fabric } from 'fabric';
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
  Download
} from 'lucide-react';
import { LiveObject, LiveMap } from '@liveblocks/client';

interface CanvasStorage {
  canvas: {
    elements: Element[];
    selectedElement: string | null;
  };
}

interface CanvasProps {
  width?: number;
  height?: number;
  onSave?: (elements: Element[]) => void;
}

export const Canvas: React.FC<CanvasProps> = ({ 
  width = 800, 
  height = 600,
  onSave
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPoint, setStartPoint] = useState<{ x: number; y: number } | null>(null);
  const [currentElement, setCurrentElement] = useState<Element | null>(null);
  const [isCreatingConnection, setIsCreatingConnection] = useState(false);
  const [connectionSource, setConnectionSource] = useState<string | null>(null);
  const [connectionType, setConnectionType] = useState<'click' | 'hover'>('click');
  const [selectedFilter, setSelectedFilter] = useState<string>('none');
  const [isCropping, setIsCropping] = useState(false);
  const [cropStart, setCropStart] = useState<{ x: number; y: number } | null>(null);
  const [showFrameDialog, setShowFrameDialog] = useState(false);
  const [frameName, setFrameName] = useState('');
  const [hiddenLayers, setHiddenLayers] = useState<Record<string, boolean>>({});
  const [lockedLayers, setLockedLayers] = useState<Record<string, boolean>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [fabricCanvas, setFabricCanvas] = useState<fabric.Canvas | null>(null);
  
  const {
    elements,
    selectedElement,
    selectedTool,
    selectedColor,
    selectedSize,
    frames,
    activeFrame,
    connections,
    isPrototypingMode,
    addElement,
    updateElement,
    setSelectedElement,
    addConnection,
    removeConnection,
    addFrame,
    setActiveFrame,
    togglePrototypingMode,
    applyFilter,
    cropImage,
    undo,
    redo,
    setSelectedTool,
    history,
    addToHistory,
    currentColor,
    brushSize
  } = useDesignToolStore();

  // Liveblocks storage
  const canvasElements = useStorage((root: LiveObject<CanvasStorage>) => root.canvas.elements);
  const selectedElementId = useStorage((root: LiveObject<CanvasStorage>) => root.canvas.selectedElement);
  
  // Mutations for collaborative editing
  const updateCanvasElements = useMutation(({ storage }: { storage: LiveObject<CanvasStorage> }, newElements: Element[]) => {
    storage.set('canvas.elements', newElements);
  }, []);
  
  const updateSelectedElement = useMutation(({ storage }: { storage: LiveObject<CanvasStorage> }, elementId: string | null) => {
    storage.set('canvas.selectedElement', elementId);
  }, []);

  // Sync local state with Liveblocks storage
  useEffect(() => {
    if (canvasElements && JSON.stringify(elements) !== JSON.stringify(canvasElements)) {
      useDesignToolStore.getState().setElements(canvasElements as Element[]);
    }
  }, [canvasElements, elements]);

  useEffect(() => {
    if (selectedElementId !== selectedElement) {
      setSelectedElement(selectedElementId as string | null);
    }
  }, [selectedElementId, selectedElement, setSelectedElement]);

  // Handle tool changes
  useEffect(() => {
    if (selectedTool === 'image' && fileInputRef.current) {
      fileInputRef.current.click();
    }
    
    if (selectedTool === 'link') {
      setIsCreatingConnection(true);
    } else {
      setIsCreatingConnection(false);
      setConnectionSource(null);
    }
    
    if (selectedTool === 'frame') {
      setShowFrameDialog(true);
    }
    
    if (selectedTool === 'crop') {
      setIsCropping(true);
    } else {
      setIsCropping(false);
      setCropStart(null);
    }
  }, [selectedTool]);

  // Share layer visibility and locking state with LayerPanel
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'hiddenLayers') {
        try {
          const newHiddenLayers = JSON.parse(e.newValue || '{}');
          setHiddenLayers(newHiddenLayers);
        } catch (error) {
          console.error('Failed to parse hiddenLayers from storage', error);
        }
      } else if (e.key === 'lockedLayers') {
        try {
          const newLockedLayers = JSON.parse(e.newValue || '{}');
          setLockedLayers(newLockedLayers);
        } catch (error) {
          console.error('Failed to parse lockedLayers from storage', error);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    // Initialize from localStorage if available
    try {
      const storedHiddenLayers = localStorage.getItem('hiddenLayers');
      if (storedHiddenLayers) {
        setHiddenLayers(JSON.parse(storedHiddenLayers));
      }
      
      const storedLockedLayers = localStorage.getItem('lockedLayers');
      if (storedLockedLayers) {
        setLockedLayers(JSON.parse(storedLockedLayers));
      }
    } catch (error) {
      console.error('Failed to load layer states from localStorage', error);
    }
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // Update localStorage when hiddenLayers or lockedLayers change
  useEffect(() => {
    localStorage.setItem('hiddenLayers', JSON.stringify(hiddenLayers));
    // Dispatch storage event for other components to pick up
    window.dispatchEvent(new StorageEvent('storage', {
      key: 'hiddenLayers',
      newValue: JSON.stringify(hiddenLayers)
    }));
  }, [hiddenLayers]);

  useEffect(() => {
    localStorage.setItem('lockedLayers', JSON.stringify(lockedLayers));
    // Dispatch storage event for other components to pick up
    window.dispatchEvent(new StorageEvent('storage', {
      key: 'lockedLayers',
      newValue: JSON.stringify(lockedLayers)
    }));
  }, [lockedLayers]);

  // Add auto-save functionality
  useEffect(() => {
    if (onSave && elements.length > 0) {
      const saveTimeout = setTimeout(() => {
        onSave(elements);
      }, 2000); // Auto-save after 2 seconds of inactivity
      
      return () => clearTimeout(saveTimeout);
    }
  }, [elements, onSave]);

  useEffect(() => {
    // Simulate loading for better UX
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (canvasRef.current) {
      const canvas = new fabric.Canvas(canvasRef.current, {
        width,
        height,
        backgroundColor: '#ffffff'
      });

      setFabricCanvas(canvas);

      canvas.on('object:added', () => {
        addToHistory(canvas.toJSON());
      });

      canvas.on('object:modified', () => {
        addToHistory(canvas.toJSON());
      });

      return () => {
        canvas.dispose();
      };
    }
  }, [width, height]);

  useEffect(() => {
    if (!fabricCanvas) return;

    fabricCanvas.isDrawingMode = selectedTool === 'pencil';
    fabricCanvas.freeDrawingBrush.width = brushSize;
    fabricCanvas.freeDrawingBrush.color = currentColor;
  }, [selectedTool, fabricCanvas, brushSize, currentColor]);

  const getSizeValue = (size: string): number => {
    switch (size) {
      case 'small':
        return 2;
      case 'medium':
        return 4;
      case 'large':
        return 8;
      default:
        return 4;
    }
  };

  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0] && canvasRef.current) {
      const file = e.target.files[0];
      const reader = new FileReader();
      
      reader.onload = (event) => {
        if (event.target && event.target.result) {
          const img = new Image();
          img.src = event.target.result as string;
          
          img.onload = () => {
            const rect = canvasRef.current!.getBoundingClientRect();
            const x = rect.width / 2 - img.width / 4;
            const y = rect.height / 2 - img.height / 4;
            
            const newElement: Element = {
              id: uuidv4(),
              type: 'image',
              x,
              y,
              width: img.width / 2,
              height: img.height / 2,
              color: selectedColor,
              size: selectedSize,
              imageUrl: event.target!.result as string,
            };
            
            addElement(newElement);
            updateCanvasElements([...elements, newElement]);
          };
        }
      };
      
      reader.readAsDataURL(file);
      e.target.value = '';
    }
  };

  const handleCreateFrame = () => {
    if (frameName.trim() === '') return;
    
    const newFrame: Frame = {
      id: uuidv4(),
      name: frameName,
      elements: [],
    };
    
    addFrame(newFrame);
    setActiveFrame(newFrame.id);
    setFrameName('');
    setShowFrameDialog(false);
  };

  const handleMouseDown = (e: MouseEvent) => {
    if (!canvasRef.current) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setStartPoint({ x, y });
    
    // Handle prototyping mode clicks
    if (isPrototypingMode) {
      const clickedElement = findElementAtPosition(x, y, elements.filter(el => !hiddenLayers[el.id]));
      if (clickedElement) {
        const connection = connections.find(conn => 
          conn.sourceId === clickedElement.id && conn.type === 'click'
        );
        
        if (connection) {
          const targetElement = elements.find(el => el.id === connection.targetId);
          if (targetElement) {
            // In a real app, you would navigate to the target frame or show the target element
          }
        }
      }
      return;
    }
    
    // Handle connection creation
    if (isCreatingConnection) {
      const clickedElement = findElementAtPosition(x, y, elements.filter(el => !hiddenLayers[el.id]));
      
      if (clickedElement) {
        if (!connectionSource) {
          setConnectionSource(clickedElement.id);
        } else if (clickedElement.id !== connectionSource) {
          const newConnection: Connection = {
            sourceId: connectionSource,
            targetId: clickedElement.id,
            type: connectionType,
          };
          
          addConnection(newConnection);
          setConnectionSource(null);
        }
      }
      return;
    }
    
    // Handle cropping
    if (isCropping && selectedElement) {
      const element = elements.find(el => el.id === selectedElement);
      if (element && element.type === 'image') {
        setCropStart({ x, y });
      }
      return;
    }
    
    // Handle selection
    if (selectedTool === 'select') {
      const clickedElement = findElementAtPosition(x, y, elements.filter(el => !hiddenLayers[el.id]));
      
      if (clickedElement) {
        // Don't select if the layer is locked
        if (lockedLayers[clickedElement.id]) {
          return;
        }
        
        setSelectedElement(clickedElement.id);
        updateSelectedElement(clickedElement.id);
      } else {
        setSelectedElement(null);
        updateSelectedElement(null);
      }
      return;
    }
    
    // Handle filter application
    if (selectedTool === 'filter' && selectedElement) {
      const element = elements.find(el => el.id === selectedElement);
      if (element && element.type === 'image') {
        applyFilter(element.id, selectedFilter);
      }
      return;
    }
    
    setIsDrawing(true);
    
    // Create a new element based on the selected tool
    const newElement: Element = {
      id: uuidv4(),
      type: selectedTool,
      x,
      y,
      color: selectedColor,
      size: selectedSize,
      points: selectedTool === 'pen' ? [{ x, y }] : undefined,
    };
    
    setCurrentElement(newElement);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!canvasRef.current) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Handle hover connections in prototype mode
    if (isPrototypingMode) {
      const hoveredElement = findElementAtPosition(x, y, elements.filter(el => !hiddenLayers[el.id]));
      if (hoveredElement) {
        const connection = connections.find(conn => 
          conn.sourceId === hoveredElement.id && conn.type === 'hover'
        );
        
        if (connection) {
          const targetElement = elements.find(el => el.id === connection.targetId);
          if (targetElement) {
            // In a real app, you would highlight or show the target element
          }
        }
      }
    }
    
    // Handle cropping
    if (isCropping && selectedElement && cropStart) {
      const element = elements.find(el => el.id === selectedElement);
      if (element && element.type === 'image') {
        const width = x - cropStart.x;
        const height = y - cropStart.y;
        
        setCurrentElement({
          ...element,
          width,
          height,
        });
      }
      return;
    }
    
    if (!isDrawing || !startPoint || !currentElement) return;
    
    const updatedElement = { ...currentElement };
    
    switch (selectedTool) {
      case 'rectangle':
      case 'ellipse':
        updatedElement.width = x - startPoint.x;
        updatedElement.height = y - startPoint.y;
        break;
      case 'line':
        updatedElement.width = x - startPoint.x;
        updatedElement.height = y - startPoint.y;
        break;
      case 'pen':
        updatedElement.points = [...(updatedElement.points || []), { x, y }];
        break;
      default:
        break;
    }
    
    setCurrentElement(updatedElement);
  };

  const handleMouseUp = () => {
    // Handle cropping completion
    if (isCropping && selectedElement && cropStart && currentElement) {
      cropImage(
        selectedElement,
        cropStart.x,
        cropStart.y,
        currentElement.width || 0,
        currentElement.height || 0
      );
      
      setCropStart(null);
      setCurrentElement(null);
      return;
    }
    
    if (!isDrawing || !currentElement) return;
    
    setIsDrawing(false);
    
    // Add the completed element to the store
    addElement(currentElement);
    
    // Update Liveblocks storage
    updateCanvasElements([...elements, currentElement]);
    
    setCurrentElement(null);
    setStartPoint(null);
  };

  // Memoize renderElement function to prevent unnecessary re-renders
  const renderElement = useCallback((element: Element) => {
    // Skip rendering hidden elements
    if (hiddenLayers[element.id]) {
      return null;
    }
    
    const isSelected = element.id === selectedElement;
    const isLocked = lockedLayers[element.id];
    const sizeValue = getSizeValue(element.size);
    
    // Show a lock indicator for locked elements
    const lockedIndicator = isLocked ? (
      <div className="absolute top-0 right-0 bg-gray-200 rounded-full p-1 transform translate-x-1/2 -translate-y-1/2">
        <Lock className="h-3 w-3 text-gray-600" />
      </div>
    ) : null;
    
    switch (element.type) {
      case 'rectangle':
        return (
          <div
            key={element.id}
            className={`absolute ${isSelected ? 'ring-2 ring-blue-500' : ''}`}
            style={{
              left: element.x,
              top: element.y,
              width: element.width,
              height: element.height,
              backgroundColor: isSelected ? 'transparent' : element.color,
              border: `${sizeValue}px solid ${element.color}`,
              pointerEvents: isLocked ? 'none' : 'auto',
            }}
          >
            {lockedIndicator}
          </div>
        );
      case 'ellipse':
        return (
          <div
            key={element.id}
            className={`absolute rounded-full ${isSelected ? 'ring-2 ring-blue-500' : ''}`}
            style={{
              left: element.x,
              top: element.y,
              width: element.width,
              height: element.height,
              backgroundColor: isSelected ? 'transparent' : element.color,
              border: `${sizeValue}px solid ${element.color}`,
              pointerEvents: isLocked ? 'none' : 'auto',
            }}
          >
            {lockedIndicator}
          </div>
        );
      case 'line':
        return (
          <svg
            key={element.id}
            className="absolute"
            style={{
              left: 0,
              top: 0,
              width: '100%',
              height: '100%',
              pointerEvents: isLocked ? 'none' : 'auto',
            }}
          >
            <line
              x1={element.x}
              y1={element.y}
              x2={element.x + (element.width || 0)}
              y2={element.y + (element.height || 0)}
              stroke={element.color}
              strokeWidth={sizeValue}
              className={isSelected ? 'stroke-2 stroke-blue-500' : ''}
            />
            {lockedIndicator && (
              <foreignObject
                x={element.x + (element.width || 0) / 2}
                y={element.y - 20}
                width="50"
                height="20"
              >
                <div className="bg-yellow-500 text-white text-xs px-1 py-0.5 rounded">
                  Locked
                </div>
              </foreignObject>
            )}
          </svg>
        );
      case 'pen':
        if (!element.points || element.points.length < 2) return null;
        
        let pathData = `M ${element.points[0].x} ${element.points[0].y}`;
        for (let i = 1; i < element.points.length; i++) {
          pathData += ` L ${element.points[i].x} ${element.points[i].y}`;
        }
        
        return (
          <svg
            key={element.id}
            className="absolute"
            style={{
              left: 0,
              top: 0,
              width: '100%',
              height: '100%',
              pointerEvents: isLocked ? 'none' : 'auto',
            }}
          >
            <path
              d={pathData}
              fill="none"
              stroke={element.color}
              strokeWidth={sizeValue}
              strokeLinecap="round"
              strokeLinejoin="round"
              className={isSelected ? 'stroke-2 stroke-blue-500' : ''}
            />
            {lockedIndicator && (
              <foreignObject
                x={element.points[0].x}
                y={element.points[0].y - 20}
                width="50"
                height="20"
              >
                <div className="bg-yellow-500 text-white text-xs px-1 py-0.5 rounded">
                  Locked
                </div>
              </foreignObject>
            )}
          </svg>
        );
      case 'image':
        return (
          <div
            key={element.id}
            className={`absolute ${isSelected ? 'ring-2 ring-blue-500' : ''}`}
            style={{
              left: element.x,
              top: element.y,
              width: element.width,
              height: element.height,
              overflow: 'hidden',
              pointerEvents: isLocked ? 'none' : 'auto',
            }}
          >
            <img
              src={element.imageUrl}
              alt="User uploaded"
              className="w-full h-full object-cover"
              style={{
                filter: element.filter || 'none',
              }}
            />
            {lockedIndicator}
          </div>
        );
      default:
        return null;
    }
  }, [hiddenLayers, lockedLayers, selectedElement]);

  // Memoize filtered elements to avoid recalculating on every render
  const visibleElements = useMemo(() => {
    return elements.filter(element => !hiddenLayers[element.id]);
  }, [elements, hiddenLayers]);

  // Memoize the findElementAtPosition function
  const memoizedFindElementAtPosition = useCallback(
    (x: number, y: number) => {
      return findElementAtPosition(x, y, visibleElements);
    },
    [visibleElements]
  );

  const handleCanvasClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!canvasRef.current) return;

      const rect = canvasRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      if (isPrototypingMode) {
        const clickedElement = memoizedFindElementAtPosition(x, y);
        if (selectedElement && clickedElement) {
          addConnection({
            id: `${selectedElement.id}-${clickedElement.id}`,
            sourceId: selectedElement.id,
            targetId: clickedElement.id,
            type: "click",
          });
        }
        return;
      }

      if (selectedTool === "select") {
        const clickedElement = memoizedFindElementAtPosition(x, y);
        setSelectedElement(clickedElement || null);
        return;
      }

      if (selectedTool) {
        const newElement = {
          id: `element-${Date.now()}`,
          type: selectedTool,
          x,
          y,
          width: 100,
          height: 100,
          content: selectedTool === "text" ? "Text" : "",
          style: {},
        };
        addElement(newElement);
        setSelectedElement(newElement);
      }
    },
    [
      selectedTool,
      addElement,
      setSelectedElement,
      isPrototypingMode,
      selectedElement,
      addConnection,
      memoizedFindElementAtPosition,
    ]
  );

  const handleElementDrag = useCallback(
    (id: string, dx: number, dy: number) => {
      const element = elements.find((el) => el.id === id);
      if (element) {
        updateElement({
          ...element,
          x: element.x + dx,
          y: element.y + dy,
        });
      }
    },
    [elements, updateElement]
  );

  // Render connections with memoization
  const renderConnections = useMemo(() => {
    return connections.map((connection) => {
      const source = elements.find((el) => el.id === connection.sourceId);
      const target = elements.find((el) => el.id === connection.targetId);

      if (!source || !target) return null;

      const path = calculateConnectionPath(source, target);

      return (
        <svg
          key={connection.id}
          className="absolute top-0 left-0 w-full h-full pointer-events-none"
        >
          <path
            d={path}
            stroke="#007bff"
            strokeWidth="2"
            fill="none"
            strokeDasharray="5,5"
            markerEnd="url(#arrowhead)"
          />
          <defs>
            <marker
              id="arrowhead"
              markerWidth="10"
              markerHeight="7"
              refX="9"
              refY="3.5"
              orient="auto"
            >
              <polygon points="0 0, 10 3.5, 0 7" fill="#007bff" />
            </marker>
          </defs>
        </svg>
      );
    });
  }, [connections, elements]);

  // Render frames with memoization
  const renderFrames = useMemo(() => {
    return frames.map((frame) => (
      <div
        key={frame.id}
        className="absolute border-2 border-gray-300 rounded-md"
        style={{
          left: frame.x,
          top: frame.y,
          width: frame.width,
          height: frame.height,
        }}
      >
        <div className="absolute top-0 left-0 p-1 text-xs bg-gray-100 rounded-sm">
          {frame.name}
        </div>
      </div>
    ));
  }, [frames]);

  const renderCurrentElement = () => {
    if (!currentElement) return null;
    return renderElement(currentElement);
  };

  const renderPrototypingOverlay = () => {
    if (!isPrototypingMode) return null;
    
    return (
      <div className="absolute top-4 right-4 bg-blue-500 text-white px-4 py-2 rounded-md shadow-md">
        <p className="font-medium">Prototype Mode</p>
        <p className="text-sm">Click on elements to navigate</p>
        <Button 
          onClick={togglePrototypingMode}
          className="mt-2 w-full bg-white text-blue-500 hover:bg-blue-50"
          size="sm"
        >
          Exit
        </Button>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center w-full h-full bg-background animate-in fade-in duration-300">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <>
      <div
        ref={canvasRef}
        className={cn(
          "relative w-full h-full overflow-auto bg-white",
          isPrototypingMode && "cursor-pointer"
        )}
        onClick={handleCanvasClick}
      >
        {renderFrames}
        {visibleElements.map((element) => (
          <React.Fragment key={element.id}>
            {renderElement({
              element,
              isSelected: selectedElement?.id === element.id,
              onDrag: handleElementDrag,
            })}
          </React.Fragment>
        ))}
        {renderConnections()}
        {renderCurrentElement()}
        {renderPrototypingOverlay()}
        
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept="image/*"
          onChange={handleImageUpload}
        />
      </div>
      
      <Dialog open={showFrameDialog} onOpenChange={setShowFrameDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Frame</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input
                id="name"
                value={frameName}
                onChange={(e) => setFrameName(e.target.value)}
                className="col-span-3"
              />
            </div>
          </div>
          <div className="flex justify-end">
            <Button onClick={handleCreateFrame}>Create Frame</Button>
          </div>
        </DialogContent>
      </Dialog>
      
      {isCreatingConnection && connectionSource && (
        <div className="absolute bottom-4 left-4 bg-white p-4 rounded-md shadow-md">
          <p className="font-medium mb-2">Creating Connection</p>
          <p className="text-sm mb-4">Select target element</p>
          <div className="flex items-center space-x-2 mb-4">
            <Label htmlFor="connection-type">Type:</Label>
            <Select
              value={connectionType}
              onValueChange={(value) => setConnectionType(value as 'click' | 'hover')}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Connection Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="click">On Click</SelectItem>
                <SelectItem value="hover">On Hover</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button
            variant="outline"
            onClick={() => {
              setIsCreatingConnection(false);
              setConnectionSource(null);
            }}
          >
            Cancel
          </Button>
        </div>
      )}
    </>
  );
}; 