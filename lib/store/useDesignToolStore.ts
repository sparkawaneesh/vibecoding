import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import  fabric  from 'fabric';

export type Point = {
  x: number;
  y: number;
};

export type ElementType = 'rectangle' | 'circle' | 'text' | 'image' | 'pencil';

export type Element = {
  id: string;
  type: ElementType;
  x: number;
  y: number;
  width?: number;
  height?: number;
  color?: string;
  size?: string;
  points?: Point[];
  imageUrl?: string;
  filter?: string;
  content?: string;
  style?: Record<string, any>;
};

export type Connection = {
  id: string;
  sourceId: string;
  targetId: string;
  type: 'click' | 'hover';
};

export type Frame = {
  id: string;
  name: string;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  elements: string[];
};

export type Tool = ElementType | 'select' | 'link' | 'frame' | 'crop' | 'filter';

interface DesignToolState {
  elements: Element[];
  selectedElement: Element | null;
  selectedTool: Tool | null;
  selectedColor: string;
  selectedSize: string;
  frames: Frame[];
  activeFrame: string | null;
  connections: Connection[];
  isPrototypingMode: boolean;
  history: any[];
  currentColor: string;
  brushSize: number;
  hiddenLayers: Record<string, boolean>;
  lockedLayers: Record<string, boolean>;
  fabricCanvas: fabric.Canvas | null;
  
  // Actions
  addElement: (element: Element) => void;
  updateElement: (element: Element) => void;
  setSelectedElement: (element: Element | null) => void;
  addConnection: (connection: Connection) => void;
  removeConnection: (sourceId: string, targetId: string) => void;
  addFrame: (frame: Frame) => void;
  setActiveFrame: (frameId: string | null) => void;
  togglePrototypingMode: () => void;
  applyFilter: (elementId: string, filter: string) => void;
  cropImage: (elementId: string, x: number, y: number, width: number, height: number) => void;
  undo: () => void;
  redo: () => void;
  setSelectedTool: (tool: Tool | null) => void;
  addToHistory: (state: any) => void;
  setElements: (elements: Element[]) => void;
  setBrushSize: (size: number) => void;
  toggleLayerVisibility: (id: string) => void;
  toggleLayerLock: (id: string) => void;
  moveLayerUp: (id: string) => void;
  moveLayerDown: (id: string) => void;
}

export const useDesignToolStore = create<DesignToolState>()(
  persist(
    (set, get) => ({
      elements: [],
      selectedElement: null,
      selectedTool: null,
      selectedColor: '#000000',
      selectedSize: 'medium',
      frames: [],
      activeFrame: null,
      connections: [],
      isPrototypingMode: false,
      history: [],
      currentColor: '#000000',
      brushSize: 2,
      hiddenLayers: {},
      lockedLayers: {},
      fabricCanvas: null,
      
      setFabricCanvas: (canvas: fabric.Canvas) => set({ fabricCanvas: canvas }),
      
      setElements: (elements) => set({ elements }),
      
      addElement: (element) => set((state) => ({ 
        elements: [...state.elements, element] 
      })),
      
      updateElement: (element) => set((state) => ({
        elements: state.elements.map((el) => 
          el.id === element.id ? element : el
        )
      })),
      
      setSelectedElement: (element) => set({ selectedElement: element }),
      
      addConnection: (connection) => set((state) => ({
        connections: [...state.connections, connection]
      })),
      
      removeConnection: (sourceId, targetId) => set((state) => ({
        connections: state.connections.filter(
          (conn) => !(conn.sourceId === sourceId && conn.targetId === targetId)
        )
      })),
      
      addFrame: (frame) => set((state) => ({
        frames: [...state.frames, frame]
      })),
      
      setActiveFrame: (frameId) => set({ activeFrame: frameId }),
      
      togglePrototypingMode: () => set((state) => ({
        isPrototypingMode: !state.isPrototypingMode
      })),
      
      applyFilter: (elementId, filter) => set((state) => ({
        elements: state.elements.map((el) =>
          el.id === elementId ? { ...el, filter } : el
        )
      })),
      
      cropImage: (elementId, x, y, width, height) => set((state) => ({
        elements: state.elements.map((el) =>
          el.id === elementId
            ? { ...el, x, y, width, height }
            : el
        )
      })),
      
      undo: () => {
        const state = get();
        if (state.history.length > 0) {
          const previousState = state.history[state.history.length - 1];
          set({
            elements: previousState.elements,
            history: state.history.slice(0, -1)
          });
        }
      },
      
      redo: () => {
        // Implement redo functionality
      },
      
      setSelectedTool: (tool) => set({ selectedTool: tool }),
      
      addToHistory: (state) => set((currentState) => ({
        history: [...currentState.history, state]
      })),
      
      setBrushSize: (size) => set({ brushSize: size }),
      
      toggleLayerVisibility: (id) => set((state) => ({
        hiddenLayers: {
          ...state.hiddenLayers,
          [id]: !state.hiddenLayers[id]
        }
      })),
      
      toggleLayerLock: (id) => set((state) => ({
        lockedLayers: {
          ...state.lockedLayers,
          [id]: !state.lockedLayers[id]
        }
      })),
      
      moveLayerUp: (id) => set((state) => {
        const index = state.elements.findIndex(el => el.id === id);
        if (index > 0) {
          const newElements = [...state.elements];
          [newElements[index - 1], newElements[index]] = [newElements[index], newElements[index - 1]];
          return { elements: newElements };
        }
        return state;
      }),
      
      moveLayerDown: (id) => set((state) => {
        const index = state.elements.findIndex(el => el.id === id);
        if (index < state.elements.length - 1) {
          const newElements = [...state.elements];
          [newElements[index], newElements[index + 1]] = [newElements[index + 1], newElements[index]];
          return { elements: newElements };
        }
        return state;
      })
    }),
    {
      name: 'design-tool-storage',
      partialize: (state) => ({
        elements: state.elements,
        frames: state.frames,
        connections: state.connections,
        currentColor: state.currentColor,
        brushSize: state.brushSize,
        hiddenLayers: state.hiddenLayers,
        lockedLayers: state.lockedLayers
      })
    }
  )
); 