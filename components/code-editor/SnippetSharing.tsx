"use client";

import { useCodeEditorStore } from "@/store/useCodeEditorStore";
import { useState } from "react";
import { Share2, Copy, Check, Download, Upload, Link2 } from "lucide-react";
import { motion } from "framer-motion";

export default function SnippetSharing() {
  const { getCode, language } = useCodeEditorStore();
  const [isOpen, setIsOpen] = useState(false);
  const [shareLink, setShareLink] = useState("");
  const [isCopied, setIsCopied] = useState(false);
  const [isSharing, setIsSharing] = useState(false);

  const handleShare = async () => {
    const code = getCode();
    if (!code) return;

    setIsSharing(true);
    
    try {
      // In a real implementation, this would call an API to store the code
      // and generate a shareable link
      const response = await fetch("/api/snippets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          code,
          language,
          timestamp: new Date().toISOString(),
        }),
      });

      const data = await response.json();
      
      // For now, we'll simulate a response
      const simulatedLink = `https://vibe-studio.vercel.app/snippet/${Math.random().toString(36).substring(2, 10)}`;
      setShareLink(simulatedLink);
    } catch (error) {
      console.error("Error sharing snippet:", error);
    } finally {
      setIsSharing(false);
    }
  };

  const handleCopyLink = () => {
    if (!shareLink) return;
    
    navigator.clipboard.writeText(shareLink);
    setIsCopied(true);
    
    setTimeout(() => {
      setIsCopied(false);
    }, 2000);
  };

  const handleDownload = () => {
    const code = getCode();
    if (!code) return;
    
    const fileExtension = language === "javascript" ? "js" : 
                          language === "typescript" ? "ts" : 
                          language === "python" ? "py" : "txt";
    
    const blob = new Blob([code], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `snippet.${fileExtension}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImport = async (content: string) => {
    try {
      const parsedContent = JSON.parse(content);
      setImportedContent(parsedContent);
      setShowImportDialog(false);
      
      if (parsedContent.code) {
        onImport(parsedContent);
      }
    } catch (error) {
      setImportError('Invalid snippet format. Please check your input.');
    }
  };

  return (
    <div className="relative">
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#1e1e2e] text-gray-300 hover:bg-[#2a2a3a] border border-white/10"
      >
        <Share2 className="w-4 h-4" />
        <span className="text-sm">Share</span>
      </motion.button>
      
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-[#1e1e2e] rounded-xl shadow-lg border border-white/10 p-4 z-10">
          <h3 className="text-sm font-medium text-white mb-3">Share Code Snippet</h3>
          
          <div className="space-y-3">
            {/* Generate Link */}
            {!shareLink ? (
              <button
                onClick={handleShare}
                disabled={isSharing}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {isSharing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Generating...</span>
                  </>
                ) : (
                  <>
                    <Link2 className="w-4 h-4" />
                    <span>Generate Shareable Link</span>
                  </>
                )}
              </button>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center gap-2 p-2 bg-[#252535] rounded-lg">
                  <input
                    type="text"
                    value={shareLink}
                    readOnly
                    className="flex-1 bg-transparent text-sm text-gray-300 outline-none"
                  />
                  <button
                    onClick={handleCopyLink}
                    className="p-1.5 rounded-md hover:bg-[#3a3a4a] text-gray-300"
                  >
                    {isCopied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
                
                <button
                  onClick={() => setShareLink("")}
                  className="text-xs text-gray-500 hover:text-gray-400"
                >
                  Generate new link
                </button>
              </div>
            )}
            
            {/* Download & Import */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleDownload}
                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-[#252535] text-gray-300 hover:bg-[#3a3a4a]"
              >
                <Download className="w-4 h-4" />
                <span className="text-sm">Download</span>
              </button>
              
              <button
                onClick={handleImport}
                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-[#252535] text-gray-300 hover:bg-[#3a3a4a]"
              >
                <Upload className="w-4 h-4" />
                <span className="text-sm">Import</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 