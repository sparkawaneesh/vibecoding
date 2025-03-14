import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { fabric } from 'fabric';
import { Monaco } from "@monaco-editor/react";

export type Tool = 'select' | 'rect' | 'circle' | 'text' | 'image' | 'pencil' | 'eraser' | 'crop' | 'filter';
export type Color = string;
export type Size = 'small' | 'medium' | 'large';
export type ConnectionType = 'none' | 'click' | 'hover';

export type Element = {
  id: string;
  type: Tool;
  x: number;
  y: number;
  width?: number;
  height?: number;
  points?: { x: number; y: number }[];
  color: Color;
  size: Size;
  text?: string;
  imageUrl?: string;
  filter?: string;
  connections?: Connection[];
  name?: string;
};

export type Connection = {
  sourceId: string;
  targetId: string;
  type: ConnectionType;
};

export type Frame = {
  id: string;
  name: string;
  elements: string[]; // Element IDs
};

interface History {
  past: string[];
  present: string | null;
  future: string[];
}

interface EditorOptions {
  fontSize: number;
  lineNumbers: 'on' | 'off';
  minimap: { enabled: boolean };
  wordWrap: 'on' | 'off';
  theme: string;
  tabSize: number;
  autoIndent: boolean;
}

interface DebuggerState {
  currentLine: number;
  callStack: string[];
  variables: Record<string, unknown>;
  breakpoints: Set<number>;
  isActive: boolean;
}

type SupportedLanguage = 'javascript' | 'typescript' | 'python' | 'java' | 'cpp';
type EditorTheme = 'vs-dark' | 'vs-light' | 'hc-black';

interface DesignToolState {
  elements: Element[];
  selectedElement: string | null;
  selectedTool: Tool;
  currentColor: string;
  brushSize: number;
  history: History;
  frames: Frame[];
  activeFrame: string | null;
  connections: Connection[];
  isPrototypingMode: boolean;
  hiddenLayers: Record<string, boolean>;
  lockedLayers: Record<string, boolean>;
  fabricCanvas: fabric.Canvas | null;
  
  // Actions
  setElements: (elements: Element[]) => void;
  addElement: (element: Element) => void;
  updateElement: (id: string, updates: Partial<Element>) => void;
  deleteElement: (id: string) => void;
  setSelectedElement: (id: string | null) => void;
  setSelectedTool: (tool: Tool) => void;
  setCurrentColor: (color: string) => void;
  setBrushSize: (size: number) => void;
  clearCanvas: () => void;
  undo: (canvas: fabric.Canvas) => void;
  redo: (canvas: fabric.Canvas) => void;
  setFabricCanvas: (canvas: fabric.Canvas | null) => void;
  
  // Prototyping actions
  addFrame: (frame: Frame) => void;
  updateFrame: (id: string, updates: Partial<Frame>) => void;
  deleteFrame: (id: string) => void;
  setActiveFrame: (id: string | null) => void;
  addConnection: (connection: Connection) => void;
  removeConnection: (sourceId: string, targetId: string) => void;
  togglePrototypingMode: () => void;
  
  // Image editing actions
  applyFilter: (elementId: string, filter: string) => void;
  cropImage: (elementId: string, x: number, y: number, width: number, height: number) => void;
  addToHistory: (state: string) => void;
  
  // Layer management actions
  toggleLayerVisibility: (id: string) => void;
  toggleLayerLock: (id: string) => void;
  moveLayerUp: (id: string) => void;
  moveLayerDown: (id: string) => void;
  
  // Save functionality
  saveDesign: () => Promise<void>;
  loadDesign: (designData: string) => Promise<void>;
}

interface CodeEditorStore {
  // Editor state
  code: string;
  language: SupportedLanguage;
  theme: EditorTheme;
  fontSize: number;
  editor: Monaco | null;
  editorOptions: EditorOptions;
  isRunning: boolean;
  output: string[];
  error: string | null;
  
  // Debugger state
  isDebugging: boolean;
  debuggerState: DebuggerState | null;
  
  // Editor actions
  setCode: (code: string) => void;
  setLanguage: (language: SupportedLanguage) => void;
  setTheme: (theme: EditorTheme) => void;
  setFontSize: (size: number) => void;
  setEditor: (editor: Monaco | null) => void;
  setEditorOptions: (options: Partial<EditorOptions>) => void;
  
  // Code execution
  runCode: () => Promise<void>;
  stopCode: () => void;
  clearOutput: () => void;
  appendOutput: (text: string) => void;
  
  // Debugger actions
  startDebugging: () => Promise<void>;
  stopDebugging: () => void;
  stepOver: () => void;
  stepInto: () => void;
  stepOut: () => void;
  toggleBreakpoint: (line: number) => void;
  
  // File management
  saveCode: () => Promise<void>;
  loadCode: (content: string) => void;
}

const DEFAULT_EDITOR_OPTIONS: EditorOptions = {
  fontSize: 14,
  lineNumbers: 'on',
  minimap: { enabled: true },
  wordWrap: 'on',
  theme: 'vs-dark',
  tabSize: 2,
  autoIndent: true
};

const DEFAULT_DEBUGGER_STATE: DebuggerState = {
  currentLine: 1,
  callStack: ['global scope'],
  variables: {},
  breakpoints: new Set(),
  isActive: false
};

export const useDesignToolStore = create<DesignToolState>()(
  persist(
    immer((set, get) => ({
      elements: [],
      selectedElement: null,
      selectedTool: 'select' as Tool,
      currentColor: '#000000',
      brushSize: 5,
      history: {
        past: [],
        present: null,
        future: []
      },
      frames: [],
      activeFrame: null,
      connections: [],
      isPrototypingMode: false,
      hiddenLayers: {},
      lockedLayers: {},
      fabricCanvas: null,
      
      setFabricCanvas: (canvas) => set({ fabricCanvas: canvas }),
      
      setElements: (elements) => {
        set((state) => {
          // Only add to history if elements have actually changed
          const currentElements = JSON.stringify(state.elements);
          const newElements = JSON.stringify(elements);
          
          if (currentElements !== newElements) {
            const newHistory = {
              past: state.history.past,
              present: state.history.present,
              future: state.history.future
            };
            state.elements = elements;
            state.history = newHistory;
          }
        });
      },
      
      addElement: (element) => {
        set((state) => {
          const newElements = [...state.elements, element];
          const newHistory = {
            past: state.history.past,
            present: state.history.present,
            future: state.history.future
          };
          
          state.elements = newElements;
          state.history = newHistory;
          state.selectedElement = element.id;
        });
      },
      
      updateElement: (id, updates) => {
        set((state) => {
          const elementIndex = state.elements.findIndex(el => el.id === id);
          if (elementIndex === -1) return;
          
          // Create a new elements array with the updated element
          const updatedElement = { ...state.elements[elementIndex], ...updates };
          const newElements = [...state.elements];
          newElements[elementIndex] = updatedElement;
          
          // Add to history
          const newHistory = {
            past: state.history.past,
            present: state.history.present,
            future: state.history.future
          };
          
          state.elements = newElements;
          state.history = newHistory;
        });
      },
      
      deleteElement: (id) => {
        set((state) => {
          // Remove element from elements array
          const newElements = state.elements.filter(el => el.id !== id);
          
          // Remove element from frames
          const newFrames = state.frames.map(frame => ({
            ...frame,
            elements: frame.elements.filter(elId => elId !== id)
          }));
          
          // Remove connections involving this element
          const newConnections = state.connections.filter(
            conn => conn.sourceId !== id && conn.targetId !== id
          );
          
          // Add to history
          const newHistory = {
            past: state.history.past,
            present: state.history.present,
            future: state.history.future
          };
          
          state.elements = newElements;
          state.frames = newFrames;
          state.connections = newConnections;
          state.history = newHistory;
          
          // Deselect if the deleted element was selected
          if (state.selectedElement === id) {
            state.selectedElement = null;
          }
        });
      },
      
      setSelectedElement: (id) => {
        set((state) => {
          state.selectedElement = id;
        });
      },
      
      setSelectedTool: (tool) => {
        set((state) => {
          state.selectedTool = tool;
          if (tool !== 'select' && tool !== 'crop' && tool !== 'filter') {
            state.selectedElement = null;
          }
        });
      },
      
      setCurrentColor: (color) => {
        set((state) => {
          state.currentColor = color;
        });
      },
      
      setBrushSize: (size) => {
        set((state) => {
          state.brushSize = size;
        });
      },
      
      clearCanvas: () => {
        set((state) => {
          const newHistory = {
            past: state.history.past,
            present: state.history.present,
            future: state.history.future
          };
          
          state.elements = [];
          state.selectedElement = null;
          state.frames = [];
          state.connections = [];
          state.history = newHistory;
        });
      },
      
      undo: (canvas) => {
        const { history } = get();
        
        if (history.past.length === 0) return;
        
        const previous = history.past[history.past.length - 1];
        const newPast = history.past.slice(0, history.past.length - 1);
        
        set((state) => {
          state.history = {
            past: newPast,
            present: previous,
            future: history.present 
              ? [history.present, ...history.future]
              : history.future
          };
        });
        
        canvas.loadFromJSON(previous, canvas.renderAll.bind(canvas));
      },
      
      redo: (canvas) => {
        const { history } = get();
        
        if (history.future.length === 0) return;
        
        const next = history.future[0];
        const newFuture = history.future.slice(1);
        
        set((state) => {
          state.history = {
            past: history.present 
              ? [...history.past, history.present]
              : history.past,
            present: next,
            future: newFuture
          };
        });
        
        canvas.loadFromJSON(next, canvas.renderAll.bind(canvas));
      },
      
      addFrame: (frame) => {
        set((state) => {
          state.frames = [...state.frames, frame];
          state.activeFrame = frame.id;
        });
      },
      
      updateFrame: (id, updates) => {
        set((state) => {
          const frameIndex = state.frames.findIndex(frame => frame.id === id);
          if (frameIndex === -1) return;
          
          const updatedFrame = { ...state.frames[frameIndex], ...updates };
          const newFrames = [...state.frames];
          newFrames[frameIndex] = updatedFrame;
          
          state.frames = newFrames;
        });
      },
      
      deleteFrame: (id) => {
        set((state) => {
          state.frames = state.frames.filter(frame => frame.id !== id);
          
          if (state.activeFrame === id) {
            state.activeFrame = state.frames.length > 0 ? state.frames[0].id : null;
          }
        });
      },
      
      setActiveFrame: (id) => {
        set((state) => {
          state.activeFrame = id;
        });
      },
      
      addConnection: (connection) => {
        set((state) => {
          // Check if connection already exists
          const connectionExists = state.connections.some(
            conn => conn.sourceId === connection.sourceId && conn.targetId === connection.targetId
          );
          
          if (!connectionExists) {
            state.connections = [...state.connections, connection];
          }
        });
      },
      
      removeConnection: (sourceId, targetId) => {
        set((state) => {
          state.connections = state.connections.filter(
            conn => !(conn.sourceId === sourceId && conn.targetId === targetId)
          );
        });
      },
      
      togglePrototypingMode: () => {
        set((state) => {
          state.isPrototypingMode = !state.isPrototypingMode;
          
          // When entering prototyping mode, deselect current element
          if (state.isPrototypingMode) {
            state.selectedElement = null;
          }
        });
      },
      
      applyFilter: (elementId, filter) => {
        set((state) => {
          const elementIndex = state.elements.findIndex(el => el.id === elementId);
          if (elementIndex === -1) return;
          
          const updatedElement = { ...state.elements[elementIndex], filter };
          const newElements = [...state.elements];
          newElements[elementIndex] = updatedElement;
          
          // Add to history
          const newHistory = {
            past: state.history.past,
            present: state.history.present,
            future: state.history.future
          };
          
          state.elements = newElements;
          state.history = newHistory;
        });
      },
      
      cropImage: (elementId, x, y, width, height) => {
        set((state) => {
          const elementIndex = state.elements.findIndex(el => el.id === elementId);
          if (elementIndex === -1) return;
          
          const element = state.elements[elementIndex];
          
          // Calculate new position and dimensions
          const newX = element.x + x;
          const newY = element.y + y;
          const newWidth = width;
          const newHeight = height;
          
          const updatedElement = { 
            ...element, 
            x: newX, 
            y: newY, 
            width: newWidth, 
            height: newHeight 
          };
          
          const newElements = [...state.elements];
          newElements[elementIndex] = updatedElement;
          
          // Add to history
          const newHistory = {
            past: state.history.past,
            present: state.history.present,
            future: state.history.future
          };
          
          state.elements = newElements;
          state.history = newHistory;
        });
      },
      
      addToHistory: (state) => {
        const { history } = get();
        
        set({
          history: {
            past: history.present 
              ? [...history.past, history.present]
              : history.past,
            present: state,
            future: []
          }
        });
      },
      
      toggleLayerVisibility: (id) => {
        set((state) => {
          state.hiddenLayers[id] = !state.hiddenLayers[id];
        });
      },
      
      toggleLayerLock: (id) => {
        set((state) => {
          state.lockedLayers[id] = !state.lockedLayers[id];
        });
      },
      
      moveLayerUp: (id) => {
        set((state) => {
          const index = state.elements.findIndex(el => el.id === id);
          if (index > 0) {
            const element = state.elements[index];
            state.elements.splice(index, 1);
            state.elements.splice(index - 1, 0, element);
          }
        });
      },
      
      moveLayerDown: (id) => {
        set((state) => {
          const index = state.elements.findIndex(el => el.id === id);
          if (index < state.elements.length - 1) {
            const element = state.elements[index];
            state.elements.splice(index, 1);
            state.elements.splice(index + 1, 0, element);
          }
        });
      },
      
      saveDesign: async () => {
        const { fabricCanvas } = get();
        if (!fabricCanvas) return;
        
        try {
          const designData = JSON.stringify(fabricCanvas.toJSON());
          localStorage.setItem('current-design', designData);
          
          // Here you would typically also save to a backend
          // For now, we'll just use localStorage
          console.log('Design saved successfully');
        } catch (error) {
          console.error('Error saving design:', error);
          throw new Error('Failed to save design');
        }
      },
      
      loadDesign: async (designData: string) => {
        const { fabricCanvas } = get();
        if (!fabricCanvas) return;
        
        try {
          const parsedData = JSON.parse(designData);
          fabricCanvas.loadFromJSON(parsedData, fabricCanvas.renderAll.bind(fabricCanvas));
          
          // Update history
          set((state) => {
            state.history = {
              past: [],
              present: designData,
              future: []
            };
          });
        } catch (error) {
          console.error('Error loading design:', error);
          throw new Error('Failed to load design');
        }
      }
    })),
    {
      name: 'design-tool-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        elements: state.elements,
        frames: state.frames,
        connections: state.connections,
        selectedColor: state.currentColor,
        selectedSize: state.brushSize,
        hiddenLayers: state.hiddenLayers,
        lockedLayers: state.lockedLayers
      }),
    }
  )
);

export const useCodeEditorStore = create<CodeEditorStore>()(
  persist(
    (set, get) => ({
      // Initial state
      code: '',
      language: 'javascript',
      theme: 'vs-dark',
      fontSize: DEFAULT_EDITOR_OPTIONS.fontSize,
      editor: null,
      editorOptions: DEFAULT_EDITOR_OPTIONS,
      isRunning: false,
      output: [],
      error: null,
      isDebugging: false,
      debuggerState: null,
      
      // Editor actions
      setCode: (code) => {
        if (typeof code !== 'string') return;
        set({ code });
      },
      
      setLanguage: (language) => {
        if (!language) return;
        set({ language });
        localStorage.setItem('editor-language', language);
      },
      
      setTheme: (theme) => {
        if (!theme) return;
        set({ 
          theme,
          editorOptions: { ...get().editorOptions, theme }
        });
        localStorage.setItem('editor-theme', theme);
      },
      
      setFontSize: (fontSize) => {
        if (fontSize < 8 || fontSize > 32) return;
        set({ 
          fontSize,
          editorOptions: { ...get().editorOptions, fontSize }
        });
        localStorage.setItem('editor-font-size', fontSize.toString());
      },
      
      setEditor: (editor) => set({ editor }),
      
      setEditorOptions: (options) => {
        if (!options || typeof options !== 'object') return;
        set({ 
          editorOptions: { ...get().editorOptions, ...options }
        });
      },
      
      // Code execution
      runCode: async () => {
        const { code, language, isRunning } = get();
        if (!code || isRunning) return;
        
        set({ isRunning: true, output: [], error: null });
        
        try {
          // Here you would implement actual code execution
          await new Promise(resolve => setTimeout(resolve, 1000));
          set(state => ({ 
            output: [...state.output, `Executed ${language} code successfully`]
          }));
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Unknown error occurred' });
        } finally {
          set({ isRunning: false });
        }
      },
      
      stopCode: () => {
        const { isRunning } = get();
        if (!isRunning) return;
        set({ isRunning: false });
      },
      
      clearOutput: () => set({ output: [], error: null }),
      
      appendOutput: (text) => {
        if (typeof text !== 'string') return;
        set(state => ({ output: [...state.output, text] }));
      },
      
      // Debugger actions
      startDebugging: async () => {
        const { code, isDebugging, debuggerState } = get();
        if (!code || isDebugging || debuggerState?.isActive) return;
        
        set({ 
          isDebugging: true,
          debuggerState: { ...DEFAULT_DEBUGGER_STATE, isActive: true }
        });
      },
      
      stopDebugging: () => {
        const { isDebugging, debuggerState } = get();
        if (!isDebugging || !debuggerState?.isActive) return;
        
        set({
          isDebugging: false,
          debuggerState: null
        });
      },
      
      stepOver: () => {
        const { debuggerState } = get();
        if (!debuggerState?.isActive) return;
        
        const nextLine = debuggerState.currentLine + 1;
        set({
          debuggerState: {
            ...debuggerState,
            currentLine: nextLine
          }
        });
      },
      
      stepInto: () => {
        const { debuggerState } = get();
        if (!debuggerState?.isActive) return;
        
        set({
          debuggerState: {
            ...debuggerState,
            callStack: [...debuggerState.callStack, 'function scope']
          }
        });
      },
      
      stepOut: () => {
        const { debuggerState } = get();
        if (!debuggerState?.isActive || debuggerState.callStack.length <= 1) return;
        
        const newCallStack = [...debuggerState.callStack];
        newCallStack.pop();
        
        set({
          debuggerState: {
            ...debuggerState,
            callStack: newCallStack
          }
        });
      },
      
      toggleBreakpoint: (line: number) => {
        const { debuggerState } = get();
        if (!debuggerState || line < 1) return;
        
        const newBreakpoints = new Set(debuggerState.breakpoints);
        if (newBreakpoints.has(line)) {
          newBreakpoints.delete(line);
        } else {
          newBreakpoints.add(line);
        }
        
        set({
          debuggerState: {
            ...debuggerState,
            breakpoints: newBreakpoints
          }
        });
      },
      
      // File management
      saveCode: async () => {
        const { code, language } = get();
        if (!code) return;
        
        try {
          const key = `code-${language}-${Date.now()}`;
          localStorage.setItem(key, code);
          return key;
        } catch (error) {
          console.error('Failed to save code:', error);
          throw new Error('Failed to save code');
        }
      },
      
      loadCode: (content: string) => {
        if (!content) return;
        set({ code: content, error: null });
      }
    }),
    {
      name: 'code-editor-storage',
      partialize: (state) => ({
        code: state.code,
        language: state.language,
        theme: state.theme,
        fontSize: state.fontSize,
        editorOptions: state.editorOptions
      })
    }
  )
); 