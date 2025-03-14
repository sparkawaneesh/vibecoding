"use client";

import { useCodeEditorStore } from "@/store/useCodeEditorStore";
import { Editor as MonacoEditor } from "@monaco-editor/react";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { RotateCcwIcon, PlayIcon, ShareIcon } from "lucide-react";
import EditorToolbar from "./EditorToolbar";
import OutputPanel from "./OutputPanel";
import FileExplorer from "./FileExplorer";
import Debugger from "./Debugger";
import SnippetSharing from "./SnippetSharing";
import AIHelper from "./AIHelper";
import Terminal from "./Terminal";
import SettingsPanel from "./SettingsPanel";

const SUPPORTED_LANGUAGES = {
  javascript: {
    label: "JavaScript",
    logoPath: "/javascript.png",
  },
  python: {
    label: "Python",
    logoPath: "/python.png",
  },
  typescript: {
    label: "TypeScript",
    logoPath: "/typescript.png",
  },
};

export default function Editor() {
  const { 
    language,
    theme,
    fontSize,
    editor,
    isRunning,
    editorOptions,
    setEditor,
    runCode,
    toggleBreakpoint
  } = useCodeEditorStore();

  const [mounted, setMounted] = useState(false);
  const [showFileExplorer, setShowFileExplorer] = useState(true);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleEditorChange = (value: string | undefined) => {
    if (value) {
      localStorage.setItem(`editor-code-${language}`, value);
    }
  };

  const handleRefresh = () => {
    if (editor) {
      editor.setValue("");
      localStorage.removeItem(`editor-code-${language}`);
    }
  };

  const handleEditorDidMount = (editor: any) => {
    setEditor(editor);
    
    // Add event listener for breakpoints
    editor.onMouseDown((e: any) => {
      if (e.target.type === monaco.editor.MouseTargetType.GUTTER_LINE_NUMBERS) {
        const lineNumber = e.target.position.lineNumber;
        toggleBreakpoint(lineNumber);
      }
    });
  };

  if (!mounted) return null;

  return (
    <div className="flex h-[calc(100vh-4rem)]">
      {/* File Explorer */}
      {showFileExplorer && (
        <div className="w-64 border-r border-white/[0.05]">
          <FileExplorer />
        </div>
      )}
      
      <div className="flex-1 flex flex-col">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 p-4 flex-1 overflow-hidden">
          <div className="flex flex-col">
            <div className="relative bg-[#12121a]/90 backdrop-blur rounded-xl border border-white/[0.05] p-6 flex-1">
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#1e1e2e] ring-1 ring-white/5">
                    <Image 
                      src={SUPPORTED_LANGUAGES[language as keyof typeof SUPPORTED_LANGUAGES]?.logoPath || "/code.png"} 
                      alt="Language logo" 
                      width={24} 
                      height={24} 
                    />
                  </div>
                  <div>
                    <h2 className="text-sm font-medium text-white">Code Editor</h2>
                    <p className="text-xs text-gray-500">Write and execute your code</p>
                  </div>
                </div>
                
                <EditorToolbar 
                  onRefresh={handleRefresh} 
                  onToggleExplorer={() => setShowFileExplorer(!showFileExplorer)} 
                />
              </div>

              {/* Editor */}
              <div className="relative group rounded-xl overflow-hidden ring-1 ring-white/[0.05] h-[calc(100%-6rem)]">
                <MonacoEditor
                  height="100%"
                  language={language}
                  theme={theme}
                  onChange={handleEditorChange}
                  onMount={handleEditorDidMount}
                  options={{
                    ...editorOptions,
                    fontSize,
                  }}
                />
              </div>

              {/* Action Buttons */}
              <div className="mt-4 flex justify-between">
                <div className="flex items-center gap-2">
                  <SnippetSharing />
                  <AIHelper />
                  <Terminal />
                  <SettingsPanel />
                </div>
                
                <div className="flex items-center gap-2">
                  <Debugger />
                  
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={runCode}
                    disabled={isRunning}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <PlayIcon className="w-4 h-4" />
                    <span className="font-medium">
                      {isRunning ? "Running..." : "Run Code"}
                    </span>
                  </motion.button>
                </div>
              </div>
            </div>
          </div>

          <OutputPanel />
        </div>
      </div>
    </div>
  );
} 