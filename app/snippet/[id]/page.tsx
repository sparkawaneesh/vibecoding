"use client";

import { useEffect, useState } from "react";
import { Editor as MonacoEditor } from "@monaco-editor/react";
import { Copy, Check, Download } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const SUPPORTED_LANGUAGES: Record<string, { label: string; logoPath: string }> = {
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

interface SnippetData {
  code: string;
  language: string;
  timestamp: string;
}

export default function SnippetPage({ params }: { params: { id: string } }) {
  const [snippet, setSnippet] = useState<SnippetData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchSnippet = async () => {
      try {
        const response = await fetch(`/api/snippets?id=${params.id}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch snippet');
        }
        
        const data = await response.json();
        setSnippet(data);
      } catch (err) {
        setError('The snippet could not be found or has expired');
        console.error('Error fetching snippet:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchSnippet();
  }, [params.id]);

  const handleCopy = () => {
    if (!snippet) return;
    
    navigator.clipboard.writeText(snippet.code);
    setCopied(true);
    
    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };

  const handleDownload = () => {
    if (!snippet) return;
    
    const fileExtension = snippet.language === "javascript" ? "js" : 
                          snippet.language === "typescript" ? "ts" : 
                          snippet.language === "python" ? "py" : "txt";
    
    const blob = new Blob([snippet.code], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `snippet.${fileExtension}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0f0f17]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading snippet...</p>
        </div>
      </div>
    );
  }

  if (error || !snippet) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#0f0f17] p-4">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-bold text-white mb-4">Snippet Not Found</h1>
          <p className="text-gray-400 mb-6">{error || "The snippet could not be found or has expired."}</p>
          <Link 
            href="/code-editor" 
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Create a new snippet
          </Link>
        </div>
      </div>
    );
  }

  const formattedDate = new Date(snippet.timestamp).toLocaleString();
  const language = snippet.language as keyof typeof SUPPORTED_LANGUAGES;

  return (
    <div className="min-h-screen bg-[#0f0f17] p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Link 
            href="/code-editor" 
            className="text-blue-400 hover:text-blue-300 transition-colors"
          >
            ← Back to Editor
          </Link>
        </div>
        
        <div className="bg-[#12121a] rounded-xl border border-white/[0.05] overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-white/[0.05]">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#1e1e2e] ring-1 ring-white/5">
                <Image 
                  src={SUPPORTED_LANGUAGES[language]?.logoPath || "/code.png"} 
                  alt="Language logo" 
                  width={24} 
                  height={24} 
                />
              </div>
              <div>
                <h2 className="text-sm font-medium text-white">
                  {SUPPORTED_LANGUAGES[language]?.label || "Code"} Snippet
                </h2>
                <p className="text-xs text-gray-500">Shared on {formattedDate}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={handleCopy}
                className="p-2 rounded-lg bg-[#1e1e2e] hover:bg-[#2a2a3a] text-gray-300 transition-colors"
                title="Copy code"
              >
                {copied ? <Check className="w-5 h-5 text-green-500" /> : <Copy className="w-5 h-5" />}
              </button>
              
              <button
                onClick={handleDownload}
                className="p-2 rounded-lg bg-[#1e1e2e] hover:bg-[#2a2a3a] text-gray-300 transition-colors"
                title="Download code"
              >
                <Download className="w-5 h-5" />
              </button>
            </div>
          </div>
          
          {/* Code Editor (Read-only) */}
          <div className="h-[70vh]">
            <MonacoEditor
              height="100%"
              language={snippet.language}
              theme="vs-dark"
              value={snippet.code}
              options={{
                readOnly: true,
                minimap: { enabled: true },
                scrollBeyondLastLine: false,
                fontSize: 14,
                fontFamily: '"Fira Code", "Cascadia Code", Consolas, monospace',
                fontLigatures: true,
              }}
            />
          </div>
        </div>
        
        <div className="mt-6 text-center text-gray-500 text-sm">
          <p>
            Created with{" "}
            <a 
              href="https://github.com/yourusername/vibe-studio" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300"
            >
              Vibe Studio
            </a>
          </p>
        </div>
      </div>
    </div>
  );
} 