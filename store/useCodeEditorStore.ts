import { create } from "zustand";
import { Monaco } from "@monaco-editor/react";

interface EditorOptions {
  fontSize: number;
  lineNumbers: 'on' | 'off';
  minimap: { enabled: boolean };
  wordWrap: 'on' | 'off';
  theme: string;
}

interface DebuggerState {
  currentLine: number;
  callStack: string[];
  variables: Record<string, unknown>;
  breakpoints: number[];
}

interface CodeEditorStore {
  // Editor state
  code: string;
  language: string;
  theme: string;
  fontSize: number;
  editor: Monaco | null;
  editorOptions: EditorOptions;
  isRunning: boolean;
  output: string;
  error: string | null;
  
  // Debugger state
  isDebugging: boolean;
  debuggerState: DebuggerState | null;
  
  // Editor actions
  setCode: (code: string) => void;
  setLanguage: (language: string) => void;
  setTheme: (theme: string) => void;
  setFontSize: (size: number) => void;
  setEditor: (editor: Monaco | null) => void;
  setEditorOptions: (options: Partial<EditorOptions>) => void;
  
  // Code execution
  runCode: () => Promise<void>;
  stopCode: () => void;
  
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
  theme: 'vs-dark'
};

const DEFAULT_DEBUGGER_STATE: DebuggerState = {
  currentLine: 1,
  callStack: ['global scope'],
  variables: {},
  breakpoints: []
};

export const useCodeEditorStore = create<CodeEditorStore>((set, get) => ({
  // Initial state
  code: '',
  language: 'javascript',
  theme: 'vs-dark',
  fontSize: DEFAULT_EDITOR_OPTIONS.fontSize,
  editor: null,
  editorOptions: DEFAULT_EDITOR_OPTIONS,
  isRunning: false,
  output: '',
  error: null,
  isDebugging: false,
  debuggerState: null,
  
  // Editor actions
  setCode: (code) => set({ code }),
  
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
  
  setEditorOptions: (options) => set({ 
    editorOptions: { ...get().editorOptions, ...options }
  }),
  
  // Code execution
  runCode: async () => {
    const { code, language } = get();
    if (!code) return;
    
    set({ isRunning: true, output: '', error: null });
    
    try {
      // Here you would implement actual code execution
      await new Promise(resolve => setTimeout(resolve, 1000));
      set({ output: `Executed ${language} code successfully` });
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
  
  // Debugger actions
  startDebugging: async () => {
    const { code, isDebugging } = get();
    if (!code || isDebugging) return;
    
    set({ 
      isDebugging: true,
      debuggerState: { ...DEFAULT_DEBUGGER_STATE }
    });
  },
  
  stopDebugging: () => {
    const { isDebugging } = get();
    if (!isDebugging) return;
    
    set({
      isDebugging: false,
      debuggerState: null
    });
  },
  
  stepOver: () => {
    const { debuggerState, isDebugging } = get();
    if (!debuggerState || !isDebugging) return;
    
    set({
      debuggerState: {
        ...debuggerState,
        currentLine: debuggerState.currentLine + 1
      }
    });
  },
  
  stepInto: () => {
    const { debuggerState, isDebugging } = get();
    if (!debuggerState || !isDebugging) return;
    
    set({
      debuggerState: {
        ...debuggerState,
        callStack: [...debuggerState.callStack, 'function scope']
      }
    });
  },
  
  stepOut: () => {
    const { debuggerState, isDebugging } = get();
    if (!debuggerState || !isDebugging || debuggerState.callStack.length <= 1) return;
    
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
    
    set({
      debuggerState: {
        ...debuggerState,
        breakpoints: debuggerState.breakpoints.includes(line)
          ? debuggerState.breakpoints.filter(bp => bp !== line)
          : [...debuggerState.breakpoints, line]
      }
    });
  },
  
  // File management
  saveCode: async () => {
    const { code, language } = get();
    if (!code) return;
    
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      localStorage.setItem(`code-${language}`, code);
    } catch (error) {
      console.error('Failed to save code:', error);
      throw error;
    }
  },
  
  loadCode: (content: string) => {
    if (!content) return;
    set({ code: content });
  }
})); 