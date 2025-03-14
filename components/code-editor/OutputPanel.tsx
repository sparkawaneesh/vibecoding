"use client";

import { useCodeEditorStore } from "@/store/useCodeEditorStore";
import { Terminal } from "lucide-react";

export default function OutputPanel() {
  const { output, error, isRunning } = useCodeEditorStore();

  return (
    <div className="relative bg-[#181825] rounded-xl p-4 ring-1 ring-gray-800/50">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center w-6 h-6 rounded-lg bg-[#1e1e2e] ring-1 ring-gray-800/50">
            <Terminal className="w-4 h-4 text-blue-400" />
          </div>
          <span className="text-sm font-medium text-gray-300">Output</span>
        </div>
      </div>

      {/* Output Area */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-b from-[#1e1e2e] to-[#1a1a2e] rounded-xl -z-10" />
        <div className="relative bg-[#1e1e2e]/50 backdrop-blur-sm border border-[#313244] rounded-xl p-4 h-[600px] overflow-auto">
          {isRunning ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-sm text-gray-400">Running code...</p>
              </div>
            </div>
          ) : error ? (
            <pre className="text-red-400 text-sm font-mono whitespace-pre-wrap">{error}</pre>
          ) : output ? (
            <pre className="text-gray-300 text-sm font-mono whitespace-pre-wrap">{output}</pre>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <Terminal className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                <p className="text-sm text-gray-500">Run your code to see the output here</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 