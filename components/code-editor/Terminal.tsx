"use client";

import { useCodeEditorStore } from "@/store/useCodeEditorStore";
import { useState, useRef, useEffect } from "react";
import { Terminal as TerminalIcon, X, Maximize2, Minimize2 } from "lucide-react";
import { motion } from "framer-motion";

export default function Terminal() {
  const { language, getCode, output, error } = useCodeEditorStore();
  const [isOpen, setIsOpen] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const [command, setCommand] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [terminalOutput, setTerminalOutput] = useState<Array<{type: "input" | "output" | "error", content: string}>>([
    { type: "output", content: "Welcome to Vibe Studio Terminal" },
    { type: "output", content: `Type 'help' to see available commands` }
  ]);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const outputRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [terminalOutput]);

  const handleCommand = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== "Enter" || !command.trim()) return;
    
    const newCommand = command.trim();
    setHistory(prev => [newCommand, ...prev]);
    setHistoryIndex(-1);
    
    // Add command to terminal output
    setTerminalOutput(prev => [...prev, { type: "input", content: `$ ${newCommand}` }]);
    
    // Process command
    processCommand(newCommand);
    
    // Clear input
    setCommand("");
  };

  const processCommand = (cmd: string) => {
    const parts = cmd.split(" ");
    const mainCommand = parts[0].toLowerCase();
    
    switch (mainCommand) {
      case "help":
        setTerminalOutput(prev => [
          ...prev, 
          { 
            type: "output", 
            content: `
Available commands:
  help                 Show this help message
  clear                Clear the terminal
  echo [text]          Display text
  run                  Run the current code
  ls                   List files in current directory
  cat [filename]       Display file content
  pwd                  Show current directory
  exit                 Close the terminal
            `.trim()
          }
        ]);
        break;
        
      case "clear":
        setTerminalOutput([]);
        break;
        
      case "echo":
        const text = parts.slice(1).join(" ");
        setTerminalOutput(prev => [...prev, { type: "output", content: text }]);
        break;
        
      case "run":
        const code = getCode();
        if (!code) {
          setTerminalOutput(prev => [...prev, { type: "error", content: "No code to run" }]);
          return;
        }
        
        setTerminalOutput(prev => [...prev, { type: "output", content: "Running code..." }]);
        
        // Simulate running code
        setTimeout(() => {
          if (error) {
            setTerminalOutput(prev => [...prev, { type: "error", content: error }]);
          } else if (output) {
            setTerminalOutput(prev => [...prev, { type: "output", content: output }]);
          } else {
            setTerminalOutput(prev => [...prev, { type: "output", content: "Code executed successfully with no output" }]);
          }
        }, 500);
        break;
        
      case "ls":
        setTerminalOutput(prev => [
          ...prev, 
          { 
            type: "output", 
            content: `
src/
├── components/
│   ├── button.js
│   └── input.js
└── app.js
package.json
            `.trim()
          }
        ]);
        break;
        
      case "cat":
        const filename = parts[1];
        if (!filename) {
          setTerminalOutput(prev => [...prev, { type: "error", content: "Missing filename" }]);
          return;
        }
        
        // Simulate cat command
        if (filename === "package.json") {
          setTerminalOutput(prev => [
            ...prev, 
            { 
              type: "output", 
              content: `
{
  "name": "my-app",
  "version": "1.0.0",
  "dependencies": {
    "react": "^18.0.0",
    "react-dom": "^18.0.0"
  }
}
              `.trim()
            }
          ]);
        } else {
          setTerminalOutput(prev => [...prev, { type: "error", content: `File not found: ${filename}` }]);
        }
        break;
        
      case "pwd":
        setTerminalOutput(prev => [...prev, { type: "output", content: "/home/user/project" }]);
        break;
        
      case "exit":
        setIsOpen(false);
        break;
        
      default:
        setTerminalOutput(prev => [...prev, { type: "error", content: `Command not found: ${mainCommand}` }]);
    }
  };

  const handleHistoryNavigation = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowUp") {
      e.preventDefault();
      if (historyIndex < history.length - 1) {
        const newIndex = historyIndex + 1;
        setHistoryIndex(newIndex);
        setCommand(history[newIndex]);
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (historyIndex > 0) {
        const newIndex = historyIndex - 1;
        setHistoryIndex(newIndex);
        setCommand(history[newIndex]);
      } else if (historyIndex === 0) {
        setHistoryIndex(-1);
        setCommand("");
      }
    }
  };

  if (!isOpen) {
    return (
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#1e1e2e] text-gray-300 hover:bg-[#2a2a3a] border border-white/10"
      >
        <TerminalIcon className="w-4 h-4" />
        <span className="text-sm">Terminal</span>
      </motion.button>
    );
  }

  return (
    <motion.div 
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className={`fixed ${isMaximized ? 'inset-0' : 'bottom-4 right-4 w-[600px] h-[400px]'} bg-[#1e1e2e] rounded-lg shadow-lg border border-white/10 flex flex-col z-50`}
    >
      {/* Terminal Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-white/10">
        <div className="flex items-center gap-2">
          <TerminalIcon className="w-4 h-4 text-gray-400" />
          <h3 className="text-sm font-medium text-white">Terminal</h3>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setIsMaximized(!isMaximized)}
            className="p-1.5 rounded-md hover:bg-[#2a2a3a] text-gray-400"
          >
            {isMaximized ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
          <button
            onClick={() => setIsOpen(false)}
            className="p-1.5 rounded-md hover:bg-[#2a2a3a] text-gray-400"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
      
      {/* Terminal Output */}
      <div 
        ref={outputRef}
        className="flex-1 p-3 overflow-y-auto font-mono text-sm bg-[#0f0f17]"
      >
        {terminalOutput.map((line, index) => (
          <div key={index} className={`mb-1 ${line.type === "error" ? "text-red-400" : line.type === "input" ? "text-green-400" : "text-gray-300"}`}>
            {line.content}
          </div>
        ))}
      </div>
      
      {/* Terminal Input */}
      <div className="flex items-center px-3 py-2 border-t border-white/10 bg-[#0f0f17]">
        <span className="text-green-400 mr-2">$</span>
        <input
          ref={inputRef}
          type="text"
          value={command}
          onChange={(e) => setCommand(e.target.value)}
          onKeyDown={(e) => {
            handleCommand(e);
            handleHistoryNavigation(e);
          }}
          className="flex-1 bg-transparent text-gray-300 outline-none"
          placeholder="Type a command..."
          autoFocus
        />
      </div>
    </motion.div>
  );
} 