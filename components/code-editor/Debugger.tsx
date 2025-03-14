"use client";

import { useCodeEditorStore } from "@/store/useCodeEditorStore";
import { useState, useEffect } from "react";
import { Bug, Play, Pause, StepForward, StepBack, RotateCcw } from "lucide-react";
import { motion } from "framer-motion";

export default function Debugger() {
  const { 
    language, 
    getCode, 
    debuggerState, 
    startDebugging, 
    stopDebugging, 
    stepOver, 
    stepInto, 
    stepOut, 
    restart,
    isDebugging,
    breakpoints
  } = useCodeEditorStore();

  const [variables, setVariables] = useState<Record<string, any>>({});
  const [callStack, setCallStack] = useState<string[]>([]);
  const [currentLine, setCurrentLine] = useState<number | null>(null);

  useEffect(() => {
    if (debuggerState) {
      setVariables(debuggerState.variables || {});
      setCallStack(debuggerState.callStack || []);
      setCurrentLine(debuggerState.currentLine || null);
    }
  }, [debuggerState]);

  const handleStartDebugging = async () => {
    const code = getCode();
    if (!code) return;
    await startDebugging();
  };

  if (!isDebugging) {
    return (
      <div className="mt-4">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleStartDebugging}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-purple-600 text-white hover:bg-purple-700"
        >
          <Bug className="w-4 h-4" />
          <span className="font-medium">Debug</span>
        </motion.button>
      </div>
    );
  }

  return (
    <div className="mt-4 bg-[#1e1e2e] rounded-xl p-4 border border-white/10">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-white">Debugger</h3>
        <div className="flex items-center gap-2">
          <button
            onClick={restart}
            className="p-1.5 rounded-md bg-[#2a2a3a] hover:bg-[#3a3a4a] text-gray-300"
            title="Restart"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          
          {debuggerState?.isPaused ? (
            <button
              onClick={stepOver}
              className="p-1.5 rounded-md bg-[#2a2a3a] hover:bg-[#3a3a4a] text-gray-300"
              title="Continue"
            >
              <Play className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={stopDebugging}
              className="p-1.5 rounded-md bg-[#2a2a3a] hover:bg-[#3a3a4a] text-gray-300"
              title="Pause"
            >
              <Pause className="w-4 h-4" />
            </button>
          )}
          
          <button
            onClick={stepInto}
            className="p-1.5 rounded-md bg-[#2a2a3a] hover:bg-[#3a3a4a] text-gray-300"
            title="Step Into"
          >
            <StepForward className="w-4 h-4" />
          </button>
          
          <button
            onClick={stepOut}
            className="p-1.5 rounded-md bg-[#2a2a3a] hover:bg-[#3a3a4a] text-gray-300"
            title="Step Out"
          >
            <StepBack className="w-4 h-4" />
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        {/* Variables */}
        <div className="bg-[#252535] rounded-lg p-3">
          <h4 className="text-xs font-medium text-gray-400 mb-2">Variables</h4>
          <div className="max-h-40 overflow-y-auto">
            {Object.keys(variables).length > 0 ? (
              <div className="space-y-1">
                {Object.entries(variables).map(([name, value]) => (
                  <div key={name} className="flex justify-between text-xs">
                    <span className="text-blue-400">{name}</span>
                    <span className="text-gray-300">{JSON.stringify(value)}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-gray-500">No variables to display</p>
            )}
          </div>
        </div>
        
        {/* Call Stack */}
        <div className="bg-[#252535] rounded-lg p-3">
          <h4 className="text-xs font-medium text-gray-400 mb-2">Call Stack</h4>
          <div className="max-h-40 overflow-y-auto">
            {callStack.length > 0 ? (
              <div className="space-y-1">
                {callStack.map((call, index) => (
                  <div key={index} className="text-xs text-gray-300">
                    {call}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-gray-500">Call stack is empty</p>
            )}
          </div>
        </div>
      </div>
      
      {/* Breakpoints */}
      <div className="mt-4 bg-[#252535] rounded-lg p-3">
        <h4 className="text-xs font-medium text-gray-400 mb-2">Breakpoints</h4>
        <div className="max-h-40 overflow-y-auto">
          {breakpoints.length > 0 ? (
            <div className="space-y-1">
              {breakpoints.map((line, index) => (
                <div key={index} className="flex justify-between text-xs">
                  <span className="text-red-400">Line {line}</span>
                  <button 
                    onClick={() => {
                      // Remove breakpoint logic would go here
                    }}
                    className="text-gray-500 hover:text-gray-300"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-gray-500">No breakpoints set</p>
          )}
        </div>
      </div>
    </div>
  );
} 