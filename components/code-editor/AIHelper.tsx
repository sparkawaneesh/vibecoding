"use client";

import { useCodeEditorStore } from "@/store/useCodeEditorStore";
import { useState, useRef } from "react";
import { Sparkles, Send, X, Lightbulb, Code2, Bug, Wand2 } from "lucide-react";
import { motion } from "framer-motion";

type AIAction = "explain" | "optimize" | "debug" | "generate" | "custom";

interface AIPrompt {
  id: string;
  title: string;
  prompt: string;
  action: AIAction;
  icon: React.ReactNode;
}

const DEFAULT_PROMPTS: AIPrompt[] = [
  {
    id: "explain",
    title: "Explain Code",
    prompt: "Explain what this code does in simple terms",
    action: "explain",
    icon: <Code2 className="w-4 h-4" />,
  },
  {
    id: "optimize",
    title: "Optimize Code",
    prompt: "Optimize this code for better performance",
    action: "optimize",
    icon: <Wand2 className="w-4 h-4" />,
  },
  {
    id: "debug",
    title: "Debug Code",
    prompt: "Find and fix bugs in this code",
    action: "debug",
    icon: <Bug className="w-4 h-4" />,
  },
  {
    id: "generate",
    title: "Generate Documentation",
    prompt: "Generate documentation for this code",
    action: "generate",
    icon: <Lightbulb className="w-4 h-4" />,
  },
];

export default function AIHelper() {
  const { getCode, language, setCode } = useCodeEditorStore();
  const [isOpen, setIsOpen] = useState(false);
  const [customPrompt, setCustomPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState("");
  const [activeAction, setActiveAction] = useState<AIAction | null>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const handlePrompt = async (prompt: string, action: AIAction) => {
    const code = getCode();
    if (!code) return;

    setIsLoading(true);
    setActiveAction(action);
    setResponse("");

    try {
      // In a real implementation, this would call an AI API
      // For now, we'll simulate a response
      await new Promise((resolve) => setTimeout(resolve, 1500));

      let simulatedResponse = "";

      switch (action) {
        case "explain":
          simulatedResponse = `This code ${language === "javascript" ? "defines a JavaScript function" : language === "python" ? "defines a Python function" : "implements a program"} that appears to ${code.includes("sort") ? "sort an array of items" : code.includes("fetch") ? "fetch data from an API" : "process some data"}.\n\nIt ${code.includes("for") || code.includes("while") ? "uses a loop to iterate through items" : "processes the data directly"} and ${code.includes("return") ? "returns a result" : "outputs the processed data"}.`;
          break;
        case "optimize":
          simulatedResponse = `Here's an optimized version of your code:\n\n\`\`\`${language}\n${code.replace(/for\s*\(/g, "// Using a more efficient approach\nfor (")}\n\`\`\`\n\nOptimizations made:\n- Improved loop efficiency\n- Reduced unnecessary operations`;
          break;
        case "debug":
          simulatedResponse = `I found a few potential issues in your code:\n\n1. ${code.includes("=") ? "You might have an assignment where you intended a comparison (= vs ==)" : "There might be a logic error in your conditional statements"}\n2. ${code.includes("(") ? "Check your parentheses for proper closure" : "Make sure your syntax is correct"}\n\nSuggested fix:\n\`\`\`${language}\n${code.replace(/=/g, "==").replace(/\/\//g, "// Fixed: ")}\n\`\`\``;
          break;
        case "generate":
          simulatedResponse = `/**\n * ${language === "javascript" || language === "typescript" ? "JavaScript" : language === "python" ? "Python" : "Code"} Documentation\n *\n * ${code.split("\n")[0].replace(/[\/\*]/g, "").trim()}\n * \n * @param {any} input - The input data to process\n * @returns {any} The processed result\n */`;
          break;
        case "custom":
          simulatedResponse = `I've analyzed your code based on your request: "${prompt}"\n\nHere's my response:\n\n${code.length > 100 ? "Your code is quite complex. " : ""}I would suggest ${prompt.includes("improve") ? "improving the structure by separating concerns" : prompt.includes("explain") ? "understanding the core logic first" : "considering alternative approaches"}.\n\n${prompt.includes("how") ? "The way to achieve this is by refactoring your code to be more modular." : ""}`;
          break;
      }

      setResponse(simulatedResponse);
    } catch (error) {
      console.error("Error processing AI request:", error);
      setResponse("Sorry, there was an error processing your request. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCustomPrompt = () => {
    if (!customPrompt.trim()) return;
    handlePrompt(customPrompt, "custom");
    setCustomPrompt("");
  };

  const handleApplyChanges = () => {
    if (!response || !activeAction || activeAction === "explain") return;
    
    // Extract code from response if it contains code blocks
    const codeBlockRegex = /```(?:\w+)?\n([\s\S]*?)\n```/;
    const match = response.match(codeBlockRegex);
    
    if (match && match[1]) {
      // In a real implementation, this would update the editor content
      // This would require a new method in the store
      // setCode(match[1]);
    }
  };

  const applyCodeSuggestion = (suggestion: string) => {
    // Extract code blocks from markdown
    const codeBlockRegex = /```(?:[\w]*)\n([\s\S]*?)```/g;
    const match = codeBlockRegex.exec(suggestion);
    
    if (match && match[1]) {
      // Remove console.log
      // setCode(match[1].trim());
    } else {
      // If no code block found, try to apply the whole suggestion
      // setCode(suggestion.trim());
    }
    
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#1e1e2e] text-gray-300 hover:bg-[#2a2a3a] border border-white/10"
      >
        <Sparkles className="w-4 h-4 text-purple-400" />
        <span className="text-sm">AI Helper</span>
      </motion.button>
      
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full max-w-2xl bg-[#1e1e2e] rounded-xl shadow-lg border border-white/10 p-4 max-h-[80vh] flex flex-col"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-400" />
                AI Code Assistant
              </h3>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-md hover:bg-[#3a3a4a] text-gray-300"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {!response ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  {DEFAULT_PROMPTS.map((prompt) => (
                    <button
                      key={prompt.id}
                      onClick={() => handlePrompt(prompt.prompt, prompt.action)}
                      disabled={isLoading}
                      className="flex items-center gap-2 p-3 rounded-lg bg-[#252535] hover:bg-[#2a2a3a] text-left"
                    >
                      <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-md bg-purple-500/20 text-purple-400">
                        {prompt.icon}
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-white">{prompt.title}</h4>
                        <p className="text-xs text-gray-400">{prompt.prompt}</p>
                      </div>
                    </button>
                  ))}
                </div>
                
                <div className="relative mt-4">
                  <textarea
                    ref={inputRef}
                    value={customPrompt}
                    onChange={(e) => setCustomPrompt(e.target.value)}
                    placeholder="Ask anything about your code..."
                    className="w-full p-3 pr-12 bg-[#252535] rounded-lg text-gray-300 placeholder-gray-500 resize-none h-20 focus:outline-none focus:ring-1 focus:ring-purple-500"
                    disabled={isLoading}
                  />
                  <button
                    onClick={handleCustomPrompt}
                    disabled={!customPrompt.trim() || isLoading}
                    className="absolute right-3 bottom-3 p-2 rounded-md bg-purple-600 text-white hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex-1 overflow-hidden flex flex-col">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-medium text-gray-400">
                    {activeAction === "explain" ? "Explanation" : 
                     activeAction === "optimize" ? "Optimized Code" : 
                     activeAction === "debug" ? "Debug Results" : 
                     activeAction === "generate" ? "Generated Documentation" : 
                     "AI Response"}
                  </h4>
                  <button
                    onClick={() => setResponse("")}
                    className="text-xs text-gray-500 hover:text-gray-400"
                  >
                    Back to prompts
                  </button>
                </div>
                
                <div className="flex-1 overflow-y-auto bg-[#252535] rounded-lg p-4">
                  <pre className="text-sm text-gray-300 whitespace-pre-wrap font-mono">{response}</pre>
                </div>
                
                {activeAction && activeAction !== "explain" && (
                  <div className="mt-3 flex justify-end">
                    <button
                      onClick={handleApplyChanges}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-purple-600 text-white hover:bg-purple-700"
                    >
                      <Wand2 className="w-4 h-4" />
                      <span>Apply Changes</span>
                    </button>
                  </div>
                )}
              </div>
            )}
            
            {isLoading && (
              <div className="absolute inset-0 bg-[#1e1e2e]/80 backdrop-blur-sm flex items-center justify-center rounded-xl">
                <div className="text-center">
                  <div className="w-10 h-10 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                  <p className="text-sm text-gray-400">Processing your request...</p>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </div>
  );
} 